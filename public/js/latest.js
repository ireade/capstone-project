"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

displayNavigationTemplate({ isLatest: true });

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

var Article = function () {
    function Article(options) {
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
    }

    _createClass(Article, [{
        key: "save",
        value: function save() {
            console.log("about to save - " + this.title);
        }
    }]);

    return Article;
}();

Database.retrieve('Articles').then(function (articlesFromDatabase) {
    if (articlesFromDatabase.length == 0) {
        return fetchArticles();
    }
    return Promise.resolve(articlesFromDatabase);
}).then(function (articles) {
    var html = MyApp.templates.excerpt({ items: articles });
    document.getElementById('excerpts').innerHTML = html;
});