const bitsofcode_rss_to_api_url = 'http://rss2json.com/api.json?rss_url=https://bitsofco.de/rss/';
const Database = new IDB();
let myNotificationsService;

/* **************

    Bookmark Article

 *************** */
function toggleBookmark(buttonElement) {
    const guid = buttonElement.getAttribute('data-guid');

    function toggleButtonClass() {
        buttonElement.classList.toggle('btn-bookmark--bookmarked');
    }

    function addArticleToBookmarks() {
        Database.retrieve('Articles', 'guid', guid)
            .then((articles) => {
                const article = articles[0];
                article.isBookmarked = true;
                Database.add('Articles', article);
                Database.add('Bookmarks', article).then(() => toggleButtonClass());
            })
    }

    function removeArticleFromBookmarks() {
        Database.remove('Bookmarks', false, 'guid', guid).then(() => toggleButtonClass());
    }

    Database.retrieve('Bookmarks', 'guid', guid)
        .then((articles) => {
            console.log( articles );
            if ( articles.length === 0 ) return addArticleToBookmarks();
            removeArticleFromBookmarks();
        });
}



/* **************

  General Helper Functions

 *************** */

function sortedArticles(unsortedArticles) {
    return unsortedArticles.sort(function(a,b){
        return new Date(b.pubDate) - new Date(a.pubDate);
    });
}

/* **************

Handlebars Helpers

 *************** */

Handlebars.registerHelper('excerpt', function (excerpt, options) {

    const lastParagraphIndex = excerpt.lastIndexOf("</p>");

    excerpt = excerpt.slice(0, lastParagraphIndex) + '....' + excerpt.slice(lastParagraphIndex);


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



/* **************

    UI Stuff

 *************** */

const navigation = document.querySelector('.site-nav');

function displayNavigationTemplate(option) {
    navigation.innerHTML = MyApp.templates.nav(option);
}



let lastScrollPosition = 0;
window.onscroll = () => {
    const newScrollPosition = window.scrollY;
    const difference = lastScrollPosition - newScrollPosition;
    const differenceIsSignificant = difference > 10 | difference < -10;
    const scrollingUp = newScrollPosition < lastScrollPosition;
    const scrollingDown = newScrollPosition > lastScrollPosition;

    if ( differenceIsSignificant ) {
        if ( scrollingUp ) {
            navigation.classList.remove('hidden');
        } else if ( scrollingDown ) {
            navigation.classList.add('hidden');
        }
    }

    lastScrollPosition = newScrollPosition;
}


/* **************

 Service Worker

 *************** */

if ( 'serviceWorker' in navigator ) {
    navigator
        .serviceWorker
        .register('./service-worker.js')
        .then(function(reg) {
            console.log('Service Worker Registered', reg);
            myNotificationsService = new NotificationsService(reg);
        })
        .catch(function(err) {
            console.log('Service Worker Failed to Register', err);
        });
}

