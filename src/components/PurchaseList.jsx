import React, { useState, useEffect } from 'react';
import { purchaseService, materialService } from '../services/api';

function PurchaseList() {
  // Состояния
  const [purchases, setPurchases] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Данные формы
  const [formData, setFormData] = useState({
    material_id: '',
    count: 1,
    unit_price: 0,
    notes: '',
    purchase_date: new Date().toISOString().split('T')[0] // сегодняшняя дата
  });

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [purchasesData, materialsData] = await Promise.all([
        purchaseService.getAllPurchases(),
        materialService.getAllMaterials()
      ]);
      
      setPurchases(purchasesData || []);
      setMaterials(materialsData || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setError('Не удалось загрузить данные');
      setPurchases([]);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'count' || name === 'unit_price') {
      newValue = parseFloat(value) || 0;
      // Если меняем количество или цену, пересчитываем общую сумму
      if (name === 'count' || name === 'unit_price') {
        const count = name === 'count' ? newValue : formData.count;
        const unitPrice = name === 'unit_price' ? newValue : formData.unit_price;
        formData.total_price = count * unitPrice;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const resetForm = () => {
    setFormData({
      material_id: '',
      count: 1,
      unit_price: 0,
      notes: '',
      purchase_date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  // Создание покупки
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.material_id) {
      alert('Выберите материал');
      return;
    }
    if (formData.count <= 0) {
      alert('Количество должно быть больше 0');
      return;
    }
    if (formData.unit_price <= 0) {
      alert('Цена должна быть больше 0');
      return;
    }

    try {
      // Рассчитываем общую сумму
      const total_price = formData.count * formData.unit_price;
      const purchaseData = {
        ...formData,
        total_price
      };
      
      await purchaseService.createPurchase(purchaseData);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Ошибка создания:', error);
      alert('Не удалось создать запись о покупке');
    }
  };

  // Удаление покупки
  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту запись о покупке?')) return;
    
    try {
      await purchaseService.deletePurchase(id);
      loadData();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить запись');
    }
  };

  // Получение названия материала по ID
  const getMaterialName = (materialId) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : `Материал #${materialId}`;
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

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Показываем загрузку
  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Загрузка записей о покупках...</p>
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
      <h1>💰 Учет покупок материалов</h1>
      
      {/* Кнопка добавления */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          + Новая покупка
        </button>
      )}

      {/* Форма добавления */}
      {showForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #dee2e6'
        }}>
          <h3>Новая запись о покупке</h3>
          
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Левая колонка */}
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Материал *
                  </label>
                  <select
                    name="material_id"
                    value={formData.material_id}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px'
                    }}
                    required
                  >
                    <option value="">Выберите материал</option>
                    {materials.map(material => (
                      <option key={material.id} value={material.id}>
                        {material.name} (ост.: {material.remains} {material.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Дата покупки
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
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
                    Примечания
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      resize: 'vertical'
                    }}
                    placeholder="Например: Куплено у поставщика..."
                  />
                </div>
              </div>

              {/* Правая колонка */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Количество *
                    </label>
                    <input
                      type="number"
                      name="count"
                      value={formData.count}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Цена за единицу *
                    </label>
                    <input
                      type="number"
                      name="unit_price"
                      value={formData.unit_price}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ 
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '14px', color: '#495057', marginBottom: '5px' }}>
                    Общая сумма:
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                    {formatPrice(formData.count * formData.unit_price)} ₽
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
                Сохранить покупку
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

      {/* Список покупок */}
      <div>
        <h3>История покупок ({purchases.length})</h3>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          Общая сумма всех покупок: <strong>
            {formatPrice(purchases.reduce((sum, p) => sum + (p.total_price || 0), 0))} ₽
          </strong>
        </p>
        
        {purchases.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
              Записей о покупках пока нет. Добавьте первую!
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
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Дата</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Материал</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Кол-во</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Цена за ед.</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Сумма</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Примечания</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>#{purchase.id}</td>
                    <td style={{ padding: '12px' }}>
                      {formatDate(purchase.purchase_date)}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      {getMaterialName(purchase.material_id)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {purchase.count}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {formatPrice(purchase.unit_price)} ₽
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatPrice(purchase.total_price)} ₽
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#6c757d' }}>
                      {purchase.notes || '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleDelete(purchase.id)}
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
                        🗑️ Удалить
                      </button>
                    </td>
                  </tr>
                ))}
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

export default PurchaseList;