require('dotenv').config();
const cheerio = require('cheerio');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {
	polling: true
});

bot.setMyCommands([
	{command: '/start', description: 'Приветствие'},
])

let playlist = [];
const tracksNew = new Array();
const dataId = new Array();

	bot.on('message', async (msg) => {
		const chatId = msg.chat.id;
		const text = msg.text;
	
		if (text === '/start') {
			await bot.sendMessage(chatId, `Привіт ${msg.from.first_name}! Мене звати Джавелін Музиченко, хочу показати тобі свою музику.`, {
				reply_markup: {
					keyboard: [
						[{text: 'Мій плейлист', callback: '/playlist'}, {text: 'Топ доби'}],
						[{text: 'Інформація'}, {text: 'Реклама'}]
					]
				}
			});
		}

				if(text != '' && text != '/start' && text != 'Топ доби') {
					const userMsg = text;
					tracksNew.length = 0;
					dataId.length = 0;
					await axios.post('https://mp3uk.net/?do=search&subaction=search&story=' + userMsg)
						.then((html) => {
						const $ = cheerio.load(html.data);
						
						$('.track-item').each((i, elem) => {
							const tracks = {};
							//const dataId = [];
							const artist = $('.track-subtitle', elem).text();
							const trackName = $('.track-title', elem).text();
							const time = $('.track-time', elem).text();
							const url = 'https:' + $('.track-dl', elem).attr().href;

							tracks.text = `${artist + ' - ' + trackName + ' (' + time + ')'}`;
							tracks.callback_data = `${i}`;

							dataId.push(url);

							tracksNew.push([tracks]);
						});
					
					})
						.catch((error) => {console.log(error)})
						.then(() => {});
						

						console.log(tracksNew);
						//console.log(dataId);

							bot.sendMessage(chatId, 'Результат пошуку для: ' + text, {
								reply_markup: {
									inline_keyboard: tracksNew
								}
							});

							bot.on('callback_query', msg => {
								const data = msg.data;

								if(data.length > 0 && dataId[data] !== undefined) {
									console.log(dataId[data])
									bot.sendAudio(chatId, dataId[data]);
								} else if(dataId[data] === undefined) {
									bot.sendMessage(chatId, `Неможливо завантажити аудіо.`);
								} else {
									bot.sendMessage(chatId, `Виникла помилка. Спробуйте ще раз.`);
								}
							})	
				}
	});

