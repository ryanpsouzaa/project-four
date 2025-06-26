from django.test import TestCase

from network.models import User, Post
# Create your tests here.

class ModelsTestCase(TestCase):

    def setUp(self):
        user1 = User.objects.create(username="bob", password="123123")
        user2 = User.objects.create(username="ana", password="321321")
        user3 = User.objects.create(username="Paul", password="456456")

        Post.objects.create(content="Post Test One", author=user1)
        Post.objects.create(content="Post Test Two", author=user1)
        Post.objects.create(content="Post Test Three", author=user1)

        Post.objects.create(content="Post Test Four", author=user2)
        Post.objects.create(content="Post Test Five", author=user2)

        Post.objects.create(content="Post Test Six", author=user3)

    def test_posts_created_count(self):
        user = User.objects.get(pk=1)
        self.assertEqual(user.posts_created.count(), 3)

    def test_likes_add(self):
        post = Post.objects.get(pk=1)

        userBob = User.objects.get(pk=1)
        userAna = User.objects.get(pk=2)

        self.assertTrue(post.like(userAna))
        self.assertFalse(post.like(userBob))
    
    def test_likes_count(self):
        post = Post.objects.get(pk=4)

        userBob = User.objects.get(pk=1)
        userPaul = User.objects.get(pk=3)

        post.like(userBob)
        post.like(userPaul)

        self.assertEqual(post.likes.count(), 2)

    def test_posts_liked_count(self):
        post1 = Post.objects.get(pk=1)
        post2 = Post.objects.get(pk=2)
        post3 = Post.objects.get(pk=3)

        userAna = User.objects.get(pk=2)

        post1.like(userAna)
        post2.like(userAna)
        post3.like(userAna)

        self.assertEqual(userAna.posts_liked.count(), 3)

#todo: Tests for follow/unfollow            