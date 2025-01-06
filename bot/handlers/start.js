const { setUserActive, getRandomActiveUser } = require('../../db/queries');

const activeChats = new Map(); // Хранит пары собеседников

const findHandler = async (ctx) => {
const userId = ctx.from.id;

if (activeChats.has(userId)) {
    return ctx.reply('Вы уже общаетесь с собеседником. Для завершения отправьте /stop.');
}

  // Ищем случайного активного пользователя
const partnerId = getRandomActiveUser(userId);
if (partnerId) {
    // Сопоставляем пользователей
    activeChats.set(userId, partnerId);
    activeChats.set(partnerId, userId);

    await ctx.reply('Собеседник найден! Вы можете начинать общение.');
    await ctx.telegram.sendMessage(partnerId, 'Собеседник найден! Вы можете начинать общение.');
} else {
    // Если нет доступных пользователей
    setUserActive(userId, true);
    await ctx.reply('Ожидаем собеседника. Вы будете подключены, как только он появится.');
}
};

// Завершение диалога
const stopHandler = async (ctx) => {
const userId = ctx.from.id;

if (!activeChats.has(userId)) {
    return ctx.reply('Вы сейчас не общаетесь с собеседником.');
}

const partnerId = activeChats.get(userId);

activeChats.delete(userId);
activeChats.delete(partnerId);

await ctx.reply('Вы завершили общение.');
await ctx.telegram.sendMessage(partnerId, 'Ваш собеседник завершил общение.');
};

module.exports = { findHandler, stopHandler };