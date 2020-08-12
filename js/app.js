let addressEl = document.querySelector('.address');
let balanceEl = document.querySelector('.balance');
let searchBtn = document.querySelector('.search');
let coinNameEl = document.querySelector('.coin-name');

// address = '0x6D91F46966F703C61090E829fBe0870d3551CAA9';
// address = '3CsGhWqT4E17ucePh2U2C3Vgd7pNhw641t';
// address = 't1MyKSea26LaxeotrDMiZWta8kRJASGNr6t';

let coinsInfo = [
    {
        name: 'btc',
        fullName: 'Bitcoin',
        symbol: '₿',
        divisor: 1e8,
        decimals: 8,
        website: 'https://bitcoin.org'
    },
    {
        name: 'eth',
        fullName: 'Ethereum',
        symbol: 'Ξ',
        divisor: 1e18,
        decimals: 6,
        website: 'https://ethereum.org'
    },
    {
        name: 'dash',
        fullName: 'Dash',
        symbol: 'Dash',
        divisor: 1e8,
        decimals: 4,
        website: 'https://www.dash.org'
    },
    {
        name: 'zec',
        fullName: 'Zcash',
        symbol: 'zec',
        divisor: 1,
        decimals: 8,
        website: 'https://www.z.cash'
    },
    {
        name: 'bch',
        fullName: 'bitcoin cash',
        symbol: 'bch',
        divisor: 1e8,
        decimals: 4,
        website: 'https://www.bitcoincash.org'
    }
];

searchBtn.addEventListener('click', () => {
    let address = addressEl.value;
    let [btcObj, ethObj, dashObj, zecObj, bchObj] = coinsInfo;
    let coin;

    if (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1')) {
        coin = btcObj;
    } else if (address.startsWith("0x")) {
        coin = ethObj;
    } else if (address.startsWith('X')) {
        coin = dashObj;
    } else if (address.startsWith('q')) {
        coin = bchObj;
    } else if (address.startsWith('t')) {
        coin = zecObj;
    } else {
        balanceEl.innerHTML = '😕';
        coinNameEl.classList.add('warning');
        coinNameEl.innerHTML = 'No address found';
        return;
    }

    fetchApi(coin, address);
})

addressEl.addEventListener('input', (e) => {
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

function fetchApi(coin, address) {
    let fetched;
    if (coin.name === 'bch') {
        fetched = fetch(`https://blockchain.info/rawaddr/${address}`);
    } else if (coin.name === 'zec') {
        fetched = fetch(`https://api.zcha.in/v2/mainnet/accounts/${address}`);
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

            showBalance(coin, calculateBalance(data, coin));
            createBlockchainLink(coin, address);
        })
        .catch(err => {
            console.log(err);
            balanceEl.innerHTML = '🤬'
        });
};

function calculateBalance({ balance }, { divisor, decimals }) {
    return (balance / divisor).toFixed(decimals);
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
    if (name === 'eth') {
        balanceEl.href = `https://etherscan.io/address/${address}`
    } else if (name === 'bch') {
        balanceEl.href = `https://www.blockchain.com/bch/${address}`;
    } else if (name === 'zec') {
        balanceEl.href = `https://explorer.zcha.in/accounts/${address}`;
    } else {
        balanceEl.href = `https://live.blockcypher.com/${name}/address/${address}/`;
    };
};

