'use strict';

displayNavigationTemplate({ isSaved: true });

var excerptsEl = document.getElementById('excerpts');

Database.retrieve('Bookmarks', 'pubDate').then(function (bookmarkedArticles) {
    document.querySelector('.articles-count').innerHTML = bookmarkedArticles.length;
    return Promise.resolve(bookmarkedArticles);
}).then(function (articles) {
    var Articles = sortedArticles(articles);
    var html = MyApp.templates.excerpt({ items: Articles });
    excerptsEl.innerHTML = html;
});