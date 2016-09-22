const navHTML = MyApp.templates.nav({isLatest: true});
document.querySelector('.site-nav').innerHTML = navHTML;

fetch(bitsofcode_rss_to_api_url)
    .then((response) => response.json())
    .then((response) => {
        console.log(response);
            const html = MyApp.templates.excerpt(response);
            document.getElementById('excerpts').innerHTML = html;
    })

