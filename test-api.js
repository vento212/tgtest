// Тестовый скрипт для проверки API ключа TON Center
const API_KEY = '5b9f36ace1197dc5d9dba4abdc2198c56bc722e8527f0e2f5266f2d0e3366579';
const WALLET_ADDRESS = 'UQBlcF9j3mvxaLCKeB1APahO9wpqvd91BIn_mUgm9_lDE_4k';

async function testTonCenterAPI() {
  console.log('🔑 Тестируем новый API ключ TON Center...');
  console.log(`📝 Ключ: ${API_KEY.substring(0, 10)}...`);
  console.log(`💼 Кошелек: ${WALLET_ADDRESS}`);
  console.log('');

  try {
    // Тест 1: TON Center - getWalletInfo
    console.log('1️⃣ TON Center - getWalletInfo...');
    const walletResponse = await fetch(`https://toncenter.com/api/v2/getWalletInfo?address=${WALLET_ADDRESS}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (walletResponse.ok) {
      const walletData = await walletResponse.json();
      console.log(`✅ Информация о кошельке получена:`);
      console.log(`💰 Баланс: ${walletData.result.balance / 1000000000} TON`);
      console.log(`📊 Статус: ${walletData.result.state}`);
    } else {
      const errorText = await walletResponse.text();
      console.log(`❌ Ошибка ${walletResponse.status}: ${errorText}`);
    }
    console.log('');

    // Тест 2: TON Center - getAddressBalance (без API ключа)
    console.log('2️⃣ TON Center - getAddressBalance (публичный)...');
    const balanceResponse = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${WALLET_ADDRESS}`);

    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      console.log(`✅ Баланс получен: ${balanceData.result} нанотон`);
      console.log(`💰 В TON: ${balanceData.result / 1000000000}`);
    } else {
      const errorText = await balanceResponse.text();
      console.log(`❌ Ошибка ${balanceResponse.status}: ${errorText}`);
    }
    console.log('');

    // Тест 3: TON API (tonapi.io)
    console.log('3️⃣ TON API (tonapi.io)...');
    const tonApiResponse = await fetch(`https://tonapi.io/v2/accounts/${WALLET_ADDRESS}`);

    if (tonApiResponse.ok) {
      const tonApiData = await tonApiResponse.json();
      console.log(`✅ TON API ответ получен:`);
      console.log(`💰 Баланс: ${tonApiData.balance / 1000000000} TON`);
      console.log(`📊 Статус: ${tonApiData.status}`);
    } else {
      const errorText = await tonApiResponse.text();
      console.log(`❌ Ошибка ${tonApiResponse.status}: ${errorText}`);
    }
    console.log('');

    // Тест 4: TON Center - getTransactions
    console.log('4️⃣ TON Center - getTransactions...');
    const transactionsResponse = await fetch(`https://toncenter.com/api/v2/getTransactions?address=${WALLET_ADDRESS}&limit=5`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (transactionsResponse.ok) {
      const transactionsData = await transactionsResponse.json();
      console.log(`✅ Получено ${transactionsData.result.length} транзакций`);
      
      if (transactionsData.result.length > 0) {
        const lastTx = transactionsData.result[0];
        console.log(`📄 Последняя транзакция: ${lastTx.transaction_id.hash}`);
        console.log(`⏰ Время: ${new Date(lastTx.transaction_id.lt * 1000).toLocaleString()}`);
      }
    } else {
      const errorText = await transactionsResponse.text();
      console.log(`❌ Ошибка ${transactionsResponse.status}: ${errorText}`);
    }

    console.log('');
    console.log('🎉 Тестирование завершено!');

  } catch (error) {
    console.log(`❌ Ошибка сети: ${error.message}`);
  }
}

// Запускаем тест
testTonCenterAPI(); 