// API Service para comunicação com o backend
const API_BASE_URL = 'https://5000-i86dvsqhhuuqhbwwgna3z-82b38eb0.manusvm.computer/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.isRefreshing = false;
    this.failedQueue = [];
    
    // Configurar interceptador para renovação automática de token
    this.setupTokenRefresh();
  }

  // Configurar sistema de renovação automática de token
  setupTokenRefresh() {
    // Verificar validade do token a cada 5 minutos
    setInterval(() => {
      this.checkTokenValidity();
    }, 5 * 60 * 1000); // 5 minutos
  }

  // Verificar se o token está próximo do vencimento
  async checkTokenValidity() {
    if (!this.token) return;

    try {
      // Decodificar JWT para verificar expiração
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;

      // Se o token expira em menos de 10 minutos, renovar
      if (timeUntilExpiry < 600) { // 10 minutos
        console.log('Token próximo do vencimento, renovando...');
        await this.silentRefreshToken();
      }
    } catch (error) {
      console.error('Erro ao verificar validade do token:', error);
    }
  }

  // Renovação silenciosa do token
  async silentRefreshToken() {
    if (this.isRefreshing) {
      // Se já está renovando, aguardar na fila
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    if (!this.refreshToken) {
      this.logout();
      return Promise.reject(new Error('Refresh token não encontrado'));
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha na renovação do token');
      }

      const data = await response.json();
      
      // Atualizar tokens
      this.token = data.access_token;
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
        localStorage.setItem('refresh_token', this.refreshToken);
      }
      localStorage.setItem('token', this.token);

      // Processar fila de requisições que falharam
      this.processQueue(null, this.token);
      
      console.log('Token renovado com sucesso');
      return this.token;

    } catch (error) {
      console.error('Erro na renovação do token:', error);
      this.processQueue(error, null);
      this.logout();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Processar fila de requisições pendentes
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Headers padrão com autenticação
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Método genérico para requisições com retry automático
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Se token expirou (401), tentar renovar e repetir requisição
      if (response.status === 401 && !options._retry) {
        try {
          await this.silentRefreshToken();
          // Repetir requisição com novo token
          return this.request(endpoint, { ...options, _retry: true });
        } catch (refreshError) {
          // Se renovação falhou, fazer logout
          this.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos HTTP básicos
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Autenticação
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = data.access_token;
    this.refreshToken = data.refresh_token;
    localStorage.setItem('token', this.token);
    localStorage.setItem('refresh_token', this.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Iniciar verificação automática de token
    this.checkTokenValidity();
    
    return data;
  }

  async logout() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Redirecionar para login se estiver em uma página protegida
    if (window.location.hash !== '#/login' && window.location.hash !== '#/') {
      window.location.hash = '#/login';
    }
  }

  // Verificar se o usuário está autenticado
  isAuthenticated() {
    return !!this.token;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Usuários
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Planejamento
  async getPlannings() {
    return this.request('/planning');
  }

  async createPlanning(planningData) {
    return this.request('/planning', {
      method: 'POST',
      body: JSON.stringify(planningData),
    });
  }

  async updatePlanning(planningId, planningData) {
    return this.request(`/planning/${planningId}`, {
      method: 'PUT',
      body: JSON.stringify(planningData),
    });
  }

  async deletePlanning(planningId) {
    return this.request(`/planning/${planningId}`, {
      method: 'DELETE',
    });
  }

  // Transações
  async getTransactions() {
    return this.request('/transactions');
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(transactionId, transactionData) {
    return this.request(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(transactionId) {
    return this.request(`/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }

  // Cartões de Crédito
  async getCreditCards() {
    return this.request('/credit-cards');
  }

  async createCreditCard(cardData) {
    return this.request('/credit-cards', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  async updateCreditCard(cardId, cardData) {
    return this.request(`/credit-cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(cardData),
    });
  }

  async deleteCreditCard(cardId) {
    return this.request(`/credit-cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  async getCreditCardTransactions(cardId) {
    return this.request(`/credit-cards/${cardId}/transactions`);
  }

  async createCreditCardTransaction(cardId, transactionData) {
    return this.request(`/credit-cards/${cardId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Metas
  async getGoals() {
    return this.request('/goals');
  }

  async createGoal(goalData) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(goalId, goalData) {
    return this.request(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  }

  async deleteGoal(goalId) {
    return this.request(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  // Investimentos
  async getInvestments() {
    return this.request('/investments');
  }

  async createInvestment(investmentData) {
    return this.request('/investments', {
      method: 'POST',
      body: JSON.stringify(investmentData),
    });
  }

  async updateInvestment(investmentId, investmentData) {
    return this.request(`/investments/${investmentId}`, {
      method: 'PUT',
      body: JSON.stringify(investmentData),
    });
  }

  async deleteInvestment(investmentId) {
    return this.request(`/investments/${investmentId}`, {
      method: 'DELETE',
    });
  }

  // Agenda
  async getScheduleEvents() {
    return this.request('/schedule');
  }

  async createScheduleEvent(eventData) {
    return this.request('/schedule', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateScheduleEvent(eventId, eventData) {
    return this.request(`/schedule/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteScheduleEvent(eventId) {
    return this.request(`/schedule/${eventId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();

