
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("posts/", views.load_posts, name="posts"),
    path("posts/view", views.get_post, name="get_post"),
    path("post/like", views.like_post, name="like_post"),
    path("create", views.create_post, name="create_post"),
    path("profile", views.get_profile, name="get_profile"),
    path("profile/follow", views.follow_user, name="follow_user")


]
