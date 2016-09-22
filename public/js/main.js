'use strict';

var bitsofcode_rss_to_api_url = 'http://rss2json.com/api.json?rss_url=https://bitsofco.de/rss/';

/* HANDLEBARS HELPERS */

Handlebars.registerHelper('escape_html', function (value, options) {
    return value;
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