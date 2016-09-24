this["MyApp"] = this["MyApp"] || {};
this["MyApp"]["templates"] = this["MyApp"]["templates"] || {};
this["MyApp"]["templates"]["article"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return " <span class=\"article__meta__category\">"
    + this.escapeExpression(this.lambda(depth0, depth0))
    + "</span> ";
},"3":function(depth0,helpers,partials,data) {
    return "btn-bookmark--bookmarked";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"wrapper\">\n    <header class=\"article__header\">\n        <h2 class=\"article__title\">"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</h2>\n\n        <i class=\"fa fa-clock-o\"></i>\n        <date class=\"article__meta\">"
    + alias3((helpers.moment || (depth0 && depth0.moment) || alias1).call(depth0,(depth0 != null ? depth0.pubDate : depth0),{"name":"moment","hash":{},"data":data}))
    + "</date>\n        <br>\n        <i class=\"fa fa-tags\"></i>\n        <span class=\"article__meta\">\n            "
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.categories : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n        </span>\n    </header>\n    <div class=\"article__content\">\n        "
    + ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n    </div>\n    <footer class=\"article__footer\">\n\n        <a href=\"https://twitter.com/intent/tweet/?text='"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "'%20from%20bitsofco.de&url="
    + alias3(((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"link","hash":{},"data":data}) : helper)))
    + "&via=IreAderinokun\"\n           class=\"btn btn-large btn-share-twitter\"\n           target=\"_blank\">\n            <i class=\"fa fa-twitter\"></i>\n            <span>Share on Twitter</span>\n        </a>\n\n        <button class=\"btn btn-white btn-large btn-bookmark "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isBookmarked : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\"\n                data-guid=\""
    + alias3(((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"guid","hash":{},"data":data}) : helper)))
    + "\"\n                onclick=\"toggleBookmark(this)\">\n            <span class=\"isBookmarked\">\n                <i class=\"fa fa-check-circle\"></i>\n                <span>Bookmarked</span>\n            </span>\n            <span class=\"isNotBookmarked\">\n                <i class=\"fa fa-bookmark\"></i>\n                <span>Bookmark Article</span>\n            </span>\n        </button>\n\n        <!--<button class=\"btn btn-white btn-large btn-bookmark "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isBookmarked : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\"-->\n                <!--data-guid=\""
    + alias3(((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"guid","hash":{},"data":data}) : helper)))
    + "\"-->\n                <!--onclick=\"toggleBookmark(this)\">-->\n            <!--<span class=\"isBookmarked\">-->\n                <!--<i class=\"fa fa-check-circle\"></i>-->\n                <!--<span>Bookmarked</span>-->\n            <!--</span>-->\n            <!--<span class=\"isNotBookmarked\">-->\n                <!--<i class=\"fa fa-bookmark\"></i>-->\n                <!--<span>Bookmark Article</span>-->\n            <!--</span>-->\n        <!--</button>-->\n\n    </footer>\n</div>\n\n";
},"useData":true});
this["MyApp"]["templates"]["excerpt"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<article class=\"excerpt\">\n    <header class=\"excerpt__header\">\n        <h3 class=\"excerpt__title\">\n            <a href=\"article.html?guid="
    + alias3(((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"guid","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</a>\n        </h3>\n        <i class=\"fa fa-clock-o\"></i>\n        <date class=\"excerpt__meta\">"
    + alias3((helpers.moment || (depth0 && depth0.moment) || alias1).call(depth0,(depth0 != null ? depth0.pubDate : depth0),{"name":"moment","hash":{},"data":data}))
    + "</date>\n        <i class=\"fa fa-tags\"></i>\n        <span class=\"excerpt__meta\">\n            "
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.categories : depth0),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n        </span>\n    </header>\n\n    <div class=\"excerpt__content\">\n        "
    + ((stack1 = (helpers.excerpt || (depth0 && depth0.excerpt) || alias1).call(depth0,(depth0 != null ? depth0.description : depth0),{"name":"excerpt","hash":{},"data":data})) != null ? stack1 : "")
    + "\n    </div>\n    <div class=\"excerpt__footer\">\n        <a href=\"article.html?guid="
    + alias3(((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"guid","hash":{},"data":data}) : helper)))
    + "\" class=\"btn btn-default\">\n            <i class=\"fa fa-ellipsis-h\"></i>\n            <span>Read</span>\n        </a>\n\n\n        <button class=\"btn btn-default btn-bookmark "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isBookmarked : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\"\n                data-guid=\""
    + alias3(((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"guid","hash":{},"data":data}) : helper)))
    + "\"\n                onclick=\"toggleBookmark(this)\">\n            <span class=\"isBookmarked\">\n                <i class=\"fa fa-check-circle\"></i>\n                <span>Bookmarked</span>\n            </span>\n            <span class=\"isNotBookmarked\">\n                <i class=\"fa fa-bookmark\"></i>\n                <span>Bookmark</span>\n            </span>\n        </button>\n\n    </div>\n</article>\n";
},"2":function(depth0,helpers,partials,data) {
    return " <span class=\"excerpt__meta__category\">"
    + this.escapeExpression(this.lambda(depth0, depth0))
    + "</span> ";
},"4":function(depth0,helpers,partials,data) {
    return "btn-bookmark--bookmarked";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.items : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
this["MyApp"]["templates"]["nav"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "class=\"active\"";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<ul>\n    <li "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isLatest : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n        <a href=\"latest.html\">\n            <i class=\"fa fa-plus\"></i>\n            <span>Latest</span>\n        </a>\n    </li>\n    <li "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isHome : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n        <a href=\"index.html\">\n            <i class=\"fa fa-home\"></i>\n            <span>Home</span>\n        </a>\n    </li>\n    <li "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isSaved : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n        <a href=\"saved.html\">\n            <i class=\"fa fa-bookmark\"></i>\n            <span>Bookmarks</span>\n        </a>\n    </li>\n</ul>";
},"useData":true});