'use strict';

var navHTML = MyApp.templates.nav();
document.querySelector('.site-nav').innerHTML = navHTML;

fetch(bitsofcode_rss_to_api_url).then(function (response) {
    return response.json();
}).then(function (response) {
    var article = response.items[0];
    console.log(article);
    var html = MyApp.templates.article(article);
    document.getElementById('article').innerHTML = html;
});