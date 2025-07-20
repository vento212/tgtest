import telegramAuth from './telegram-auth';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Базовый метод для HTTP запросов
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Добавляем заголовки аутентификации Telegram
        const authHeaders = telegramAuth.getAuthHeaders();
        
        const config = {
            ...options,
            headers: {
                ...authHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`❌ API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // ===== API МЕТОДЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ =====

    // Получение профиля пользователя
    async getUserProfile() {
        return this.request('/api/user/profile');
    }

    // Подключение кошелька
    async connectWallet(walletAddress) {
        return this.request('/api/user/connect-wallet', {
            method: 'POST',
            body: JSON.stringify({ walletAddress })
        });
    }

    // Отключение кошелька
    async disconnectWallet() {
        return this.request('/api/user/disconnect-wallet', {
            method: 'POST'
        });
    }

    // Пополнение баланса
    async deposit(amount) {
        return this.request('/api/user/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
    }

    // Вывод средств
    async withdraw(amount, toAddress) {
        return this.request('/api/user/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount, toAddress })
        });
    }

    // Получение заказов пользователя
    async getUserOrders(status = null, limit = 20, offset = 0) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());
        
        const queryString = params.toString();
        const endpoint = `/api/user/orders${queryString ? `?${queryString}` : ''}`;
        
        return this.request(endpoint);
    }

    // ===== API МЕТОДЫ ДЛЯ ЗАКАЗОВ =====

    // Создание заказа
    async createOrder(itemId, itemName, itemTokenId, amount, paymentMethod = 'external_wallet') {
        return this.request('/api/orders', {
            method: 'POST',
            body: JSON.stringify({
                itemId,
                itemName,
                itemTokenId,
                amount,
                paymentMethod
            })
        });
    }

    // Проверка статуса заказа
    async checkOrderStatus(comment) {
        return this.request(`/api/orders/${comment}/status`);
    }

    // Получение всех заказов (для отладки)
    async getAllOrders() {
        return this.request('/api/orders');
    }

    // ===== УТИЛИТЫ =====

    // Проверка подключения к серверу
    async checkConnection() {
        try {
            await this.request('/api/orders');
            return true;
        } catch (error) {
            console.error('❌ Нет подключения к серверу:', error);
            return false;
        }
    }

    // Получение баланса TON кошелька
    async getTonBalance(walletAddress) {
        try {
            const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${walletAddress}`);
            const data = await response.json();
            return data.result / 1000000000; // Конвертируем наноТОН в ТОН
        } catch (error) {
            console.error('❌ Ошибка получения баланса TON:', error);
            return 0;
        }
    }
}

// Создаем глобальный экземпляр API клиента
const apiClient = new ApiClient();

export default apiClient; 