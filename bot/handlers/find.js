const { Telegraf } = require('telegraf');
const { getUsers } = require('../../db/queries');

let broadcastState = {}; // Хранит временное состояние рассылки

const broadcastHandler = async (ctx) => {
if (ctx.from.id !== parseInt(process.env.ADMIN_ID)) {
    return ctx.reply('Доступ запрещён.');
}

broadcastState = { text: '', photo: '', buttons: [] };

await ctx.reply('Что вы хотите разослать? Начнём с текста.');
ctx.reply('Отправьте текст для рассылки или пропустите этот шаг, отправив "пропустить".');

  // Ждём текста
ctx.bot.on('text', async (textCtx) => {
    if (broadcastState.text === '') {
    if (textCtx.message.text.toLowerCase() !== 'пропустить') {
        broadcastState.text = textCtx.message.text;
    }
    await textCtx.reply('Теперь отправьте фото для рассылки или "пропустить".');
    } else if (broadcastState.photo === '') {
    if (textCtx.message.text.toLowerCase() === 'пропустить') {
        broadcastState.photo = null;
    }
    await textCtx.reply('Добавьте кнопки: отправьте в формате "Текст кнопки URL".');
    } else {
    const [buttonText, buttonUrl] = textCtx.message.text.split(' ');
    if (buttonText && buttonUrl) {
        broadcastState.buttons.push({ text: buttonText, url: buttonUrl });
        await textCtx.reply('Кнопка добавлена. Добавьте ещё или отправьте "запустить" для старта рассылки.');
    } else if (textCtx.message.text.toLowerCase() === 'запустить') {
        await launchBroadcast(textCtx);
    }
    }
});
};

const launchBroadcast = async (ctx) => {
const users = getUsers(); // Получаем всех пользователей
let sentCount = 0;

for (const user of users) {
    try {
    const options = {};
    if (broadcastState.buttons.length > 0) {
        options.reply_markup = {
        inline_keyboard: [broadcastState.buttons.map((btn) => ({ text: btn.text, url: btn.url }))],
        };
    }
    if (broadcastState.photo) {
        await ctx.telegram.sendPhoto(user.telegram_id, broadcastState.photo, {
        caption: broadcastState.text || '',
        ...options,
        });
    } else {
        await ctx.telegram.sendMessage(user.telegram_id, broadcastState.text, options);
    }
    sentCount++;
    } catch (error) {
    console.error(`Не удалось отправить сообщение пользователю ${user.telegram_id}:`, error.message);
    }
}

await ctx.reply(`Рассылка завершена. Успешно отправлено: ${sentCount} сообщений.`);
  broadcastState = {}; // Сброс состояния
};

module.exports = broadcastHandler;
