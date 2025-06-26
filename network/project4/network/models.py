from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("self", symmetrical=False, blank=True, related_name="following")
    

class Post(models.Model):
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts_created")
    likes = models.ManyToManyField(User, blank=True, related_name="posts_liked")
    date = models.DateTimeField(auto_now_add=True)

    def like(self, user):
        if(self.author == user):
            return False
        else:
            self.likes.add(user)
            return True

