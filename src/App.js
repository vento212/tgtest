import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GiftIcon, ShoppingCartIcon, UserCircleIcon, CurrencyDollarIcon, ViewColumnsIcon, ChartBarIcon, XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import MarketIcon from './icons/Market.png';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { getBalance } from './ton-connect';
import './App.css';

// Получаем данные пользователя Telegram, если приложение открыто как WebApp
const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;

console.log('tgUser:', tgUser);

// Массив товаров для маркетплейса
const marketItems = [
  {
    id: 1,
    name: "Swiss Watch",
    tokenId: "#13174",
    price: 1.5,
    image: "/IMG_0494.MP4",
    type: "video",
    attributes: {
      model: "The Original (3%)",
      symbol: "Bull of Heaven (0.8%)",
      backdrop: "Raspberry (2%)",
      mintable: "Mintable!"
    }
  },
  {
    id: 2,
    name: "Snow Globe",
    tokenId: "#8921",
    price: 2.1,
    image: "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Snow+Globe",
    type: "image",
    attributes: {
      model: "Winter Edition (5%)",
      symbol: "Frost Crystal (1.2%)",
      backdrop: "Arctic Blue (3%)",
      mintable: "Mintable!"
    }
  },
  {
    id: 3,
    name: "Snoop Dogg (Pre-Market)",
    tokenId: "#15678",
    price: 3.5,
    image: "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Snoop+Dogg",
    type: "image",
    attributes: {
      model: "Hip-Hop Legend (8%)",
      symbol: "Gin & Juice (2.5%)",
      backdrop: "Purple Haze (4%)",
      mintable: "Pre-Market"
    }
  },
  {
    id: 4,
    name: "Cyberpunk Mask",
    tokenId: "#2345",
    price: 1.8,
    image: "https://via.placeholder.com/300x300/9B59B6/FFFFFF?text=Cyberpunk+Mask",
    type: "image",
    attributes: {
      model: "Neon Future (4%)",
      symbol: "Digital Ghost (1.8%)",
      backdrop: "Neon Pink (2.5%)",
      mintable: "Mintable!"
    }
  },
  {
    id: 5,
    name: "Golden Dragon",
    tokenId: "#5678",
    price: 4.2,
    image: "https://via.placeholder.com/300x300/FFD700/000000?text=Golden+Dragon",
    type: "image",
    attributes: {
      model: "Mythical Beast (10%)",
      symbol: "Fire Breath (3%)",
      backdrop: "Golden Sky (5%)",
      mintable: "Mintable!"
    }
  },
  {
    id: 6,
    name: "Space Helmet",
    tokenId: "#9012",
    price: 2.8,
    image: "https://via.placeholder.com/300x300/34495E/FFFFFF?text=Space+Helmet",
    type: "image",
    attributes: {
      model: "Astronaut Gear (6%)",
      symbol: "Cosmic Explorer (2%)",
      backdrop: "Starry Night (3.5%)",
      mintable: "Mintable!"
    }
  }
];

export default function App() {
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(marketItems[0]); // По умолчанию первый товар
  const [activeTab, setActiveTab] = useState('market'); // По умолчанию активен Market
  const [showDevNotice, setShowDevNotice] = useState(true); // Показывать уведомление о разработке
  
  const [tonConnectUI] = useTonConnectUI();

  // Состояние для анимации исчезновения
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Функция для плавного исчезновения
  const handleFadeOut = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowDevNotice(false);
      setIsFadingOut(false);
    }, 500);
  }, []);

  // Автоматическое исчезновение с анимацией
  useEffect(() => {
    if (showDevNotice && !isFadingOut) {
      const timer = setTimeout(() => {
        handleFadeOut();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showDevNotice, isFadingOut]);
  const walletInfo = tonConnectUI.account;
  const isConnected = !!walletInfo;

  // Мемоизация для оптимизации рендеринга
  const filteredItems = useMemo(() => {
    return marketItems;
  }, []);

  const selectedItemDetails = useMemo(() => {
    return selectedItem;
  }, [selectedItem]);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  // Подписываемся на изменения состояния кошелька
  useEffect(() => {
    const updateBalance = async () => {
      if (tonConnectUI.account && tonConnectUI.account.address) {
        try {
          setIsLoading(true);
          const balance = await getBalance(tonConnectUI.account.address);
          
          // Валидация баланса
          if (typeof balance === 'number' && balance >= 0) {
            setBalance(balance);
          } else {
            setBalance(0);
            console.warn('Invalid balance received:', balance);
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(0);
          setMessage('Ошибка получения баланса: ' + (error.message || 'Неизвестная ошибка'));
        } finally {
          setIsLoading(false);
        }
      } else {
        setBalance(0);
      }
    };

    updateBalance();
  }, [tonConnectUI.account]);

  // Функция проверки оплаты - упрощенная версия
  const checkPayment = useCallback(async () => {
    if (!currentOrder) {
      setMessage('❌ Сначала нажмите "Купить"!');
      return;
    }

    // Валидация данных заказа
    if (!currentOrder.walletAddress || !currentOrder.amountNano || !currentOrder.comment) {
      setMessage('❌ Неполные данные заказа!');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Проверяю оплату...');
      
      // Используем API ключ для проверки транзакций
      const apiKey = process.env.REACT_APP_TONCENTER_API_KEY;
      
      if (!apiKey) {
        throw new Error('API ключ не настроен');
      }
      
      const response = await fetch(
        `https://toncenter.com/api/v2/getTransactions?address=${encodeURIComponent(currentOrder.walletAddress)}&limit=10`,
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
      
      if (!data.result || !Array.isArray(data.result)) {
        throw new Error('Неверный формат ответа от API');
      }
      
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
        setCurrentOrder(null); // бсрос товара
      } else {
        setPaymentStatus('pending');
        setMessage('❌ Оплата не найдена. Попробуйте позже.');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      setMessage('❌ Ошибка при проверке оплаты: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 6000);
    }
  }, [currentOrder]);

  // Функция покупки NFT - упрощенная версия
  const buyNFT = useCallback(async () => {
    if (!selectedItem) {
      setMessage('❌ Выберите товар для покупки!');
      return;
    }

    // Валидация данных товара
    if (!selectedItem.price || selectedItem.price <= 0) {
      setMessage('❌ Неверная цена товара!');
      return;
    }

    if (!selectedItem.tokenId) {
      setMessage('❌ Отсутствует ID товара!');
      return;
    }

    try {
      // Генерируем уникальный комментарий
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const comment = `Buy NFT ${selectedItem.tokenId} - ${timestamp}_${randomId}`;
      
      // Используем адрес кошелька из переменных окружения
      const walletAddress = process.env.REACT_APP_WALLET_ADDRESS || 'UQBlcF9j3mvxaLCKeB1APahO9wpqvd91BIn_mUgm9_lDE_4k';
      
      // Валидация адреса кошелька
      if (!walletAddress || walletAddress.length < 10) {
        setMessage('❌ Неверный адрес кошелька!');
        return;
      }
      
      const amountNano = Math.floor(selectedItem.price * 1000000000); // Конвертируем цену в nanoTON
      
      // Валидация суммы
      if (amountNano <= 0) {
        setMessage('❌ Неверная сумма платежа!');
        return;
      }
      
      const deeplink = `ton://transfer/${walletAddress}?amount=${amountNano}&text=${encodeURIComponent(comment)}`;
      
      // Открываем deeplink
      window.open(deeplink, '_blank');
      
      // Сохраняем информацию о заказе для проверки
      const order = {
        amount: selectedItem.price,
        amountNano: amountNano,
        comment: comment,
        status: 'pending',
        walletAddress: walletAddress,
        createdAt: new Date(),
        itemId: selectedItem.id,
        itemName: selectedItem.name
      };
      
      setCurrentOrder(order);
      setPaymentStatus('pending');
      
      setMessage(`✅ Открываю TON кошелек для оплаты ${selectedItem.name}!`);
      
    } catch (error) {
      console.error('Failed to create payment link:', error);
      setMessage('❌ Ошибка создания ссылки для оплаты: ' + (error.message || 'Неизвестная ошибка'));
    }
  }, [selectedItem]);

  return (
    <div className="min-h-screen bg-telegram-dark flex flex-col items-center py-4">
      {/* Development Notice */}
      {showDevNotice && (
        <div className={`fixed top-4 right-4 z-50 ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className="bg-red-500/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-red-300/50 max-w-xs">
            <div className="text-center">
              <div className="mb-2">
                <svg className="w-8 h-8 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-1 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                ⚠️ Внимание
              </h3>
              <p className="text-white text-xs leading-relaxed font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                Данный проект находится в разработке
              </p>
              <p className="text-red-100 text-xs mt-1 font-semibold tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
                by Vento
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Content based on active tab */}
      {activeTab === 'market' && (
        <div className="w-full max-w-md mb-4">
          <h2 className="text-xl font-bold text-white mb-4">Market</h2>
          {isConnected ? (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-telegram-card rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                    selectedItem?.id === item.id 
                      ? 'ring-2 ring-telegram-blue shadow-lg' 
                      : 'hover:bg-telegram-gray'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative rounded-lg overflow-hidden mb-2">
                    {item.type === 'video' ? (
                      <video
                        src={item.image}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-telegram-blue text-white text-xs px-2 py-1 rounded-full font-bold">
                      {item.price} TON
                    </div>
                  </div>
                  <div className="text-white">
                    <div className="font-bold text-sm truncate">{item.name}</div>
                    <div className="text-gray-400 text-xs">{item.tokenId}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-telegram-card rounded-2xl p-6 text-center">
              <ShoppingCartIcon className="w-16 h-16 text-telegram-blue mx-auto mb-4" />
              <p className="text-white text-lg font-semibold mb-2">Connect Wallet to View Market</p>
              <p className="text-gray-400 text-sm">Please connect your TON wallet to browse items</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="w-full max-w-md mb-4">
          <h2 className="text-xl font-bold text-white mb-4">Gallery</h2>
          {isConnected ? (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-telegram-card rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                    selectedItem?.id === item.id 
                      ? 'ring-2 ring-telegram-blue shadow-lg' 
                      : 'hover:bg-telegram-gray'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative rounded-lg overflow-hidden mb-2">
                    {item.type === 'video' ? (
                      <video
                        src={item.image}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-telegram-blue text-white text-xs px-2 py-1 rounded-full font-bold">
                      {item.price} TON
                    </div>
                  </div>
                  <div className="text-white">
                    <div className="font-bold text-sm truncate">{item.name}</div>
                    <div className="text-gray-400 text-xs">{item.tokenId}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-telegram-card rounded-2xl p-6 text-center">
              <UserCircleIcon className="w-16 h-16 text-telegram-blue mx-auto mb-4" />
              <p className="text-white text-lg font-semibold mb-2">Connect Wallet to View Gallery</p>
              <p className="text-gray-400 text-sm">Please connect your TON wallet to browse items</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'auctions' && (
        <div className="w-full max-w-md mb-4">
          <h2 className="text-xl font-bold text-white mb-4">Auctions</h2>
          <div className="bg-telegram-card rounded-2xl p-6 text-center">
            <CurrencyDollarIcon className="w-16 h-16 text-telegram-blue mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">Auctions Coming Soon</p>
            <p className="text-gray-400 text-sm">Stay tuned for exciting auction features!</p>
          </div>
        </div>
      )}

      {activeTab === 'gifts' && (
        <div className="w-full max-w-md mb-4">
          <h2 className="text-xl font-bold text-white mb-4">My Gifts</h2>
          <div className="bg-telegram-card rounded-2xl p-6 text-center">
            <GiftIcon className="w-16 h-16 text-telegram-blue mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">No Gifts Yet</p>
            <p className="text-gray-400 text-sm">Gifts you receive will appear here</p>
          </div>
        </div>
      )}

      {activeTab === 'gifi' && (
        <div className="w-full max-w-md mb-4">
          <h2 className="text-xl font-bold text-white mb-4">GiFi</h2>
          <div className="bg-telegram-card rounded-2xl p-6 text-center">
            <ViewColumnsIcon className="w-16 h-16 text-telegram-blue mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">GiFi Platform</p>
            <p className="text-gray-400 text-sm">Coming soon with amazing features!</p>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="w-full max-w-md mb-4">
          <h2 className="text-xl font-bold text-white mb-4">Activity</h2>
          <div className="bg-telegram-card rounded-2xl p-6 text-center">
            <ChartBarIcon className="w-16 h-16 text-telegram-blue mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">Activity Feed</p>
            <p className="text-gray-400 text-sm">Your recent activity will appear here</p>
          </div>
        </div>
      )}

      {/* Selected NFT Card - только для Market и Gallery */}
      {selectedItemDetails && (activeTab === 'market' || activeTab === 'gallery') && isConnected && (
        <div className="w-full max-w-md bg-telegram-card rounded-2xl shadow-lg p-4 mb-4">
          <div className="relative rounded-xl overflow-hidden mb-4">
            {selectedItemDetails.type === 'video' ? (
              <video
                src={selectedItemDetails.image}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-64 object-cover rounded-xl"
              />
            ) : (
              <img
                src={selectedItemDetails.image}
                alt={selectedItemDetails.name}
                className="w-full h-64 object-cover rounded-xl"
              />
            )}
            <GiftIcon
              className="w-8 h-8 text-telegram-blue absolute left-2 bottom-2 bg-white rounded-full p-1 cursor-pointer hover:bg-telegram-blue hover:text-white transition-colors"
              onClick={() => setShowGiftModal(true)}
            />
            <ShoppingCartIcon className="w-8 h-8 text-telegram-blue absolute right-2 bottom-2 bg-white rounded-full p-1" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl font-bold text-white">{selectedItemDetails.name}</span>
            <span className="text-gray-400 font-semibold">{selectedItemDetails.tokenId}</span>
          </div>
          <div className="space-y-1 mb-4">
            <div className="flex items-center text-white text-sm">
              <span className="w-24 font-normal">Model</span>
              <span className="text-telegram-blue font-semibold ml-2">{selectedItemDetails.attributes.model}</span>
            </div>
            <div className="flex items-center text-white text-sm">
              <span className="w-24 font-bold">Symbol</span>
              <span className="text-telegram-blue font-semibold ml-2">{selectedItemDetails.attributes.symbol}</span>
            </div>
            <div className="flex items-center text-white text-sm">
              <span className="w-24 font-normal">Backdrop</span>
              <span className="text-telegram-blue font-semibold ml-2">{selectedItemDetails.attributes.backdrop}</span>
            </div>
            <div className="flex items-center text-white text-sm">
              <span className="w-24 font-bold">Mintable</span>
              <span className="text-telegram-blue font-semibold ml-2">{selectedItemDetails.attributes.mintable}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="w-full max-w-md bg-telegram-gray rounded-2xl flex justify-between px-2 py-2 mb-4 text-xs">
        <div 
          className={`flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100 ${
            activeTab === 'market' ? 'text-telegram-blue' : 'text-white'
          }`}
          onClick={() => setActiveTab('market')}
        >
          <img src={MarketIcon} alt="Market" className={`w-7 h-7 mx-auto mb-1 ${activeTab === 'market' ? 'opacity-100' : 'opacity-70'}`} />
          <span className="font-bold">Market</span>
        </div>
        <div 
          className={`flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100 ${
            activeTab === 'auctions' ? 'text-telegram-blue' : 'text-white'
          }`}
          onClick={() => setActiveTab('auctions')}
        >
          <CurrencyDollarIcon className="w-7 h-7 mx-auto mb-1 font-bold" />
          <span className="font-bold">Auctions</span>
        </div>
        <div 
          className={`flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100 ${
            activeTab === 'gifts' ? 'text-telegram-blue' : 'text-white'
          }`}
          onClick={() => setActiveTab('gifts')}
        >
          <GiftIcon className="w-7 h-7 mx-auto mb-1 font-bold" />
          <span className="font-bold">My Gifts</span>
        </div>
        <div 
          className={`flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100 ${
            activeTab === 'gifi' ? 'text-telegram-blue' : 'text-white'
          }`}
          onClick={() => setActiveTab('gifi')}
        >
          <ViewColumnsIcon className="w-7 h-7 mx-auto mb-1 font-bold" />
          <span className="font-bold">GiFi</span>
        </div>
        <div 
          className={`flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100 ${
            activeTab === 'gallery' ? 'text-telegram-blue' : 'text-white'
          }`}
          onClick={() => setActiveTab('gallery')}
        >
          <UserCircleIcon className="w-7 h-7 mx-auto mb-1 font-bold" />
          <span className="font-bold">Gallery</span>
        </div>
        <div 
          className={`flex flex-col items-center flex-1 cursor-pointer active:scale-95 transition-transform duration-100 ${
            activeTab === 'activity' ? 'text-telegram-blue' : 'text-white'
          }`}
          onClick={() => setActiveTab('activity')}
        >
          <ChartBarIcon className="w-7 h-7 mx-auto mb-1 font-bold" />
          <span className="font-bold">Activity</span>
        </div>
      </div>

      {/* Buy/Offer Buttons - только для Market и Gallery */}
      {(activeTab === 'market' || activeTab === 'gallery') && isConnected && (
        <div className="w-full max-w-md flex flex-col gap-2">
          {/* Кнопка "Купить" теперь создает заказ через бэкенд */}
                  <button
          onClick={buyNFT}
          disabled={isLoading || !selectedItemDetails}
          className={`w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors ${(isLoading || !selectedItemDetails) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Создаю заказ...' : selectedItemDetails ? `Купить (${selectedItemDetails.price} TON)` : 'Выберите товар'}
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
      )}
    </div>
  );
} 