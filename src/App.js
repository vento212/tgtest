import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GiftIcon, ShoppingCartIcon, UserCircleIcon, CurrencyDollarIcon, ViewColumnsIcon, ChartBarIcon, XMarkIcon, PlusIcon, MinusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import MarketIcon from './icons/Market.png';
import { useTonConnectUI } from '@tonconnect/ui-react';
import telegramAuth from './telegram-auth';
import apiClient from './api';
import './App.css';

// Получаем данные пользователя Telegram
const tgUser = telegramAuth.getUser();

console.log('tgUser:', tgUser);
console.log('Build timestamp:', new Date().toISOString()); // Принудительное обновление

const marketItems = [
  {
    id: 1,
    name: "Cosmic Warrior",
    tokenId: "#1234",
    price: 1.5,
    image: "https://via.placeholder.com/300x300/3498DB/FFFFFF?text=Cosmic+Warrior",
    type: "image",
    attributes: {
      model: "Warrior (15%)",
      symbol: "Cosmic (8%)",
      backdrop: "Space (12%)",
      mintable: "Mintable!"
    }
  },
  {
    id: 2,
    name: "Digital Dragon",
    tokenId: "#5678",
    price: 2.2,
    image: "https://via.placeholder.com/300x300/E74C3C/FFFFFF?text=Digital+Dragon",
    type: "image",
    attributes: {
      model: "Dragon (10%)",
      symbol: "Digital (5%)",
      backdrop: "Fire (7%)",
      mintable: "Mintable!"
    }
  },
  {
    id: 3,
    name: "Neon Cat",
    tokenId: "#9012",
    price: 0.8,
    image: "https://via.placeholder.com/300x300/9B59B6/FFFFFF?text=Neon+Cat",
    type: "image",
    attributes: {
      model: "Cat (20%)",
      symbol: "Neon (12%)",
      backdrop: "Cyber (9%)",
      mintable: "Mintable!"
    }
  },
  {
    id: 4,
    name: "Holographic Unicorn",
    tokenId: "#3456",
    price: 3.5,
    image: "https://via.placeholder.com/300x300/F39C12/FFFFFF?text=Holographic+Unicorn",
    type: "image",
    attributes: {
      model: "Unicorn (5%)",
      symbol: "Holographic (3%)",
      backdrop: "Rainbow (4%)",
      mintable: "Mintable!"
    }
  },
  {
    id: 5,
    name: "Quantum Robot",
    tokenId: "#7890",
    price: 1.8,
    image: "https://via.placeholder.com/300x300/1ABC9C/FFFFFF?text=Quantum+Robot",
    type: "image",
    attributes: {
      model: "Robot (12%)",
      symbol: "Quantum (6%)",
      backdrop: "Tech (8%)",
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
  // Состояние пользователя
  const [userProfile, setUserProfile] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  // Состояние приложения
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(marketItems[0]);
  const [activeTab, setActiveTab] = useState('market');
  const [showDevNotice, setShowDevNotice] = useState(true);
  
  // Состояние модальных окон
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [orders, setOrders] = useState([]);
  
  // Состояние анимации
  const [isFadingOut, setIsFadingOut] = useState(false);

  // TON Connect
  const [tonConnectUI] = useTonConnectUI();
  const walletInfo = tonConnectUI.account;
  const isConnected = !!walletInfo;

  // Демо данные для режима без базы данных
  const demoData = {
    user: {
      telegramId: 123456789,
      username: 'demo_user',
      firstName: 'Демо',
      lastName: 'Пользователь',
      photoUrl: null,
      walletAddress: 'EQD4FPq-PRDieyQKkizFTRtSDyucUIqrjKvVmh2v9vXeJw8G',
      isWalletConnected: true,
      balance: 5.0,
      lastActivity: new Date(),
      createdAt: new Date()
    },
    orders: [
      {
        _id: 'demo_order_1',
        itemName: 'Cosmic Warrior',
        amount: 1.5,
        status: 'paid',
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        _id: 'demo_order_2',
        itemName: 'Digital Art #123',
        amount: 2.0,
        status: 'pending',
        createdAt: new Date()
      }
    ]
  };

  // Инициализация Telegram WebApp
  useEffect(() => {
    const initTelegram = async () => {
      try {
        const success = telegramAuth.init();
        if (success) {
          console.log('✅ Telegram WebApp инициализирован');
          await loadUserProfile();
          await loadUserOrders();
        } else {
          console.warn('⚠️ Приложение запущено вне Telegram');
          setIsProfileLoading(false);
          // Показываем сообщение пользователю
          setMessage('Приложение лучше всего работает в Telegram. Откройте его через Telegram бота.');
        }
      } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        setIsProfileLoading(false);
        setMessage('Ошибка инициализации приложения. Попробуйте обновить страницу.');
      }
    };

    initTelegram();
  }, []);

  // Загрузка профиля пользователя
  const loadUserProfile = async () => {
    try {
      setIsProfileLoading(true);
      
      // Проверяем, есть ли данные Telegram
      if (!telegramAuth.isTelegramApp()) {
        console.log('Приложение запущено вне Telegram, используем демо режим');
        setUserProfile(demoData.user);
        setUserBalance(demoData.user.balance);
        setOrders(demoData.orders);
        setIsProfileLoading(false);
        setMessage('Демо режим: данные не сохраняются');
        return;
      }
      
      const profile = await apiClient.getUserProfile();
      setUserProfile(profile.user);
      setUserBalance(profile.user.balance);
      console.log('✅ Профиль пользователя загружен:', profile);
    } catch (error) {
      console.error('❌ Ошибка загрузки профиля:', error);
      
      // Если ошибка связана с базой данных, показываем демо режим
      if (error.message.includes('База данных недоступна')) {
        console.log('База данных недоступна, переключаемся в демо режим');
        setUserProfile(demoData.user);
        setUserBalance(demoData.user.balance);
        setOrders(demoData.orders);
        setMessage('Демо режим: база данных недоступна');
      } else if (error.message.includes('TELEGRAM_DATA_MISSING') || error.message.includes('AUTH_ERROR')) {
        console.log('Данные Telegram недоступны, работаем в режиме демо');
        setUserProfile(demoData.user);
        setUserBalance(demoData.user.balance);
        setOrders(demoData.orders);
        setMessage('Режим демо: некоторые функции недоступны без Telegram');
      } else {
        setMessage('Ошибка загрузки профиля: ' + error.message);
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Загрузка заказов пользователя
  const loadUserOrders = async () => {
    try {
      if (!telegramAuth.isTelegramApp()) {
        console.log('Демо режим: используем демо заказы');
        setOrders(demoData.orders);
        return;
      }
      
      const userOrders = await apiClient.getUserOrders();
      setOrders(userOrders.orders);
      console.log('✅ Заказы пользователя загружены:', userOrders);
    } catch (error) {
      console.error('❌ Ошибка загрузки заказов:', error);
      
      if (error.message.includes('База данных недоступна')) {
        console.log('База данных недоступна, используем демо заказы');
        setOrders(demoData.orders);
        setMessage('Демо режим: заказы не сохраняются');
      } else {
        setMessage('Ошибка загрузки заказов: ' + error.message);
      }
    }
  };

  // Обновление профиля при подключении кошелька
  useEffect(() => {
    if (isConnected && walletInfo?.address) {
      handleWalletConnected(walletInfo.address);
    }
  }, [isConnected, walletInfo]);

  // Обработка подключения кошелька
  const handleWalletConnected = async (walletAddress) => {
    try {
      setIsLoading(true);
      await apiClient.connectWallet(walletAddress);
      await loadUserProfile(); // Перезагружаем профиль
      setMessage('✅ Кошелек успешно подключен!');
    } catch (error) {
      console.error('❌ Ошибка подключения кошелька:', error);
      setMessage('Ошибка подключения кошелька: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка отключения кошелька
  const handleWalletDisconnected = async () => {
    try {
      setIsLoading(true);
      await apiClient.disconnectWallet();
      await loadUserProfile(); // Перезагружаем профиль
      setMessage('✅ Кошелек отключен');
    } catch (error) {
      console.error('❌ Ошибка отключения кошелька:', error);
      setMessage('Ошибка отключения кошелька: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Пополнение баланса
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage('❌ Введите корректную сумму');
      return;
    }

    try {
      setIsLoading(true);
      const result = await apiClient.deposit(parseFloat(depositAmount));
      
      if (result.deeplink) {
        // Открываем deeplink для оплаты
        window.open(result.deeplink, '_blank');
        setCurrentOrder(result.order);
        setPaymentStatus('pending');
        setMessage(`✅ Создан заказ на пополнение ${depositAmount} TON!`);
      }
      
      setShowDepositModal(false);
      setDepositAmount('');
    } catch (error) {
      console.error('❌ Ошибка создания депозита:', error);
      setMessage('Ошибка создания депозита: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Вывод средств
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setMessage('❌ Введите корректную сумму');
      return;
    }

    if (!withdrawAddress) {
      setMessage('❌ Введите адрес кошелька');
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.withdraw(parseFloat(withdrawAmount), withdrawAddress);
      await loadUserProfile(); // Перезагружаем профиль
      setMessage(`✅ Выведено ${withdrawAmount} TON!`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
    } catch (error) {
      console.error('❌ Ошибка вывода средств:', error);
      setMessage('Ошибка вывода средств: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Покупка NFT
  const buyNFT = async (paymentMethod = 'external_wallet') => {
    if (!selectedItem) {
      setMessage('❌ Выберите товар для покупки');
      return;
    }

    // Проверяем баланс для внутренней оплаты
    if (paymentMethod === 'wallet_balance' && userBalance < selectedItem.price) {
      setMessage(`❌ Недостаточно средств. Требуется: ${selectedItem.price} TON, доступно: ${userBalance} TON`);
      return;
    }

    try {
      setIsLoading(true);
      const result = await apiClient.createOrder(
        selectedItem.id,
        selectedItem.name,
        selectedItem.tokenId,
        selectedItem.price,
        paymentMethod
      );
      
      if (result.deeplink) {
        // Открываем deeplink для внешней оплаты
        window.open(result.deeplink, '_blank');
        setCurrentOrder(result.order);
        setPaymentStatus('pending');
        setMessage(`✅ Создан заказ на покупку ${selectedItem.name}!`);
      } else {
        // Оплата через внутренний баланс
        setMessage(`✅ ${selectedItem.name} успешно куплен за ${selectedItem.price} TON!`);
        await loadUserProfile(); // Перезагружаем профиль
      }
    } catch (error) {
      console.error('❌ Ошибка создания заказа:', error);
      setMessage('Ошибка создания заказа: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка статуса платежа
  const checkPayment = useCallback(async () => {
    if (!currentOrder) {
      setMessage('❌ Нет активного заказа');
      return;
    }

    try {
      setIsLoading(true);
      const result = await apiClient.checkOrderStatus(currentOrder.comment);
      
      if (result.status === 'paid') {
        setPaymentStatus('paid');
        setMessage('✅ Платеж подтвержден!');
        setCurrentOrder(null);
        await loadUserProfile(); // Перезагружаем профиль
      } else if (result.status === 'expired') {
        setPaymentStatus('expired');
        setMessage('❌ Заказ истек');
        setCurrentOrder(null);
      } else {
        setMessage('⏳ Платеж еще не поступил, попробуйте позже');
      }
    } catch (error) {
      console.error('❌ Ошибка проверки платежа:', error);
      setMessage('Ошибка проверки платежа: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

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
  }, [showDevNotice, isFadingOut, handleFadeOut]);

  // Мемоизация для оптимизации рендеринга
  const filteredItems = useMemo(() => {
    return marketItems;
  }, []);

  const selectedItemDetails = useMemo(() => {
    return selectedItem;
  }, [selectedItem]);

  // Отображение информации о пользователе
  const renderUserInfo = () => {
    if (isProfileLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-telegram-blue"></div>
          <span className="ml-2 text-gray-400">Загрузка профиля...</span>
        </div>
      );
    }

    if (userProfile) {
      return (
        <div className="flex items-center space-x-3 p-4 bg-telegram-card rounded-xl">
          {userProfile.photoUrl ? (
            <img 
              src={userProfile.photoUrl} 
              alt="Profile" 
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <UserCircleIcon className="w-10 h-10 text-telegram-blue" />
          )}
          <div className="flex-1">
            <div className="text-white font-semibold">
              {userProfile.firstName} {userProfile.lastName}
            </div>
            {userProfile.username && (
              <div className="text-gray-400 text-sm">@{userProfile.username}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-telegram-blue font-bold">{userBalance.toFixed(2)} TON</div>
            <div className="text-gray-400 text-xs">Баланс</div>
          </div>
        </div>
      );
    }

    // Если приложение запущено вне Telegram
    if (!telegramAuth.isTelegramApp()) {
      return (
        <div className="p-4 bg-telegram-card rounded-xl text-center">
          <div className="text-gray-400 mb-2">Приложение лучше всего работает в Telegram</div>
          <div className="text-sm text-gray-500">Откройте через Telegram бота для полного функционала</div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-telegram-card rounded-xl text-center">
        <div className="text-gray-400">Пользователь не авторизован</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-telegram-bg text-white">
      {/* Уведомление о разработке */}
      {showDevNotice && (
        <div className={`fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-3 text-center transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center justify-center space-x-2">
            <span>🚧 Приложение в разработке</span>
            <button onClick={handleFadeOut} className="ml-2 text-black hover:text-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <img src={MarketIcon} alt="Market" className="w-8 h-8" />
            <h1 className="text-2xl font-bold">TON Market</h1>
          </div>
          <div className="text-sm text-gray-400">
            {telegramAuth.isTelegramApp() ? 'Telegram' : 'Web'}
          </div>
        </div>

        {/* Информация о пользователе */}
        {renderUserInfo()}

        {/* Сообщения */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl border ${
            message.includes('✅') || message.includes('успешно') 
              ? 'bg-green-900/20 border-green-500 text-green-300' 
              : message.includes('❌') || message.includes('Ошибка')
              ? 'bg-red-900/20 border-red-500 text-red-300'
              : 'bg-telegram-card border-telegram-blue'
          }`}>
            <div className="text-sm">{message}</div>
            {message.includes('Ошибка') && (
              <button 
                onClick={() => setMessage('')}
                className="mt-2 text-xs text-gray-400 hover:text-white"
              >
                Скрыть
              </button>
            )}
          </div>
        )}

        {/* Управление балансом */}
        {userProfile && (
          <div className="w-full max-w-md flex items-center justify-between bg-telegram-gray rounded-2xl px-4 py-2 mb-4">
            <div className="flex items-center gap-1 sm:gap-2 flex-1">
              <div className="flex items-center bg-telegram-dark rounded-full px-3 py-1 text-sm font-semibold">
                <CurrencyDollarIcon className="w-5 h-5 text-telegram-blue mr-1" />
                <span>{userBalance.toFixed(2)} TON</span>
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
              {userProfile.isWalletConnected && userProfile.walletAddress && (
                <div className="text-xs text-gray-400 truncate max-w-[120px] ml-2">
                  {userProfile.walletAddress.slice(0, 6)}...{userProfile.walletAddress.slice(-4)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Подключение кошелька */}
        <div className="w-full max-w-md mb-4">
          <div className="bg-telegram-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-telegram-blue"></div>
                <span className="text-sm font-semibold">TON Wallet</span>
              </div>
              <button 
                onClick={async () => {
                  if (isConnected) {
                    await handleWalletDisconnected();
                  } else {
                    if (!tonConnectUI || typeof tonConnectUI.openModal !== 'function') {
                      setMessage('Ошибка: TON Connect UI не инициализирован!');
                      return;
                    }
                    try {
                      await tonConnectUI.openModal();
                    } catch (e) {
                      setMessage('Ошибка при открытии окна подключения: ' + (e.message || e));
                    }
                  }
                }}
                className="bg-telegram-blue hover:bg-telegram-btn-dark text-white font-semibold rounded-full px-4 py-2 transition-colors"
                disabled={isLoading}
              >
                {isConnected ? 'Отключить кошелек' : 'Подключить кошелек'}
              </button>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="w-full max-w-md mb-4">
          <div className="bg-telegram-card rounded-2xl p-2">
            <div className="grid grid-cols-6 gap-1">
              {[
                { id: 'market', icon: ShoppingCartIcon, label: 'Market' },
                { id: 'gallery', icon: ViewColumnsIcon, label: 'Gallery' },
                { id: 'orders', icon: DocumentTextIcon, label: 'Orders' },
                { id: 'auctions', icon: ChartBarIcon, label: 'Auctions' },
                { id: 'gifts', icon: GiftIcon, label: 'Gifts' },
                { id: 'profile', icon: UserCircleIcon, label: 'Profile' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-telegram-blue text-white'
                      : 'text-gray-400 hover:text-white hover:bg-telegram-gray'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Контент в зависимости от активной вкладки */}
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

        {activeTab === 'profile' && (
          <div className="w-full max-w-md mb-4">
            <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
            {userProfile ? (
              <div className="bg-telegram-card rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {userProfile.photoUrl ? (
                      <img 
                        src={userProfile.photoUrl} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="w-16 h-16 text-telegram-blue" />
                    )}
                    <div>
                      <div className="text-white font-bold text-lg">
                        {userProfile.firstName} {userProfile.lastName}
                      </div>
                      {userProfile.username && (
                        <div className="text-gray-400">@{userProfile.username}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-telegram-gray rounded-xl p-3">
                      <div className="text-telegram-blue font-bold text-lg">{userBalance.toFixed(2)}</div>
                      <div className="text-gray-400 text-sm">Balance (TON)</div>
                    </div>
                    <div className="bg-telegram-gray rounded-xl p-3">
                      <div className="text-telegram-blue font-bold text-lg">{userProfile.totalOrders || 0}</div>
                      <div className="text-gray-400 text-sm">Total Orders</div>
                    </div>
                  </div>
                  
                  {userProfile.isWalletConnected && (
                    <div className="bg-telegram-gray rounded-xl p-3">
                      <div className="text-gray-400 text-sm mb-1">Connected Wallet</div>
                      <div className="text-white font-mono text-sm break-all">
                        {userProfile.walletAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-telegram-card rounded-2xl p-6 text-center">
                <UserCircleIcon className="w-16 h-16 text-telegram-blue mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">Profile Not Available</p>
                <p className="text-gray-400 text-sm">Please open this app in Telegram</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="w-full max-w-md mb-4">
            <h2 className="text-xl font-bold text-white mb-4">My Orders</h2>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="bg-telegram-card rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-white font-semibold">{order.itemName}</div>
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        order.status === 'paid' ? 'bg-green-600 text-white' :
                        order.status === 'pending' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {order.status === 'paid' ? 'Paid' : 
                         order.status === 'pending' ? 'Pending' : 
                         order.status}
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm mb-2">
                      Amount: {order.amount} TON
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-telegram-card rounded-2xl p-6 text-center">
                <DocumentTextIcon className="w-16 h-16 text-telegram-blue mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">No Orders Yet</p>
                <p className="text-gray-400 text-sm">Your order history will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Кнопки покупки */}
        {(activeTab === 'market' || activeTab === 'gallery') && isConnected && (
          <div className="w-full max-w-md flex flex-col gap-2">
            {/* Кнопка покупки через внешний кошелек */}
            <button
              onClick={() => buyNFT('external_wallet')}
              disabled={isLoading || !selectedItemDetails}
              className={`w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors ${(isLoading || !selectedItemDetails) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Создаю заказ...' : selectedItemDetails ? `Купить (${selectedItemDetails.price} TON)` : 'Выберите товар'}
            </button>
            
            {/* Кнопка покупки через внутренний баланс */}
            {userProfile && userBalance >= (selectedItemDetails?.price || 0) && (
              <button
                onClick={() => buyNFT('wallet_balance')}
                disabled={isLoading || !selectedItemDetails}
                className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-lg transition-colors ${(isLoading || !selectedItemDetails) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Покупаю...' : selectedItemDetails ? `Купить за баланс (${selectedItemDetails.price} TON)` : 'Выберите товар'}
              </button>
            )}
            
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
          </div>
        )}
      </div>

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
            <div className="flex flex-col items-center">
              <div className="bg-telegram-blue rounded-full p-3 mb-4">
                <PlusIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-xl font-bold mb-2 text-white text-center">Deposit TON</div>
              <div className="text-gray-400 text-center mb-4">Enter the amount you want to deposit</div>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.0"
                step="0.1"
                min="0.1"
                className="w-full bg-telegram-gray border border-gray-600 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-telegram-blue"
              />
              <button
                className="w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors"
                onClick={handleDeposit}
                disabled={isLoading}
              >
                {isLoading ? 'Создаю депозит...' : 'Deposit'}
              </button>
            </div>
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
                <MinusIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-xl font-bold mb-2 text-white text-center">Withdraw TON</div>
              <div className="text-gray-400 text-center mb-4">Enter amount and wallet address</div>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.0"
                step="0.1"
                min="0.1"
                className="w-full bg-telegram-gray border border-gray-600 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-telegram-blue"
              />
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="EQ... or UQ..."
                className="w-full bg-telegram-gray border border-gray-600 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-telegram-blue"
              />
              <button
                className="w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors"
                onClick={handleWithdraw}
                disabled={isLoading}
              >
                {isLoading ? 'Вывожу средства...' : 'Withdraw'}
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
            <div className="flex flex-col items-center">
              <div className="bg-telegram-blue rounded-full p-3 mb-4">
                <GiftIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-xl font-bold mb-2 text-white text-center">Send Gift</div>
              <div className="text-gray-400 text-center mb-4">Enter recipient&apos;s username</div>
              <input
                type="text"
                value={giftRecipient}
                onChange={(e) => setGiftRecipient(e.target.value)}
                placeholder="@username"
                className="w-full bg-telegram-gray border border-gray-600 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-telegram-blue"
              />
              <button
                className="w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors"
                onClick={() => {/* Логика отправки подарка */}}
              >
                Send Gift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 