const db = require('./db');

// Добавление нового пользователя
const setUserActive = (telegram_id, isActive) => {
    const query = db.prepare(`UPDATE users SET is_active = ? WHERE telegram_id = ?;`);
    query.run(isActive ? 1 : 0, telegram_id);
};

// Получение случайного активного пользователя
const getRandomActiveUser = (excludeUserId) => {
    const query = db.prepare(
        `SELECT telegram_id FROM users WHERE is_active = 1 AND telegram_id != ? ORDER BY RANDOM() LIMIT 1;`
    );
    const result = query.get(excludeUserId);
    return result ? result.telegram_id : null;
};

// Получение всех пользователей
const getUsers = () => {
    const query = db.prepare(`SELECT telegram_id FROM users;`);
    return query.all();
};

// Добавление пользователя
const addUser = (telegram_id, username) => {
    const query = db.prepare(`INSERT OR IGNORE INTO users (telegram_id, username) VALUES (?, ?);`);
    query.run(telegram_id, username);
};

// Получение количества активных пользователей
const getUserCount = () => {
    const query = db.prepare(`SELECT COUNT(*) as count FROM users WHERE is_active = 1;`);
    return query.get().count;
};

// Работа с обязательными каналами в памяти

// Массив обязательных каналов
const requiredChannels = [];

// Получение всех обязательных каналов
const getRequiredChannels = async () => {
    return requiredChannels;
};

// Добавление обязательного канала
const addRequiredChannel = async (username) => {
    const id = requiredChannels.length + 1;
    requiredChannels.push({ id, channel_name: username });
};

// Удаление обязательного канала
const removeRequiredChannel = async (channelId) => {
    const index = requiredChannels.findIndex((channel) => channel.id === parseInt(channelId));
    if (index !== -1) {
        requiredChannels.splice(index, 1);
    }
};

module.exports = {
    addUser,
    getUserCount,
    getRequiredChannels,
    addRequiredChannel,
    removeRequiredChannel,
    setUserActive,
    getRandomActiveUser,
    getUsers
};
