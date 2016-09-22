'use strict';

var navHTML = MyApp.templates.nav({ isLatest: true });
document.querySelector('.site-nav').innerHTML = navHTML;

fetch(bitsofcode_rss_to_api_url).then(function (response) {
    return response.json();
}).then(function (response) {
    console.log(response);
    var html = MyApp.templates.excerpt(response);
    document.getElementById('excerpts').innerHTML = html;
});