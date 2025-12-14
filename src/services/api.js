import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// Перехватчик для ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    throw error;
  }
);

export const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      // Возвращаем null вместо выбрасывания ошибки
      return null;
    }
  },
  
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export const materialService = {
  // GET /materials - получить все материалы
  getAllMaterials: async () => {
    try {
      const response = await api.get('/materials');
      return response.data;
    } catch (error) {
      console.error('Error in getAllMaterials:', error);
      return [];
    }
  },
  
  // GET /materials/:id - получить один материал
  getMaterialById: async (id) => {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },
  
  // POST /materials - создать материал
  createMaterial: async (materialData) => {
    const response = await api.post('/materials', materialData);
    return response.data;
  },
  
  // PUT /materials/:id - обновить материал
  updateMaterial: async (id, materialData) => {
    const response = await api.put(`/materials/${id}`, materialData);
    return response.data;
  },
  
  // DELETE /materials/:id - удалить материал
  deleteMaterial: async (id) => {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  }
};

export const purchaseService = {
  // GET /purchases - получить все покупки
  getAllPurchases: async () => {
    try {
      const response = await api.get('/purchases');
      return response.data;
    } catch (error) {
      console.error('Error in getAllPurchases:', error);
      return [];
    }
  },
  
  // POST /purchases - создать покупку
  createPurchase: async (purchaseData) => {
    const response = await api.post('/purchases', purchaseData);
    return response.data;
  },
  
  // DELETE /purchases/:id - удалить покупку
  deletePurchase: async (id) => {
    const response = await api.delete(`/purchases/${id}`);
    return response.data;
  }
};

export const orderService = {
  // GET /orders - получить все заказы
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      return [];
    }
  },
  
  // GET /orders/:id - получить заказ по ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  // POST /orders - создать заказ
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  // PUT /orders/:id - обновить заказ
  updateOrder: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },
  
  // DELETE /orders/:id - удалить заказ
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  
  // PATCH /orders/:id/status - обновить статус заказа
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};