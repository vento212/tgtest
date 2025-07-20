// Утилиты для работы с Telegram WebApp
class TelegramAuth {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.initData = null;
        this.initDataUnsafe = null;
    }

    // Инициализация Telegram WebApp
    init() {
        if (!this.tg) {
            console.warn('⚠️ Telegram WebApp не доступен');
            return false;
        }

        try {
            // Расширяем приложение на весь экран
            this.tg.expand();
            
            // Включаем закрытие по свайпу
            this.tg.enableClosingConfirmation();
            
            // Получаем данные пользователя
            this.user = this.tg.initDataUnsafe?.user;
            this.initData = this.tg.initData;
            this.initDataUnsafe = this.tg.initDataUnsafe;
            
            console.log('✅ Telegram WebApp инициализирован:', {
                user: this.user,
                platform: this.tg.platform,
                version: this.tg.version
            });
            
            return true;
        } catch (error) {
            console.error('❌ Ошибка инициализации Telegram WebApp:', error);
            return false;
        }
    }

    // Получение данных пользователя
    getUser() {
        return this.user;
    }

    // Проверка, запущено ли приложение в Telegram
    isTelegramApp() {
        return !!this.tg;
    }

    // Получение данных для аутентификации
    getAuthData() {
        if (!this.tg || !this.initData) {
            return null;
        }

        return {
            telegramData: this.initData,
            telegramHash: this.tg.initDataUnsafe?.hash || ''
        };
    }

    // Отправка данных в заголовках для аутентификации
    getAuthHeaders() {
        const authData = this.getAuthData();
        if (!authData) {
            return {};
        }

        return {
            'X-Telegram-Data': authData.telegramData,
            'X-Telegram-Hash': authData.telegramHash,
            'Content-Type': 'application/json'
        };
    }

    // Показ главного кнопки Telegram
    showMainButton(text, callback) {
        if (!this.tg) return;
        
        this.tg.MainButton.setText(text);
        this.tg.MainButton.onClick(callback);
        this.tg.MainButton.show();
    }

    // Скрытие главной кнопки Telegram
    hideMainButton() {
        if (!this.tg) return;
        this.tg.MainButton.hide();
    }

    // Показ уведомления
    showAlert(message) {
        if (!this.tg) {
            alert(message);
            return;
        }
        this.tg.showAlert(message);
    }

    // Показ подтверждения
    showConfirm(message, callback) {
        if (!this.tg) {
            const result = confirm(message);
            callback(result);
            return;
        }
        this.tg.showConfirm(message, callback);
    }

    // Закрытие приложения
    close() {
        if (!this.tg) return;
        this.tg.close();
    }

    // Получение темы
    getTheme() {
        if (!this.tg) return 'light';
        return this.tg.colorScheme || 'light';
    }

    // Получение цвета темы
    getThemeParams() {
        if (!this.tg) return {};
        return this.tg.themeParams || {};
    }
}

// Создаем глобальный экземпляр
const telegramAuth = new TelegramAuth();

export default telegramAuth; 