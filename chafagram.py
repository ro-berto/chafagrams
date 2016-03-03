import json
import os
import uuid

from google.appengine.ext import ndb
from PIL import Image

import cloudstorage as gcs
import webapp2


BUCKET = 'chafagramdemophotos'


class RecentPage(webapp2.RequestHandler):
  def get(self):
    result = []
    for c in Chafagram.query().order(-Chafagram.date).fetch(20):
      result.append({'url': c.image_file,
                     'date': c.date.isoformat(),
                     'comment': c.comment,
                     'post_id': c.post_id})
    self.response.headers['Content-Type'] = 'application/json'
    self.response.write(json.dumps(result))


class PutPage(webapp2.RequestHandler):
  def post(self):
    comment = 'No comment'  # TODO: Actually read this from post.
    image_file = self.request.POST.multi['photo'].file
    image = Image.open(image_file)
    image.thumbnail((400, 1080), Image.ANTIALIAS)
    post_id = uuid.uuid4().hex
    filename = post_id+ '.png'
    gcspath = '/%s/%s' % (BUCKET, filename)
    write_retry_params = gcs.RetryParams(backoff_factor=1.1)
    gcsfile =  gcs.open(gcspath, 'w', content_type='image/png',
                        retry_params=write_retry_params)
    image.save(gcsfile, 'PNG')
    gcsfile.close()

    chafagram = Chafagram()
    chafagram.image_file = gcspath
    chafagram.comment = comment
    chafagram.post_id = post_id
    chafagram.put()

    self.response.headers['Content-Type'] = 'text/plain'
    self.response.write('Photo uploaded as: ' + gcspath)


class Chafagram(ndb.Model):
  post_id = ndb.StringProperty()
  image_file = ndb.StringProperty()
  comment = ndb.StringProperty()
  date = ndb.DateTimeProperty(auto_now_add=True)


app = webapp2.WSGIApplication([
    ('/put', PutPage),
    ('/recent', RecentPage),
], debug=True)

