import os

from django.conf import settings
from django.http import Http404
from django.shortcuts import render
from django.template import Template
from django.utils._os import safe_join


def get_page_or_404(name):
    try:
        # file path may not be higher than BASE_DIR
        file_path = safe_join(settings.SITE_PAGES_DIRECTORY, name)
    except ValueError:
        raise Http404('Page Not Found')
    else:
        if not os.path.exists(file_path):
            raise Http404('Page Not Found')

    with open(file_path) as f:
        page = Template(f.read())
    return page


def render_page(request, page_name='index'):
    file_name = "{}.html".format(page_name)
    page = get_page_or_404(file_name)
    context = {
        'page_name': page_name,
        'page': page,
    }
    return render(request, 'page.html', context)
