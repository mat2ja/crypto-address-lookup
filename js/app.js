// DOM Elements
const appWrapper = document.querySelector('.app');
const cardEl = document.querySelector('.card');
const addressEl = document.querySelector('.address');
const balanceEl = document.querySelector('.balance');

const priceEl = document.querySelector('.coin-price');
const priceChangeElements = document.querySelectorAll('.coin-change');
const priceChangeUpEl = document.querySelector('.coin-change--up');
const priceChangeDownEl = document.querySelector('.coin-change--down');

const searchBtn = document.querySelector('.search');

const coinStatsEl = document.querySelector('.coin-stats');

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
		website: 'https://bitcoin.org',
	},
	eth: {
		symbol: 'eth',
		name: 'Ethereum',
		divisor: 1e18,
		decimals: 3,
		website: 'https://ethereum.org',
	},
	dash: {
		symbol: 'dash',
		name: 'Dash',
		divisor: 1e8,
		decimals: 3,
		website: 'https://www.dash.org',
	},
	zec: {
		symbol: 'zec',
		name: 'Zcash',
		divisor: 1,
		decimals: 3,
		website: 'https://www.z.cash',
	},
	doge: {
		symbol: 'doge',
		name: 'Dogecoin',
		divisor: 1e8,
		decimals: 3,
		website: 'https://dogecoin.com',
	},
	ltc: {
		symbol: 'ltc',
		name: 'Litecoin',
		divisor: 1e8,
		decimals: 3,
		website: 'https://litecoin.com',
	},
	bch: {
		symbol: 'bch',
		name: 'BTC Cash',
		divisor: 1e8,
		decimals: 3,
		website: 'https://www.bitcoincash.org',
	},
	nano: {
		symbol: 'nano',
		name: 'Nano',
		divisor: 1e30,
		decimals: 3,
		website: 'https://nano.org',
	},
	xrp: {
		symbol: 'xrp',
		name: 'Ripple',
		divisor: 1,
		decimals: 3,
		website: 'https://ripple.com',
	},
};

// Add coin name label on hover
for (let coin of coins) {
	coin.addEventListener('mouseover', () => {
		if (!addressEl.value) {
			coinLabelEl.classList.remove('hide');
			coinLabelEl.innerText = coin.dataset.name;
		}
	});
}

// Remove coin name label on hover-end
supportedCoins.addEventListener('mouseleave', () => {
	if (!addressEl.value) {
		coinLabelEl.classList.add('hide');
	}
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
		return;
	}

	fetchBalance(coin, address);
});

// listens for change on input, checks if it is empty to show some placeholder
addressEl.addEventListener('input', cleanupData);

function cleanupData() {
	// if value is empty
	if (!addressEl.value) {
		balanceEl.innerHTML = '🌚';
		coinLabelEl.classList.add('hide');
	} else {
		balanceEl.innerHTML = '🚀';
	}

	coinStatsEl.classList.remove('warning');
	coinStatsEl.innerHTML = '';

	balanceEl.href = defaultLink;
	balanceEl.classList.add('middle');

	priceEl.innerText = '';
	priceEl.classList.remove('warning');
	priceEl.classList.remove('success');

	priceChangeElements.forEach((elem) => (elem.style.display = 'none'));
}

// recognizes coin address and returns key of recognized coin object
function recognizeCoin(address) {
	const { btc, eth, dash, zec, doge, ltc, bch, nano, xrp } = coinsInfo;
	let coin = '';

	if (
		address.startsWith('1') ||
		address.startsWith('3') ||
		address.startsWith('bc1')
	) {
		coin = btc;
	} else if (address.startsWith('0x')) {
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
	}
	console.log('Balance URL: ', url);

	fetch(url)
		.then((response) => {
			if (!response.ok) {
				// throws error so catch catches it
				throw new Error(`Status Code Error: ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			console.log('Balance api data: ', data);
			let balance = formatBalance(data, coin, address);

			// cos nano api returns shitty string instead of throwing error if wrong address
			if (isNaN(balance)) {
				throw Error();
			}

			console.log('Balance:', balance);
			showBalance(coin, balance);
			createBlockchainLink(coin, address);

			fetchStats(coin, balance);

			// return balance;
		})
		.catch((err) => {
			console.log(err);
			showWarning('😕', 'No address found');
		});
}

function fetchStats(coin, balance) {
	let fiat = 'USD';
	let proxy = 'https://cors-anywhere.herokuapp.com/';
	let url = `${proxy}https://api.nomics.com/v1/currencies/ticker?key=${apiKey}&ids=${coin.symbol.toUpperCase()}&convert=${fiat}`;

	fetch(url, {
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	})
		.then((response) => {
			if (!response.ok) {
				// throws error so catch catches it
				throw new Error(`Status Code Error: ${response.status}`);
			}
			return response.json();
		})
		.then(([data]) => {
			console.log('Stats api data: ', data);
			let priceChange = data['1d'].price_change;

			let { price, rank, market_cap, circulating_supply, max_supply, high } =
				data;

			let stats = {
				price,
				rank,
				market_cap,
				circulating_supply,
				max_supply,
				high,
			};

			console.log('Change: ', priceChange);
			console.log('Exchange rate: ', price);

			let balanceValue = calculatePrice(balance, price);

			console.log('Balance value: ', balanceValue);

			showChange(priceChange);
			showStats(stats, balanceValue);
		})
		.catch((err) => {
			console.log(err);
			showWarning('😳', 'Something went wrong');
		});
}

function calculatePrice(amount, price) {
	return amount * price;
}

// returns formatted balance amount (diveded and with fixed decimals)
function formatBalance(
	{ balance, xrpBalance, data },
	{ divisor, decimals },
	address
) {
	let balanceAmount;
	if (balance >= 0) {
		balanceAmount = balance;
	} else if (xrpBalance) {
		// XRP API FORMAT
		balanceAmount = xrpBalance;
	} else if (data[address].address.balance) {
		// BCH API FORMAT
		balanceAmount = data[address].address.balance;
	}
	// TODO fix zero addresses
	return (balanceAmount / divisor).toFixed(decimals);
}

// Shows balance and coin name
function showBalance({ symbol, name }, balance) {
	if (balance >= 1) {
		balance = commaSeparateNumber(balance);
	} else if (!(balance > 0)) {
		balance = 0;
	}

	balanceEl.innerHTML = `
                ${balance}
                <span>
                    <img src='./img/svg/color/${symbol}.svg'>
                </span>
            `;

	balanceEl.classList.remove('middle');
	coinStatsEl.classList.remove('warning');
	coinLabelEl.classList.remove('hide');
	coinLabelEl.innerText = name;
}

function showStats(stats, value) {
	let formattedStats = { ...stats };
	let { rank, market_cap, price, high } = formattedStats;

	value = commaSeparateNumber((+value).toFixed(2));
	price = commaSeparateNumber((+price).toFixed(2));
	high = commaSeparateNumber((+high).toFixed(2));
	market_cap = commaSeparateNumber(market_cap);
	rank = commaSeparateNumber(rank);

	let statsMsg = `
        Rank: ${rank}<span>·</span>MC: ${market_cap}<span>·</span>Price: $${price}<span>·</span>High: $${high}
    `;

	priceEl.innerText = `$${value}`;
	coinStatsEl.innerHTML = statsMsg;
	coinStatsEl.href = 'https://coinmarketcap.com/';
}

function commaSeparateNumber(val) {
	while (/(\d+)(\d{3})/.test(val.toString())) {
		val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
	}
	return val;
}

function showChange(priceChange) {
	if (priceChange > 0) {
		priceChangeUpEl.style.display = 'block';
		priceChangeDownEl.style.display = 'none';
		priceEl.classList.remove('warning');
		priceEl.classList.add('success');
	} else {
		priceChangeUpEl.style.display = 'none';
		priceChangeDownEl.style.display = 'block';
		priceEl.classList.remove('success');
		priceEl.classList.add('warning');
	}
}

// shows warning message and emoji
function showWarning(emoji, msg) {
	balanceEl.innerHTML = `${emoji}`;
	balanceEl.classList.remove('middle');
	priceEl.innerText = '';
	coinStatsEl.classList.add('warning');
	coinStatsEl.innerHTML = `${msg}`;
	coinStatsEl.href = defaultLink2;
	priceChangeElements.forEach((elem) => (elem.style.display = 'none'));
}

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
		case 'ltc':
			link = `https://live.blockcypher.com/${symbol}/address/${address}/`;
			break;
		default:
			link = `https://www.blockchain.com/${symbol}/address/${address}`;
	}

	balanceEl.href = link;
}
