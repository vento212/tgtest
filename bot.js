const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен бота
const token = 'YOUR_BOT_TOKEN_HERE';
const webAppUrl = 'https://fancy-melomakarona-ceb24e.netlify.app';

const bot = new TelegramBot(token, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
  const welcomeMessage = `Привет, ${userName}! 👋

Добро пожаловать в TON Market! 🛒

Здесь вы можете:
• Покупать NFT
• Подключать TON кошелек
• Управлять балансом

Нажмите кнопку ниже, чтобы открыть приложение:`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🛒 Открыть TON Market',
          web_app: {
            url: webAppUrl
          }
        }
      ]
    ]
  };

  bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: keyboard
  });
});

// Обработка WebApp данных
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const webAppData = msg.web_app_data;
  
  console.log('WebApp данные получены:', webAppData);
  
  bot.sendMessage(chatId, 'Данные из WebApp получены! 📱');
});

// Обработка ошибок
bot.on('error', (error) => {
  console.error('Ошибка бота:', error);
});

console.log('🤖 Бот запущен...');
console.log('📱 WebApp URL:', webAppUrl);
console.log('💡 Отправьте /start боту для тестирования'); 