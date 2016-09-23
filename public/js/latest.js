"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

displayNavigationTemplate({ isLatest: true });

/* Classes and Variables */

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

var Articles = [];
var didFetchArticlesFromDatabase = false;

/* Database Functions */
function addToDatabase(article) {
    return new Promise(function (resolve, reject) {
        Database.add('Articles', article).then(function () {
            resolve(article);
        });
    });
}
function clearDatabase() {
    console.log("clearDatabase");
    // @todo
    // 1 - get all Articles from database
    // 2 - get the 15 most recent articles
    // 3 - delete the rest
}

/* Getting Articles, Updating in Background, etc */
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
            return sequence = sequence.then(function () {
                return addToDatabase(article);
            });
        });
        return sequence;
    }).then(function () {
        return fetchedArticles;
    });
}
function checkForNewArticles() {
    function isNewArticle(article) {
        Articles.find(function (oldArticle) {
            if (oldArticle.title === article.title) return false;
            return true;
        });
    }
    var newArticles = [];
    return new Promise(function (resolve, reject) {
        fetchArticles().then(function (articles) {
            articles.forEach(function (article) {
                if (isNewArticle(article)) newArticles.push(article);
            });
            resolve(newArticles);
        }).catch(function (err) {
            return reject(err);
        });
    });
}
function updateArticlesInBackground() {
    checkForNewArticles().then(function (newArticles) {
        console.log(newArticles);
        if (newArticles.length === 0) return;
        Articles.unshift(newArticles);
        clearDatabase();
    });
}

/* Start */
Database.retrieve('Articles', 'pubDate').then(function (articlesFromDatabase) {
    if (articlesFromDatabase.length == 0) return fetchArticles();
    didFetchArticlesFromDatabase = true;
    return Promise.resolve(articlesFromDatabase);
}).then(function (articles) {
    Articles = articles;
    var html = MyApp.templates.excerpt({ items: articles });
    document.getElementById('excerpts').innerHTML = html;
    return Promise.resolve();
}).then(function () {
    if (didFetchArticlesFromDatabase) updateArticlesInBackground();
});