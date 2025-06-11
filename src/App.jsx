import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Componentes
import Login from './Login';
import Dashboard from './Dashboard';
import Planning from './Planning';
import Transactions from './Transactions';
import CreditCards from './CreditCards';
import Goals from './Goals';
import Investments from './Investments';
import Schedule from './Schedule';
import AdminPanel from './AdminPanel';
import Reports from './Reports';

// Serviços
import notificationService from './services/notifications';

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Verificar se há usuário logado
    const savedUser = localStorage.getItem('simplific_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('simplific_user');
      }
    }
    
    // Inicializar sistema de notificações
    initializeNotifications();
    
    setIsLoading(false);
  }, []);

  const initializeNotifications = async () => {
    // Solicitar permissão para notificações
    await notificationService.requestPermission();
    
    // Configurar listener para novas notificações
    const unsubscribe = notificationService.subscribe((event, data) => {
      if (event === 'notification_sent') {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          title: data.title,
          body: data.options.body,
          timestamp: new Date(),
          read: false
        }]);
      }
    });

    // Cleanup
    return unsubscribe;
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('simplific_user', JSON.stringify(userData));
    
    // Enviar notificação de boas-vindas
    setTimeout(() => {
      notificationService.sendNotification(
        `Bem-vindo, ${userData.name}!`,
        {
          body: 'Você está conectado ao Simplific Pro. Gerencie suas finanças com facilidade!',
          icon: '/favicon.ico'
        }
      );
    }, 2000);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('simplific_user');
    localStorage.removeItem('simplific_token');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/planning" 
            element={
              user ? <Planning user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/transactions" 
            element={
              user ? <Transactions user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/credit-cards" 
            element={
              user ? <CreditCards user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/goals" 
            element={
              user ? <Goals user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/investments" 
            element={
              user ? <Investments user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/schedule" 
            element={
              user ? <Schedule user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/admin" 
            element={
              user ? <AdminPanel user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/reports" 
            element={
              user ? <Reports user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

