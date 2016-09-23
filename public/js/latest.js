'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

displayNavigationTemplate({ isLatest: true });

var Article = function Article(options) {
    _classCallCheck(this, Article);

    this.title = options.title;
    this.author = options.author;
    this.categories = options.categories;
    this.content = options.content;
    this.description = options.description;
    this.guid = options.guid;
    this.link = options.link;
    this.pubDate = new Date(options.pubDate).getTime();
    this.thumbnail = options.thumbnail;
    this.isBookmarked = false;
};

function addToDatabase(article) {
    return new Promise(function (resolve, reject) {
        Database.add('Articles', article).then(function () {
            resolve(article);
        });
    });
}

function fetchArticles() {

    var fetchedArticles = void 0;
    return fetch(bitsofcode_rss_to_api_url).then(function (response) {
        return response.json();
    }).then(function (response) {
        console.log("fetched");
        var articles = response.items;
        return articles.map(function (article) {
            return new Article(article);
        });
    }).then(function (Articles) {
        fetchedArticles = Articles;

        var sequence = Promise.resolve();
        Articles.forEach(function (article) {
            sequence = sequence.then(function () {
                addToDatabase(article);
            });
        });
        return sequence;
    }).then(function () {
        return fetchedArticles;
    });
}

var Articles = [];

function checkForNewArticles() {
    // return new Promise((resolve) => {
    //
    //     fetchArticles()
    //         .then((articles) => {
    //             console.log(articles);
    //         })
    //
    // })
}

Database.retrieve('Articles', 'pubDate').then(function (articlesFromDatabase) {
    if (articlesFromDatabase.length == 0) {
        return fetchArticles();
    }
    return Promise.resolve(articlesFromDatabase);
}).then(function (articles) {
    Articles = articles;
    var html = MyApp.templates.excerpt({ items: articles });
    document.getElementById('excerpts').innerHTML = html;
    return Promise.resolve();
}).then(function () {
    console.log(Articles);
    return checkForNewArticles();
});