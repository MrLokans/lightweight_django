import sys
from django.conf import settings
# Settings have to be specified first,
# as some modules rely on them

settings.configure(
    DEBUG=True,
    SECRET_KEY='SOMESECRETSECRETKEY',
    ROOT_URLCONF=__name__,
    MIDDLEWARE_CLASSES=(
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',

    ),
)


from django.conf.urls import url
from django.http import HttpResponse
from django.core.wsgi import get_wsgi_application


def index(request):
    return HttpResponse('Hello World')

urlpatterns = (
    url(r'^$', index),
)

application = get_wsgi_application()

if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
