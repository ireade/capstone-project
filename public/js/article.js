'use strict';

displayNavigationTemplate();

var guid = window.location.href.split('?guid=')[1];

Database.retrieve('Articles', 'guid', guid).then(function (articles) {
    var article = articles[0];
    var html = MyApp.templates.article(article);
    document.getElementById('article').innerHTML = html;
    console.log(article);
});