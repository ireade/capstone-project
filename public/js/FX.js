'use strict';

function FX() {}

FX.prototype._createFXCard = function (fx) {

    var currencyInformation = this.currencyInformation;

    console.log(currencyInformation);

    var id = fx.base.currency + '-' + fx.compare.currency;
    var card = '<li class="fx" id="' + id + '">\n                    <div class="rates">\n                        <div class="rate rate__base">\n                            <span class="fx__currency">' + currencyInformation[fx.base.currency].name_plural + '</span>\n                            <span class="fx__amount">\n                              ' + currencyInformation[fx.base.currency].symbol + '\n                              ' + fx.base.amount + '\n                            </span>\n                        </div>\n                        <div class="rate rate__compare">\n                            <span class="fx__currency">' + currencyInformation[fx.compare.currency].name_plural + '</span>\n                            <span class="fx__amount">\n                              ' + currencyInformation[fx.compare.currency].symbol + '\n                              ' + fx.compare.amount + '\n                            </span>\n                        </div>\n                    </div>\n                    <div class="converter">\n                        <div class="exchange exchange__base" data-rate="' + fx.base.amount + '">\n                            <input type="number" value="' + fx.base.amount + '" data-parent-id="' + id + '"/>\n                        </div>\n                        <div class="exchange exchange__compare" data-rate="' + fx.compare.amount + '">\n                            <input type="number" value="' + fx.compare.amount + '" data-parent-id="' + id + '"/>\n                        </div>\n                    </div>\n                    <div class="actions">\n                        <div>\n                            <button type="button" class="btn btn-convert">\n                                <img src="./img/icon-convert.png" alt="" />\n                                Convert\n                            </button>\n                        </div>\n                        <div>\n                            <button type="button" class="btn btn-remove">\n                                <img src="./img/icon-delete.png" alt="" />\n                                Remove\n                            </button>\n                        </div>\n                    </div>\n                </li>';

    var cardEl = document.getElementById(id);
    if (cardEl) {
        cardEl.outerHTML = card;
    } else {
        fxList.insertAdjacentHTML('afterbegin', card);
    }
};

FX.prototype._addEventListeners = function () {

    var calculate = function calculate(el, elToUpdate) {
        var value = parseFloat(el.value);
        var exchangeRate = parseFloat(document.querySelector('#' + el.dataset.parentId + ' .exchange__compare').dataset.rate);

        switch (elToUpdate) {
            case 'compare':
                var el = document.querySelector('#' + el.dataset.parentId + ' .exchange__' + elToUpdate + ' input');
                el.value = value * exchangeRate;
                break;

            case 'base':
                var el = document.querySelector('#' + el.dataset.parentId + ' .exchange__' + elToUpdate + ' input');
                el.value = value / exchangeRate;
                break;

            default:
                break;
        }
    }; // end calculate

    var removeCurrency = function removeCurrency(currency) {
        offlineFXDatabase.remove('Currencies', null, 'full', currency).then(function () {
            return myFX.init();
        });
    };

    var items = document.querySelectorAll('.fx');
    items.forEach(function (item) {

        var id = item.getAttribute('id');

        var inputBase = document.querySelector('#' + id + ' .exchange__base input');
        inputBase.addEventListener('keyup', function (e) {
            calculate(e.target, 'compare');
        });

        var inputCompare = document.querySelector('#' + id + ' .exchange__compare input');
        inputCompare.addEventListener('keyup', function (e) {
            calculate(e.target, 'base');
        });

        var convertButton = document.querySelector('#' + id + ' .btn-convert');
        convertButton.addEventListener('click', function (e) {
            document.querySelector('#' + id + ' .converter').classList.toggle('open');
        });

        var removeButton = document.querySelector('#' + id + ' .btn-remove');
        removeButton.addEventListener('click', function (e) {
            removeCurrency(id);
        });
    });
};

FX.prototype._createFXObject = function (data) {

    var lastUpdated = data.clientTimestamp;
    lastUpdated = moment(lastUpdated).calendar(null, {
        sameDay: '[Today at] h:mma',
        nextDay: '[Tomorrow at] h:mma',
        nextWeek: '[Next] dddd [at] h:mma',
        lastDay: '[Yesterday at] h:mma',
        lastWeek: '[Last] dddd [at] h:mma',
        sameElse: '[on] dddd Do MMMM [at] h:mma'
    });

    var lastUpdatedEl = document.querySelector('.last-updated');
    lastUpdatedEl.innerHTML = 'Last updated: ' + lastUpdated;

    var baseCurrency = data.source;

    var currencies = [];
    for (var key in data.quotes) {
        currencies.push({
            base: {
                currency: baseCurrency,
                amount: '1'
            },
            compare: {
                currency: key.split(baseCurrency)[1],
                amount: parseInt(data.quotes[key]).toFixed(4)
            }
        });
    }

    currencies.map(this._createFXCard);
    this._addEventListeners();
};

FX.prototype._handleEmptyState = function () {
    new Toast('success', "Looks like you haven't set any currencies yet. Press the + to get started!");
};

FX.prototype._fetchAndSave = function (url, shouldFirstRemoveFromDB) {
    return fetch(url).then(function (fetchedResponse) {
        return fetchedResponse.json();
    }).then(function (fetchedResponse) {

        fetchedResponse.url = url;
        fetchedResponse.clientTimestamp = new Date().getTime();

        var sequence = Promise.resolve();

        if (shouldFirstRemoveFromDB) {
            sequence = sequence.then(function () {
                return offlineFXDatabase.remove('FX', 'url', 'url', url);
            });
        }

        sequence = sequence.then(function () {
            return offlineFXDatabase.add('FX', fetchedResponse).then(function () {
                return Promise.resolve(fetchedResponse);
            });
        });

        return sequence;
    });
};

FX.prototype._doBackgroundUpdate = function (url, fetchedFromDatabase) {
    var _this = this;

    if (!fetchedFromDatabase) return;
    this._fetchAndSave(url, true).then(function (data) {
        return _this._createFXObject(data);
    }).catch(function () {
        console.log("looks like there's no wifi connection to update in background");
    });
};

FX.prototype._initEachFX = function (item) {
    var _this2 = this;

    var url = API_URL + '&currencies=' + item.compare + '&source=' + item.base;
    var fetchedFromDatabase = false;

    offlineFXDatabase.retrieve('FX', 'url', url).then(function (dbResponse) {
        console.log(dbResponse);
        if (dbResponse.length > 0) {
            fetchedFromDatabase = true;
            return Promise.resolve(dbResponse[0]);
        }
        return _this2._fetchAndSave(url);
    }).then(function (data) {
        return _this2._createFXObject(data);
    })
    //.then(() => this._doBackgroundUpdate(url, fetchedFromDatabase))
    .catch(function (err) {
        console.log("error somewhere");
    });
};

FX.prototype.init = function () {
    var _this3 = this;

    offlineFXDatabase.retrieve('Currencies').then(function (currenciesResponse) {
        if (currenciesResponse.length == 0) {
            _this3._handleEmptyState();
            return Promise.reject({ displayErrorMessage: false });
        }
        fxList.innerHTML = '';
        currenciesResponse.forEach(function (item) {
            return _this3._initEachFX(item);
        });
    }).catch(function (err) {
        if (err.displayErrorMessage === false) {
            return;
        }
        new Toast('error', "Uh oh, there was an error fetching information");
    });
};