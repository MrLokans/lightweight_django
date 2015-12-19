from django.conf.urls import url

from .views import render_page

urlpatterns = (
    url(r'^(?P<page_name>)[\w./-]+/$', render_page, name='page'),
    url(r'^$', render_page, name='homepage'),
)
