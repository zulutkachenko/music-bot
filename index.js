require('dotenv').config();
const cheerio = require('cheerio');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');


const token = process.env.BOT_TOKEN;
//const webAppUrl = 'https://sensational-entremet-16bba7.netlify.app/';

const bot = new TelegramBot(token, {
	polling: true
});

bot.setMyCommands([
	{command: '/start', description: 'Приветствие'},
	{command: '/playlist', description: 'Мій плейлист'}
])

let playlist = [];
const tracks = {};

bot.on('message', async (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === '/start') {
		await bot.sendMessage(chatId, `Привіт ${msg.from.first_name}! Мене звати Джавелін Музиченко, хочу показати тобі свою музику.`, {
			reply_markup: {
				keyboard: [
					[{text: 'Мій плейлист', callback: '/playlist'}, {text: 'Топ доби'}, {text: 'Інформація'}, {text: 'Реклама'}]
				]
			}
		});
	}

		if(text === 'Топ доби') {
			//let userMsg = text;
			await axios.get('https://mp3uk.net/')
				.then((html) => {
				const $ = cheerio.load(html.data);
				$('.track-dl').each((num, elem) => {
					let resultParse = 'https:' + $(elem).attr().href;
					//console.log(resultParse);

					bot.sendAudio(chatId, resultParse);
				});
			
			})
				.catch((error) => {bot.sendMessage(chatId, error)})
				.then(() => {});
			}


			if(text != '' && text != '/start' && text != 'Топ доби') {
				const userMsg = text;
				await axios.post('https://mp3uk.net/?do=search&subaction=search&story=' + userMsg)
					.then((html) => {
					const $ = cheerio.load(html.data);
					
					$('.track-item .track-dl').each((i, elem) => {
						const resultParse = 'https:' + $(elem).attr().href;
						let trackName = 'track';
						//console.log(resultParse);
						console.log(resultParse);

						bot.sendAudio(chatId, resultParse, {
							title: {trackName},
							reply_markup: {
								inline_keyboard: [
									[{text: 'Додати в плейлист', callback_data: playlist.push(resultParse)}]
								]
							}
						});
					});
					
				
				})
					.catch((error) => {bot.sendMessage(chatId, error)})
					.then(() => {});
				}

				if(text === '/playlist') {
					console.log(playlist[0]);
					if(playlist.length > 0) {
						playlist.forEach(e => {
							bot.sendAudio(chatId, e);
						})
					} else {
						bot.sendMessage(chatId, 'Плейлист порожній');
					}
				}
	
});