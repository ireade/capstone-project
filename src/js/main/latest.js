displayNavigationTemplate({isLatest: true});

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

function addToDatabase(article) {
    return new Promise((resolve, reject) => {
        Database.add('Articles', article)
            .then(() => { resolve(article) });
    })
}

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
            Articles.forEach((article) => {
                sequence = sequence.then(() => {
                    addToDatabase(article);
                })
            })
            return sequence;
        })
        .then(() => {
            return fetchedArticles;
        })
}


let Articles = [];


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



Database.retrieve('Articles', 'pubDate')
    .then((articlesFromDatabase) => {
        if (articlesFromDatabase.length == 0) {
            return fetchArticles();
        }
        return Promise.resolve(articlesFromDatabase);
    })
    .then((articles) => {
        Articles = articles;
        const html = MyApp.templates.excerpt({items: articles});
        document.getElementById('excerpts').innerHTML = html;
        return Promise.resolve();
    })
    .then(() => {
        console.log(Articles);
        return checkForNewArticles();
    })



