import json
import os
import uuid

from google.appengine.ext import ndb
from PIL import Image

import cloudstorage as gcs
import webapp2


BUCKET = 'chafagramdemophotos'


class MainPage(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'text/html'
    self.response.write(open(
        os.path.join(os.path.dirname(__file_), 'static','shell.html')).read())


class RecentPage(webapp2.RequestHandler):
  def get(self):
    result = []
    for c in Chafagram.query().order(-Chafagram.date).fetch(20):
      result.append({'url': c.image_file,
                     'date': c.date,
                     'comment': c.comment})
    self.response.headers['Content-Type'] = 'application/json'
    self.response.write(json.dumps(result))


class PutPage(webapp2.RequestHandler):
  def post(self):
    comment = 'No comment'  # TODO: Actually read this from post.
    image_file = self.request.POST.multi['photo'].file
    image = Image.open(image_file)
    image.thumbnail((1080, 1080), Image.ANTIALIAS)
    filename = uuid.uuid4().hex + '.png'
    gcspath = '/%s/%s' % (BUCKET, filename)
    write_retry_params = gcs.RetryParams(backoff_factor=1.1)
    gcsfile =  gcs.open(gcspath, 'w', content_type='image/png',
                        retry_params=write_retry_params)
    image.save(gcsfile, 'PNG')
    gcsfile.close()

    chafagram = Chafagram()
    chafagram.image_file = filename
    chafagram.comment = comment
    chafagram.save()

    self.response.headers['Content-Type'] = 'text/plain'
    self.response.write('Photo uploaded as: ' + gcspath)


class Chafagram(ndb.Model):
  image_file = ndb.StringProperty()
  comment = ndb.StringProperty()
  date = ndb.DateTimeProperty(auto_now_add=True)


app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/put', PutPage),
    ('/recent', RecentPage),
], debug=True)

