import { load_profile } from './profile.js';
import {load_posts, new_post} from './posts.js';



document.addEventListener('DOMContentLoaded', function () {

    //TODO: clicks for buttons navigation page
    //todo: options in nav
    //todo: click events => in buttons... later implemment in div
    //todo: Likes in posts
    //todo: Edit posts
    //todo: url and states of navigation

    //events for clicks in nav links
    document.querySelector('#nav-link-profile').addEventListener('click', () => load_page('profile'));
    document.querySelector('#nav-link-all-posts').addEventListener('click', () => load_page('all-posts'));
    document.querySelector('#nav-link-following').addEventListener('click', () => load_page('following'));
    document.querySelector('#nav-link-main').addEventListener('click', () => load_page('all-posts'));

    //first interaction on site: load all posts
    load_page('all-posts');
    
    //when the form is submited => a new post is created
    document.querySelector('#new-post-all-posts').onsubmit = (event) => {
        event.preventDefault();
        new_post(
            document.querySelector('#new-post-content').value
        );
        document.querySelector('#new-post-content').value = '';
    }
})

function load_page(page) {
    document.querySelector('#div-profile').style.display = 'none';
    document.querySelector('#div-all-posts').style.display = 'none';

    document.querySelector(`#div-${page}`).style.display = 'block';

    if (page === 'all-posts') {
        load_posts(1);
    }
    if (page === 'profile'){
        load_profile();
    }
    if (page === 'following'){
        load_posts(1, 'following');
    }
}

export function show_div(div_name){
    document.querySelector('#div-profile').style.display = 'none';
    document.querySelector('#div-all-posts').style.display = 'none';
    document.querySelector('#div-one-post').style.display = 'none';

    document.querySelector(`#div-${div_name}`).style.display = 'block';
}