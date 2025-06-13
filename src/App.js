import React, { useState, useEffect } from 'react';
import { GiftIcon, ShoppingCartIcon, UserCircleIcon, CurrencyDollarIcon, ViewColumnsIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import MarketIcon from './icons/Market.png';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { getBalance, sendTransaction } from './ton-connect';
import './App.css';

const avatarUrl = 'https://i.imgur.com/8Km9tLL.png'; // Заглушка для аватара
const nftImg = 'https://via.placeholder.com/400x400/8f5be8/ffffff?text=NFT'; // Заглушка для NFT

export default function App() {
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Подписываемся на изменения состояния кошелька
  useEffect(() => {
    const updateBalance = async () => {
      if (wallet) {
        try {
          setIsLoading(true);
          const balance = await getBalance(wallet.account.address);
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
  }, [wallet]);

  useEffect(() => {
    // Проверяем статус подключения при загрузке
    const checkConnection = async () => {
      const walletInfo = tonConnectUI.account;
      setIsConnected(!!walletInfo);
      if (walletInfo) {
        setWalletAddress(walletInfo.address);
      }
    };

    checkConnection();

    // Подписываемся на изменения статуса подключения
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      setIsConnected(!!wallet);
      if (wallet) {
        setWalletAddress(wallet.address);
      } else {
        setWalletAddress('');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  const handleBuy = async () => {
    if (!wallet) {
      setMessage('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Processing purchase...');
      // Здесь должен быть адрес смарт-контракта NFT
      const nftContractAddress = 'EQD...'; // Замените на реальный адрес
      await sendTransaction(nftContractAddress, 23.1, 'Buy NFT #16173');
      setMessage('Purchase successful!');
    } catch (error) {
      console.error('Error in purchase:', error);
      setMessage('Error: ' + (error.message || 'Failed to process purchase'));
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleOffer = async () => {
    if (!wallet) {
      setMessage('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Creating offer...');
      // Здесь должна быть логика создания оффера
      setMessage('Offer created successfully!');
    } catch (error) {
      console.error('Error in offer creation:', error);
      setMessage('Error: ' + (error.message || 'Failed to create offer'));
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-telegram-dark flex flex-col items-center py-4">
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
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-telegram-dark rounded-full px-3 py-1 text-sm font-semibold">
            <CurrencyDollarIcon className="w-5 h-5 text-telegram-blue mr-1" />
            <span>{balance.toFixed(2)} TON</span>
          </div>
          {isConnected && walletAddress && (
            <div className="text-xs text-gray-400 truncate max-w-[120px]">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </div>
        <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-telegram-blue" />
        <button 
          onClick={() => tonConnectUI.openModal()}
          className="bg-telegram-blue hover:bg-telegram-btn-dark text-white font-semibold rounded-full px-4 py-2 ml-2 transition-colors"
        >
          {isConnected ? 'Connected' : 'Connect Wallet'}
        </button>
      </div>

      {/* NFT Card */}
      <div className="w-full max-w-md bg-telegram-card rounded-2xl shadow-lg p-4 mb-4">
        <div className="relative rounded-xl overflow-hidden mb-4" style={{background: 'linear-gradient(135deg, #8f5be8 0%, #6a82fb 100%)'}}>
          <img src={nftImg} alt="NFT" className="w-full h-64 object-contain" />
          <GiftIcon className="w-8 h-8 text-telegram-blue absolute left-2 bottom-2 bg-white rounded-full p-1" />
          <ShoppingCartIcon className="w-8 h-8 text-telegram-blue absolute right-2 bottom-2 bg-white rounded-full p-1" />
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xl font-bold">Record Player</span>
          <span className="text-gray-400 font-semibold">#16173</span>
        </div>
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <span>Model</span>
          <span className="ml-2 text-telegram-blue cursor-pointer">High Voltage (0.5%)</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full max-w-md bg-telegram-gray rounded-2xl flex justify-between px-2 py-2 mb-4 text-xs">
        <div className="flex flex-col items-center flex-1">
          <img src={MarketIcon} alt="Market" className="w-6 h-6 mx-auto mb-1" />
          Market
        </div>
        <div className="flex flex-col items-center flex-1">
          <CurrencyDollarIcon className="w-6 h-6 mx-auto mb-1" />
          Auctions
        </div>
        <div className="flex flex-col items-center flex-1">
          <GiftIcon className="w-6 h-6 mx-auto mb-1" />
          My Gifts
        </div>
        <div className="flex flex-col items-center flex-1">
          <ViewColumnsIcon className="w-6 h-6 mx-auto mb-1" />
          GiFi
        </div>
        <div className="flex flex-col items-center flex-1">
          <UserCircleIcon className="w-6 h-6 mx-auto mb-1" />
          Gallery
        </div>
        <div className="flex flex-col items-center flex-1">
          <ChartBarIcon className="w-6 h-6 mx-auto mb-1" />
          Activity
        </div>
      </div>

      {/* Buy/Offer Buttons */}
      <div className="w-full max-w-md flex flex-col gap-2">
        <button 
          onClick={handleBuy}
          disabled={isLoading || !wallet}
          className={`w-full bg-telegram-blue hover:bg-telegram-btn-dark text-white font-bold py-3 rounded-xl text-lg transition-colors ${(!wallet || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Processing...' : 'Buy (23.1 TON)'}
        </button>
        <button 
          onClick={handleOffer}
          disabled={isLoading || !wallet}
          className={`w-full bg-telegram-gray text-white font-bold py-3 rounded-xl text-lg border border-gray-600 hover:bg-telegram-dark transition-colors ${(!wallet || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Processing...' : 'Offer'}
        </button>
      </div>
    </div>
  );
} 