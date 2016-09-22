function FX() {}

FX.prototype._createFXCard = function(fx) {

    let currencyInformation = this.currencyInformation;

    console.log(currencyInformation);

  const id = `${fx.base.currency}-${fx.compare.currency}`;
  const card = `<li class="fx" id="${id}">
                    <div class="rates">
                        <div class="rate rate__base">
                            <span class="fx__currency">${ currencyInformation[fx.base.currency].name_plural }</span>
                            <span class="fx__amount">
                              ${ currencyInformation[fx.base.currency].symbol }
                              ${ fx.base.amount }
                            </span>
                        </div>
                        <div class="rate rate__compare">
                            <span class="fx__currency">${ currencyInformation[fx.compare.currency].name_plural }</span>
                            <span class="fx__amount">
                              ${ currencyInformation[fx.compare.currency].symbol }
                              ${ fx.compare.amount }
                            </span>
                        </div>
                    </div>
                    <div class="converter">
                        <div class="exchange exchange__base" data-rate="${ fx.base.amount }">
                            <input type="number" value="${ fx.base.amount }" data-parent-id="${id}"/>
                        </div>
                        <div class="exchange exchange__compare" data-rate="${ fx.compare.amount }">
                            <input type="number" value="${ fx.compare.amount }" data-parent-id="${id}"/>
                        </div>
                    </div>
                    <div class="actions">
                        <div>
                            <button type="button" class="btn btn-convert">
                                <img src="./img/icon-convert.png" alt="" />
                                Convert
                            </button>
                        </div>
                        <div>
                            <button type="button" class="btn btn-remove">
                                <img src="./img/icon-delete.png" alt="" />
                                Remove
                            </button>
                        </div>
                    </div>
                </li>`;

    const cardEl = document.getElementById(id);
    if ( cardEl ) {
        cardEl.outerHTML = card;
    } else {
        fxList.insertAdjacentHTML('afterbegin', card);
    }

};

FX.prototype._addEventListeners = function() {

    const calculate = (el, elToUpdate) => {
        const value = parseFloat(el.value);
        const exchangeRate = parseFloat( document.querySelector(`#${el.dataset.parentId} .exchange__compare`).dataset.rate    );

        switch(elToUpdate) {
            case 'compare':
                var el = document.querySelector(`#${el.dataset.parentId} .exchange__${elToUpdate} input`);
                el.value = value * exchangeRate;
                break;

            case 'base':
                var el = document.querySelector(`#${el.dataset.parentId} .exchange__${elToUpdate} input`);
                el.value = value / exchangeRate;
                break;

            default:
                break;
        }
    }; // end calculate

    const removeCurrency = (currency) => {
        offlineFXDatabase.remove('Currencies', null, 'full', currency)
        .then(() => myFX.init() );
    };

    const items = document.querySelectorAll('.fx');
    items.forEach(function(item) {

        const id = item.getAttribute('id');

        const inputBase = document.querySelector(`#${id} .exchange__base input`);
        inputBase.addEventListener('keyup', function(e) {
            calculate(e.target, 'compare');
        })

        const inputCompare = document.querySelector(`#${id} .exchange__compare input`);
        inputCompare.addEventListener('keyup', function(e) {
            calculate(e.target, 'base');
        })

        const convertButton = document.querySelector(`#${id} .btn-convert`);
        convertButton.addEventListener('click', function(e) {
            document.querySelector(`#${id} .converter`).classList.toggle('open');
        })

        const removeButton = document.querySelector(`#${id} .btn-remove`);
        removeButton.addEventListener('click', function(e) {
            removeCurrency(id);
        })

    });

};


FX.prototype._createFXObject = function(data) {

    let lastUpdated = data.clientTimestamp;
    lastUpdated = moment(lastUpdated).calendar(null, {
        sameDay: '[Today at] h:mma',
        nextDay: '[Tomorrow at] h:mma',
        nextWeek: '[Next] dddd [at] h:mma',
        lastDay: '[Yesterday at] h:mma',
        lastWeek: '[Last] dddd [at] h:mma',
        sameElse: '[on] dddd Do MMMM [at] h:mma'
    });

    const lastUpdatedEl = document.querySelector('.last-updated');
    lastUpdatedEl.innerHTML = `Last updated: ${lastUpdated}`;

    const baseCurrency = data.source;

    const currencies = [];
    for (let key in data.quotes) {
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

    currencies.map( this._createFXCard );
    this._addEventListeners();
}


FX.prototype._handleEmptyState = function() {
    new Toast('success', "Looks like you haven't set any currencies yet. Press the + to get started!");
}

FX.prototype._fetchAndSave = function(url, shouldFirstRemoveFromDB) {
    return fetch(url)
    .then( (fetchedResponse) => fetchedResponse.json() )
    .then( (fetchedResponse) => {

        fetchedResponse.url = url;
        fetchedResponse.clientTimestamp = new Date().getTime();

        let sequence = Promise.resolve();

        if ( shouldFirstRemoveFromDB ) {
            sequence = sequence.then(() => {
                return offlineFXDatabase.remove('FX', 'url', 'url', url);
            })
        }

        sequence = sequence.then(() => {
            return offlineFXDatabase.add('FX', fetchedResponse)
            .then( () => {
                return Promise.resolve(fetchedResponse);
            })
        });

        return sequence;
    });
};


FX.prototype._doBackgroundUpdate = function(url, fetchedFromDatabase) {
    if (!fetchedFromDatabase) return;
    this._fetchAndSave(url, true)
        .then((data) => this._createFXObject(data))
        .catch( () => {
            console.log("looks like there's no wifi connection to update in background");
        });
};




FX.prototype._initEachFX = function(item) {
    const url = `${API_URL}&currencies=${item.compare}&source=${item.base}`;
    let fetchedFromDatabase = false;

    offlineFXDatabase.retrieve('FX', 'url', url)
        .then((dbResponse) => {
            console.log(dbResponse);
            if ( dbResponse.length > 0 ) {
                fetchedFromDatabase = true;
                return Promise.resolve( dbResponse[0] );
            }
            return this._fetchAndSave(url);
        })
        .then((data) => this._createFXObject(data) )
        //.then(() => this._doBackgroundUpdate(url, fetchedFromDatabase))
        .catch((err) => {
            console.log("error somewhere");
        });
};


FX.prototype.init = function() {
    offlineFXDatabase.retrieve('Currencies')
        .then((currenciesResponse) => {
            if ( currenciesResponse.length == 0 ) {
                this._handleEmptyState();
                return Promise.reject({displayErrorMessage: false});
            }
            fxList.innerHTML = '';
            currenciesResponse.forEach((item) => this._initEachFX(item));
        })
        .catch((err) => {
            if ( err.displayErrorMessage === false ) { return; }
            new Toast('error', "Uh oh, there was an error fetching information");
        });
};
