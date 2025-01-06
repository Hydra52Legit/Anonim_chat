const { getRequiredChannels } = require('../../db/queries');

const checkSub = async (ctx, next) => {
    try {
        // Получаем список обязательных каналов из базы данных
        const requiredChannels = await getRequiredChannels();
        const userId = ctx.from.id;

        // Проверяем каждый обязательный канал
        for (const channel of requiredChannels) {
            try {
                // Получаем статус подписки пользователя на канал
                const chatMember = await ctx.telegram.getChatMember(channel.channel_id, userId);

                // Если пользователь не подписан на канал, отправляем уведомление
                if (!['member', 'administrator', 'creator'].includes(chatMember.status)) {
                    return ctx.reply(
                        `Наш бот бесплатный, но вы должны подписаться на @${channel.channel_name}, чтобы продолжить.`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: `Перейти в @${channel.channel_name}`,
                                            url: `https://t.me/${channel.channel_name}`,
                                        },
                                    ],
                                ],
                            },
                        }
                    );
                }
            } catch (error) {
                console.error(`Ошибка проверки подписки на канал @${channel.channel_name}:`, error.message);
                // Обрабатываем ошибки, если не удается проверить подписку на канал
                return ctx.reply(
                    `Не удалось проверить вашу подписку на @${channel.channel_name}. Пожалуйста, подпишитесь и попробуйте снова.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: `Перейти в @${channel.channel_name}`,
                                        url: `https://t.me/${channel.channel_name}`,
                                    },
                                ],
                            ],
                        },
                    }
                );
            }
        }

        // Если пользователь подписан на все каналы, продолжаем выполнение
        return next();
    } catch (error) {
        console.error('Ошибка в мидлвере checkSub:', error.message);
        // Общая обработка ошибок
        await ctx.reply('Произошла ошибка при проверке подписки. Попробуйте позже.');
    }
};

module.exports = checkSub;
