import {load_profile} from './profile.js';
import {show_div, show_error, show_message, check_auth} from './main.js';

export async function load_posts(page_number = 1, filter = 'none') {

    show_div('all-posts');

    const auth =  await check_auth();
    if(!auth){
        document.querySelector('#div-form-all-posts').style.display = 'none';
    }else{
        document.querySelector('#div-form-all-posts').style.display = 'block';
    }
    

    if (page_number === 1) {
        document.querySelector('#page-item-previous').classList.add('disabled');
    }

    fetch(`/posts/?page=${page_number}&filter=${filter}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); //remove this log
            if(data.error){
                show_error(data.error);
            }

            document.querySelector('#div-number-pages').innerHTML = '';
            document.querySelector('#div-load-posts').innerHTML = '';

            generate_navigation_page(data);

            generate_div_all_posts(data);
        })
}

export function like_post(id, event){
    fetch(`/post/like/?post=${id}`)
    .then(response => response.json())
    .then(data => {

        if(data.error){
            show_error(data.error);
        }

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

export function edit_post_load(id){
    const content_form = document.querySelector('#content-edit-post');
    const form = document.querySelector('#form-edit-post');

    show_div('edit-post');

    fetch(`/posts/view/?id=${id}`)
    .then(response => response.json())
    .then(data => {

        if(data.error){
            show_error(data.error);
        }
        content_form.value = data.post.content;
    })

    form.onsubmit = (event) => {
        event.preventDefault();
        const content = content_form.value
        edit_post(id, content);
    }
}

export function edit_post(id, new_content){
    fetch('/posts/edit/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken' : get_csrf_token()
            },
            body: JSON.stringify({
                id: id,
                content: new_content 
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.message){
                get_post(id);
                show_message(data.message);

            } else if(data.error){
                console.error(data.error);
                show_error(data.error);
            }
        });
}

async function generate_div_all_posts(data) {
    const auth = await check_auth();

    data.posts.forEach(post => {
        const div_post = document.createElement('div');
        div_post.classList.add('post-loaded');
        div_post.style.cursor = 'pointer';

        div_post.onclick = () => get_post(post.id);

        const heading_author = document.createElement('h4');
        heading_author.classList.add('post-loaded-heading');
        heading_author.innerHTML = `<strong>${post.author.username}</strong>`;
        heading_author.style.cursor = 'pointer';
        heading_author.onclick = (event) => {
            event.stopPropagation();
            load_profile(post.author.id)
        };

        const num_followers = document.createElement('p');
        num_followers.classList.add('post-loaded-num-followers');
        num_followers.innerHTML = `<strong>Followers:</strong> ${post.author.followers}`

        const content = document.createElement('p');
        content.classList.add('post-loaded-content');
        content.innerHTML = post.content;

        const num_likes = document.createElement('p');
        num_likes.classList.add('post-loaded-num-likes');
        num_likes.dataset.id = post.id;
        num_likes.innerHTML = `<strong>Likes:</strong> ${post.likes}`;

        const date = document.createElement('p');
        date.classList.add('post-loaded-date');
        date.innerHTML = `<strong>Posted:</strong> ${post.date}`;

        const line = document.createElement('hr');

        div_post.append(heading_author, num_followers, content, num_followers, num_likes);

        if(auth){
            const button_like = document.createElement('button');
            button_like.classList.add('post-loaded-button-like');
            button_like.dataset.id = post.id;
            button_like.innerHTML = post.liked_by_user ? 'Dislike' : 'Like';
            button_like.onclick = function (event){
                event.stopPropagation();
                like_post(post.id, event);
            }
            div_post.append(button_like);    
        }

        div_post.append(date);
        //faltam line
        if(post.user_is_owner){
            const edit_link = document.createElement('a');
            edit_link.classList.add('post-loaded-edit');
            edit_link.innerHTML = 'Edit';
            edit_link.onclick = (event) => {
                event.stopPropagation();
                edit_post_load(post.id);
            }
            div_post.append(edit_link, line);

        }else{
            div_post.append(line);
        }
    
        document.querySelector('#div-load-posts').appendChild(div_post);
    })
}

async function generate_div_one_post(post) {
    const auth = await check_auth();

    const div_post = document.createElement('div');
    div_post.classList.add('post-loaded');

    const heading_author = document.createElement('h4');
    heading_author.classList.add('post-loaded-heading');
    heading_author.innerHTML = `<strong>${post.author.username}</strong>`;
    heading_author.style.cursor = 'pointer';
    heading_author.onclick = () => {
        load_profile(post.author.id);
    }

    const num_followers = document.createElement('p');
    num_followers.classList.add('post-loaded-num-followers');
    num_followers.innerHTML = `<strong>Followers:</strong> ${post.author.followers}`

    const content = document.createElement('p');
    content.classList.add('post-loaded-content');
    content.innerHTML = post.content;

    const num_likes = document.createElement('p');
    num_likes.classList.add('post-loaded-num-likes');
    num_likes.innerHTML = `<strong>Likes:</strong> ${post.likes}`;

    const date = document.createElement('p');
    date.classList.add('post-loaded-date');
    date.innerHTML = `<strong>Posted:</strong> ${post.date}`;

    const back_button = document.createElement('button');
    back_button.classList.add('post-loaded-back-button');
    back_button.innerHTML = 'Back to feed';
    back_button.onclick = () => load_posts(1); //current page ???

    div_post.append(heading_author, num_followers, content, num_likes);

    if(auth){
        const button_like = document.createElement('button');
        button_like.classList.add('post-loaded-button-like');
        button_like.dataset.id = post.id;
        button_like.innerHTML = post.liked_by_user ? "Dislike" : "Like";
        button_like.onclick = (event) =>{
            like_post(post.id, event);
        }
        div_post.append(button_like);
    }

    if(post.user_is_owner){
        const link_edit = document.createElement('a');
        link_edit.classList.add('post-loaded-edit');
        link_edit.innerHTML = 'Edit';
        link_edit.addEventListener('click', (event)=>{
            event.stopPropagation();
            edit_post_load(post.id);
        })
        div_post.append(link_edit);
    }

    div_post.append(date, back_button);
    document.querySelector('#div-one-post').appendChild(div_post);
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

        const link = document.createElement('a');
        link.classList.add('page-link');
        link.innerHTML = i;
        
        if (i === data.current_page){
            link.classList.add('active')
        }

        link.onclick = (event) => {
            event.preventDefault();
            load_posts(i, data.filter);
        }

        li.appendChild(link);
        document.querySelector('#div-number-pages').appendChild(li);
    }
}

export function new_post(content){
    fetch('/create/', {
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
            show_error(data.error);
            console.log(data.error);
        }else{
            show_message(data.message);  
            console.log(data.message);
            console.log(data.post);
            get_post(data.post.id);
        }
    })
}

export function get_post(id) {

    show_div('one-post');

    fetch(`/posts/view/?id=${id}`)
        .then(response => response.json())
        .then(post => {
            console.log(post);

            if(post.error){
                show_error(post.error);
            }

            document.querySelector('#div-one-post').innerHTML = '';
        
            generate_div_one_post(post.post);

        })
}

function get_csrf_token(){
    return document.querySelector('[name=csrf-token]').content;
}

