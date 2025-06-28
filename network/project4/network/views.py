import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.views.decorators.csrf import csrf_exempt

from django.core.paginator import Paginator

from .models import User, Post

def index(request):
    return render(request, "network/index.html")

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
        "message" : "Post created succesfully."
    }, status=201)


@csrf_exempt
def load_posts(request):
    if request.method == "GET":
        #page1 for default
        page_number = int(request.GET.get("page", 1))
 
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
                "posts" : [post.serialize() for post in page],
                "has_next" : page.has_next(),
                "has_previous" : page.has_previous(),
                "current_page" : page.number,
                "total_pages" : posts_paginator.num_pages,
            }
            
            ,safe=False
            )
    



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
