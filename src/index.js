import React from 'react';
import { createRoot } from 'react-dom/client'; // правильный импорт
import './index.css';
import App from './App';

// Находим корневой элемент
const container = document.getElementById('root');

// Создаем корень
const root = createRoot(container);

// Рендерим приложение
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);