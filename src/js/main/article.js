
const navHTML = MyApp.templates.nav();
document.querySelector('.site-nav').innerHTML = navHTML;

fetch(bitsofcode_rss_to_api_url)
    .then((response) => response.json())
    .then((response) => {
        const article = response.items[0];
        console.log(article);
        const html = MyApp.templates.article(article);
        document.getElementById('article').innerHTML = html;
    })

