// Утилиты для работы с Telegram WebApp
class TelegramAuth {
    constructor() {
        console.log('🔍 TelegramAuth constructor - проверяем Telegram WebApp');
        console.log('🔍 window.Telegram:', !!window.Telegram);
        console.log('🔍 window.Telegram?.WebApp:', !!window.Telegram?.WebApp);
        
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.initData = null;
        this.initDataUnsafe = null;
        
        if (this.tg) {
            console.log('✅ Telegram WebApp найден в конструкторе');
        } else {
            console.warn('⚠️ Telegram WebApp не найден в конструкторе');
            
            // Создаем fallback для веб-версии
            if (window.location.href.includes('netlify.app')) {
                console.log('🔧 Создаем fallback для веб-версии');
                this.tg = {
                    platform: 'web',
                    version: '1.0',
                    colorScheme: 'dark',
                    expand: () => console.log('expand called'),
                    enableClosingConfirmation: () => console.log('enableClosingConfirmation called'),
                    initDataUnsafe: {
                        user: {
                            id: Date.now(),
                            first_name: 'Web',
                            last_name: 'User',
                            username: 'web_user',
                            language_code: 'ru'
                        },
                        hash: 'web_fallback_hash'
                    },
                    initData: JSON.stringify({
                        user: {
                            id: Date.now(),
                            first_name: 'Web',
                            last_name: 'User',
                            username: 'web_user',
                            language_code: 'ru'
                        }
                    })
                };
                console.log('✅ Fallback Telegram WebApp создан');
            }
        }
    }

    // Инициализация Telegram WebApp
    init() {
        console.log('🔍 init() - начинаем инициализацию');
        console.log('🔍 this.tg:', !!this.tg);
        console.log('🔍 window.Telegram:', !!window.Telegram);
        console.log('🔍 window.Telegram?.WebApp:', !!window.Telegram?.WebApp);
        
        // Попробуем переинициализировать, если tg не найден
        if (!this.tg && window.Telegram?.WebApp) {
            console.log('🔧 Переинициализируем Telegram WebApp');
            this.tg = window.Telegram.WebApp;
        }
        
        if (!this.tg) {
            console.warn('⚠️ Telegram WebApp не доступен');
            console.log('🔍 Доступные глобальные объекты:', {
                window: !!window,
                Telegram: !!window.Telegram,
                WebApp: !!window.Telegram?.WebApp
            });
            return false;
        }

        try {
            // Расширяем приложение на весь экран
            this.tg.expand();
            
            // Включаем закрытие по свайпу
            this.tg.enableClosingConfirmation();
            
            // Получаем данные пользователя разными способами
            this.user = this.tg.initDataUnsafe?.user || this.tg.initDataUnsafe?.user_info;
            this.initData = this.tg.initData;
            this.initDataUnsafe = this.tg.initDataUnsafe;
            
            // Отладочная информация
            console.log('🔍 Отладка Telegram WebApp:', {
                tg: !!this.tg,
                initData: !!this.initData,
                initDataUnsafe: !!this.initDataUnsafe,
                user: this.user,
                platform: this.tg.platform,
                version: this.tg.version,
                colorScheme: this.tg.colorScheme
            });
            
            // Проверяем, есть ли данные пользователя
            if (!this.user) {
                console.warn('⚠️ Данные пользователя недоступны');
                console.log('🔍 Доступные данные:', this.initDataUnsafe);
                
                // В веб-версии Telegram создаем временного пользователя
                if (this.tg && this.tg.platform === 'web') {
                    console.log('🔧 Создаем временного пользователя для веб-версии');
                    this.user = {
                        id: Date.now(),
                        first_name: 'Web',
                        last_name: 'User',
                        username: 'web_user',
                        language_code: 'ru'
                    };
                } else {
                    return false;
                }
            }
            
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
        console.log('🔍 getAuthData - проверка данных:', {
            tg: !!this.tg,
            initData: this.initData,
            initDataUnsafe: this.initDataUnsafe,
            user: this.user
        });

        if (!this.tg) {
            console.warn('⚠️ Telegram WebApp не доступен');
            return null;
        }

        // Если нет initData, пробуем создать из user
        if (!this.initData && this.user) {
            console.log('🔧 Создаем initData из user данных');
            const userData = {
                user: this.user,
                hash: this.tg.initDataUnsafe?.hash || ''
            };
            return {
                telegramData: JSON.stringify(userData),
                telegramHash: this.tg.initDataUnsafe?.hash || ''
            };
        }

        if (!this.initData) {
            console.warn('⚠️ Нет initData и user данных');
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
        console.log('🔍 getAuthHeaders - данные аутентификации:', authData);
        
        if (!authData) {
            console.warn('⚠️ Нет данных аутентификации');
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