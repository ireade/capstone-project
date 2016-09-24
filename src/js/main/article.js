displayNavigationTemplate();

const guid = window.location.href.split('?guid=')[1];

Database.retrieve('Articles', 'guid', guid)
    .then((articles) => {
        const article = articles[0];
        const html = MyApp.templates.article(article);
        document.getElementById('article').innerHTML = html;
    })

