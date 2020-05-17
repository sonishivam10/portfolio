from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('skills/', views.skills)
]
