const db = require('../../db/queries'); // Функции для работы с базой данных
const axios = require('axios'); // Для проверки подписки через Telegram Bot API

// Получить список обязательных каналов
async function getRequiredChannels() {
  const channels = await db.getRequiredChannels(); // Запрос из базы
    return channels;
}

// Добавить обязательный канал
async function addRequiredChannel(username) {
  // Проверяем, не добавлен ли уже канал
    const existingChannels = await getRequiredChannels();
    if (existingChannels.some((channel) => channel.username === username)) {
    throw new Error(`Канал @${username} уже добавлен.`);
    }

    await db.addRequiredChannel(username); // Сохраняем канал в базе
    return `Канал @${username} успешно добавлен.`;
}

// Удалить обязательный канал
async function removeRequiredChannel(channelId) {
    await db.removeRequiredChannel(channelId); // Удаление канала из базы
    return `Канал с ID ${channelId} успешно удалён.`;
}

// Проверить подписку пользователя на обязательные каналы
async function checkUserSubscriptions(userId) {
    const channels = await getRequiredChannels();

    if (channels.length === 0) {
    return true; // Если нет обязательных каналов, подписка не требуется
    }

const results = await Promise.all(
    channels.map(async (channel) => {
    const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`;
    const params = { chat_id: channel.username, user_id: userId };

    try {
        const response = await axios.get(url, { params });
        const status = response.data.result.status;

        // Проверяем статус подписки
        return status === 'member' || status === 'administrator' || status === 'creator';
    } catch (error) {
        console.error(`Ошибка проверки подписки на @${channel.username}:`, error.message);
        return false;
    }
    })
);

  return results.every((isSubscribed) => isSubscribed); // Все ли каналы подписаны
}



module.exports = {
    getRequiredChannels,
    addRequiredChannel,
    removeRequiredChannel,
    checkUserSubscriptions,
};
