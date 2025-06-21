import React, { useState, useEffect } from 'react';
import { GiftIcon, ShoppingCartIcon, UserCircleIcon, CurrencyDollarIcon, ViewColumnsIcon, ChartBarIcon, XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import MarketIcon from './icons/Market.png';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { getBalance } from './ton-connect';
import './App.css';

// Получаем данные пользователя Telegram, если приложение открыто как WebApp
const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;

console.log('tgUser:', tgUser);

export default function App() {
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  
  const [tonConnectUI] = useTonConnectUI();
  const walletInfo = tonConnectUI.account;
  const isConnected = !!walletInfo;
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  // Подписываемся на изменения состояния кошелька
  useEffect(() => {
    const updateBalance = async () => {
      if (tonConnectUI.account) {
        try {
          setIsLoading(true);
          const balance = await getBalance(tonConnectUI.account.address);
          setBalance(balance);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setMessage('Error fetching balance');
        } finally {
          setIsLoading(false);
        }
      } else {
        setBalance(0);
      }
    };

    updateBalance();
  }, [tonConnectUI]);

  // Функция проверки оплаты - упрощенная версия
  async function checkPayment() {
    if (!currentOrder) {
      setMessage('❌ Сначала нажмите "Купить"!');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Проверяю оплату...');
      
      // Используем API ключ для проверки транзакций
      const apiKey = process.env.REACT_APP_TONCENTER_API_KEY;
      const response = await fetch(
        `https://toncenter.com/api/v2/getTransactions?address=${currentOrder.walletAddress}&limit=10`,
        {
          headers: {
            'X-API-Key': apiKey
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const transactions = data.result;
      
      // Ищем транзакцию с нужной суммой и комментарием
      const payment = transactions.find(tx => 
        tx.in_msg &&
        tx.in_msg.value === currentOrder.amountNano.toString() &&
        tx.in_msg.message && 
        tx.in_msg.message.includes(currentOrder.comment)
      );
      
      if (payment) {
        setPaymentStatus('paid');
        setMessage('✅ Оплата найдена! Спасибо за покупку.');
        setCurrentOrder(null); // Сбрасываем заказ после успешной оплаты
      } else {
        setPaymentStatus('pending');
        setMessage('❌ Оплата не найдена. Попробуйте позже.');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      setMessage('❌ Ошибка при проверке оплаты: ' + error.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 6000);
    }
  }

  // Функция покупки NFT - упрощенная версия
  async function buyNFT() {
    try {
      // Генерируем уникальный комментарий
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const comment = `Buy NFT #13174 - ${timestamp}_${randomId}`;
      
      // Используем адрес кошелька из переменных окружения
      const walletAddress = process.env.REACT_APP_WALLET_ADDRESS || 'UQBlcF9j3mvxaLCKeB1APahO9wpqvd91BIn_mUgm9_lDE_4k';
      const amountNano = 1500000000; // 1.5 TON в nanoTON
      const deeplink = `ton://transfer/${walletAddress}?amount=${amountNano}&text=${encodeURIComponent(comment)}`;
      
      // Открываем deeplink
      window.open(deeplink, '_blank');
      
      // Сохраняем информацию о заказе для проверки
      const order = {
        amount: 1.5,
        amountNano: amountNano,
        comment: comment,
        status: 'pending',
        walletAddress: walletAddress,
        createdAt: new Date()
      };
      
      setCurrentOrder(order);
      setPaymentStatus('pending');
      
      setMessage('✅ Открываю TON кошелек для оплаты!');
      
    } catch (error) {
      console.error('Failed to create payment link:', error);
      setMessage('❌ Ошибка создания ссылки для оплаты');
    }
  }

  return (
    <div className="min-h-screen bg-telegram-dark flex flex-col items-center py-4">
      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-telegram-card rounded-2xl p-6 w-full max-w-md relative shadow-lg">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowDepositModal(false)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-xl font-bold mb-2 text-white text-center">Deposit</div>
            <div className="text-gray-400 text-center mb-4">Enter the amount you want to deposit</div>
            <div className="flex items-center bg-telegram-dark rounded-xl px-4 py-3 mb-4 border border-telegram-blue">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="mr-2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6 0 2.22 1.21 4.15 3.01 5.19.13.08.28.13.44.13.16 0 .31-.05.44-.13C13.79 16.15 15 14.22 15 12c0-3.31-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4 0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.21-1.79 4-4 4z" fill="#08c"/></svg>
              <input
                type="number"
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                placeholder="Amount"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
              />
              <span className="ml-2 text-gray-400">Balance: <span className="text-telegram-blue font-bold">{balance} <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style={{display:'inline',verticalAlign:'middle'}}><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6 0 2.22 1.21 4.15 3.01 5.19.13.08.28.13.44.13.16 0 .31-.05.44-.13C13.79 16.15 15 14.22 15 12c0-3.31-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4 0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.21-1.79 4-4 4z' fill='#08c'/></svg></span></span>
            </div>
            <button
              className="w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors flex items-center justify-center"
              onClick={() => {/* Логика депозита */}}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="mr-2"><rect width="24" height="24" rx="12" fill="#fff"/><path d="M7 12h10M12 7v10" stroke="#08c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Deposit
            </button>
          </div>
        </div>
      )}
      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-telegram-card rounded-2xl p-6 w-full max-w-md relative shadow-lg">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowWithdrawModal(false)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
              <div className="bg-yellow-400 rounded-full p-3 mb-4">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff"/><path d="M12 8v4m0 4h.01" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="text-xl font-bold mb-2 text-white text-center">Insufficient Balance</div>
              <div className="text-gray-400 text-center mb-4">You do not have enough balance, please charge your balance first!</div>
              <button
                className="w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors"
                onClick={() => {/* Логика пополнения */}}
              >
                Charge Balance
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-telegram-card rounded-2xl p-6 w-full max-w-md relative shadow-lg">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowGiftModal(false)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-lg font-bold mb-4 text-white">Buy gift for someone else</div>
            <input
              type="text"
              className="w-full rounded-xl px-4 py-3 mb-4 bg-telegram-dark text-white placeholder-gray-400 border border-telegram-blue focus:outline-none focus:ring-2 focus:ring-telegram-blue"
              placeholder="Recipient Username or UserId"
              value={giftRecipient}
              onChange={e => setGiftRecipient(e.target.value)}
            />
            <button
              className="w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors"
              onClick={() => {/* Здесь будет логика поиска пользователя */}}
            >
              Find User
            </button>
          </div>
        </div>
      )}

      {/* Message Popup */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-telegram-blue text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-telegram-gray p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-telegram-blue"></div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between bg-telegram-gray rounded-2xl px-4 py-2 mb-4">
        <div className="flex items-center gap-1 sm:gap-2 flex-1">
          <div className="flex items-center bg-telegram-dark rounded-full px-3 py-1 text-sm font-semibold">
            <CurrencyDollarIcon className="w-5 h-5 text-telegram-blue mr-1" />
            <span>{balance.toFixed(2)} TON</span>
          </div>
          <button
            className="ml-1 bg-telegram-blue hover:bg-telegram-btn-dark text-white rounded-full p-1 transition-colors"
            onClick={() => setShowDepositModal(true)}
            aria-label="Deposit"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          <button
            className="ml-0 bg-telegram-blue hover:bg-telegram-btn-dark text-white rounded-full p-1 transition-colors"
            onClick={() => setShowWithdrawModal(true)}
            aria-label="Withdraw"
          >
            <MinusIcon className="w-6 h-6" />
          </button>
          {isConnected && walletInfo?.address && (
            <div className="text-xs text-gray-400 truncate max-w-[120px] ml-2">
              {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {tgUser?.photo_url ? (
            <img
              src={tgUser.photo_url}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-telegram-blue"
            />
          ) : tgUser?.first_name ? (
            <div className="w-8 h-8 rounded-full bg-telegram-blue flex items-center justify-center text-white font-bold border-2 border-telegram-blue">
              {tgUser.first_name[0]}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold border-2 border-telegram-blue">
              <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z' />
              </svg>
            </div>
          )}
          <button 
            onClick={async () => {
              if (!tonConnectUI || typeof tonConnectUI.openModal !== 'function') {
                setMessage('Ошибка: TON Connect UI не инициализирован!');
                console.error('tonConnectUI:', tonConnectUI);
                return;
              }
              try {
                console.log('Открытие модального окна TON Connect...');
                await tonConnectUI.openModal();
              } catch (e) {
                setMessage('Ошибка при открытии окна подключения: ' + (e.message || e));
                console.error('Ошибка при открытии окна подключения:', e);
              }
            }}
            className="bg-telegram-blue hover:bg-telegram-btn-dark text-white font-semibold rounded-full px-4 py-2 transition-colors"
            disabled={isLoading || !tonConnectUI || isConnected}
          >
            {isConnected ? 'Кошелек подключен' : 'Подключить кошелек'}
          </button>
        </div>
      </div>

      {/* NFT Card */}
      <div className="w-full max-w-md bg-telegram-card rounded-2xl shadow-lg p-4 mb-4">
        <div className="relative rounded-xl overflow-hidden mb-4">
          <video
            src="/IMG_0494.MP4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-64 object-cover rounded-xl"
          />
          <GiftIcon
            className="w-8 h-8 text-telegram-blue absolute left-2 bottom-2 bg-white rounded-full p-1 cursor-pointer hover:bg-telegram-blue hover:text-white transition-colors"
            onClick={() => setShowGiftModal(true)}
          />
          <ShoppingCartIcon className="w-8 h-8 text-telegram-blue absolute right-2 bottom-2 bg-white rounded-full p-1" />
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xl font-bold">Swiss Watch</span>
          <span className="text-gray-400 font-semibold">#13174</span>
        </div>
        <div className="space-y-1 mb-4">
          <div className="flex items-center text-white text-sm">
            <span className="w-24 font-normal">Model</span>
            <span className="text-telegram-blue font-semibold ml-2">The Original (3%)</span>
          </div>
          <div className="flex items-center text-white text-sm">
            <span className="w-24 font-bold">Symbol</span>
            <span className="text-telegram-blue font-semibold ml-2">Bull of Heaven (0.8%)</span>
          </div>
          <div className="flex items-center text-white text-sm">
            <span className="w-24 font-normal">Backdrop</span>
            <span className="text-telegram-blue font-semibold ml-2">Raspberry (2%)</span>
          </div>
          <div className="flex items-center text-white text-sm">
            <span className="w-24 font-bold">Mintable</span>
            <span className="text-telegram-blue font-semibold ml-2">Mintable!</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full max-w-md bg-telegram-gray rounded-2xl flex justify-between px-2 py-2 mb-4 text-xs">
        <div className="flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100" onClick={e => e.preventDefault()}>
          <img src={MarketIcon} alt="Market" className="w-7 h-7 mx-auto mb-1" />
          <span className="font-bold text-white">Market</span>
        </div>
        <div className="flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100" onClick={e => e.preventDefault()}>
          <CurrencyDollarIcon className="w-7 h-7 mx-auto mb-1 text-white font-bold" />
          <span className="font-bold text-white">Auctions</span>
        </div>
        <div className="flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100" onClick={e => e.preventDefault()}>
          <GiftIcon className="w-7 h-7 mx-auto mb-1 text-white font-bold" />
          <span className="font-bold text-white">My Gifts</span>
        </div>
        <div className="flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100" onClick={e => e.preventDefault()}>
          <ViewColumnsIcon className="w-7 h-7 mx-auto mb-1 text-white font-bold" />
          <span className="font-bold text-white">GiFi</span>
        </div>
        <div className="flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100" onClick={e => e.preventDefault()}>
          <UserCircleIcon className="w-7 h-7 mx-auto mb-1 text-white font-bold" />
          <span className="font-bold text-white">Gallery</span>
        </div>
        <div className="flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100" onClick={e => e.preventDefault()}>
          <ChartBarIcon className="w-7 h-7 mx-auto mb-1 text-white font-bold" />
          <span className="font-bold text-white">Activity</span>
        </div>
      </div>

      {/* Buy/Offer Buttons */}
      <div className="w-full max-w-md flex flex-col gap-2">
        {/* Кнопка "Купить" теперь создает заказ через бэкенд */}
        <button
          onClick={buyNFT}
          disabled={isLoading}
          className={`w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Создаю заказ...' : 'Купить (1.5 TON)'}
        </button>
        
        {/* Показываем информацию о текущем заказе */}
        {currentOrder && (
          <div className="w-full bg-telegram-dark rounded-xl p-3 mb-2 border border-telegram-blue">
            <div className="text-white text-sm">
              <div className="font-semibold mb-1">Текущий заказ:</div>
              <div>Сумма: {currentOrder.amount} TON</div>
              <div>Комментарий: {currentOrder.comment}</div>
              <div>Статус: <span className={paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}>{paymentStatus === 'paid' ? 'Оплачен' : 'Ожидает оплаты'}</span></div>
            </div>
          </div>
        )}
        
        {/* Кнопка "Я оплатил" */}
        <button
          onClick={checkPayment}
          disabled={isLoading || !currentOrder}
          className={`w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl text-lg transition-colors ${(!currentOrder || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Проверяю...' : 'Я оплатил'}
        </button>
        
        <button 
          onClick={() => {/* Логика создания оффера */}}
          disabled={isLoading || !walletInfo}
          className={`w-full bg-telegram-gray text-white font-bold py-3 rounded-xl text-lg border border-gray-600 hover:bg-telegram-dark transition-colors ${(!walletInfo || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Processing...' : 'Offer'}
        </button>
      </div>
    </div>
  );
} 