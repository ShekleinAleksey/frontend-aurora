import React, { useState, useEffect } from 'react';
import { orderService, materialService } from '../services/api';

function OrderList() {
  // Состояния
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Данные формы
  const [formData, setFormData] = useState({
    number: '',
    material_id: '',
    client_name: '',
    price: 0,
    quantity: 1,
    status: 'новый',
    planned_completion_date: '',
    notes: ''
  });

  // Статусы заказов
  const statusOptions = [
    { value: 'новый', label: '🆕 Новый', color: '#6c757d' },
    { value: 'в работе', label: '🔧 В работе', color: '#007bff' },
    { value: 'готов', label: '✅ Готов', color: '#28a745' },
    { value: 'выдан', label: '📦 Выдан', color: '#17a2b8' },
    { value: 'отменен', label: '❌ Отменен', color: '#dc3545' }
  ];

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, materialsData] = await Promise.all([
        orderService.getAllOrders(),
        materialService.getAllMaterials()
      ]);
      
      setOrders(ordersData || []);
      setMaterials(materialsData || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setError('Не удалось загрузить данные');
      setOrders([]);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'price' || name === 'quantity') {
      newValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const resetForm = () => {
    // Генерация номера заказа
    const today = new Date();
    const orderNumber = `ORD-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(orders.length + 1).padStart(3, '0')}`;
    
    setFormData({
      number: orderNumber,
      material_id: '',
      client_name: '',
      price: 0,
      quantity: 1,
      status: 'новый',
      planned_completion_date: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Создание заказа
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.material_id) {
      alert('Выберите товар/материал');
      return;
    }
    if (!formData.client_name.trim()) {
      alert('Введите имя клиента');
      return;
    }
    if (formData.quantity <= 0) {
      alert('Количество должно быть больше 0');
      return;
    }

    try {
      // Рассчитываем сумму
      const total_amount = formData.price * formData.quantity;
      const orderData = {
        ...formData,
        total_amount,
        created_at: new Date().toISOString()
      };
      
      await orderService.createOrder(orderData);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Ошибка создания:', error);
      alert('Не удалось создать заказ');
    }
  };

  // Начало редактирования
  const startEdit = (order) => {
    setFormData({
      number: order.number || '',
      material_id: order.material_id || '',
      client_name: order.client_name || '',
      price: order.price || 0,
      quantity: order.quantity || 1,
      status: order.status || 'новый',
      planned_completion_date: order.planned_completion_date || '',
      notes: order.notes || '',
      actual_completion_date: order.actual_completion_date || ''
    });
    setEditingId(order.id);
    setShowForm(true);
  };

  // Сохранение редактирования
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const total_amount = formData.price * formData.quantity;
      const orderData = {
        ...formData,
        total_amount
      };
      
      await orderService.updateOrder(editingId, orderData);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Не удалось обновить заказ');
    }
  };

  // Обновление статуса
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Если статус меняется на "готов" или "выдан", устанавливаем дату завершения
      if (newStatus === 'готов' || newStatus === 'выдан') {
        const updatedOrders = orders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status: newStatus,
              actual_completion_date: order.actual_completion_date || new Date().toISOString()
            };
          }
          return order;
        });
        setOrders(updatedOrders);
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Не удалось обновить статус');
    }
  };

  // Удаление заказа
  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот заказ?')) return;
    
    try {
      await orderService.deleteOrder(id);
      loadData();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить заказ');
    }
  };

  // Получение названия материала по ID
  const getMaterialName = (materialId) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : `Товар #${materialId}`;
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

  // Получение цвета для статуса
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.color : '#6c757d';
  };

  // Получение метки для статуса
  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.label : status;
  };

  // Показываем загрузку
  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Загрузка заказов...</p>
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
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>📋 Управление заказами</h1>
      
      {/* Статистика */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          borderLeft: '4px solid #007bff'
        }}>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>Всего заказов</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{orders.length}</div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          borderLeft: '4px solid #28a745'
        }}>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>Выполнено</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {orders.filter(o => o.status === 'готов' || o.status === 'выдан').length}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          borderLeft: '4px solid #ffc107'
        }}>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>В работе</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {orders.filter(o => o.status === 'в работе').length}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          borderLeft: '4px solid #dc3545'
        }}>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>Общая сумма</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {formatPrice(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0))} ₽
          </div>
        </div>
      </div>

      {/* Кнопка добавления */}
      {!showForm && (
        <button
          onClick={() => {
            // Генерация номера заказа
            const today = new Date();
            const orderNumber = `ORD-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(orders.length + 1).padStart(3, '0')}`;
            
            setFormData(prev => ({ ...prev, number: orderNumber }));
            setShowForm(true);
          }}
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
          + Новый заказ
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
          <h3>{editingId ? 'Редактирование заказа' : 'Новый заказ'}</h3>
          
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Левая колонка */}
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Номер заказа
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      backgroundColor: '#e9ecef'
                    }}
                    readOnly
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Товар/Материал *
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
                    <option value="">Выберите товар</option>
                    {materials.map(material => (
                      <option key={material.id} value={material.id}>
                        {material.name} (ост.: {material.remains} {material.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Клиент *
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
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
                    Статус
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px'
                    }}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Правая колонка */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Количество *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
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
                      Цена за ед.
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Планируемая дата завершения
                  </label>
                  <input
                    type="date"
                    name="planned_completion_date"
                    value={formData.planned_completion_date}
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
                    placeholder="Дополнительная информация о заказе..."
                  />
                </div>

                <div style={{ 
                  padding: '15px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  marginTop: '10px'
                }}>
                  <div style={{ fontSize: '14px', color: '#495057', marginBottom: '5px' }}>
                    Общая сумма заказа:
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                    {formatPrice(formData.price * formData.quantity)} ₽
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
                  backgroundColor: editingId ? '#28a745' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {editingId ? 'Сохранить изменения' : 'Создать заказ'}
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

      {/* Список заказов */}
      <div>
        <h3>Все заказы ({orders.length})</h3>
        
        {orders.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
              Заказов пока нет. Создайте первый!
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
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>№</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Клиент</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Товар</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Кол-во</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Цена</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Сумма</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Статус</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Дата создания</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: '500' }}>
                      {order.number}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      {order.client_name}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getMaterialName(order.material_id)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {order.quantity}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {formatPrice(order.price)} ₽
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatPrice(order.total_amount)} ₽
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: `1px solid ${getStatusColor(order.status)}`,
                          borderRadius: '4px',
                          backgroundColor: `${getStatusColor(order.status)}15`,
                          color: getStatusColor(order.status),
                          fontWeight: '500',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {formatDate(order.created_at)}
                      {order.planned_completion_date && (
                        <div style={{ color: '#6c757d', marginTop: '2px' }}>
                          план: {formatDate(order.planned_completion_date)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => startEdit(order)}
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
                          onClick={() => handleDelete(order.id)}
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

export default OrderList;