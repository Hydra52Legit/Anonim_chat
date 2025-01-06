const {Telegraf} = require('telegraf');
const startHandler = require('./handlers/start');
const { adminPanel, handleAdminAction } = require('./handlers/admin');
const subscriptionHandler = require('./handlers/subscriptionHandler');
const checkSubscription = require('./middlewares/checksub');
const { findHandler, stopHandler } = require('./handlers/find');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('start', startHandler);
bot.command('admin', adminPanel);
bot.command('channels', subscriptionHandler);
bot.command('find', findHandler); // Поиск собеседника
bot.command('stop', stopHandler); // Завершение общения
bot.on('callback_query', handleAdminAction);
bot.use(checkSubscription);

module.exports = bot;