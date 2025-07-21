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
  const [debugInfo, setDebugInfo] = useState('');

  // TON Connect
  const [tonConnectUI] = useTonConnectUI();
  const walletInfo = tonConnectUI.account;
  const isConnected = !!walletInfo;

  // Инициализация
  useEffect(() => {
    console.log('🚀 Приложение запущено');
    
    const initApp = () => {
      let debugText = 'Отладка:\n';
      
      // Проверяем Telegram WebApp
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        debugText += '✅ Telegram WebApp найден\n';
        
        // Расширяем приложение
        try {
          webApp.expand();
          debugText += '✅ Приложение расширено\n';
        } catch (error) {
          debugText += `❌ Ошибка расширения: ${error}\n`;
        }
        
        // Показываем все доступные данные
        debugText += `📱 Платформа: ${webApp.platform}\n`;
        debugText += `🌐 Версия: ${webApp.version}\n`;
        debugText += `📊 Viewport: ${webApp.viewportHeight}x${webApp.viewportStableHeight}\n`;
        
        // Пробуем получить пользователя
        let user = null;
        
        if (webApp.initDataUnsafe?.user) {
          user = webApp.initDataUnsafe.user;
          debugText += '✅ Пользователь из initDataUnsafe.user\n';
        } else if (webApp.initDataUnsafe?.user_info) {
          user = webApp.initDataUnsafe.user_info;
          debugText += '✅ Пользователь из initDataUnsafe.user_info\n';
        } else {
          debugText += '❌ Пользователь не найден в initDataUnsafe\n';
        }
        
        if (user) {
          const name = user.first_name || user.first_name || user.name || 'User';
          setUserName(name);
          debugText += `👤 Имя установлено: ${name}\n`;
        } else {
          debugText += '⚠️ Используем дефолтное имя\n';
        }
        
        // Показываем все данные для отладки
        debugText += `📋 InitData: ${webApp.initData || 'нет'}\n`;
        debugText += `📋 InitDataUnsafe: ${JSON.stringify(webApp.initDataUnsafe, null, 2)}\n`;
        
        setMessage('Приложение готово');
      } else {
        debugText += '❌ Telegram WebApp недоступен\n';
        setMessage('❌ Это приложение работает только в Telegram');
      }
      
      setDebugInfo(debugText);
    };

    // Запускаем с задержкой
    setTimeout(initApp, 500);
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

  // Рендер отладочной информации
  const renderDebug = () => (
    <div className="debug-section" style={{ 
      background: 'rgba(0,0,0,0.8)', 
      padding: '10px', 
      margin: '10px', 
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap'
    }}>
      <h3>🔍 Отладочная информация:</h3>
      {debugInfo}
    </div>
  );

  // Рендер контента
  const renderContent = () => {
    switch (activeTab) {
      case 'market':
        return (
          <>
            {renderMarket()}
            {renderDebug()}
          </>
        );
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