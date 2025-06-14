import { TonConnect } from '@tonconnect/sdk';

// Создаем экземпляр TonConnect с манифестом
const manifestUrl = 'https://fancy-melomakarona-ceb24e.netlify.app/tonconnect-manifest.json';

export const tonConnect = new TonConnect({
    manifestUrl,
    connectButtonOptions: {
        enableSandbox: true
    }
});

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
  if (!tonConnect) {
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
    const result = await tonConnect.sendTransaction(transaction);
    console.log('Transaction result:', result);
    return result;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}; 