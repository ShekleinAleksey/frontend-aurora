import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/api';

function CategoryList() {
  // Изменим начальное состояние на null, чтобы отличать "еще не загружено" от "пустой массив"
  const [categories, setCategories] = useState(null); // null вместо []
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAllCategories();
      // Убедимся, что data существует
      setCategories(data || []);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      setError('Не удалось загрузить категории');
      setCategories([]); // устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      alert('Введите название категории');
      return;
    }

    try {
      await categoryService.createCategory(newCategory);
      setNewCategory({ name: '' });
      loadCategories(); // перезагружаем список
    } catch (error) {
      console.error('Ошибка добавления:', error);
      alert('Не удалось добавить категорию');
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category.id);
    setEditName(category.name);
  };

  const saveEdit = async (id) => {
    try {
      await categoryService.updateCategory(id, { name: editName });
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Не удалось обновить категорию');
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту категорию?')) return;
    
    try {
      await categoryService.deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить категорию');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  // Показываем загрузку
  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p>Загрузка категорий...</p>
          <div style={{
            margin: '20px auto',
            width: '40px',
            height: '40px',
            border: '3px solid #ddd',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h3>❌ Ошибка</h3>
          <p>{error}</p>
          <button 
            onClick={loadCategories}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // categories может быть null или массивом
  const categoriesArray = categories || [];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📂 Справочник категорий материалов</h1>
      
      {/* Форма добавления */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3>Добавить новую категорию</h3>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Название категории"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ name: e.target.value })}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Добавить
          </button>
        </form>
      </div>

      {/* Список категорий */}
      <div>
        <h3>Список категорий ({categoriesArray.length})</h3>
        
        {categoriesArray.length === 0 ? (
          <div style={{ 
            padding: '30px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Категорий пока нет. Добавьте первую!
            </p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Название</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Дата создания</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categoriesArray.map((category) => (
                <tr key={category.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>#{category.id}</td>
                  <td style={{ padding: '12px' }}>
                    {editingCategory === category.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          padding: '8px',
                          fontSize: '14px',
                          width: '100%',
                          border: '1px solid #007bff',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      category.name || '—'
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#666' }}>
                    {formatDate(category.created_at)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingCategory === category.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(category.id)}
                          style={{
                            padding: '6px 12px',
                            marginRight: '8px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(category)}
                          style={{
                            padding: '6px 12px',
                            marginRight: '8px',
                            backgroundColor: '#ffc107',
                            color: 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Удалить
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Кнопка обновления */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={loadCategories}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Обновить список
        </button>
      </div>
    </div>
  );
}

export default CategoryList;