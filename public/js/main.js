'use strict';

var bitsofcode_rss_to_api_url = 'http://rss2json.com/api.json?rss_url=https://bitsofco.de/rss/';

/* Database */

var Database = new IDB();

/* */

function toggleBookmark(buttonElement) {

    var guid = buttonElement.getAttribute('data-guid');

    function toggleButtonClass() {
        buttonElement.classList.toggle('btn-bookmark--bookmarked');
    }

    function addArticleToBookmarks() {
        Database.retrieve('Articles', 'guid', guid).then(function (articles) {
            var article = articles[0];
            Database.add('Bookmarks', article).then(function () {
                return toggleButtonClass();
            });
        });
    }

    function removeArticleFromBookmarks() {
        Database.remove('Bookmarks', false, 'guid', guid).then(function () {
            return toggleButtonClass();
        });
    }

    Database.retrieve('Bookmarks', 'guid', guid).then(function (articles) {
        if (articles.length === 0) return addArticleToBookmarks();
        removeArticleFromBookmarks();
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