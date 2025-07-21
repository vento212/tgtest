import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Package, 
  User, 
  Wallet, 
  Plus, 
  X,
  Check,
  AlertCircle,
  Star
} from 'lucide-react';

// Данные для маркета
const marketItems = [
  {
    id: 1,
    name: 'Cosmic Warrior',
    price: 1.5,
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=300&fit=crop',
    description: 'Легендарный воин из космоса с уникальными способностями',
    rarity: 'legendary',
    category: 'warrior'
  },
  {
    id: 2,
    name: 'Digital Dragon',
    price: 2.2,
    image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=300&h=300&fit=crop',
    description: 'Цифровой дракон с технологическими улучшениями',
    rarity: 'epic',
    category: 'dragon'
  },
  {
    id: 3,
    name: 'Neon Cat',
    price: 0.8,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop',
    description: 'Неоновый кот с ярким характером и уникальным стилем',
    rarity: 'rare',
    category: 'pet'
  },
  {
    id: 4,
    name: 'Cyber Wolf',
    price: 1.8,
    image: 'https://images.unsplash.com/photo-1547407139-3c921a66005c?w=300&h=300&fit=crop',
    description: 'Кибер-волк с технологическими улучшениями и боевыми навыками',
    rarity: 'epic',
    category: 'wolf'
  }
];

// Утилиты
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Компоненты
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
  };

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      'bg-gray-800 rounded-xl p-6 border border-gray-700',
      'hover:border-gray-600 transition-all duration-200',
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-600 text-gray-200',
    legendary: 'bg-yellow-600 text-yellow-100',
    epic: 'bg-purple-600 text-purple-100',
    rare: 'bg-blue-600 text-blue-100',
    common: 'bg-gray-500 text-gray-100'
  };

  return (
    <span className={cn(
      'px-2 py-1 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default function App() {
  // Состояние
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('market');
  const [purchasedItems, setPurchasedItems] = useState(() => {
    const saved = localStorage.getItem('ton_market_purchased');
    return saved ? JSON.parse(saved) : [];
  });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [balanceStatus, setBalanceStatus] = useState('');

  // TON Connect
  const [tonConnectUI] = useTonConnectUI();
  const walletInfo = tonConnectUI.account;
  const isConnected = !!walletInfo;

  // Функции для сохранения данных
  const saveBalance = (newBalance) => {
    setBalance(newBalance);
    localStorage.setItem('ton_market_balance', newBalance.toString());
  };

  const savePurchasedItems = (items) => {
    setPurchasedItems(items);
    localStorage.setItem('ton_market_purchased', JSON.stringify(items));
  };

  // Функция для получения баланса из TON кошелька
  const getWalletBalance = async () => {
    if (walletInfo?.address) {
      try {
        // Сначала пробуем получить баланс через TON Connect API
        const balance = await tonConnectUI.wallet?.account?.balance;
        console.log('Сырой баланс из TON Connect API:', balance);
        
        if (balance && balance !== '0') {
          // Конвертируем из наноТОН в ТОН (1 TON = 1,000,000,000 наноТОН)
          const tonBalance = parseFloat(balance) / 1000000000;
          console.log('Конвертированный баланс:', tonBalance);
          setBalanceStatus('TON Connect');
          return tonBalance;
        }
        
        // Если TON Connect не дал баланс, пробуем через TON API
        console.log('Пробуем получить баланс через TON API...');
        setBalanceStatus('TON API...');
        try {
          const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${walletInfo.address}`);
          const data = await response.json();
          console.log('Ответ от TON API:', data);
          
          if (data.ok && data.result !== undefined) {
            const tonBalance = parseFloat(data.result) / 1000000000;
            console.log('Баланс из TON API:', tonBalance);
            setBalanceStatus('TON API');
            return tonBalance;
          }
        } catch (apiError) {
          console.error('Ошибка получения баланса через TON API:', apiError);
        }
        
        // Если API не сработали, используем localStorage
        const savedBalance = localStorage.getItem('ton_market_balance');
        if (savedBalance) {
          console.log('Используем сохраненный баланс:', savedBalance);
          setBalanceStatus('LocalStorage');
          return parseFloat(savedBalance);
        }
        
        console.log('Баланс не найден, возвращаем 0');
        setBalanceStatus('Не найден');
        return 0;
      } catch (error) {
        console.error('Ошибка получения баланса:', error);
        return 0;
      }
    }
    return 0;
  };

  // Инициализация Telegram WebApp
  useEffect(() => {
    const initTelegram = () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        // Расширяем приложение
        webApp.expand();
        
        // Устанавливаем тему
        webApp.setHeaderColor('#000000');
        webApp.setBackgroundColor('#000000');
        
        // Получаем данные пользователя
        const telegramUser = webApp.initDataUnsafe?.user;
        if (telegramUser) {
          setUser({
            id: telegramUser.id,
            name: telegramUser.first_name,
            username: telegramUser.username,
            photoUrl: telegramUser.photo_url,
            isPremium: telegramUser.is_premium
          });
        } else {
          // Если нет данных пользователя Telegram, показываем ошибку
          setMessage({ type: 'error', text: 'Ошибка: Данные пользователя Telegram не найдены. Откройте приложение через Telegram бота.' });
          // Очищаем данные для неавторизованных пользователей
          localStorage.removeItem('ton_market_balance');
          localStorage.removeItem('ton_market_purchased');
        }
        
        // Баланс будет загружен только при подключении кошелька
        setIsLoading(false);
      } else {
        // Если Telegram WebApp недоступен, показываем ошибку
        setMessage({ type: 'error', text: 'Ошибка: Telegram WebApp недоступен. Откройте приложение через Telegram бота.' });
        // Очищаем данные для неавторизованных пользователей
        localStorage.removeItem('ton_market_balance');
        localStorage.removeItem('ton_market_purchased');
        setIsLoading(false);
      }
    };

    setTimeout(initTelegram, 100);
  }, []);

  // Обработчики TON Connect
  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {
      if (wallet) {
        console.log('Кошелек подключен:', wallet);
        console.log('Адрес кошелька:', wallet.account?.address);
        console.log('Баланс кошелька:', wallet.account?.balance);
        
        // Загружаем баланс при подключении кошелька
        const walletBalance = await getWalletBalance();
        console.log('Полученный баланс:', walletBalance);
        saveBalance(walletBalance);
        setMessage({ type: 'success', text: 'Кошелек подключен!' });
      } else {
        console.log('Кошелек отключен');
        // Сбрасываем баланс при отключении кошелька
        saveBalance(0);
        setMessage({ type: 'info', text: 'Кошелек отключен' });
      }
    });

    return () => unsubscribe();
  }, [tonConnectUI]);

  // Покупка NFT
  const buyNFT = () => {
    if (!selectedItem) return;
    
    if (!isConnected) {
      setMessage({ type: 'error', text: 'Подключите кошелек для покупки' });
      return;
    }

    if (balance < selectedItem.price) {
      setMessage({ type: 'error', text: 'Недостаточно средств' });
      return;
    }

    const newBalance = balance - selectedItem.price;
    saveBalance(newBalance);
    
    const newPurchasedItem = {
      ...selectedItem,
      id: Date.now(),
      purchaseDate: new Date().toLocaleDateString(),
      purchaseTime: new Date().toLocaleTimeString()
    };
    savePurchasedItems([newPurchasedItem, ...purchasedItems]);
    
    setMessage({ type: 'success', text: `Покупка совершена! ${selectedItem.name} добавлен в ваш кошелек.` });
    setSelectedItem(null);
  };

  // Пополнение баланса
  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage({ type: 'error', text: 'Введите корректную сумму' });
      return;
    }

    const amount = parseFloat(depositAmount);
    const newBalance = balance + amount;
    saveBalance(newBalance);
    setMessage({ type: 'success', text: `Баланс пополнен на ${amount} TON!` });
    setShowDepositModal(false);
    setDepositAmount('');
  };

  // Очистка сообщений
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">TON Market</h1>
            <p className="text-sm text-gray-400">NFT Marketplace</p>
          </div>
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">@{user.username}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              'mx-4 mt-4 p-4 rounded-lg flex items-center space-x-2',
              message.type === 'success' && 'bg-green-600 text-white',
              message.type === 'error' && 'bg-red-600 text-white',
              message.type === 'info' && 'bg-blue-600 text-white'
            )}
          >
            {message.type === 'success' && <Check className="w-5 h-5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {message.type === 'info' && <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-4 py-6">
        {!user ? (
          <Card>
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Доступ запрещен</h2>
              <p className="text-gray-400 mb-4">
                Для использования приложения необходимо открыть его через Telegram бота
              </p>
              <Button onClick={() => window.location.reload()}>
                Обновить страницу
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {activeTab === 'market' && (
          <div className="space-y-6">
            {/* Balance Card */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Баланс</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {isConnected ? `${balance.toFixed(2)} TON` : 'Подключите кошелек'}
                  </p>
                </div>
                <Button 
                  onClick={() => setShowDepositModal(true)}
                  disabled={!isConnected}
                  className={!isConnected ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Пополнить
                </Button>
              </div>
            </Card>

            {/* Wallet Status */}
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="font-medium">TON Wallet</p>
                    <p className="text-sm text-gray-400">
                      {isConnected ? 'Подключен' : 'Не подключен'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={isConnected ? 'danger' : 'primary'}
                    onClick={() => isConnected ? tonConnectUI.disconnect() : tonConnectUI.connectWallet()}
                  >
                    {isConnected ? 'Отключить' : 'Подключить'}
                  </Button>
                  {isConnected && (
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          const newBalance = await getWalletBalance();
                          saveBalance(newBalance);
                          setMessage({ type: 'info', text: 'Баланс обновлен' });
                        }}
                      >
                        Обновить
                      </Button>
                      <Button
                        variant="success"
                        onClick={() => {
                          saveBalance(10.5);
                          setMessage({ type: 'success', text: 'Демо баланс: 10.5 TON' });
                        }}
                      >
                        Демо 10.5 TON
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {walletInfo?.address && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 font-mono">
                    {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Полный адрес: {walletInfo.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Баланс в кошельке: {balance > 0 ? `${balance.toFixed(2)} TON` : 
                      (balanceStatus === 'TON API' ? '0 TON' : 'Загрузка...')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Сырой баланс: {walletInfo.account?.balance || '0 (из API)'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Статус: {balanceStatus || 'Загрузка...'}
                  </p>
                </div>
              )}
            </Card>

            {/* Market Items */}
            <div>
              <h2 className="text-xl font-bold mb-4">NFT Collection</h2>
              <div className="grid grid-cols-2 gap-4">
                {marketItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      'bg-gray-800 rounded-xl p-4 cursor-pointer border-2 transition-all duration-200',
                      selectedItem?.id === item.id ? 'border-blue-500' : 'border-gray-700'
                    )}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-3">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant={item.rarity}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <p className="text-blue-400 font-bold">{item.price} TON</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selected Item */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Card>
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold">{selectedItem.name}</h3>
                          <Badge variant={selectedItem.rarity}>
                            {selectedItem.rarity}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{selectedItem.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-blue-400 font-bold text-lg">{selectedItem.price} TON</p>
                          <Button onClick={buyNFT} disabled={!isConnected || balance < selectedItem.price}>
                            Купить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'purchased' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Купленные NFT</h2>
            {purchasedItems.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">У вас пока нет купленных NFT</p>
                  <p className="text-sm text-gray-500 mt-2">Перейдите в Market, чтобы купить NFT</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {purchasedItems.map((item) => (
                  <Card key={item.id}>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-blue-400 text-sm">{item.price} TON</p>
                        <p className="text-xs text-gray-400">
                          Куплен: {item.purchaseDate} в {item.purchaseTime}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* User Profile */}
            <Card>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  {user?.photoUrl ? (
                    <img src={user.photoUrl} alt={user.name} className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{user?.name}</h3>
                  <p className="text-gray-400">@{user?.username}</p>
                  {user?.isPremium && (
                    <Badge variant="legendary" className="mt-1">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Balance */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-400">Общий баланс</p>
                <p className="text-3xl font-bold text-blue-400">
                  {isConnected ? `${balance.toFixed(2)} TON` : 'Подключите кошелек'}
                </p>
                <Button 
                  onClick={() => setShowDepositModal(true)} 
                  className="mt-4"
                  disabled={!isConnected}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Пополнить баланс
                </Button>
              </div>
            </Card>

            {/* Stats */}
            <Card>
              <h3 className="font-bold mb-4">Статистика</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{purchasedItems.length}</p>
                  <p className="text-sm text-gray-400">Купленных NFT</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {purchasedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">Потрачено TON</p>
                </div>
              </div>
            </Card>
          </div>
        )}
          </>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'market', icon: ShoppingCart, label: 'Market' },
            { id: 'purchased', icon: Package, label: 'Купленные' },
            { id: 'profile', icon: User, label: 'Профиль' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200',
                activeTab === id
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDepositModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Пополнить баланс</h3>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Сумма в TON</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleDeposit} className="flex-1">
                    Пополнить
                  </Button>
                  <Button variant="secondary" onClick={() => setShowDepositModal(false)} className="flex-1">
                    Отмена
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 