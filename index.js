require('dotenv').config();

const bot = require('./bot')

bot.launch().then(() => {
    console.loq("Стартуем ебана рот");
});