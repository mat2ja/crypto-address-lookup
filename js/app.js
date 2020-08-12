let addressEl = document.querySelector('.address');
let balanceEl = document.querySelector('.balance');
let searchBtn = document.querySelector('.search');
let coinNameEl = document.querySelector('.coin-name');

// address = '0x6D91F46966F703C61090E829fBe0870d3551CAA9'; //ETH
// address = '3CsGhWqT4E17ucePh2U2C3Vgd7pNhw641t'; // BTC
// address = 'XfcLDYdv97tc8YYbQqmR1gxBdLq4xfPNdy'; // DASH
// address = 't1MyKSea26LaxeotrDMiZWta8kRJASGNr6t'; // ZCASH
// address = 'DSs7SN1wkHNyYfFeJ3t41BTMkf2Z4fgmRp'; // DOGE
// address = 'LaJfmTU7ZYiCUjcNEbnn6DzkwNtpARkonA'; // LTC
// address = 'nano_1dptcs1wo89e5q8udktm36gj4ue34t7cqfxdtf5mxao71bufnogpus1kdtes'; // NANO
// address = 'qr0zq8fl88fzv5d4620y8ucvasxkk4j6gg0d2rwjst'; // BCH
// address = 'rQ3fNyLjbvcDaPNS4EAJY8aT9zR3uGk17c'; // XRP
// address = 'DdzFFzCqrhsk3Bqvun2x2CZh3E7xRrdmH9552oWkBQ6JUNtsSgTFzRhZKN7FjdUFwdZa4B5pm4xVnKVGov3Vox53iigr7upJoBcNBLXf'; // ADA

// Best api so far
/* https://blockchair.com/api/docs#link_300 */

let coinsInfo = {
    btc: {
        name: 'btc',
        fullName: 'Bitcoin',
        symbol: '₿',
        divisor: 1e8,
        decimals: 8,
        website: 'https://bitcoin.org'
    },
    eth: {
        name: 'eth',
        fullName: 'Ethereum',
        symbol: 'Ξ',
        divisor: 1e18,
        decimals: 5,
        website: 'https://ethereum.org'
    },
    dash: {
        name: 'dash',
        fullName: 'Dash',
        symbol: 'Dash',
        divisor: 1e8,
        decimals: 4,
        website: 'https://www.dash.org'
    },
    zec: {
        name: 'zec',
        fullName: 'Zcash',
        symbol: 'zec',
        divisor: 1,
        decimals: 4,
        website: 'https://www.z.cash'
    },
    doge: {
        name: 'doge',
        fullName: 'Doge',
        symbol: 'doge',
        divisor: 1,
        decimals: 8,
        website: 'https://dogecoin.com'
    },
    ltc: {
        name: 'ltc',
        fullName: 'Litecoin',
        symbol: 'ltc',
        divisor: 1,
        decimals: 5,
        website: 'https://litecoin.com'
    },
    bch: {
        name: 'bch',
        fullName: 'Bitcoin Cash',
        symbol: 'bch',
        divisor: 1e8,
        decimals: 5,
        website: 'https://www.bitcoincash.org'
    },
    nano: {
        name: 'nano',
        fullName: 'Nano',
        symbol: 'nano',
        divisor: 1e30,
        decimals: 5,
        website: 'https://nano.org'
    },
    xrp: {
        name: 'xrp',
        fullName: 'Ripple',
        symbol: 'xrp',
        divisor: 1,
        decimals: 4,
        website: 'https://ripple.com'
    }
};

searchBtn.addEventListener('click', () => {
    let address = addressEl.value;

    let coin = recognizeCoin(address);
    if (!coin) {
        balanceEl.innerHTML = '😕';
        coinNameEl.classList.add('warning');
        coinNameEl.innerHTML = 'No address found';
        return
    };

    fetchApi(coin, address);
})

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

function recognizeCoin(address) {
    let { btc, eth, dash, zec, doge, ltc, bch, nano, xrp } = coinsInfo;
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
    if (coin.name === 'zec') {
        fetched = fetch(`https://api.zcha.in/v2/mainnet/accounts/${address}`);
    } else if (coin.name === 'doge' || coin.name === 'ltc') {
        fetched = fetch(`https://sochain.com/api/v2/get_address_balance/${coin.name.toUpperCase()}/${address}`);
    } else if (coin.name === 'nano') {
        fetched = fetch(`https://api.nanex.cc:443/?action=account_info&account=${address}`);
    } else if (coin.name === 'bch') {
        fetched = fetch(`https://api.blockchair.com/${'bitcoin-cash'}/dashboards/address/${address}`);
    } else if (coin.name === 'xrp') {
        fetched = fetch(`https://api.xrpscan.com/api/v1/account/${address}`);
    } else {
        fetched = fetch(`https://api.blockcypher.com/v1/${coin.name}/main/addrs/${address}/balance`);
    }

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

            let balance;
            if (coin.name === 'doge' || coin.name === 'ltc') {
                balance = calculateBalance2(data, coin);
            } else if (coin.name === 'bch') {
                balance = calculateBalance3(data, coin, address);
            } else {
                balance = calculateBalance(data, coin);
            }

            showBalance(coin, balance);


            createBlockchainLink(coin, address);
        })
        .catch(err => {
            console.log(err);
            balanceEl.innerHTML = '🤬'
            coinNameEl.classList.add('warning');
            coinNameEl.innerHTML = 'Something went wrong';
        });
};

function calculateBalance({ balance, xrpBalance }, { divisor, decimals }) {
    if (xrpBalance) {
        return (xrpBalance / divisor).toFixed(decimals);
    }
    return (balance / divisor).toFixed(decimals);
}

function calculateBalance2({ data }, { divisor, decimals }) {
    return (data.confirmed_balance / divisor).toFixed(decimals);
}

function calculateBalance3({ data }, { divisor, decimals }, address) {
    return (data[address].address.balance / divisor).toFixed(decimals);
}

function showBalance({ name, fullName, website }, balance) {
    balanceEl.innerHTML = `
                ${balance}
                <span>
                    <img src='./node_modules/cryptocurrency-icons/svg/color/${name}.svg'>
                </span>
            `;

    coinNameEl.classList.remove('warning');
    coinNameEl.innerHTML = fullName;
    coinNameEl.href = website;
};

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

