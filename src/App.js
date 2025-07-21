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
  // Состояние
  const [userName, setUserName] = useState('User');
  const [userBalance, setUserBalance] = useState(0);
  const [selectedItem, setSelectedItem] = useState(marketItems[0]);
  const [activeTab, setActiveTab] = useState('market');
  const [message, setMessage] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [showDevNotice, setShowDevNotice] = useState(true);

  // TON Connect
  const [tonConnectUI] = useTonConnectUI();
  const walletInfo = tonConnectUI.account;
  const isConnected = !!walletInfo;

  // Инициализация
  useEffect(() => {
    console.log('🚀 Приложение запущено');
    
    // Функция для получения данных пользователя
    const getUserData = () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        console.log('✅ Telegram WebApp найден');
        
        // Расширяем приложение
        webApp.expand();
        
        // Пробуем разные способы получения пользователя
        let user = null;
        
        // Способ 1: initDataUnsafe.user
        if (webApp.initDataUnsafe?.user) {
          user = webApp.initDataUnsafe.user;
          console.log('👤 Пользователь из initDataUnsafe:', user);
        }
        
        // Способ 2: initDataUnsafe.user_info
        if (!user && webApp.initDataUnsafe?.user_info) {
          user = webApp.initDataUnsafe.user_info;
          console.log('👤 Пользователь из user_info:', user);
        }
        
        // Способ 3: парсим initData
        if (!user && webApp.initData) {
          try {
            const params = new URLSearchParams(webApp.initData);
            const userParam = params.get('user');
            if (userParam) {
              user = JSON.parse(decodeURIComponent(userParam));
              console.log('👤 Пользователь из initData:', user);
            }
          } catch (error) {
            console.log('❌ Ошибка парсинга initData:', error);
          }
        }
        
        // Способ 4: ищем в URL параметрах
        if (!user) {
          const urlParams = new URLSearchParams(window.location.search);
          const userParam = urlParams.get('user');
          if (userParam) {
            try {
              user = JSON.parse(decodeURIComponent(userParam));
              console.log('👤 Пользователь из URL:', user);
            } catch (error) {
              console.log('❌ Ошибка парсинга URL:', error);
            }
          }
        }
        
        // Устанавливаем имя пользователя
        if (user) {
          const name = user.first_name || user.first_name || user.name || 'User';
          setUserName(name);
          console.log('✅ Имя установлено:', name);
        } else {
          console.log('⚠️ Данные пользователя не найдены');
          // Показываем все доступные данные для отладки
          console.log('📋 Все данные WebApp:', {
            initData: webApp.initData,
            initDataUnsafe: webApp.initDataUnsafe,
            platform: webApp.platform,
            version: webApp.version
          });
        }
        
        setMessage('Приложение готово');
      } else {
        console.log('❌ Telegram WebApp недоступен');
        setMessage('❌ Это приложение работает только в Telegram');
      }
    };

    // Запускаем с небольшой задержкой
    setTimeout(getUserData, 100);
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

  // Пополнение баланса
  const handleDeposit = () => {
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
      purchaseTime: new Date().toLocaleTimeString()
    };
    
    setPurchasedItems(prev => [purchasedItem, ...prev]);
    setMessage(`✅ Покупка совершена! ${selectedItem.name} добавлен в ваш кошелек.`);
  };

  // Рендер пользователя
  const renderUser = () => (
    <div className="user-info">
      <div className="user-profile">
        <div className="user-avatar">
          <span>👤</span>
        </div>
        <div className="user-details">
          <div className="user-name">{userName}</div>
          <div className="user-username">@user</div>
        </div>
      </div>
      <div className="user-balance">
        <div className="balance-amount">{userBalance.toFixed(2)} TON</div>
        <div className="balance-label">Баланс</div>
      </div>
    </div>
  );

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
            >
              Купить за {selectedItem.price} TON
            </button>
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