displayNavigationTemplate({isSaved: true});

const excerptsEl = document.getElementById('excerpts');

Database.retrieve('Bookmarks', 'pubDate')
    .then((bookmarkedArticles) => {
        if ( bookmarkedArticles.length == 0 ) {

            excerptsEl.innerHTML = "Looks like you haven't bookmarked any articles yet.";
            console.log("none saved yet");
        }
        document.querySelector('.articles-count').innerHTML = bookmarkedArticles.length;
        return Promise.resolve(bookmarkedArticles);
    })
    .then((articles) => {
        const html = MyApp.templates.excerpt({ items: articles });
        excerptsEl.innerHTML = html;
    });


