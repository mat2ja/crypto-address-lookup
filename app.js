// let myAddress = 0x6D91F46966F703C61090E829fBe0870d3551CAA9;

let addressEl = document.querySelector('.address');
let balanceEl = document.querySelector('.balance');
let searchBtn = document.querySelector('.search');

// address = '0x6D91F46966F703C61090E829fBe0870d3551CAA9';
// address = '3CsGhWqT4E17ucePh2U2C3Vgd7pNhw641t';


searchBtn.addEventListener('click', () => {
    let address = addressEl.value;
    let fetched;
    let coin;

    if (address.startsWith("0x")) {
        fetched = fetchEthereum(address);
        coin = 'ETH';
    } else {
        fetched = fetchBitcoin(address);
        coin = 'BTC';
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

            let balance = data.balance;
            let divisor;
            let decimals;

            if (coin === 'ETH') {
                // wei to eth
                divisor = 1e18;
                decimals = 6;
            } else if (coin === 'BTC') {
                // satoshi to btc
                divisor = 1e8;
                decimals = 8;
            }
            let shownBalance = (balance / divisor).toFixed(decimals);
            balanceEl.innerHTML = `${shownBalance}<span>${coin}</span>`;
        })
        .catch(err => {
            console.log(err);
            balanceEl.innerHTML = '🤬'
        });
})

function fetchEthereum(address) {
    let fetched = fetch(`https://api.blockcypher.com/v1/eth/main/addrs/${address}/balance`);
    return fetched;
}
function fetchBitcoin(address) {
    let fetched = fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`)
    return fetched;
}

addressEl.addEventListener('input', (e) => {
    if (!addressEl.value) {
        balanceEl.innerHTML = '🌚';
    } else {
        balanceEl.innerHTML = '🚀';

    }
})