// API для работы с бэкендом
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.com';

export const api = {
  // Получить профиль пользователя
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Обновить баланс пользователя
  async updateUserBalance(userId, balance) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ balance }),
      });
      if (!response.ok) throw new Error('Failed to update balance');
      return await response.json();
    } catch (error) {
      console.error('Error updating balance:', error);
      return null;
    }
  },

  // Добавить покупку
  async addPurchase(userId, purchaseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });
      if (!response.ok) throw new Error('Failed to add purchase');
      return await response.json();
    } catch (error) {
      console.error('Error adding purchase:', error);
      return null;
    }
  },

  // Получить покупки пользователя
  async getUserPurchases(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/purchases`);
      if (!response.ok) throw new Error('Failed to fetch purchases');
      return await response.json();
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }
  },

  // Обработать платеж
  async processPayment(userId, amount, walletAddress) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          walletAddress,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to process payment');
      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      return null;
    }
  }
};

export default api; 