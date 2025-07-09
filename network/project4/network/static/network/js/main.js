import { load_profile } from './profile.js';
import {load_posts, new_post} from './posts.js';

document.addEventListener('DOMContentLoaded', function () {

    //todo: increase time of alerts of errors and messages
    //todo: CSS bruh :(
    //todo: ignore history
    //todo: fix the delay/conflict to render pages (all posts, following and etc)
    //new bug: form in all-posts/following not present (fixed)
    //todo: link edit post on profile option
    //todo: atualizar em tempo real o numero de seguidores/seguindo


    const auth = check_auth();
    const profile_menu = document.querySelector('#nav-link-profile');
    const following_menu = document.querySelector('#nav-link-following');
    if(profile_menu && following_menu){
        document.querySelector('#nav-link-profile').addEventListener('click', () => load_page('profile'));
        document.querySelector('#nav-link-following').addEventListener('click', () => load_page('following'));
    }
    //events for clicks in nav links
    document.querySelector('#nav-link-all-posts').addEventListener('click', () => load_page('all-posts'));
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

export function load_page(page) {
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
    document.querySelector('#div-form-all-posts').style.display = 'none';

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

export async function check_auth(){
    const response = await fetch('/user/status/');
    const data = await response.json();
    return data.authenticated;
}