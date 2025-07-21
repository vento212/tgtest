const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен бота
const token = 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(token, {polling: false});

// URL вашего приложения на Netlify
const webAppUrl = 'https://your-app-name.netlify.app';

async function setupBot() {
    try {
        // Устанавливаем команду /start
        await bot.setMyCommands([
            {
                command: 'start',
                description: 'Открыть TON Market'
            }
        ]);

        // Устанавливаем кнопку меню
        await bot.setChatMenuButton({
            menu_button: {
                type: 'web_app',
                text: 'Открыть TON Market',
                web_app: {
                    url: webAppUrl
                }
            }
        });

        console.log('✅ Бот настроен успешно!');
        console.log('🔗 WebApp URL:', webAppUrl);
        
    } catch (error) {
        console.error('❌ Ошибка настройки бота:', error);
    }
}

setupBot(); 