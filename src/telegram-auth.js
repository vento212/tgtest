// Утилиты для работы с Telegram WebApp
class TelegramAuth {
  constructor() {
    this.webApp = null;
    this.user = null;
    this.initData = null;
    this.initDataUnsafe = null;
    this.isInitialized = false;
  }

  // Инициализация Telegram WebApp
  init() {
    try {
      console.log('🔍 TelegramAuth: проверяем Telegram WebApp...');
      
      // Проверяем наличие Telegram WebApp API
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.warn('❌ TelegramAuth: Telegram WebApp API недоступен');
        return false;
      }

      this.webApp = window.Telegram.WebApp;
      
      // Проверяем, что приложение запущено в Telegram
      if (!this.webApp.initDataUnsafe) {
        console.warn('❌ TelegramAuth: initDataUnsafe недоступен');
        return false;
      }

      // Получаем данные пользователя
      this.user = this.webApp.initDataUnsafe.user;
      this.initData = this.webApp.initData;
      this.initDataUnsafe = this.webApp.initDataUnsafe;

      if (!this.user) {
        console.warn('❌ TelegramAuth: данные пользователя недоступны');
        return false;
      }

      console.log('✅ TelegramAuth: успешно инициализирован');
      console.log('👤 Пользователь:', this.user);
      
      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('❌ TelegramAuth: ошибка инициализации:', error);
      return false;
    }
  }

  // Получение заголовков аутентификации
  getAuthHeaders() {
    if (!this.isInitialized) {
      console.warn('⚠️ TelegramAuth: не инициализирован');
      return {};
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Telegram-Data': JSON.stringify(this.initDataUnsafe),
        'X-Telegram-Hash': this.initData || '',
        'X-Telegram-User-ID': this.user.id.toString(),
        'X-Telegram-Username': this.user.username || '',
        'X-Telegram-First-Name': this.user.first_name || '',
        'X-Telegram-Last-Name': this.user.last_name || ''
      };

      console.log('🔐 TelegramAuth: заголовки аутентификации:', headers);
      return headers;

    } catch (error) {
      console.error('❌ TelegramAuth: ошибка получения заголовков:', error);
      return {};
    }
  }

  // Получение данных пользователя
  getUser() {
    return this.user;
  }

  // Проверка инициализации
  isReady() {
    return this.isInitialized && this.user !== null;
  }

  // Получение WebApp объекта
  getWebApp() {
    return this.webApp;
  }

  // Получение initData
  getInitData() {
    return this.initData;
  }

  // Получение initDataUnsafe
  getInitDataUnsafe() {
    return this.initDataUnsafe;
  }
}

// Создаем и экспортируем экземпляр
const telegramAuth = new TelegramAuth();
export default telegramAuth; 