import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import './App.css';

// Данные для маркета
const marketItems = [
  {
    id: 1,
    name: 'Cosmic Warrior',
    price: 1.5,
    image: 'https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=CW',
    description: 'Легендарный воин из космоса'
  },
  {
    id: 2,
    name: 'Digital Dragon',
    price: 2.2,
    image: 'https://via.placeholder.com/150x150/E24A90/FFFFFF?text=DD',
    description: 'Цифровой дракон с уникальными способностями'
  },
  {
    id: 3,
    name: 'Neon Cat',
    price: 0.8,
    image: 'https://via.placeholder.com/150x150/90E24A/FFFFFF?text=NC',
    description: 'Неоновый кот с ярким характером'
  },
  {
    id: 4,
    name: 'Cyber Wolf',
    price: 1.8,
    image: 'https://via.placeholder.com/150x150/E2904A/FFFFFF?text=CW',
    description: 'Кибер-волк с технологическими улучшениями'
  }
];

export default function App() {
  // Состояние пользователя Telegram
  const [telegramUser, setTelegramUser] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [selectedItem, setSelectedItem] = useState(marketItems[0]);
  const [activeTab, setActiveTab] = useState('market');
  const [message, setMessage] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [showDevNotice, setShowDevNotice] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // TON Connect
  const [tonConnectUI] = useTonConnectUI();
  const walletInfo = tonConnectUI.account;
  const isConnected = !!walletInfo;

  // Инициализация Telegram WebApp
  useEffect(() => {
    const initTelegram = () => {
      console.log('🚀 Инициализация Telegram WebApp...');
      
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        // Расширяем приложение
        webApp.expand();
        
        // Включаем кнопку закрытия
        webApp.enableClosingConfirmation();
        
        // Устанавливаем тему
        webApp.setHeaderColor('#1a1a2e');
        webApp.setBackgroundColor('#1a1a2e');
        
        console.log('✅ Telegram WebApp инициализирован');
        console.log('📱 Платформа:', webApp.platform);
        console.log('🌐 Версия:', webApp.version);
        console.log('📊 Viewport:', webApp.viewportHeight, 'x', webApp.viewportStableHeight);
        
        // Получаем данные пользователя
        const user = webApp.initDataUnsafe?.user;
        if (user) {
          console.log('👤 Данные пользователя:', user);
          setTelegramUser({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            languageCode: user.language_code,
            isPremium: user.is_premium,
            photoUrl: user.photo_url
          });
        } else {
          console.log('⚠️ Данные пользователя недоступны');
          // Пробуем получить из initData
          const initData = webApp.initData;
          if (initData) {
            console.log('📋 InitData:', initData);
            // Парсим initData для получения пользователя
            try {
              const params = new URLSearchParams(initData);
              const userParam = params.get('user');
              if (userParam) {
                const userData = JSON.parse(decodeURIComponent(userParam));
                console.log('👤 Пользователь из initData:', userData);
                setTelegramUser({
                  id: userData.id,
                  firstName: userData.first_name,
                  lastName: userData.last_name,
                  username: userData.username,
                  languageCode: userData.language_code,
                  isPremium: userData.is_premium,
                  photoUrl: userData.photo_url
                });
              }
            } catch (error) {
              console.log('❌ Ошибка парсинга initData:', error);
            }
          }
        }
        
        // Получаем данные чата
        const chat = webApp.initDataUnsafe?.chat;
        if (chat) {
          console.log('💬 Данные чата:', chat);
        }
        
        // Получаем данные старта
        const startParam = webApp.initDataUnsafe?.start_param;
        if (startParam) {
          console.log('🎯 Start параметр:', startParam);
        }
        
        setMessage('✅ Приложение готово к работе');
      } else {
        console.log('❌ Telegram WebApp недоступен');
        setMessage('❌ Это приложение работает только в Telegram');
      }
      
      setIsLoading(false);
    };

    // Проверяем, загружен ли Telegram WebApp
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTelegram);
    } else {
      initTelegram();
    }
  }, []);

  // Обработчики TON Connect
  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        console.log('✅ Кошелек подключен:', wallet.account.address);
        setMessage('✅ Кошелек подключен!');
      } else {
        console.log('❌ Кошелек отключен');
        setMessage('Кошелек отключен');
      }
    });

    return () => unsubscribe();
  }, [tonConnectUI]);

  // Загрузка профиля пользователя
  const loadUserProfile = async () => {
    if (!telegramUser) return;
    
    try {
      // Здесь можно загрузить данные из базы данных
      // Пока используем localStorage для демонстрации
      const savedBalance = localStorage.getItem(`balance_${telegramUser.id}`);
      const savedPurchased = localStorage.getItem(`purchased_${telegramUser.id}`);
      
      if (savedBalance) {
        setUserBalance(parseFloat(savedBalance));
      }
      
      if (savedPurchased) {
        setPurchasedItems(JSON.parse(savedPurchased));
      }
    } catch (error) {
      console.log('❌ Ошибка загрузки профиля:', error);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [telegramUser]);

  // Сохранение данных пользователя
  const saveUserData = () => {
    if (!telegramUser) return;
    
    localStorage.setItem(`balance_${telegramUser.id}`, userBalance.toString());
    localStorage.setItem(`purchased_${telegramUser.id}`, JSON.stringify(purchasedItems));
  };

  useEffect(() => {
    saveUserData();
  }, [userBalance, purchasedItems, telegramUser]);

  // Пополнение баланса
  const handleDeposit = () => {
    if (!telegramUser) {
      setMessage('❌ Данные пользователя недоступны');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage('❌ Введите корректную сумму');
      return;
    }

    const amount = parseFloat(depositAmount);
    setUserBalance(prev => prev + amount);
    setMessage(`✅ Баланс пополнен на ${amount} TON!`);
    setShowDepositModal(false);
    setDepositAmount('');
  };

  // Покупка NFT
  const buyNFT = () => {
    if (!telegramUser) {
      setMessage('❌ Данные пользователя недоступны');
      return;
    }

    if (!isConnected) {
      setMessage('❌ Подключите кошелек для покупки');
      return;
    }

    if (userBalance < selectedItem.price) {
      setMessage('❌ Недостаточно средств на балансе');
      return;
    }

    // Списываем средства
    setUserBalance(prev => prev - selectedItem.price);
    
    // Добавляем товар в список купленных
    const purchasedItem = {
      ...selectedItem,
      id: Date.now(),
      purchaseDate: new Date().toLocaleDateString(),
      purchaseTime: new Date().toLocaleTimeString(),
      buyerId: telegramUser.id,
      buyerName: telegramUser.firstName
    };
    
    setPurchasedItems(prev => [purchasedItem, ...prev]);
    setMessage(`✅ Покупка совершена! ${selectedItem.name} добавлен в ваш кошелек.`);
  };

  // Рендер пользователя
  const renderUser = () => {
    if (!telegramUser) {
      return (
        <div className="user-info">
          <div className="user-profile">
            <div className="user-avatar">
              <span>👤</span>
            </div>
            <div className="user-details">
              <div className="user-name">Пользователь</div>
              <div className="user-username">@user</div>
            </div>
          </div>
          <div className="user-balance">
            <div className="balance-amount">{userBalance.toFixed(2)} TON</div>
            <div className="balance-label">Баланс</div>
          </div>
        </div>
      );
    }

    return (
      <div className="user-info">
        <div className="user-profile">
          <div className="user-avatar">
            {telegramUser.photoUrl ? (
              <img 
                src={telegramUser.photoUrl} 
                alt={telegramUser.firstName}
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
              />
            ) : (
              <span>{telegramUser.firstName?.charAt(0) || '👤'}</span>
            )}
          </div>
          <div className="user-details">
            <div className="user-name">
              {telegramUser.firstName} {telegramUser.lastName}
            </div>
            <div className="user-username">
              @{telegramUser.username || 'user'}
              {telegramUser.isPremium && ' 👑'}
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

  // Рендер кошелька
  const renderWallet = () => (
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
          {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
        </div>
      )}
    </div>
  );

  // Рендер маркета
  const renderMarket = () => (
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
              onClick={buyNFT}
              disabled={!isConnected || userBalance < selectedItem.price}
            >
              Купить за {selectedItem.price} TON
            </button>
            {!isConnected && (
              <button 
                className="buy-balance-btn"
                onClick={buyNFT}
                disabled={userBalance < selectedItem.price}
              >
                Купить за баланс
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Рендер купленных товаров
  const renderPurchased = () => (
    <div className="purchased-section">
      <h2>Купленные товары</h2>
      {purchasedItems.length === 0 ? (
        <div className="no-items">
          <p>У вас пока нет купленных товаров</p>
          <p>Перейдите в Market, чтобы купить NFT</p>
        </div>
      ) : (
        <div className="purchased-items">
          {purchasedItems.map((item) => (
            <div key={item.id} className="purchased-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-price">{item.price} TON</div>
                <div className="purchase-date">
                  Куплен: {item.purchaseDate} в {item.purchaseTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Рендер профиля
  const renderProfile = () => (
    <div className="profile-section">
      <h2>Profile</h2>
      {renderUser()}
      {renderWallet()}
      
      <div className="profile-actions">
        <button 
          className="deposit-btn"
          onClick={() => setShowDepositModal(true)}
        >
          Пополнить баланс
        </button>
      </div>
    </div>
  );

  // Рендер контента
  const renderContent = () => {
    switch (activeTab) {
      case 'market':
        return renderMarket();
      case 'purchased':
        return renderPurchased();
      case 'profile':
        return renderProfile();
      default:
        return renderMarket();
    }
  };

  // Рендер навигации
  const renderNavigation = () => (
    <div className="navigation">
      <button
        className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`}
        onClick={() => setActiveTab('market')}
      >
        <span className="nav-icon">🛒</span>
        <span className="nav-label">Market</span>
      </button>
      <button
        className={`nav-tab ${activeTab === 'purchased' ? 'active' : ''}`}
        onClick={() => setActiveTab('purchased')}
      >
        <span className="nav-icon">📦</span>
        <span className="nav-label">Купленные</span>
      </button>
      <button
        className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">Profile</span>
      </button>
    </div>
  );

  // Загрузка
  if (isLoading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Загрузка приложения...</p>
        </div>
      </div>
    );
  }

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
              <button onClick={handleDeposit}>
                Пополнить
              </button>
              <button onClick={() => setShowDepositModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 