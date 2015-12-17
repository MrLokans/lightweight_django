import os
import sys
from django.conf import settings

# Settings have to be specified first,
# as some modules rely on them

DEBUG = os.environ.get('DEBUG', 'on') == 'on'

SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(32))

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')

settings.configure(
    DEBUG=DEBUG,
    SECRET_KEY=SECRET_KEY,
    ALLOWED_HOSTS=ALLOWED_HOSTS,
    ROOT_URLCONF=__name__,
    MIDDLEWARE_CLASSES=(
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',

    ),
)

from io import BytesIO

from django import forms
from django.conf.urls import url
from django.http import HttpResponse, HttpResponseBadRequest
from django.core.wsgi import get_wsgi_application

from PIL import Image, ImageDraw


# we are using form to validate items
class ImageForm(forms.Form):
    height = forms.IntegerField(min_value=1, max_value=2000)
    width = forms.IntegerField(min_value=1, max_value=2000)


def index(request):
    return HttpResponse('Hello World')


def placeholder(request, width, height):
    form = ImageForm({'height': height, 'width': width})
    if form.is_valid():
        height = form.cleaned_data['height']
        width = form.cleaned_data['width']

        image = create_image(width, height)
        return HttpResponse(image, content_type='image/png')
    return HttpResponseBadRequest('Invalid image parameters')


def create_image(width, height, img_format='PNG', text_color=(255, 255, 255)):
    image = Image.new('RGB', (width, height))
    draw_area = ImageDraw.Draw(image)
    # we create file-like object to store image data
    image_text = '{} x {}'.format(width, height)

    text_w, text_h = draw_area.textsize(image_text)
    if text_w < width and text_h < height:
        text_top = (height - text_h) // 2
        text_left = (width - text_w) // 2
        draw_area.text((text_left, text_top), image_text, fill=text_color)
    content = BytesIO()
    image.save(content, img_format)
    content.seek(0)
    return content

urlpatterns = (
    url(r'^image/(?P<width>[0-9]+)x(?P<height>[0-9]+)/$', placeholder, name='placeholder'),
    url(r'^$', index, name='homepage'),
)

application = get_wsgi_application()

if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
