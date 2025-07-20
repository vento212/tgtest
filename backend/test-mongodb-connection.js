const mongoose = require('mongoose');

// Строка подключения к MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://tonnelque:cdcdcdcd@cluster0.mgg7dgs.mongodb.net/tgmarket?retryWrites=true&w=majority';

async function testConnection() {
    try {
        console.log('🔌 Подключение к MongoDB Atlas...');
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Успешно подключились к MongoDB Atlas!');
        console.log('📊 База данных: tgmarket');
        console.log('🌐 Кластер: cluster0.mgg7dgs.mongodb.net');
        
        // Проверяем доступные коллекции
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Доступные коллекции:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        console.log('🔌 Отключились от базы данных');
        
    } catch (error) {
        console.error('❌ Ошибка подключения:', error.message);
        
        if (error.message.includes('Authentication failed')) {
            console.log('💡 Проверьте username и password');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Проверьте имя кластера');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Проверьте настройки Network Access');
        }
    }
}

testConnection(); 