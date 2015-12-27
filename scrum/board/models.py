from django.db import models
from django.utils.translation import ugettext_lazy as _


class Sprint(models.Model):

    name = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    end = models.DateField(unique=True)

    def __str__(self):
        return self.name or _('Sprint ending {}'.format(self.end))
    