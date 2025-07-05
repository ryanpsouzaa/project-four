import { load_profile } from './profile.js';
import {load_posts, new_post} from './posts.js';

document.addEventListener('DOMContentLoaded', function () {

    //todo: Alerts bootStrap on messages and errors
    //todo: apply boostStrap alerts function on messages/errors
    //todo: url and states of navigation
    //todo: CSS bruh :(
    //todo: hover on posts
    //todo: history ignorando autenticacao
    //todo: page withou login

    //events for clicks in nav links
    document.querySelector('#nav-link-profile').addEventListener('click', () => navigate('/profile/'));
    document.querySelector('#nav-link-all-posts').addEventListener('click', () => navigate('/all-posts/'));
    document.querySelector('#nav-link-following').addEventListener('click', () => navigate('/following/'));
    document.querySelector('#nav-link-main').addEventListener('click', () => navigate('/all-posts/'));

    //first interaction on site: load all posts
    router();
    
    window.addEventListener('popstate', router);

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
    document.querySelector('#div-edit-post').style.display = 'none';

    document.querySelector(`#div-${div_name}`).style.display = 'block';
}

export function show_div_alert(selector, content){
    const alertBox = selector.querySelector('.alert');

    selector.style.animation = 'none';
    void selector.offsetWidth;
    selector.style.animation = null;

    alertBox.textContent = content;
    selector.style.display = 'block';
    selector.style.animationPlayState = 'running';

    const onEnd = () => {
        alertBox.textContent = '';
        selector.style.display = 'none';
        selector.removeEventListener('animationend', onEnd);
    }

    selector.addEventListener('animationend', onEnd);
}

export function show_error(error_content){
    const div = document.querySelector('#div-error');
    show_div_alert(div, error_content);
}

export function show_message(message_content){
    const div = document.querySelector('#div-message');
    show_div_alert(div, message_content);
}

function navigate(path){
    history.pushState({path}, '', path);
    router();
}

function router() {
    const path = location.pathname;

    if (path === '/profile/' || path === '/profile') {
        load_page('profile');

    } else if (path === '/following/' || path === '/following') {
        load_page('following');

    } else if (path === '/all-posts/' || path === '/' || path === '/all-posts') {
        load_page('all-posts');

    } else {

        load_page('all-posts');
    }
}