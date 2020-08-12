let addressEl = document.querySelector('.address');
let balanceEl = document.querySelector('.balance');
let searchBtn = document.querySelector('.search');
let coinNameEl = document.querySelector('.coin-name');

// address = '0x6D91F46966F703C61090E829fBe0870d3551CAA9';
// address = '3CsGhWqT4E17ucePh2U2C3Vgd7pNhw641t';

let coinsInfo = [
    {
        name: 'BTC',
        fullName: 'Bitcoin',
        symbol: '₿',
        divisor: 1e8,
        decimals: 8
    },
    {
        name: 'ETH',
        fullName: 'Ethereum',
        symbol: 'Ξ',
        divisor: 1e18,
        decimals: 6
    },
    {
        name: 'DASH',
        fullName: 'Dash',
        symbol: 'Dash',
        divisor: 1e8,
        decimals: 4
    }
];


searchBtn.addEventListener('click', () => {
    let address = addressEl.value;
    let coin;
    let [btcObj, ethObj, dashObj] = coinsInfo;

    if (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1')) {
        // fetched = fetchBitcoin(address);
        coin = btcObj;
    } else if (address.startsWith("0x")) {
        // fetched = fetchEthereum(address);
        coin = ethObj;
    } else if (address.startsWith('X')) {
        // fetched = fetchDash(address);
        coin = dashObj;
    }

    let fetched = fetch(`https://api.blockcypher.com/v1/${coin.name.toLowerCase()}/main/addrs/${address}/balance`);;

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

            let balance = data.balance;
            let shownBalance = (balance / coin.divisor).toFixed(coin.decimals);

            if (coin.name === 'ETH') {
                balanceEl.href = `https://etherscan.io/address/${address}`
            } else {
                balanceEl.href = `https://live.blockcypher.com/${coin.name.toLowerCase()}/address/${address}/`;
            };

            balanceEl.innerHTML = `
                ${shownBalance}
                <span>
                    <img src='./node_modules/cryptocurrency-icons/svg/color/${coin.name.toLowerCase()}.svg'>
                </span>
            `;
            coinNameEl.innerHTML = coin.fullName;
        })
        .catch(err => {
            console.log(err);
            balanceEl.innerHTML = '🤬'
        });
})

function fetchEthereum(address) {
    return fetch(`https://api.blockcypher.com/v1/eth/main/addrs/${address}/balance`);
}
function fetchBitcoin(address) {
    return fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`)
}
function fetchDash(address) {
    return fetch(`https://api.blockcypher.com/v1/dash/main/addrs/${address}/balance`)
}

addressEl.addEventListener('input', (e) => {
    if (!addressEl.value) {
        balanceEl.innerHTML = '🌚';
        coinNameEl.innerHTML = '';
    } else {
        balanceEl.innerHTML = '🚀';
    }
})
