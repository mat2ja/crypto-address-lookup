// DOM Elements
const appWrapper = document.querySelector('.app');
const cardEl = document.querySelector('.card');
const addressEl = document.querySelector('.address');
const balanceEl = document.querySelector('.balance');
const searchBtn = document.querySelector('.search');
const coinNameEl = document.querySelector('.coin-name');

const coinLabelEL = document.querySelector('.coin-label');
const supportedCoins = document.querySelector('.supported-coins');
const coins = supportedCoins.querySelectorAll('img');

// Cryptocurrency objects
const coinsInfo = {
    btc: {
        name: 'btc',
        fullName: 'Bitcoin',
        symbol: '₿',
        divisor: 1e8,
        decimals: 5,
        website: 'https://bitcoin.org'
    },
    eth: {
        name: 'eth',
        fullName: 'Ethereum',
        symbol: 'Ξ',
        divisor: 1e18,
        decimals: 3,
        website: 'https://ethereum.org'
    },
    dash: {
        name: 'dash',
        fullName: 'Dash',
        symbol: 'Dash',
        divisor: 1e8,
        decimals: 3,
        website: 'https://www.dash.org'
    },
    zec: {
        name: 'zec',
        fullName: 'Zcash',
        symbol: 'zec',
        divisor: 1,
        decimals: 3,
        website: 'https://www.z.cash'
    },
    doge: {
        name: 'doge',
        fullName: 'Doge',
        symbol: 'doge',
        divisor: 1,
        decimals: 3,
        website: 'https://dogecoin.com'
    },
    ltc: {
        name: 'ltc',
        fullName: 'Litecoin',
        symbol: 'ltc',
        divisor: 1,
        decimals: 3,
        website: 'https://litecoin.com'
    },
    bch: {
        name: 'bch',
        fullName: 'Bitcoin Cash',
        symbol: 'bch',
        divisor: 1e8,
        decimals: 3,
        website: 'https://www.bitcoincash.org'
    },
    nano: {
        name: 'nano',
        fullName: 'Nano',
        symbol: 'nano',
        divisor: 1e30,
        decimals: 3,
        website: 'https://nano.org'
    },
    xrp: {
        name: 'xrp',
        fullName: 'Ripple',
        symbol: 'xrp',
        divisor: 1,
        decimals: 3,
        website: 'https://ripple.com'
    }
};

// Add coin name label on hover
for (let coin of coins) {
    coin.addEventListener('mouseover', () => {
        document.querySelector('.coin-label').classList.remove('hide')
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
    let address = addressEl.value;

    // re
    let coin = recognizeCoin(address);
    if (!coin) {
        showWarning('😕', 'No address found');
        return
    };

    fetchApi(coin, address);
})

// listens for change on input, checks if it is empty to show some placeholder
addressEl.addEventListener('input', (e) => {
    // if value is empty
    if (!addressEl.value) {
        balanceEl.innerHTML = '🌚';
        coinNameEl.classList.remove('warning');
        coinNameEl.innerHTML = '';
    } else {
        balanceEl.innerHTML = '🚀';
        coinNameEl.classList.remove('warning');
        coinNameEl.innerHTML = '';
    }
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

function fetchApi(coin, address) {
    let fetched;
    switch (coin.name) {
        case 'zec':
            fetched = fetch(`https://api.zcha.in/v2/mainnet/accounts/${address}`);
            break;
        case 'doge':
        case 'ltc':
            fetched = fetch(`https://sochain.com/api/v2/get_address_balance/${coin.name.toUpperCase()}/${address}`);
            break;
        case 'nano':
            fetched = fetch(`https://api.nanex.cc:443/?action=account_info&account=${address}`);
            break;
        case 'bch':
            fetched = fetch(`https://api.blockchair.com/${'bitcoin-cash'}/dashboards/address/${address}`);
            break;
        case 'xrp':
            fetched = fetch(`https://api.xrpscan.com/api/v1/account/${address}`);
            break;
        default:
            fetched = fetch(`https://api.blockcypher.com/v1/${coin.name}/main/addrs/${address}/balance`);
    };

    fetched
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
        })
        .catch(err => {
            console.log(err);
            showWarning('😕', 'No address found');
        });
};

// returns formatted balance amount (diveded and with fixed decimals)
function formatBalance({ balance, xrpBalance, data }, { divisor, decimals }, address) {
    let balanceAmount;
    if (balance) {
        balanceAmount = balance;
    } else if (xrpBalance) {
        // XRP API FORMAT
        balanceAmount = xrpBalance;
    } else if (data.confirmed_balance) {
        // DOGE & LTC API FORMAT
        balanceAmount = data.confirmed_balance;
    } else if (data[address].address.balance) {
        // BCH API FORMAT
        balanceAmount = data[address].address.balance;
    }
    return (balanceAmount / divisor).toFixed(decimals);
}

// Shows balance and coin name
function showBalance({ name, fullName, website }, balance) {
    balanceEl.innerHTML = `
                ${balance}
                <span>
                    <img src='./img/svg/color/${name}.svg'>
                </span>
            `;

    coinNameEl.classList.remove('warning');
    coinNameEl.innerHTML = fullName;
    coinNameEl.href = website;
};

// shows warning message and emoji
function showWarning(emoji, msg) {
    balanceEl.innerHTML = `${emoji}`
    coinNameEl.classList.add('warning');
    coinNameEl.innerHTML = `${msg}`;
}

// creates custom link to blockhain for each coin
function createBlockchainLink({ name }, address) {
    switch (name) {
        case 'eth':
            balanceEl.href = `https://etherscan.io/address/${address}`;
            break;
        case 'zec':
            balanceEl.href = `https://explorer.zcha.in/accounts/${address}`;
            break;
        case 'doge':
            balanceEl.href = `https://dogechain.info/address/${address}`;
            break;
        case 'nano':
            balanceEl.href = `https://nanocrawler.cc/explorer/account/${address}/history`;
            break;
        case 'xrp':
            balanceEl.href = `https://xrpscan.com/account/${address}`;
            break;
        default:
            balanceEl.href = `https://live.blockcypher.com/${name}/address/${address}/`;
    }
};

