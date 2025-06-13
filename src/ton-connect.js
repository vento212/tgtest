import { TonConnect } from '@tonconnect/sdk';

// Создаем экземпляр TonConnect с манифестом
const manifestUrl = 'https://fancy-melomakarona-ceb24e.netlify.app/tonconnect-manifest.json';

export const connector = new TonConnect({ manifestUrl });

// Функция для получения баланса
export const getBalance = async (address) => {
  try {
    const response = await fetch(`https://toncenter.com/api/v2/getBalance?address=${address}`);
    const data = await response.json();
    return data.result / 1000000000; // Конвертируем наноТОН в ТОН
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

// Функция для отправки транзакции
export const sendTransaction = async (to, amount, comment = '') => {
  try {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
      messages: [
        {
          address: to,
          amount: (amount * 1000000000).toString(), // Конвертируем ТОН в наноТОН
          payload: comment,
        },
      ],
    };

    const result = await connector.sendTransaction(transaction);
    return result;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}; 