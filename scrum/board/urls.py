from rest_framework.routers import DefaulRouter

from . import views

router = DefaulRouter()
router.register(r'sprints', views.SprintViewSet)
router.register(r'tasks', views.TaskViewSet)
router.register(r'users', views.UserViewSet)
