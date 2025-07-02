import {load_profile} from './profile.js';
import {show_div} from './main.js';

export function load_posts(page_number = 1, filter = 'none') {

    show_div('all-posts');

    if (page_number === 1) {
        document.querySelector('#page-item-previous').classList.add('disabled');
    }

    fetch(`/posts?page=${page_number}&filter=${filter}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);

            document.querySelector('#div-number-pages').innerHTML = '';
            document.querySelector('#div-load-posts').innerHTML = '';

            generate_navigation_page(data);

            generate_div_all_posts(data);
            if (!data.has_next) { }
        })
}

function like_post(id, event){
    fetch(`/post/like?post=${id}`)
    .then(response => response.json())
    .then(data => {

        if(event.target.tagName === 'BUTTON' && event.target.dataset.id){
            const button = event.target;
            const like_count = document.querySelector(`p[data-id='${id}']`);
            like_count.innerHTML =`<strong>Likes:</strong> ${data.likes_count}`;

            if(data.status_like){
                button.innerHTML = 'Dislike';
                
            }else{
                button.innerHTML = 'Like';
            }
        }
    })
}

function generate_div_all_posts(data) {
    data.posts.forEach(post => {
        const div_post = document.createElement('div');
        div_post.classList.add('post-loaded');

        const heading_author = document.createElement('h4');
        heading_author.innerHTML = post.author.username;

        const num_followers = document.createElement('p');
        num_followers.innerHTML = `<strong>Followers:</strong> ${post.author.followers}`

        const content = document.createElement('p');
        content.innerHTML = post.content;

        const num_likes = document.createElement('p');
        num_likes.dataset.id = post.id;
        num_likes.innerHTML = `<strong>Likes:</strong> ${post.likes}`;

        const button_like = document.createElement('button');
        button_like.dataset.id = post.id;
        button_like.innerHTML = post.liked_by_user ? 'Dislike' : 'Like';

        const date = document.createElement('p');
        date.innerHTML = `<strong>Posted:</strong> ${post.date}`;

        const button_profile = document.createElement('button');
        button_profile.innerHTML = 'Visit Profile';

        const button_post = document.createElement('button');
        button_post.innerHTML = 'Visit Post';

        const line = document.createElement('hr');

        div_post.append(heading_author, num_followers, button_profile, button_post, content, num_likes, button_like, date, line);
        document.querySelector('#div-load-posts').appendChild(div_post);

        button_profile.onclick = () =>{
            load_profile(post.author.id)
        }

        button_post.onclick = () =>{
            get_post(post.id)
        }

        button_like.onclick = function (event){
            like_post(post.id, event)
        }
    })
}

function generate_div_one_post(post) {

    const div_post = document.createElement('div');
    div_post.classList.add('post-loaded');

    const heading_author = document.createElement('h4');
    heading_author.innerHTML = post.author.username;

    const num_followers = document.createElement('p');
    num_followers.innerHTML = `<strong>Followers:</strong> ${post.author.followers}`

    const button_profile = document.createElement('button');
    button_profile.innerHTML = 'Visit Profile';

    const content = document.createElement('p');
    content.innerHTML = post.content;

    const num_likes = document.createElement('p');
    num_likes.innerHTML = `<strong>Likes:</strong> ${post.likes}`;

    const button_like = document.createElement('button');
    button_like.dataset.id = post.id;
    button_like.innerHTML = post.liked_by_user ? "Dislike" : "Like";

    const date = document.createElement('p');
    date.innerHTML = `<strong>Posted:</strong> ${post.date}`;

    const back_button = document.createElement('button');
    back_button.innerHTML = 'Back to feed';

    div_post.append(heading_author, num_followers, button_profile, content, num_likes, button_like, date, back_button);
    document.querySelector('#div-one-post').appendChild(div_post);

    back_button.onclick = () => load_posts(1); //current page ???

    button_profile.onclick = () =>{
        load_profile(post.author.id);
    }

    button_like.onclick = function(event){
        like_post(post.id, event)
    }
}

function generate_navigation_page(data) {

    document.querySelector('#div-page-navigation').style.display = 'block';

    const button_previous = document.querySelector('#page-item-previous');
    const button_next = document.querySelector('#page-item-next');

    button_previous.classList.toggle('disabled', !data.has_previous);
    button_next.classList.toggle('disabled', !data.has_next);

    const current_page = Number(data.current_page);
    const total_pages = Number(data.total_pages);
    if(isNaN(current_page) || isNaN(total_pages)){
        console.error('Invalid data: ', data);
        return;
    }

    button_previous.onclick = () =>{
        if(data.has_previous){
            load_posts(current_page - 1, data.filter);
        }
    }

    button_next.onclick = () =>{
        if(data.has_next){
            load_posts(current_page + 1, data.filter);
        }
    }
    
    //Logic for navigation buttons
    for (let i = 1; i <= data.total_pages; i++) {

        const li = document.createElement('li');
        li.classList.add('page-item');

        if (i === data.current_page) {
            li.classList.add('active');
        }

        const link = document.createElement('a');
        link.classList.add('page-link');
        link.innerHTML = i;

        link.onclick = (event) => {
            event.preventDefault();
            load_posts(i, data.filter);
        }

        li.appendChild(link);
        document.querySelector('#div-number-pages').appendChild(li);
    }
}

export function new_post(content){
    fetch('/create', {
        method : 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'X-CSRFToken' : get_csrf_token()
        },
        body : JSON.stringify({
            content : content
        })

    }).then(response => response.json())
    .then(data => {
        if(data.error){
            console.log(data.error)
        }else{  
            console.log(data.message)
            console.log(data.post)
            get_post(data.post.id)
        }
    })
}

export function get_post(id) {

    show_div('one-post');

    fetch(`/posts/view?id=${id}`)
        .then(response => response.json())
        .then(post => {
            console.log(post);


            document.querySelector('#div-one-post').innerHTML = '';
        
            generate_div_one_post(post.post);

        })
}

function get_csrf_token(){
    return document.querySelector('[name=csrf-token]').content;
}

