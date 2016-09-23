displayNavigationTemplate({isLatest: true});

/* Classes and Variables */
class Article {
    constructor(options) {
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
}
let Articles = [];
let didFetchArticlesFromDatabase = false;


/* Database Functions */
function addToDatabase(article) {
    return new Promise((resolve, reject) => {
        Database.retrieve('Articles', 'guid', article.guid)
            .then((articles) => {
                if ( articles.length === 1 ) return resolve(article)
                Database.add('Articles', article).then(() => { resolve(article) });
            })
    })
}
function clearDatabase() {
    function removeArticle(guid) {
        Database.remove('Articles', false, 'guid', guid)
    }
    Database.retrieve('Articles', 'pubDate')
        .then((articlesFromDatabase) => {
            Articles = sortedArticles(articlesFromDatabase);
            const guidsOfArticlesToDelete = [];
            for (let i = 10; i < Articles.length; i++) {
                guidsOfArticlesToDelete.push( Articles[i].guid );
            }
            return Promise.resolve(guidsOfArticlesToDelete)
        })
        .then((guids) => { guids.forEach(guid => removeArticle) })
}

/* Getting Articles, Updating in Background, etc */
function fetchArticles() {
    let fetchedArticles;
    return fetch(bitsofcode_rss_to_api_url)
        .then((response) => response.json())
        .then((response) => {
            console.log("fetched");
            let articles = response.items;
            return articles.map((article) => new Article(article));
        })
        .then((Articles) => {
            fetchedArticles = Articles;
            let sequence = Promise.resolve();
            Articles.forEach((article) => sequence = sequence.then(() => addToDatabase(article)) )
            return sequence;
        })
        .then(() => {
            return fetchedArticles;
        })
}
function checkForNewArticles() {
    function isNewArticle(article) {
        Articles.find((oldArticle) => {
            if ( oldArticle.title === article.title ) return false
            return true
        })
    }
    const newArticles = [];
    return new Promise((resolve, reject) => {
        fetchArticles()
            .then((articles) => {
                articles.forEach((article) => { if ( isNewArticle(article) ) newArticles.push(article) });
                resolve(newArticles);
            })
            .catch((err) => reject(err))
    })
}
function updateArticlesInBackground() {
    checkForNewArticles()
        .then((newArticles) => {
            console.log(newArticles);
            if ( newArticles.length === 0 ) return
            Articles.unshift(newArticles);
            clearDatabase();
        })
}

/* Start */
Database.retrieve('Articles', 'pubDate')
    .then((articlesFromDatabase) => {
        if (articlesFromDatabase.length == 0) return fetchArticles()
        didFetchArticlesFromDatabase = true;
        return Promise.resolve(articlesFromDatabase);
    })
    .then((articles) => {
        Articles = sortedArticles(articles);
        const html = MyApp.templates.excerpt({items: articles});
        document.getElementById('excerpts').innerHTML = html;
        return Promise.resolve();
    })
    .then(() => { if (didFetchArticlesFromDatabase) updateArticlesInBackground() });