import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoginPage = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snowflakes, setSnowflakes] = useState([]);

  // Создание снежинок
  useEffect(() => {
    const createSnowflake = () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: -10,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3
    });

    const initialSnowflakes = Array.from({ length: 50 }, createSnowflake);
    setSnowflakes(initialSnowflakes);

    const interval = setInterval(() => {
      setSnowflakes(prev => {
        const newSnowflakes = prev.map(snowflake => ({
          ...snowflake,
          y: snowflake.y + snowflake.speed,
          x: snowflake.x + Math.sin(snowflake.y * 0.01) * 0.5
        })).filter(snowflake => snowflake.y < 110);

        // Добавляем новые снежинки
        if (newSnowflakes.length < 50) {
          newSnowflakes.push(createSnowflake());
        }

        return newSnowflakes;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Проверяем пароль
    if (password === '89910606565') {
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 1000);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError('Неверный пароль');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Анимация снега */}
      {snowflakes.map(snowflake => (
        <div
          key={snowflake.id}
          className="absolute text-white opacity-30 pointer-events-none"
          style={{
            left: `${snowflake.x}%`,
            top: `${snowflake.y}%`,
            fontSize: `${snowflake.size}px`,
            opacity: snowflake.opacity,
            transform: `rotate(${snowflake.y * 2}deg)`
          }}
        >
          ❄
        </div>
      ))}
              <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl"
        >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center border border-gray-600">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Доступ закрыт</h1>
          <p className="text-gray-300 text-lg">Проект временно заморожен</p>
          <p className="text-gray-400 text-sm mt-2">by vento</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Введите пароль для доступа
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
              placeholder="••••••••••"
              disabled={isLoading}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3"
            >
              {error}
            </motion.div>
          )}

                      <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:from-gray-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
            >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Проверка...
              </div>
            ) : (
              'Войти'
            )}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400 text-xs">
            Для получения доступа обратитесь к администратору
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 