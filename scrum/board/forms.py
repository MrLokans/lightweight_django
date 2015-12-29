import django_filters

from django.contrib.auth import get_user_model

from .models import Task


User = get_user_model()


class NullFilter(django_filters.BooleanFilter):

    def filter(self, qs, value):
        # /api/tasks/?backlog=True will return aall tasks that are not assigned to a sprint
        if value is not None:
            return qs.filter(**{"{}__isnull".format(self.name): value})
        return qs


class TaskFilter(django_filters.FilterSet):

    backlog = NullFilter(name='sprint')

    class Meta:
        model = Task
        fields = ('sprint', 'status', 'assigned', 'backlog', )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # /api/tasks/?assigned=<username>
        self.filters['assigned'].extra.update(
            {'to_field_name': User.USERNAME_FIELD})
