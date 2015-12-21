import os
import json

from django.conf import settings
from django.http import Http404
from django.shortcuts import render
from django.template import Template, Context
from django.template.loader_tags import BlockNode
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

    meta = None
    for i, node in enumerate(list(page.nodelist)):
        # we go through raw page's nodelist
        # pick {% block context %}
        # and convert its JSON content into dict
        if isinstance(node, BlockNode) and node.name == 'context':
            meta = page.nodelist.pop(i)
            break
    page._meta = meta
    return page


def render_page(request, page_name='index'):
    print("page_name: {}".format(page_name))
    file_name = "{}.html".format(page_name)
    print("filename: {}".format(file_name))
    page = get_page_or_404(file_name)
    context = {
        'page_name': page_name,
        'page': page,
    }

    if page._meta is not None:
        meta = page._meta.render(Context())
        extra_context = json.loads(meta)
        context.update(extra_context)
    return render(request, 'page.html', context)
