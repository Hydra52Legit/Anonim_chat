const {Telegraf} = require('telegraf');
const { startHandler, findHandler, stopHandler } = require('./handlers/start')
const { adminPanel, handleAdminAction } = require('./handlers/admin')
const subscriptionHandler = require('./handlers/subscriptionHandler')
const checkSubscription = require('./middlewares/checksub')

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('start', startHandler);
bot.command('admin', adminPanel);
bot.command('channels', subscriptionHandler);
bot.command('find', findHandler);
bot.command('stop', stopHandler);
bot.on('callback_query', handleAdminAction);
bot.use(checkSubscription);

module.exports = bot;