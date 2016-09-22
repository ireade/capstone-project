'use strict';

var bitsofcode_rss_to_api_url = 'http://rss2json.com/api.json?rss_url=https://bitsofco.de/rss/';

/* Database */

var Database = new IDB();

/* */

function toggleBookmark(buttonElement) {
    console.log("toggle");

    var guid = buttonElement.getAttribute('data-guid');

    function updateBookmarkStatus(article) {
        article.isBookmarked = !article.isBookmarked;
        Database.add('Articles', article).then(function () {
            console.log("done");
            buttonElement.classList.toggle('btn-bookmark--bookmarked');
        });
    }

    Database.retrieve('Articles', 'guid', guid).then(function (articles) {
        return articles[0];
    }).then(function (article) {
        updateBookmarkStatus(article);
    });
}

/* HANDLEBARS HELPERS */

Handlebars.registerHelper('excerpt', function (excerpt, options) {

    excerpt = excerpt + '...';

    return excerpt;
});

Handlebars.registerHelper('moment', function (value, options) {

    var rawDate = value;

    var m = moment(rawDate).calendar(null, {
        sameDay: '[Today]',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'MMM Do, YYYY'
    });

    return m;
});

/* UI Stuff */

var navigation = document.querySelector('.site-nav');

function displayNavigationTemplate(option) {
    navigation.innerHTML = MyApp.templates.nav(option);
}

var lastScrollPosition = 0;
window.onscroll = function () {
    var newScrollPosition = window.scrollY;
    var difference = lastScrollPosition - newScrollPosition;
    var differenceIsSignificant = difference > 10 | difference < -10;
    var scrollingUp = newScrollPosition < lastScrollPosition;
    var scrollingDown = newScrollPosition > lastScrollPosition;

    if (differenceIsSignificant) {
        if (scrollingUp) {
            navigation.classList.remove('hidden');
        } else if (scrollingDown) {
            navigation.classList.add('hidden');
        }
    }

    lastScrollPosition = newScrollPosition;
};