import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import apiClient from './api';
import telegramAuth from './telegram-auth';
import './App.css';

// Данные для маркета
const marketItems = [
  {
    id: 1,
    name: 'Cosmic Warrior',
    tokenId: 'CW001',
    price: 1.5,
    image: 'https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=CW',
    description: 'Легендарный воин из космоса'
  },
  {
    id: 2,
    name: 'Digital Dragon',
    tokenId: 'DD002',
    price: 2.2,
    image: 'https://via.placeholder.com/150x150/E24A90/FFFFFF?text=DD',
    description: 'Цифровой дракон с уникальными способностями'
  },
  {
    id: 3,
    name: 'Neon Cat',
    tokenId: 'NC003',
    price: 0.8,
    image: 'https://via.placeholder.com/150x150/90E24A/FFFFFF?text=NC',
    description: 'Неоновый кот с ярким характером'
  },
  {
    id: 4,
    name: 'Cyber Wolf',
    tokenId: 'CW004',
    price: 1.8,
    image: 'https://via.placeholder.com/150x150/E2904A/FFFFFF?text=CW',
    description: 'Кибер-волк с технологическими улучшениями'
  }
];

export default function App() {
  // Состояние пользователя
  const [userProfile, setUserProfile] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [telegramUser, setTelegramUser] = useState(null);
  
  // Состояние приложения
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(marketItems[0]);
  const [activeTab, setActiveTab] = useState('market');
  const [showDevNotice, setShowDevNotice] = useState(true);
  
  // Состояние модальных окон
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [orders, setOrders] = useState([]);

  // TON Connect
  const [tonConnectUI] = useTonConnectUI();
  const walletInfo = tonConnectUI.account;
  const isConnected = !!walletInfo;

  // Инициализация приложения
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 Инициализация приложения...');
        
        // 1. Инициализируем Telegram WebApp
        const telegramInit = await initTelegram();
        
        if (telegramInit) {
          console.log('✅ Telegram WebApp инициализирован');
          
          // 2. Загружаем профиль пользователя
          await loadUserProfile();
          
          // 3. Загружаем заказы
          await loadUserOrders();
        } else {
          console.warn('⚠️ Telegram WebApp не инициализирован');
          // Не показываем ошибку, просто загружаем базовый профиль
          await loadBasicProfile();
        }
        
      } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        // Не показываем ошибку, просто загружаем базовый профиль
        await loadBasicProfile();
      }
    };

    initApp();
  }, []);

  // Инициализация Telegram WebApp
  const initTelegram = async () => {
    try {
      // Проверяем наличие Telegram WebApp API
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.warn('❌ Telegram WebApp API недоступен');
        return false;
      }

      // Инициализируем Telegram WebApp
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();

      // Получаем данные пользователя
      const user = webApp.initDataUnsafe?.user;
      if (!user) {
        console.warn('❌ Данные пользователя Telegram недоступны');
        return false;
      }

      console.log('✅ Данные пользователя Telegram:', user);
      setTelegramUser(user);

      // Инициализируем telegramAuth
      const authSuccess = telegramAuth.init();
      if (!authSuccess) {
        console.warn('❌ Ошибка инициализации telegramAuth');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram:', error);
      return false;
    }
  };

  // Загрузка профиля пользователя
  const loadUserProfile = async () => {
    try {
      console.log('📱 Загрузка профиля пользователя...');
      
      const profile = await apiClient.getUserProfile();
      console.log('✅ Профиль загружен:', profile);
      
      setUserProfile(profile.user);
      setUserBalance(profile.user.balance || 0);
      setIsProfileLoading(false);
      setMessage('✅ Профиль загружен');
      
    } catch (error) {
      console.error('❌ Ошибка загрузки профиля:', error);
      
      // Если профиль не найден, создаем временный
      if (telegramUser) {
        const tempProfile = {
          telegramId: telegramUser.id,
          username: telegramUser.username || 'user',
          firstName: telegramUser.first_name || 'User',
          lastName: telegramUser.last_name || '',
          balance: 0,
          walletAddress: null,
          isWalletConnected: false
        };
        
        setUserProfile(tempProfile);
        setUserBalance(0);
        setMessage('Готово к работе');
      } else {
        // Если нет данных Telegram, создаем базовый профиль
        const basicProfile = {
          telegramId: 0,
          username: 'user',
          firstName: 'User',
          lastName: '',
          balance: 0,
          walletAddress: null,
          isWalletConnected: false
        };
        
        setUserProfile(basicProfile);
        setUserBalance(0);
        setMessage('Готово к работе');
      }
      
      setIsProfileLoading(false);
    }
  };

  // Загрузка заказов пользователя
  const loadUserOrders = async () => {
    try {
      const userOrders = await apiClient.getUserOrders();
      setOrders(userOrders.orders || []);
      console.log('✅ Заказы загружены:', userOrders.orders?.length || 0);
    } catch (error) {
      console.error('❌ Ошибка загрузки заказов:', error);
      setOrders([]);
    }
  };

  // Загрузка базового профиля (без Telegram)
  const loadBasicProfile = async () => {
    try {
      console.log('📱 Загрузка базового профиля...');
      
      // Создаем базовый профиль
      const basicProfile = {
        telegramId: 0,
        username: 'user',
        firstName: 'User',
        lastName: '',
        balance: 0,
        walletAddress: null,
        isWalletConnected: false
      };
      
      setUserProfile(basicProfile);
      setUserBalance(0);
      setIsProfileLoading(false);
      setMessage('Готово к работе');
      
      console.log('✅ Базовый профиль загружен');
      
    } catch (error) {
      console.error('❌ Ошибка загрузки базового профиля:', error);
      setIsProfileLoading(false);
      setMessage('Готово к работе');
    }
  };

  // Обработчики TON Connect
  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        console.log('🔗 TON Connect: кошелек подключен:', wallet.account.address);
        handleWalletConnected(wallet.account.address);
      } else {
        console.log('🔗 TON Connect: кошелек отключен');
        handleWalletDisconnected();
      }
    });

    return () => unsubscribe();
  }, [tonConnectUI]);

  // Подключение кошелька
  const handleWalletConnected = async (walletAddress) => {
    try {
      console.log('✅ Подключение кошелька:', walletAddress);
      
      // Обновляем профиль пользователя
      const updatedProfile = {
        ...userProfile,
        walletAddress: walletAddress,
        isWalletConnected: true
      };
      
      setUserProfile(updatedProfile);
      
      // Сохраняем кошелек в базе данных
      try {
        await apiClient.connectWallet(walletAddress);
        console.log('✅ Кошелек сохранен в базе данных');
      } catch (error) {
        console.warn('⚠️ Не удалось сохранить кошелек в БД:', error);
      }
      
      setMessage('✅ Кошелек подключен!');
      
    } catch (error) {
      console.error('❌ Ошибка подключения кошелька:', error);
      setMessage('❌ Ошибка подключения кошелька');
    }
  };

  // Отключение кошелька
  const handleWalletDisconnected = async () => {
    try {
      console.log('❌ Отключение кошелька');
      
      // Обновляем профиль пользователя
      const updatedProfile = {
        ...userProfile,
        walletAddress: null,
        isWalletConnected: false
      };
      
      setUserProfile(updatedProfile);
      
      // Отключаем кошелек в базе данных
      try {
        await apiClient.disconnectWallet();
        console.log('✅ Кошелек отключен в базе данных');
      } catch (error) {
        console.warn('⚠️ Не удалось отключить кошелек в БД:', error);
      }
      
      setMessage('✅ Кошелек отключен');
      
    } catch (error) {
      console.error('❌ Ошибка отключения кошелька:', error);
      setMessage('❌ Ошибка отключения кошелька');
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
      
      const amount = parseFloat(depositAmount);
      const result = await apiClient.deposit(amount);
      
      const newBalance = result.user.balance;
      setUserBalance(newBalance);
      
      // Обновляем профиль
      if (userProfile) {
        const updatedProfile = { ...userProfile, balance: newBalance };
        setUserProfile(updatedProfile);
      }
      
      setMessage(`✅ Баланс пополнен на ${amount} TON!`);
      setShowDepositModal(false);
      setDepositAmount('');
      
    } catch (error) {
      console.error('❌ Ошибка депозита:', error);
      setMessage('❌ Ошибка депозита: ' + error.message);
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

    if (!withdrawAddress || withdrawAddress.trim() === '') {
      setMessage('❌ Введите адрес кошелька');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > userBalance) {
      setMessage('❌ Недостаточно средств на балансе');
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await apiClient.withdraw(amount, withdrawAddress);
      
      const newBalance = result.user.balance;
      setUserBalance(newBalance);
      
      // Обновляем профиль
      if (userProfile) {
        const updatedProfile = { ...userProfile, balance: newBalance };
        setUserProfile(updatedProfile);
      }
      
      setMessage(`✅ Выведено ${amount} TON на адрес ${withdrawAddress}`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      
    } catch (error) {
      console.error('❌ Ошибка вывода:', error);
      setMessage('❌ Ошибка вывода: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Покупка NFT
  const buyNFT = async (paymentMethod = 'external_wallet') => {
    try {
      setIsLoading(true);
      
      if (!selectedItem) {
        setMessage('❌ Выберите товар для покупки');
        return;
      }

      // Создаем заказ через API
      const order = await apiClient.createOrder(
        selectedItem.id,
        selectedItem.name,
        selectedItem.tokenId,
        selectedItem.price,
        paymentMethod
      );

      setCurrentOrder(order);
      setPaymentStatus('pending');
      
      // Добавляем заказ в список
      setOrders(prevOrders => [order, ...prevOrders]);
      
      // Если используется внутренний баланс, сразу списываем
      if (paymentMethod === 'wallet_balance' && userProfile) {
        if (userBalance >= selectedItem.price) {
          const newBalance = userBalance - selectedItem.price;
          setUserBalance(newBalance);
          
          // Обновляем профиль
          const updatedProfile = { ...userProfile, balance: newBalance };
          setUserProfile(updatedProfile);
          
          setMessage('✅ Покупка совершена за счет внутреннего баланса!');
        } else {
          setMessage('❌ Недостаточно средств на балансе');
        }
      } else {
        setMessage('✅ Заказ создан! Используйте внешний кошелек для оплаты.');
      }
      
    } catch (error) {
      console.error('❌ Ошибка покупки:', error);
      setMessage('❌ Ошибка покупки: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка статуса платежа
  const checkPayment = async () => {
    if (!currentOrder) {
      setMessage('❌ Нет активного заказа');
      return;
    }

    try {
      setIsLoading(true);
      
      const orderStatus = await apiClient.checkOrderStatus(currentOrder.comment);
      
      if (orderStatus.status === 'paid') {
        setPaymentStatus('paid');
        setMessage('✅ Платеж подтвержден! NFT добавлен в ваш кошелек.');
        
        // Обновляем заказы
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === currentOrder.id 
              ? { ...order, status: 'paid' }
              : order
          )
        );
        
        setCurrentOrder(null);
      } else if (orderStatus.status === 'pending') {
        setMessage('⏳ Платеж в обработке...');
      } else {
        setMessage('❌ Платеж не найден');
      }
      
    } catch (error) {
      console.error('❌ Ошибка проверки платежа:', error);
      setMessage('❌ Ошибка проверки платежа: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Рендер информации о пользователе
  const renderUserInfo = () => {
    if (!userProfile && !telegramUser) return null;

    const user = userProfile || telegramUser;
    if (!user) return null;

    return (
      <div className="user-info">
        <div className="user-profile">
          <div className="user-avatar">
            <span>👤</span>
          </div>
          <div className="user-details">
            <div className="user-name">
              {user.firstName || user.first_name} {user.lastName || user.last_name}
            </div>
            <div className="user-username">
              @{user.username || 'user'}
            </div>
          </div>
        </div>
        <div className="user-balance">
          <div className="balance-amount">{userBalance.toFixed(2)} TON</div>
          <div className="balance-label">Баланс</div>
        </div>
      </div>
    );
  };

  // Рендер информации о кошельке
  const renderWalletInfo = () => {
    if (!userProfile) return null;

    return (
      <div className="wallet-info">
        <div className="wallet-status">
          <div className="status-indicator">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            TON Wallet
          </div>
          {isConnected ? (
            <button 
              className="disconnect-btn"
              onClick={() => tonConnectUI.disconnect()}
            >
              Отключить кошелек
            </button>
          ) : (
            <button 
              className="connect-btn"
              onClick={() => tonConnectUI.connectWallet()}
            >
              Подключить кошелек
            </button>
          )}
        </div>
        {walletInfo?.address && (
          <div className="wallet-address">
            {walletInfo.address.slice(0, 8)}...{walletInfo.address.slice(-8)}
          </div>
        )}
      </div>
    );
  };

  // Рендер маркета
  const renderMarket = () => {
    return (
      <div className="market-section">
        <h2>Market</h2>
        <div className="market-items">
          {marketItems.map((item) => (
            <div 
              key={item.id} 
              className={`market-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-price">{item.price} TON</div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedItem && (
          <div className="selected-item">
            <h3>{selectedItem.name}</h3>
            <p>{selectedItem.description}</p>
            <div className="item-actions">
              <button 
                className="buy-btn"
                onClick={() => buyNFT('external_wallet')}
                disabled={isLoading}
              >
                Купить за {selectedItem.price} TON
              </button>
              {userBalance >= selectedItem.price && (
                <button 
                  className="buy-balance-btn"
                  onClick={() => buyNFT('wallet_balance')}
                  disabled={isLoading}
                >
                  Купить за баланс
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Рендер заказов
  const renderOrders = () => {
    return (
      <div className="orders-section">
        <h2>Orders</h2>
        {orders.length === 0 ? (
          <div className="no-orders">Нет заказов</div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <div className="order-name">{order.itemName}</div>
                  <div className="order-price">{order.amount} TON</div>
                  <div className={`order-status ${order.status}`}>
                    {order.status === 'paid' ? 'Оплачен' : 'Ожидает оплаты'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Рендер профиля
  const renderProfile = () => {
    return (
      <div className="profile-section">
        <h2>Profile</h2>
        {renderUserInfo()}
        {renderWalletInfo()}
        
        <div className="profile-actions">
          <button 
            className="deposit-btn"
            onClick={() => setShowDepositModal(true)}
          >
            Пополнить баланс
          </button>
          <button 
            className="withdraw-btn"
            onClick={() => setShowWithdrawModal(true)}
          >
            Вывести средства
          </button>
        </div>
      </div>
    );
  };

  // Рендер основного контента
  const renderContent = () => {
    switch (activeTab) {
      case 'market':
        return renderMarket();
      case 'orders':
        return renderOrders();
      case 'profile':
        return renderProfile();
      default:
        return renderMarket();
    }
  };

  // Рендер навигации
  const renderNavigation = () => {
    const tabs = [
      { id: 'market', label: 'Market', icon: '🛒' },
      { id: 'orders', label: 'Orders', icon: '📋' },
      { id: 'profile', label: 'Profile', icon: '👤' }
    ];

    return (
      <div className="navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      {/* Заголовок */}
      <div className="header">
        <div className="header-content">
          <div className="app-title">
            <h1>TON Market</h1>
            <span className="app-subtitle">мини-приложение</span>
          </div>
        </div>
      </div>

      {/* Уведомление о разработке */}
      {showDevNotice && (
        <div className="dev-notice">
          <span>⚠️ Приложение в разработке</span>
          <button onClick={() => setShowDevNotice(false)}>✕</button>
        </div>
      )}

      {/* Загрузка */}
      {isProfileLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Загрузка профиля...</span>
        </div>
      )}

      {/* Сообщения */}
      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Основной контент */}
      <div className="main-content">
        {renderContent()}
      </div>

      {/* Навигация */}
      {renderNavigation()}

      {/* Модальные окна */}
      
      {/* Модальное окно пополнения */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Пополнить баланс</h3>
            <input
              type="number"
              placeholder="Сумма в TON"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleDeposit} disabled={isLoading}>
                {isLoading ? 'Пополнение...' : 'Пополнить'}
              </button>
              <button onClick={() => setShowDepositModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно вывода */}
      {showWithdrawModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Вывести средства</h3>
            <input
              type="number"
              placeholder="Сумма в TON"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <input
              type="text"
              placeholder="Адрес кошелька"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleWithdraw} disabled={isLoading}>
                {isLoading ? 'Вывод...' : 'Вывести'}
              </button>
              <button onClick={() => setShowWithdrawModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно проверки платежа */}
      {currentOrder && paymentStatus === 'pending' && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ожидание платежа</h3>
            <p>Заказ: {currentOrder.itemName}</p>
            <p>Сумма: {currentOrder.amount} TON</p>
            <div className="modal-actions">
              <button onClick={checkPayment} disabled={isLoading}>
                {isLoading ? 'Проверка...' : 'Проверить платеж'}
              </button>
              <button onClick={() => setCurrentOrder(null)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 