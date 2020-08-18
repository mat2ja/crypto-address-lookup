// DOM Elements
const appWrapper = document.querySelector('.app');
const cardEl = document.querySelector('.card');
const addressEl = document.querySelector('.address');
const balanceEl = document.querySelector('.balance');
const priceEl = document.querySelector('.coin-price');
const searchBtn = document.querySelector('.search');
const coinNameEl = document.querySelector('.coin-name');

const coinLabelEl = document.querySelector('.coin-label');
const supportedCoins = document.querySelector('.supported-coins');
const coins = supportedCoins.querySelectorAll('img');

const defaultLink = 'https://www.youtube.com/watch?v=_PXU0thDHCU';
const defaultLink2 = 'https://www.youtube.com/watch?v=dYJH3li2zgQ';

let apiKey = 'ff8bd370eecc99eba2c6a8a69dc001cf';

balanceEl.href = defaultLink;

// Cryptocurrency objects
const coinsInfo = {
    btc: {
        symbol: 'btc',
        name: 'Bitcoin',
        divisor: 1e8,
        decimals: 5,
        website: 'https://bitcoin.org'
    },
    eth: {
        symbol: 'eth',
        name: 'Ethereum',
        divisor: 1e18,
        decimals: 3,
        website: 'https://ethereum.org'
    },
    dash: {
        symbol: 'dash',
        name: 'Dash',
        divisor: 1e8,
        decimals: 3,
        website: 'https://www.dash.org'
    },
    zec: {
        symbol: 'zec',
        name: 'Zcash',
        divisor: 1,
        decimals: 3,
        website: 'https://www.z.cash'
    },
    doge: {
        symbol: 'doge',
        name: 'Dogecoin',
        divisor: 1,
        decimals: 3,
        website: 'https://dogecoin.com'
    },
    ltc: {
        symbol: 'ltc',
        name: 'Litecoin',
        divisor: 1,
        decimals: 3,
        website: 'https://litecoin.com'
    },
    bch: {
        symbol: 'bch',
        name: 'Bitcoin Cash',
        divisor: 1e8,
        decimals: 3,
        website: 'https://www.bitcoincash.org'
    },
    nano: {
        symbol: 'nano',
        name: 'Nano',
        divisor: 1e30,
        decimals: 3,
        website: 'https://nano.org'
    },
    xrp: {
        symbol: 'xrp',
        name: 'Ripple',
        divisor: 1,
        decimals: 3,
        website: 'https://ripple.com'
    }
};

// Add coin name label on hover
for (let coin of coins) {
    coin.addEventListener('mouseover', () => {
        document.querySelector('.coin-label').classList.remove('hide');
        document.querySelector('.coin-label').innerText = coin.dataset.name;
    })
}

// Remove coin name label on hover-end
supportedCoins.addEventListener('mouseleave', () => {
    document.querySelector('.coin-label').classList.add('hide');
});

// what to do on address submit
appWrapper.addEventListener('submit', (e) => {
    // prevent sennding to server and reloading the page
    e.preventDefault();

    // get address from input
    let address = addressEl.value.trim();

    let coin = recognizeCoin(address);
    if (!coin) {
        showWarning('😕', 'No address found');
        return
    };

    // fetchBalance(coin, address);


    function getBalance() {
        return fetchBalance(coin, address);
    }

    getBalance().then(balance => {
        console.log(balance);
    });


    // async function getBalance() {
    //     const response = await fetch(`https://api.blockcypher.com/v1/${coin.symbol}/main/addrs/${address}/balance`);
    //     const data = await response.json();

    //     return formatBalance(data, coin, address);

    // };
    // getBalance().then(b => {
    //     console.log(b);
    // });




})

// listens for change on input, checks if it is empty to show some placeholder
addressEl.addEventListener('input', (e) => {
    // if value is empty
    if (!addressEl.value) {
        balanceEl.innerHTML = '🌚';
        coinNameEl.classList.remove('warning');
    } else {
        balanceEl.innerHTML = '🚀';
        coinNameEl.classList.remove('warning');
    }
    coinNameEl.innerHTML = '';
    balanceEl.href = defaultLink;
    priceEl.innerText = '';

})

// recognizes coin address and returns key of recognized coin object
function recognizeCoin(address) {
    const { btc, eth, dash, zec, doge, ltc, bch, nano, xrp } = coinsInfo;
    let coin = '';

    if (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1')) {
        coin = btc;
    } else if (address.startsWith("0x")) {
        coin = eth;
    } else if (address.startsWith('X')) {
        coin = dash;
    } else if (address.startsWith('q')) {
        coin = bch;
    } else if (address.startsWith('t')) {
        coin = zec;
    } else if (address.startsWith('D') || address.startsWith('a')) {
        coin = doge;
    } else if (address.startsWith('L')) {
        coin = ltc;
    } else if (address.startsWith('nano')) {
        coin = nano;
    } else if (address.startsWith('r')) {
        coin = xrp;
    }

    return coin;
}

function fetchBalance(coin, address) {
    let url;
    switch (coin.symbol) {
        case 'zec':
            url = `https://api.zcha.in/v2/mainnet/accounts/${address}`;
            break;
        case 'doge':
        case 'ltc':
            url = `https://sochain.com/api/v2/get_address_balance/${coin.symbol}/${address}`;
            break;
        case 'nano':
            url = `https://api.nanex.cc:443/?action=account_info&account=${address}`;
            break;
        case 'bch':
            url = `https://api.blockchair.com/${'bitcoin-cash'}/dashboards/address/${address}`;
            break;
        case 'xrp':
            url = `https://api.xrpscan.com/api/v1/account/${address}`;
            break;
        default:
            url = `https://api.blockcypher.com/v1/${coin.symbol}/main/addrs/${address}/balance`;
    };


    return fetch(url)
        .then(response => {
            if (!response.ok) {
                // throws error so catch catches it
                throw new Error(`Status Code Error: ${response.status}`);
            };
            return response.json();
        })
        .then(data => {
            console.log(data);

            let balance = formatBalance(data, coin, address);

            // cos nano api returns shitty string instead of throwing error if wrong address
            if (isNaN(balance)) {
                throw Error();
            }

            console.log('Balance:', balance);
            showBalance(coin, balance);
            createBlockchainLink(coin, address);

            fetchStats(coin, balance);

            return balance;

        })
        .catch(err => {
            console.log(err);
            showWarning('😕', 'No address found');
        });
};

function fetchStats(coin, balance) {
    let fiat = 'USD';
    let proxy = 'https://cors-anywhere.herokuapp.com'
    let url = `${proxy}/https://api.nomics.com/v1/currencies/ticker?key=${apiKey}&ids=${coin.symbol.toUpperCase()}&convert=${fiat}`;
    fetch(url, {
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    })
        .then(response => {
            if (!response.ok) {
                // throws error so catch catches it
                throw new Error(`Status Code Error: ${response.status}`);
            };
            return response.json();
        })
        .then(data => {
            let exchangeRate = data[0].price;
            console.log('price: ', exchangeRate);
            let price = calculatePrice(balance, exchangeRate);
            console.log('price: ', price);

            showPrice(price);
        })
        .catch(err => {
            console.log(err);
            showWarning('😳', 'Something went wrong');
        });
}

function calculatePrice(amount, price) {
    return amount * price;
}

// returns formatted balance amount (diveded and with fixed decimals)
function formatBalance({ balance, xrpBalance, data }, { divisor, decimals }, address) {
    let balanceAmount;
    if (balance >= 0) {
        balanceAmount = balance;
    } else if (xrpBalance >= 0) {
        // XRP API FORMAT
        balanceAmount = xrpBalance;
    } else if (data.confirmed_balance >= 0) {
        // DOGE & LTC API FORMAT
        balanceAmount = data.confirmed_balance;
    } else if (data[address].address.balance >= 0) {
        // BCH API FORMAT
        balanceAmount = data[address].address.balance;
    }
    return (balanceAmount / divisor).toFixed(decimals) | 0;
}

// Shows balance and coin name
function showBalance({ symbol, name, website }, balance) {
    balanceEl.innerHTML = `
                ${balance}
                <span>
                    <img src='./img/svg/color/${symbol}.svg'>
                </span>
            `;

    coinNameEl.classList.remove('warning');
    coinNameEl.innerHTML = name;
    coinNameEl.href = website;
};

function showPrice(price) {
    priceEl.innerText = `$${price.toFixed(2)}`
}

// shows warning message and emoji
function showWarning(emoji, msg) {
    balanceEl.innerHTML = `${emoji}`
    priceEl.innerText = '';
    coinNameEl.classList.add('warning');
    coinNameEl.innerHTML = `${msg}`;
    coinNameEl.href = defaultLink2;
};


// creates custom link to blockhain for each coin
function createBlockchainLink({ symbol }, address) {
    let link;
    switch (symbol) {
        case 'eth':
            link = `https://etherscan.io/address/${address}`;
            break;
        case 'zec':
            link = `https://explorer.zcha.in/accounts/${address}`;
            break;
        case 'doge':
            link = `https://dogechain.info/address/${address}`;
            break;
        case 'nano':
            link = `https://nanocrawler.cc/explorer/account/${address}/history`;
            break;
        case 'xrp':
            link = `https://xrpscan.com/account/${address}`;
            break;
        case 'dash':
            link = `https://live.blockcypher.com/${symbol}/address/${address}/`;
            break;
        default:
            link = `https://www.blockchain.com/${symbol}/address/${address}`;
    }

    balanceEl.href = link;
};

