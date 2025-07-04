document.addEventListener('DOMContentLoaded', function(){

    document.querySelector('#nav-link-profile').addEventListener('click', () => load_page('profile'));
    document.querySelector('#nav-link-all-posts').addEventListener('click', () => load_page('all-posts'));
    document.querySelector('#nav-link-following').addEventListener('click', () => load_page('following'));

    load_page('all-posts')
    load_posts(1)
})


function load_page(page){
    document.querySelector('div-profile').style.display = 'none';
    document.querySelector('div-all-posts').style.display = 'none';
    document.querySelector('div-following').style.display = 'none';

    document.querySelector(`div-${page}`).style.display = 'block';
}

function load_posts(page_number){
    fetch(`/posts?page=${page_number}`)
    .then(response => response.json())
    .then(data => {
        document.querySelector('div-load-posts').innerHTML = ""

        data.posts.forEach(post => {

            const div = document.createElement('div');
            div.classList.add('post-loaded');

            const heading = document.createElement('h4');
            heading.innerHTML = post.author;

            const content = document.createElement('p');
            content.innerHTML = post.content;

            const number_likes = document.createElement('p');
            number_likes.innerHTML = post.likes.count();

            const date = document.createElement('p');
            date.innerHTML = post.date;

            div.appendChild(heading);
            div.appendChild(content);
            div.appendChild(number_likes);
            div.appendChild(date);

            document.querySelector('#div-load-posts').appendChild(div)
        })

    })

}