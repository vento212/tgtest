import { TonConnect } from '@tonconnect/sdk';

// Конфигурация для Telegram WebApp
const manifestUrl = 'https://your-app-domain.com/tonconnect-manifest.json';

// Создаем экземпляр TonConnect
const connector = new TonConnect({
  manifestUrl: manifestUrl,
  // Дополнительные настройки для Telegram WebApp
  uiPreferences: {
    theme: 'dark',
    colorsSet: {
      [TonConnect.Theme.DARK]: {
        constant: {
          background: '#1a1a2e',
          surface: '#16213e',
          surfaceVariant: '#0f3460',
          primary: '#0088cc',
          onPrimary: '#ffffff',
          secondary: '#00a8ff',
          onSecondary: '#ffffff',
          error: '#ff6b6b',
          onError: '#ffffff',
          success: '#51cf66',
          onSuccess: '#ffffff',
          warning: '#ffd43b',
          onWarning: '#000000'
        }
      }
    }
  }
});

export default connector;

// Функция для получения баланса
export const getBalance = async (address) => {
  try {
    const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`);
    const data = await response.json();
    return data.result / 1000000000; // Конвертируем наноТОН в ТОН
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

// Функция для отправки транзакции
export const sendTransaction = async (toAddress, amount, comment = '') => {
  if (!connector) {
    throw new Error('TON Connect not initialized');
  }

  if (!toAddress || typeof toAddress !== 'string') {
    throw new Error('Invalid recipient address');
  }

  try {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
      messages: [
        {
          address: toAddress,
          amount: (amount * 1000000000).toString(), // Конвертируем ТОН в наноТОН
          payload: comment ? btoa(unescape(encodeURIComponent(comment))) : undefined
        },
      ],
    };

    console.log('Sending transaction:', transaction);
    const result = await connector.sendTransaction(transaction);
    console.log('Transaction result:', result);
    return result;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}; 