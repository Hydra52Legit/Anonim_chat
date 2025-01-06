const { getUserCount, getRequiredChannels, addRequiredChannel, removeRequiredChannel } = require('../../db/queries');

const adminPanel = async (ctx) => {
if (ctx.from.id !== parseInt(process.env.ADMIN_ID)) {
    return ctx.reply('Доступ запрещён.');
}

const keyboard = [
    [{ text: 'Добавить обязательный канал', callback_data: 'add_channel' }],
    [{ text: 'Удалить обязательный канал', callback_data: 'remove_channel' }],
    [{ text: 'Посмотреть обязательные каналы', callback_data: 'view_channels' }],
    [{ text: 'Посмотреть количество пользователей', callback_data: 'user_count' }],
];

await ctx.reply('Админ-панель:', { reply_markup: { inline_keyboard: keyboard } });
};

const handleAdminAction = async (ctx) => {
const action = ctx.callbackQuery.data;

if (action === 'add_channel') {
    ctx.reply('Введите @username канала, который нужно добавить:');
    ctx.bot.on('text', async (textCtx) => {
    const channel = textCtx.message.text;
    await addRequiredChannel(channel);
    await textCtx.reply(`Канал ${channel} добавлен в список обязательных.`);
    });
} else if (action === 'remove_channel') {
    const channels = await getRequiredChannels();
    if (channels.length === 0) {
    return ctx.reply('Список обязательных каналов пуст.');
    }

    const keyboard = channels.map((channel) => [
    { text: channel.username, callback_data: `remove_${channel.id}` },
    ]);
    await ctx.reply('Выберите канал для удаления:', { reply_markup: { inline_keyboard: keyboard } });
} else if (action === 'view_channels') {
    const channels = await getRequiredChannels();
    if (channels.length === 0) {
    return ctx.reply('Список обязательных каналов пуст.');
    }
    const channelList = channels.map((channel) => `- ${channel.username}`).join('\n');
    await ctx.reply(`Обязательные каналы:\n${channelList}`);
} else if (action === 'user_count') {
    const count = await getUserCount();
    await ctx.reply(`Количество пользователей: ${count}`);
} else if (action.startsWith('remove_')) {
    const channelId = action.split('_')[1];
    await removeRequiredChannel(channelId);
    await ctx.reply(`Канал с ID ${channelId} был удалён.`);
}
};

module.exports = { adminPanel, handleAdminAction };
