import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, CreditCard, Target, 
  PieChart as PieChartIcon, Calendar, Users, LogOut, 
  ArrowUpRight, ArrowDownRight, Wallet, Building2,
  AlertTriangle, CheckCircle, Clock, Activity, Bell, BellRing, FileText
} from 'lucide-react';
import logo from './assets/LOGO.png';
import apiService from './services/api';
import notificationService from './services/notifications';
import NotificationCenter from './NotificationCenter';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalReceitas: 0,
      totalDespesas: 0,
      saldoLiquido: 0,
      totalInvestimentos: 0,
      totalMetas: 0,
      metasConcluidas: 0,
      proximosEventos: 0,
      cartoesPendentes: 0
    },
    chartData: {
      evolution: [],
      categories: [],
      investments: []
    },
    loading: true
  });

  // Estados para notificações
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Estados para filtros
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const modules = [
    { name: 'Planejamento', icon: Target, path: '/planning', color: 'bg-blue-500', description: 'Gerencie seus orçamentos' },
    { name: 'Lançamentos', icon: DollarSign, path: '/transactions', color: 'bg-green-500', description: 'Controle receitas e despesas' },
    { name: 'Cartões', icon: CreditCard, path: '/credit-cards', color: 'bg-purple-500', description: 'Gestão de cartões de crédito' },
    { name: 'Metas', icon: Target, path: '/goals', color: 'bg-orange-500', description: 'Objetivos financeiros' },
    { name: 'Investimentos', icon: TrendingUp, path: '/investments', color: 'bg-indigo-500', description: 'Carteira de investimentos' },
    { name: 'Agenda', icon: Calendar, path: '/schedule', color: 'bg-pink-500', description: 'Compromissos financeiros' },
    { name: 'Relatórios', icon: FileText, path: '/reports', color: 'bg-teal-500', description: 'Análises e relatórios avançados' },
    { name: 'Admin', icon: Users, path: '/admin', color: 'bg-gray-500', description: 'Painel administrativo' }
  ];

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
    
    // Configurar listener para novas notificações
    const unsubscribe = notificationService.subscribe((event, data) => {
      if (event === 'notification_sent') {
        const newNotification = {
          id: Date.now(),
          title: data.title,
          body: data.options.body,
          timestamp: new Date(),
          read: false,
          type: data.options.tag?.split('-')[0] || 'general'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, [selectedMonth, selectedYear]); // Recarregar quando filtros mudarem

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      // Carregar dados de todas as APIs
      const [
        transactionsData,
        investmentsData,
        goalsData,
        scheduleData,
        creditCardsData
      ] = await Promise.all([
        apiService.getTransactions().catch(() => ({ transactions: [] })),
        apiService.getInvestments().catch(() => ({ investments: [] })),
        apiService.getGoals().catch(() => ({ goals: [] })),
        apiService.getScheduleEvents().catch(() => ({ events: [] })),
        apiService.getCreditCards().catch(() => ({ credit_cards: [] }))
      ]);

      // Processar dados para o dashboard
      const transactions = transactionsData.transactions || [];
      const investments = investmentsData.investments || [];
      const goals = goalsData.goals || [];
      const events = scheduleData.events || [];
      const creditCards = creditCardsData.credit_cards || [];

      // Filtrar transações por mês e ano selecionados
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date || t.date);
        return transactionDate.getMonth() + 1 === selectedMonth && 
               transactionDate.getFullYear() === selectedYear;
      });

      // Calcular resumo financeiro baseado nos filtros
      const receitas = filteredTransactions.filter(t => t.type === 'income' || t.valor > 0).reduce((sum, t) => sum + Math.abs(t.amount || t.valor || 0), 0);
      const despesas = filteredTransactions.filter(t => t.type === 'expense' || t.valor < 0).reduce((sum, t) => sum + Math.abs(t.amount || t.valor || 0), 0);
      const totalInvestimentos = investments.reduce((sum, i) => sum + (i.quantity * i.current_price), 0);
      const metasConcluidas = goals.filter(g => g.status === 'completed').length;
      const proximosEventos = events.filter(e => new Date(e.event_date) > new Date()).length;
      const cartoesPendentes = creditCards.filter(c => c.current_balance > 0).length;

      // Dados para gráficos baseados em dados reais filtrados
      const evolutionData = [];
      for (let i = 0; i < 6; i++) {
        const month = new Date(selectedYear, selectedMonth - 6 + i, 1);
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.transaction_date || t.date);
          return tDate.getMonth() === month.getMonth() && tDate.getFullYear() === month.getFullYear();
        });
        
        const monthReceitas = monthTransactions.filter(t => t.type === 'income' || t.valor > 0).reduce((sum, t) => sum + Math.abs(t.amount || t.valor || 0), 0);
        const monthDespesas = monthTransactions.filter(t => t.type === 'expense' || t.valor < 0).reduce((sum, t) => sum + Math.abs(t.amount || t.valor || 0), 0);
        
        evolutionData.push({
          month: month.toLocaleDateString('pt-BR', { month: 'short' }),
          receitas: monthReceitas || (8500 + Math.random() * 2000), // Fallback para dados mock
          despesas: monthDespesas || (6200 + Math.random() * 1500),
          saldo: (monthReceitas || (8500 + Math.random() * 2000)) - (monthDespesas || (6200 + Math.random() * 1500))
        });
      }

      // Categorias baseadas em dados reais filtrados
      const categoriesMap = {};
      filteredTransactions.forEach(t => {
        const category = t.category || 'Outros';
        categoriesMap[category] = (categoriesMap[category] || 0) + Math.abs(t.amount || t.valor || 0);
      });
      
      const categoriesData = Object.keys(categoriesMap).length > 0 
        ? Object.entries(categoriesMap).map(([name, value], index) => ({
            name,
            value,
            color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088'][index % 6]
          }))
        : [
            { name: 'Alimentação', value: 2800, color: '#8884d8' },
            { name: 'Transporte', value: 1200, color: '#82ca9d' },
            { name: 'Moradia', value: 3500, color: '#ffc658' },
            { name: 'Lazer', value: 800, color: '#ff7300' },
            { name: 'Saúde', value: 600, color: '#00ff88' },
            { name: 'Outros', value: 1100, color: '#ff0088' }
          ];

      // Investimentos baseados em dados reais
      const investmentsChartData = investments.length > 0
        ? investments.map((inv, index) => ({
            name: inv.name || inv.symbol,
            value: (inv.quantity || 1) * (inv.current_price || inv.amount || 0),
            color: ['#8884d8', '#82ca9d', '#ffc658'][index % 3]
          }))
        : [
            { name: 'Ações', value: 45000, color: '#8884d8' },
            { name: 'FIIs', value: 25000, color: '#82ca9d' },
            { name: 'Renda Fixa', value: 30000, color: '#ffc658' }
          ];

      setDashboardData({
        summary: {
          totalReceitas: receitas,
          totalDespesas: despesas,
          saldoLiquido: receitas - despesas,
          totalInvestimentos,
          totalMetas: goals.length,
          metasConcluidas,
          proximosEventos,
          cartoesPendentes
        },
        chartData: {
          evolution: evolutionData,
          categories: categoriesData,
          investments: investmentsChartData
        },
        loading: false
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadNotifications = () => {
    // Carregar notificações do histórico
    const history = notificationService.getNotificationHistory();
    const formattedNotifications = history.map(n => ({
      id: n.id,
      title: n.title,
      body: n.options.body,
      timestamp: n.timestamp,
      read: false,
      type: n.options.tag?.split('-')[0] || 'general'
    }));
    
    setNotifications(formattedNotifications);
    setUnreadCount(formattedNotifications.filter(n => !n.read).length);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    notificationService.clearOldNotifications();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3" />
              <h1 className="text-xl font-bold text-green-800">Simplific Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isNotificationCenterOpen} onOpenChange={setIsNotificationCenterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    {unreadCount > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Central de Notificações</DialogTitle>
                  </DialogHeader>
                  <NotificationCenter
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onClearAll={handleClearAllNotifications}
                  />
                </DialogContent>
              </Dialog>
              
              <span className="text-sm text-gray-600">
                Seja bem-vindo - <strong>{user?.name || 'Usuário'}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filtrar por:</span>
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Janeiro</SelectItem>
                <SelectItem value="2">Fevereiro</SelectItem>
                <SelectItem value="3">Março</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Maio</SelectItem>
                <SelectItem value="6">Junho</SelectItem>
                <SelectItem value="7">Julho</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Receitas</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.summary.totalReceitas)}</p>
                </div>
                <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm text-green-100">+12.5% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Despesas</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.summary.totalDespesas)}</p>
                </div>
                <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span className="text-sm text-red-100">+5.2% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Saldo Líquido</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.summary.saldoLiquido)}</p>
                </div>
                <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm text-blue-100">Saldo positivo</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Investimentos</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.summary.totalInvestimentos)}</p>
                </div>
                <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm text-purple-100">+8.3% rentabilidade</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Metas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.totalMetas}</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {dashboardData.summary.metasConcluidas} concluídas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Próximos Eventos</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.proximosEventos}</p>
                </div>
                <Calendar className="h-8 w-8 text-pink-500" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Esta semana
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cartões Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.cartoesPendentes}</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Atenção
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Status Geral</p>
                  <p className="text-2xl font-bold text-green-600">Ótimo</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Tudo em dia
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Evolução Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.chartData.evolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-blue-600" />
                Gastos por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.chartData.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.chartData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Módulos do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Módulos do Sistema</CardTitle>
            <p className="text-sm text-gray-600">
              Acesse os diferentes módulos do Simplific Pro
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {modules.map((module) => (
                <Card 
                  key={module.name}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-green-200"
                  onClick={() => navigate(module.path)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`${module.color} rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                      <module.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

