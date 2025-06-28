document.addEventListener('DOMContentLoaded', function(){

    document.querySelector('#nav-link-profile').addEventListener('click', () => load_page('profile'));
    document.querySelector('#nav-link-all-posts').addEventListener('click', () => load_page('all-posts'));
    document.querySelector('#nav-link-following').addEventListener('click', () => load_page('following'));

    load_page('all-posts');
    load_posts(1);
})


function load_page(page){
    document.querySelector('#div-profile').style.display = 'none';
    document.querySelector('#div-all-posts').style.display = 'none';
    document.querySelector('#div-following').style.display = 'none';

    document.querySelector(`#div-${page}`).style.display = 'block';

    if(page === 'all-posts'){
        load_posts(1);
    }
}

function load_posts(page_number){
    if(page_number === 1){
        document.querySelector('#page-item-previous').classList.add('disabled');
    }
    fetch(`/posts?page=${page_number}`, {
        method : 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        document.querySelector('#div-number-pages').innerHTML = '';
        document.querySelector('#div-load-posts').innerHTML = '';

        generate_navigation_page(data);

        generate_elements_post(data);

        
        if(!data.has_next){}
    })
}

function generate_elements_post(data){
    data.posts.forEach(post =>{

        const div_post = document.createElement('div');
        div_post.classList.add('post-loaded');

        const heading_author = document.createElement('h4');
        heading_author.innerHTML = post.author.username;

        const num_followers = document.createElement('p');
        num_followers.innerHTML = `Followers: ${post.author.followers}`;

        const content = document.createElement('p');
        content.innerHTML = post.content;

        const num_likes = document.createElement('p');
        num_likes.innerHTML = `Likes: ${post.likes}`;

        const date = document.createElement('p');
        date.innerHTML = post.date;

        div_post.appendChild(heading_author);
        div_post.appendChild(num_followers);
        div_post.appendChild(content);
        div_post.appendChild(num_likes);
        div_post.appendChild(date);

        document.querySelector('#div-load-posts').appendChild(div_post);

        const line = document.createElement('hr');
        document.querySelector('#div-load-posts').appendChild(line);
    })
}

function generate_navigation_page(data){
    const button_previous = document.querySelector('#page-item-previous');
    const button_next = document.querySelector('#page-item-next');
    
    if(!data.has_previous){
        button_previous.classList.add('disabled');
    }
    if(!data.has_next){
        button_next.classList.add('disabled');
    }

    //Logic for navigation buttons
        for(let i = 1; i <= data.total_pages; i++){

            const li = document.createElement('li');
            li.classList.add('page-item');

            if(i === data.current_page){
                li.classList.add('active');
            }

            const link = document.createElement('a');
            link.classList.add('page-link');
            link.setAttribute('data-set', i)
            link.innerHTML = i;

            li.appendChild(link);
            document.querySelector('#div-number-pages').appendChild(li);

        }
}