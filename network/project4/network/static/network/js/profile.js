import {show_div} from './main.js'
//If id is not passed: 'owner_account' for Default
export function load_profile(id = 'owner_account'){

    show_div('profile');

    fetch(`/profile?id=${id}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);

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
        div.classList.add('profile-post');

        const content = document.createElement('p');
        content.innerHTML = post.content;

        const likes = document.createElement('span');
        likes.innerHTML = `<strong>Likes:</strong> ${post.likes}`;
        
        const date = document.createElement('span');
        date.innerHTML = `<strong>Posted:</strong> ${post.date}`;

        const line = document.createElement('hr');

        div.append(content, likes, date, line);
        document.querySelector('#div-profile').appendChild(div);
    })
}

export function follow_user(id){
    fetch(`/profile/follow?id_follow=${id}`)
    .then(response => response.json())
    .then(data => {
        let status_follow = null;
        if(data.error){
            console.log('User not Found');
        }

        if(data.follow){
            status_follow = 'Unfollow';
        }else{
            status_follow = 'Follow';
        }
        document.querySelector('#profile-follow').innerHTML = status_follow;
    })

}