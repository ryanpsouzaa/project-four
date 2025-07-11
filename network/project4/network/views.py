import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist

from django.core.paginator import Paginator

from .models import User, Post

def user_status(request):
    return JsonResponse({
        "authenticated" : request.user.is_authenticated,
        "username" : request.user.username if request.user.is_authenticated else None
    })

def index(request):
    return render(request, "network/index.html")

def like_post(request):
    if request.method == "GET":
        id = int(request.GET.get("post"))
        try: 
            post = Post.objects.get(pk=id)
        
        except ObjectDoesNotExist:
            return JsonResponse({
                "error" : "Post not found"
            }, status=404)
        
        if post.likes.all().filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            status_like = False

        else:
            post.likes.add(request.user)
            status_like = True
        
        return JsonResponse({
            "status_like" : status_like,
            "likes_count" : post.likes.all().count()
        }, status=200)
                                                                                                                                                                                    
    else:
        return JsonResponse({
            "error" : "Method GET required"
        }, status=400)

@login_required
def follow_user(request):
    if request.method == 'GET':
        id = request.GET.get('id_follow')

        try:
            user_follow = User.objects.get(pk=id)

            if user_follow.followers.filter(id=request.user.id).exists():
                user_follow.followers.remove(request.user)

                return JsonResponse({
                    "follow" : False
                }, status=200)

            else:
                user_follow.followers.add(request.user)

                return JsonResponse({
                    "message" : f"{request.user.username} is following {user_follow.username}",
                    "follow" : True
                }, status=200)

        except ObjectDoesNotExist:
            return JsonResponse({
                "error" : "User not found"
            }, status=404)
    
    else:
        return JsonResponse({
            "error" : "Method GET required"
        }, status=400)

@login_required
def get_profile(request):
    if request.method == "GET":
        if request.GET.get("id") == "owner_account":
            user = request.user
            is_following = False
        
        else:
            id = int(request.GET.get("id"))
            user = User.objects.get(pk=id)
            is_following = user.followers.filter(id=request.user.id).exists()

        posts_created = user.posts_created.all()

        return JsonResponse({
            "profile" : user.serialize(request.user),
            "is_owner" : user == request.user,
            "is_following" : is_following
        }, status=200)

    else:
        return JsonResponse({
            "error" : "Method GET required"
        }, status=400)


@login_required
def create_post(request):
    
    if request.method != "POST":
        return JsonResponse({
            "error" : "POST request required."
        }, status=400)
    
    data = json.loads(request.body)
    content_post = data.get('content')

    if not content_post.strip():
        return JsonResponse({
            "error" : "Content of Post cannot be empty."
        }, status=400)
    
    post = Post.objects.create(content=content_post, author=request.user)
    return JsonResponse({
        "message" : "Post created succesfully.",
        "post" : post.serialize(request.user)
    }, status=201)

@login_required
def edit_post(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        id = data.get("id")
        new_content = data.get("content")

        try:
            post = Post.objects.get(pk=id)

            if post.author != request.user:
                return JsonResponse({
                    "error" : "Unauthorized"
                }, status=401)

            else:
                post.content = new_content
                post.save()

                return JsonResponse({
                    "message" : "Post updated",
                    "post_id" : post.id
                }, status=200)

        except ObjectDoesNotExist:
            return JsonResponse({
                "error" : "Post not found"
            }, status=404)
    
    else:
        return JsonResponse({
            "error" : "Method PUT required"
        }, status=400)
    
#remove csrf_exempt
@csrf_exempt
def load_posts(request):
    if request.method == "GET":
        #page1 for default
        page_number = int(request.GET.get("page", 1))
        #no filter for default
        filter = request.GET.get("filter", "none")

        if(filter != "none"):
            posts = Post.objects.filter(
                author__in=request.user.following.all()
            ).order_by("-date")
            
        else:
            posts = Post.objects.all().order_by("-date")

        posts_paginator = Paginator(posts, 10)

        try:
            page = posts_paginator.page(page_number)

        except:
            return JsonResponse({
                "error" : "Invalid Page"
            }, status=400)
        
        return JsonResponse(
            {
                "posts" : [post.serialize(request.user) for post in page],
                "filter" : filter,
                "has_next" : page.has_next(),
                "has_previous" : page.has_previous(),
                "current_page" : page.number,
                "total_pages" : posts_paginator.num_pages,
            }
            
            ,safe=False, status=200)
    
def get_post(request):
    if request.method == "GET":
        id_post = request.GET.get("id")

        try:
            post = Post.objects.get(pk=id_post)
            return JsonResponse({
                "post" : post.serialize(request.user)
            }, status=200)
        
        except ObjectDoesNotExist:
            return JsonResponse({
                "error" : "Post not found"
            }, status = 404)
    
    else:
        return JsonResponse({
            "error" : "Method GET required"
        }, status = 400)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
