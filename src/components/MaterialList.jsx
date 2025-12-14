import React, { useState, useEffect } from 'react';
import { materialService, categoryService } from '../services/api';

function MaterialList() {
  // Состояния
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояния для формы добавления/редактирования
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Данные формы
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    article_number: '',
    unit: 'шт.',
    remains: 0,
    min_count: 0,
    category_id: ''
  });

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadData();
  }, []);

  // Загрузка материалов и категорий
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [materialsData, categoriesData] = await Promise.all([
        materialService.getAllMaterials(),
        categoryService.getAllCategories()
      ]);
      
      setMaterials(materialsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setError('Не удалось загрузить данные');
      setMaterials([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'remains' || name === 'min_count' || name === 'category_id' 
        ? (value === '' ? '' : Number(value)) 
        : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      article_number: '',
      unit: 'шт.',
      remains: 0,
      min_count: 0,
      category_id: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Создание материала
  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name.trim()) {
      alert('Введите название материала');
      return;
    }
    if (!formData.category_id) {
      alert('Выберите категорию');
      return;
    }

    try {
      await materialService.createMaterial(formData);
      resetForm();
      loadData(); // Перезагружаем список
    } catch (error) {
      console.error('Ошибка создания:', error);
      alert('Не удалось создать материал');
    }
  };

  // Начало редактирования
  const startEdit = (material) => {
    setFormData({
      name: material.name || '',
      description: material.description || '',
      article_number: material.article_number || '',
      unit: material.unit || 'шт.',
      remains: material.remains || 0,
      min_count: material.min_count || 0,
      category_id: material.category?.id || material.category_id || ''
    });
    setEditingId(material.id);
    setShowForm(true);
  };

  // Сохранение редактирования
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Введите название материала');
      return;
    }
    if (!formData.category_id) {
      alert('Выберите категорию');
      return;
    }

    try {
      await materialService.updateMaterial(editingId, formData);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Не удалось обновить материал');
    }
  };

  // Удаление материала
  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот материал?')) return;
    
    try {
      await materialService.deleteMaterial(id);
      loadData();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить материал');
    }
  };

  // Определение статуса остатка
  const getStockStatus = (remains, minCount) => {
    if (remains === 0) {
      return { text: 'Нет в наличии', color: '#dc3545', bg: '#f8d7da' };
    } else if (remains <= minCount) {
      return { text: 'Мало', color: '#ffc107', bg: '#fff3cd' };
    } else {
      return { text: 'В наличии', color: '#28a745', bg: '#d4edda' };
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  // Единицы измерения
  const units = ['шт.', 'м', 'кг', 'л', 'упак.', 'рулон'];

  // Показываем загрузку
  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Загрузка материалов...</p>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <h3>❌ Ошибка</h3>
          <p>{error}</p>
        </div>
        <button onClick={loadData}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📦 Управление материалами</h1>
      
      {/* Кнопка добавления */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          + Добавить материал
        </button>
      )}

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #dee2e6'
        }}>
          <h3>{editingId ? 'Редактирование материала' : 'Новый материал'}</h3>
          
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Левая колонка */}
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Название *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Категория *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px'
                    }}
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Артикул
                  </label>
                  <input
                    type="text"
                    name="article_number"
                    value={formData.article_number}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Единица измерения
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px'
                    }}
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Правая колонка */}
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Остаток
                    </label>
                    <input
                      type="number"
                      name="remains"
                      value={formData.remains}
                      onChange={handleInputChange}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Минимальный остаток
                    </label>
                    <input
                      type="number"
                      name="min_count"
                      value={formData.min_count}
                      onChange={handleInputChange}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки формы */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {editingId ? 'Сохранить' : 'Создать'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список материалов */}
      <div>
        <h3>Все материалы ({materials.length})</h3>
        
        {materials.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
              Материалов пока нет. Добавьте первый!
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Название</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Категория</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Артикул</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Остаток</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Статус</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Ед.</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => {
                  const status = getStockStatus(material.remains, material.min_count);
                  return (
                    <tr key={material.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}>#{material.id}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '500' }}>{material.name}</div>
                        {material.description && (
                          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                            {material.description.length > 50 
                              ? `${material.description.substring(0, 50)}...` 
                              : material.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {material.category ? (
                          <span style={{
                            backgroundColor: '#e9ecef',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {material.category.name}
                          </span>
                        ) : (
                          <span style={{ color: '#6c757d' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                        {material.article_number || '—'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontWeight: '500' }}>{material.remains}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          мин: {material.min_count}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: status.bg,
                          color: status.color,
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {status.text}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{material.unit}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => startEdit(material)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ffc107',
                              color: '#212529',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(material.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Кнопка обновления */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={loadData}
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

export default MaterialList;