import {show_div, show_error} from './main.js'
import {edit_post_load, get_post, like_post} from './posts.js'
//If id is not passed: 'owner_account' for Default
export function load_profile(id = 'owner_account'){

    show_div('profile');

    fetch(`/profile/?id=${id}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        console.log(data.profile);
        if(data.error){
            show_error(data.error);
        }

        document.querySelector('#div-profile').innerHTML = '';

        generate_elements_profile(data.profile, data.is_owner, data.is_following);
    })
}

function generate_elements_profile(profile, is_owner, is_following){

    const heading_user = document.createElement('h4');
    heading_user.innerHTML = `<strong>${profile.username}</strong>`;

    const num_followers = document.createElement('span')
    num_followers.innerHTML = `<strong>Followers:</strong> ${profile.followers}`;

    const num_following = document.createElement('span');
    num_following.innerHTML = `<strong>Following:</strong> ${profile.following}`;

    const button_follow = document.createElement('button')
    button_follow.id = 'profile-follow';
    button_follow.innerHTML = is_following ? 'Unfollow' : 'Follow';

    const line = document.createElement('hr');

    if(!is_owner){
        document.querySelector(`#div-profile`).append(heading_user, num_followers, num_following, button_follow, line);
        button_follow.onclick = () =>{
            follow_user(profile.id);
        }
    }else{
        document.querySelector('#div-profile').append(heading_user, num_followers, num_following, line);
    }

    profile.posts_created.forEach(post => {
        const div = document.createElement('div');
        div.classList.add('post-loaded');
        div.classList.add('profile-post');
        div.style.cursor = 'pointer';
        div.onclick = () => {
            get_post(post.id);
        }

        const content = document.createElement('p');
        content.classList.add('post-loaded-content');
        content.innerHTML = post.content;

        const likes = document.createElement('p');
        likes.classList.add('post-loaded-num-likes');
        likes.dataset.id = post.id;
        likes.innerHTML = `<strong>Likes:</strong> ${post.likes}`;

        const button_like = document.createElement('button');
        button_like.classList.add('post-loaded-button-like');
        button_like.dataset.id = post.id;
        button_like.innerHTML = post.liked_by_user ? "Dislike" : "Like";
        button_like.onclick = (event) =>{
            event.stopPropagation();
            like_post(post.id, event);
        }
        
        const date = document.createElement('p');
        date.classList.add('post-loaded-date');
        date.innerHTML = `<strong>Posted:</strong> ${post.date}`;

        const line = document.createElement('hr');

        div.append(content, likes, button_like);
        if(is_owner){
            const link_edit = document.createElement('a');
            link_edit.classList.add('post-loaded-edit');
            link_edit.innerHTML = 'Edit';
            link_edit.addEventListener('click', (event) => {
                event.stopPropagation();
                edit_post_load(post.id)
            });
            div.append(link_edit);
        }

        div.append(date, line);
        document.querySelector('#div-profile').appendChild(div);
    })
}

export function follow_user(id){
    fetch(`/profile/follow/?id_follow=${id}`)
    .then(response => response.json())
    .then(data => {
        let status_follow = null;
        if(data.error){
            show_error(data.error);
        }

        if(data.follow){
            status_follow = 'Unfollow';
        }else{
            status_follow = 'Follow';
        }
        document.querySelector('#profile-follow').innerHTML = status_follow;
    })

}