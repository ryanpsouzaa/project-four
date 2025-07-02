from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("self", symmetrical=False, blank=True, related_name="following")

    def serialize(self):
        posts = self.posts_created.all().order_by("-date")
        posts_serialized = [post.serialize() for post in posts]
        return {
            "id" : self.id,
            "username" : self.username,
            "followers" : self.followers.count(),
            "following" : self.following.count(),
            "posts_created" : posts_serialized
        }
    

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
        
    def liked_by_user(self ,user):
        if self.likes.filter(id=user.id).exists():
            return True
        
        else:
            return False
        
    def serialize(self, user = None):
        return {
            "id" : self.id,
            "author" : {
                 "id" : self.author.id,
                 "username" : self.author.username,
                 "followers" : self.author.followers.count()
                 },
            "content" : self.content,
            "likes" : self.likes.count(),
            "date" : self.date.isoformat(),
            "liked_by_user" : self.liked_by_user(user) if user else False
        }
    
    def __str__(self):
        return f"{self.author}: {self.content} | {self.likes.count()} likes | {self.date}"

