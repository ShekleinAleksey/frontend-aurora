import React, { useState, useEffect } from 'react';
import CategoryList from './components/CategoryList';
import MaterialList from './components/MaterialList';
import PurchaseList from './components/PurchaseList';
import OrderList from './components/OrderList';
import { categoryService } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('materials'); // 'materials', 'categories', 'purchases', 'orders'
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApi();
  }, []);

  const checkApi = async () => {
    try {
      const data = await categoryService.getAllCategories();
      console.log('API Response:', data);
      setApiStatus('working');
    } catch (error) {
      console.error('API Check failed:', error);
      setApiStatus('failed');
    }
  };

  if (apiStatus === 'checking') {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Проверка подключения к API...</h2>
        <p>Убедитесь что Go-сервер запущен на http://localhost:8080</p>
      </div>
    );
  }

  if (apiStatus === 'failed') {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2 style={{ color: '#dc3545' }}>❌ Не удалось подключиться к API</h2>
        <p>Проверьте:</p>
        <ol style={{ textAlign: 'left', maxWidth: '500px', margin: '20px auto' }}>
          <li>Запущен ли Go-сервер на порту 8080?</li>
          <li>Есть ли эндпоинт GET /api/categories?</li>
          <li>Настроен ли CORS в Go?</li>
          <li>Откройте консоль браузера (F12) для деталей ошибки</li>
        </ol>
        <button 
          onClick={checkApi}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Навигация */}
      <nav style={{
        backgroundColor: '#343a40',
        color: 'white',
        padding: '15px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>🛠️ Project Aurora</h1>
            <p style={{ margin: '5px 0 0 0', color: '#adb5bd', fontSize: '14px' }}>
              Учет материалов и заказов для мастерских
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentPage('materials')}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 'materials' ? '#007bff' : 'transparent',
                color: 'white',
                border: '1px solid #495057',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📦 Материалы
            </button>
            <button
              onClick={() => setCurrentPage('categories')}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 'categories' ? '#007bff' : 'transparent',
                color: 'white',
                border: '1px solid #495057',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📂 Категории
            </button>
            <button
              onClick={() => setCurrentPage('purchases')}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 'purchases' ? '#007bff' : 'transparent',
                color: 'white',
                border: '1px solid #495057',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💰 Покупки
            </button>
            <button
              onClick={() => setCurrentPage('orders')}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 'orders' ? '#007bff' : 'transparent',
                color: 'white',
                border: '1px solid #495057',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📋 Заказы
            </button>
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', minHeight: '70vh' }}>
        {currentPage === 'categories' && <CategoryList />}
        {currentPage === 'materials' && <MaterialList />}
        {currentPage === 'purchases' && <PurchaseList />}
        {currentPage === 'orders' && <OrderList />}
      </main>

      {/* Футер */}
      <footer style={{
        marginTop: '50px',
        padding: '20px',
        textAlign: 'center',
        color: '#6c757d',
        borderTop: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa'
      }}>
        <p>© {new Date().getFullYear()} Project Aurora. Версия 1.0</p>
        <p style={{ fontSize: '12px', marginTop: '5px' }}>
          Автоматизация учета для мастерских и сервисных центров
        </p>
      </footer>
    </div>
  );
}

export default App;