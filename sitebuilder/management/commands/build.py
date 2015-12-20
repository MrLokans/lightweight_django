import os
import shutil

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.core.urlresolvers import reverse
from django.test.client import Client


def get_pages():
    for name in os.listdir(settings.SITE_PAGES_DIRECTORY):
        if name.endswith('.html'):
            yield name[:-5]


class Command(BaseCommand):
    args = '<page_name page_name ...>'
    help = 'Build static site output.'

    def handle(self, *args, **options):

        print("args: {}".format(args))
        if args:
            page_names = args
            available = list(get_pages())
            invalid = []
            for page in page_names:
                if page not in available:
                    invalid.append(page)
            if invalid:
                msg = "Invalid pages: {}".format(', '.join(invalid))
                raise CommandError(msg)
        else:
            page_names = get_pages()

            if os.path.exists(settings.SITE_OUTPUT_DIRECTORY):
                print("Removing existing output directory ({})".format(settings.SITE_OUTPUT_DIRECTORY))
                shutil.rmtree(settings.SITE_OUTPUT_DIRECTORY)
            os.mkdir(settings.SITE_OUTPUT_DIRECTORY)
            os.makedirs(settings.STATIC_ROOT)

        call_command('collectstatic', interactive=False, clear=True, verbosity=0)

        client = Client()
        for page_name in page_names:
            url = reverse('page', kwargs={'page_name': page_name})
            response = client.get(url)
            if page_name == "index":
                output_dir = settings.SITE_OUTPUT_DIRECTORY
            else:
                output_dir = os.path.join(settings.SITE_OUTPUT_DIRECTORY, page_name)
                if not os.path.exists(output_dir):
                    os.makedirs(output_dir)
            with open(os.path.join(output_dir, "index.html"), 'wb') as f:
                f.write(response.content)
