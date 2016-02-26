import uuid

from PIL import Image
import cloudstorage as gcs
import webapp2

BUCKET = 'chafagramdemophotos'

class MainPage(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.write('Hello, World!')  # TODO: Serve app here.

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
                        options={'x-goog-meta-comment': comment},
                        retry_params=write_retry_params)
    image.save(gcsfile, 'PNG')
    gcsfile.close()
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.write('Photo uploaded as: ' + gcspath)

app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/put', PutPage),
], debug=True)
