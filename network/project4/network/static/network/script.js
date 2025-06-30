document.addEventListener('DOMContentLoaded', function () {

    //TODO: clicks for buttons navigation page
    //todo: options in nav
    //todo: page following
    //todo: page profile

    document.querySelector('#nav-link-profile').addEventListener('click', () => load_page('profile'));
    document.querySelector('#nav-link-all-posts').addEventListener('click', () => load_page('all-posts'));
    document.querySelector('#nav-link-following').addEventListener('click', () => load_page('following'));

    load_page('all-posts');
    load_posts(1);

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
    document.querySelector('#div-following').style.display = 'none';

    document.querySelector(`#div-${page}`).style.display = 'block';

    if (page === 'all-posts') {
        load_posts(1);
    }
    if (page === 'profile'){
        load_profile();
    }
}

function load_profile(){
    fetch('/profile?id=owner_account')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        generate_elements_profile(data.profile);
    })
}

function generate_elements_profile(profile){
    const heading_user = document.createElement('h4');
    heading_user.innerHTML = `<strong>${profile.username}</strong>`;

    const num_followers = document.createElement('span')
    num_followers.innerHTML = `<strong>Followers:</strong> ${profile.followers}`;

    const num_following = document.createElement('span');
    num_following.innerHTML = `<strong>Following:</strong> ${profile.following}`;

    const line = document.createElement('hr');

    document.querySelector('#div-profile').append(heading_user, num_followers, num_following, line);

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

function load_posts(page_number) {
    document.querySelector('#div-form-all-posts').style.display = 'block';
    if (page_number === 1) {
        document.querySelector('#page-item-previous').classList.add('disabled');
    }
    fetch(`/posts?page=${page_number}`, {
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
        num_likes.innerHTML = `<strong>Likes:</strong> ${post.likes}`;

        const date = document.createElement('p');
        date.innerHTML = `<strong>Posted:</strong> ${post.date}`;

        const line = document.createElement('hr');

        div_post.append(heading_author, num_followers, content, num_likes, date, line);
        document.querySelector('#div-load-posts').appendChild(div_post);

        div_post.addEventListener('click', ()=>{
            get_post(post.id);
        });
    })
}

function generate_div_one_post(post) {

    const div_post = document.createElement('div');
    div_post.classList.add('post-loaded');

    const heading_author = document.createElement('h4');
    heading_author.innerHTML = post.author.username;

    const num_followers = document.createElement('p');
    num_followers.innerHTML = `<strong>Followers:</strong> ${post.author.followers}`

    const content = document.createElement('p');
    content.innerHTML = post.content;

    const num_likes = document.createElement('p');
    num_likes.innerHTML = `<strong>Likes:</strong> ${post.likes}`;

    const date = document.createElement('p');
    date.innerHTML = `<strong>Posted:</strong> ${post.date}`;

    const back_button = document.createElement('button');
    back_button.innerHTML = 'Back to feed';

    div_post.append(heading_author, num_followers, content, num_likes, date, back_button);
    document.querySelector('#div-load-posts').appendChild(div_post);

    back_button.onclick = () => load_posts(1);
}

function generate_navigation_page(data) {
    document.querySelector('#div-page-navigation').style.display = 'block';
    const button_previous = document.querySelector('#page-item-previous');
    const button_next = document.querySelector('#page-item-next');

    if (!data.has_previous) {
        button_previous.classList.add('disabled');
    }
    if (!data.has_next) {
        button_next.classList.add('disabled');
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
        link.setAttribute('data-page', i)
        link.innerHTML = i;

        li.appendChild(link);
        document.querySelector('#div-number-pages').appendChild(li);

    }
}

function new_post(content){
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

function get_post(id) {
    fetch(`/posts/view?id=${id}`)
        .then(response => response.json())
        .then(post => {
            console.log(post);
            document.querySelector('#div-page-navigation').style.display = 'none';
            document.querySelector('#div-form-all-posts').style.display = 'none';
            document.querySelector('#div-load-posts').innerHTML = '';
        
            generate_div_one_post(post.post);

        })
}

function get_csrf_token(){
    return document.querySelector('[name=csrf-token]').content;
}
