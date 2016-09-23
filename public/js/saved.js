'use strict';

displayNavigationTemplate({ isSaved: true });

var excerptsEl = document.getElementById('excerpts');

Database.retrieve('Bookmarks', 'pubDate').then(function (bookmarkedArticles) {
    if (bookmarkedArticles.length == 0) {

        excerptsEl.innerHTML = "Looks like you haven't bookmarked any articles yet.";
        console.log("none saved yet");
    }
    document.querySelector('.articles-count').innerHTML = bookmarkedArticles.length;
    return Promise.resolve(bookmarkedArticles);
}).then(function (articles) {
    var html = MyApp.templates.excerpt({ items: articles });
    excerptsEl.innerHTML = html;
});