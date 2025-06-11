import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { 
  FileText, Download, TrendingUp, TrendingDown, PieChart, BarChart3,
  Calendar, Filter, RefreshCw, ArrowLeft, LogOut, DollarSign,
  Target, CreditCard, Activity, AlertCircle, CheckCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Cell, Pie, BarChart, Bar, AreaChart, Area,
  ComposedChart, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import apiService from './services/api';
import logo from './assets/LOGO.png';

const Reports = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  const [reportData, setReportData] = useState({
    summary: {
      totalReceitas: 0,
      totalDespesas: 0,
      saldoLiquido: 0,
      totalInvestimentos: 0,
      rentabilidadeMedia: 0,
      metasAtingidas: 0,
      pagamentosEmDia: 0
    },
    charts: {
      cashFlow: [],
      categoryBreakdown: [],
      investmentPerformance: [],
      monthlyComparison: [],
      goalProgress: []
    },
    loading: true
  });

  const [filters, setFilters] = useState({
    period: 'last_6_months',
    startDate: '',
    endDate: '',
    category: 'all',
    type: 'all'
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    try {
      setReportData(prev => ({ ...prev, loading: true }));

      // Simular carregamento de dados - em produção viria das APIs
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Dados simulados baseados nos filtros
      const mockData = generateMockReportData(filters);
      setReportData(mockData);

    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      setReportData(prev => ({ ...prev, loading: false }));
    }
  };

  const generateMockReportData = (filters) => {
    // Gerar dados mock baseados no período selecionado
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    
    const cashFlowData = months.map(month => ({
      month,
      receitas: Math.floor(Math.random() * 5000) + 8000,
      despesas: Math.floor(Math.random() * 3000) + 5000,
      saldo: 0
    })).map(item => ({
      ...item,
      saldo: item.receitas - item.despesas
    }));

    const categoryData = [
      { name: 'Alimentação', value: 2800, percentage: 28, color: '#8884d8' },
      { name: 'Transporte', value: 1200, percentage: 12, color: '#82ca9d' },
      { name: 'Moradia', value: 3500, percentage: 35, color: '#ffc658' },
      { name: 'Lazer', value: 800, percentage: 8, color: '#ff7300' },
      { name: 'Saúde', value: 600, percentage: 6, color: '#00ff88' },
      { name: 'Outros', value: 1100, percentage: 11, color: '#ff0088' }
    ];

    const investmentData = [
      { month: 'Jan', valor: 45000, rentabilidade: 2.5 },
      { month: 'Fev', valor: 46200, rentabilidade: 2.7 },
      { month: 'Mar', valor: 44800, rentabilidade: -0.9 },
      { month: 'Abr', valor: 47500, rentabilidade: 5.6 },
      { month: 'Mai', valor: 49200, rentabilidade: 3.6 },
      { month: 'Jun', valor: 51000, rentabilidade: 3.7 }
    ];

    const comparisonData = months.map(month => ({
      month,
      atual: Math.floor(Math.random() * 3000) + 7000,
      anterior: Math.floor(Math.random() * 3000) + 6500,
      meta: 8500
    }));

    const goalData = [
      { name: 'Reserva Emergência', progress: 73, target: 30000, current: 22000 },
      { name: 'Viagem Europa', progress: 57, target: 15000, current: 8500 },
      { name: 'Carro Novo', progress: 48, target: 25000, current: 12000 },
      { name: 'Curso MBA', progress: 100, target: 8000, current: 8000 }
    ];

    return {
      summary: {
        totalReceitas: cashFlowData.reduce((sum, item) => sum + item.receitas, 0),
        totalDespesas: cashFlowData.reduce((sum, item) => sum + item.despesas, 0),
        saldoLiquido: cashFlowData.reduce((sum, item) => sum + item.saldo, 0),
        totalInvestimentos: 51000,
        rentabilidadeMedia: 2.8,
        metasAtingidas: 1,
        pagamentosEmDia: 95
      },
      charts: {
        cashFlow: cashFlowData,
        categoryBreakdown: categoryData,
        investmentPerformance: investmentData,
        monthlyComparison: comparisonData,
        goalProgress: goalData
      },
      loading: false
    };
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportToPDF = async () => {
    try {
      // Simular exportação - em produção geraria PDF real
      const reportContent = {
        title: 'Relatório Financeiro Simplific Pro',
        period: filters.period,
        generated: new Date().toISOString(),
        summary: reportData.summary,
        charts: reportData.charts
      };

      // Criar blob com dados JSON (em produção seria PDF)
      const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (reportData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Gerando relatório...</p>
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Relatórios Avançados</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bem-vindo, {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header com Filtros */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h2>
                <p className="text-gray-600">Análise detalhada da sua situação financeira</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={loadReportData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="period">Período</Label>
                    <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_month">Último Mês</SelectItem>
                        <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
                        <SelectItem value="last_6_months">Últimos 6 Meses</SelectItem>
                        <SelectItem value="last_year">Último Ano</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filters.period === 'custom' && (
                    <>
                      <div>
                        <Label htmlFor="startDate">Data Início</Label>
                        <Input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">Data Fim</Label>
                        <Input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="alimentacao">Alimentação</SelectItem>
                        <SelectItem value="transporte">Transporte</SelectItem>
                        <SelectItem value="moradia">Moradia</SelectItem>
                        <SelectItem value="lazer">Lazer</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="income">Receitas</SelectItem>
                        <SelectItem value="expense">Despesas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Receitas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.summary.totalReceitas)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Despesas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.summary.totalDespesas)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${reportData.summary.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(reportData.summary.saldoLiquido)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rentabilidade Média</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPercentage(reportData.summary.rentabilidadeMedia)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Relatórios */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="investments">Investimentos</TabsTrigger>
              <TabsTrigger value="goals">Metas</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={reportData.charts.cashFlow}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                        <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                        <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} name="Saldo" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={reportData.charts.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                        >
                          {reportData.charts.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Fluxo de Caixa */}
            <TabsContent value="cashflow" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Fluxo de Caixa</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={reportData.charts.cashFlow}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Area type="monotone" dataKey="receitas" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Receitas" />
                      <Area type="monotone" dataKey="despesas" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Despesas" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Meses Positivos</p>
                      <p className="text-2xl font-bold">5/6</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Crescimento Médio</p>
                      <p className="text-2xl font-bold">+8.5%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Maior Gasto</p>
                      <p className="text-2xl font-bold">Mar</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Categorias */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.charts.categoryBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalhamento por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.charts.categoryBreakdown.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(category.value)}</p>
                            <p className="text-sm text-gray-600">{category.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Investimentos */}
            <TabsContent value="investments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance dos Investimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={reportData.charts.investmentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="valor" fill="#8884d8" name="Valor da Carteira" />
                      <Line yAxisId="right" type="monotone" dataKey="rentabilidade" stroke="#ff7300" strokeWidth={3} name="Rentabilidade %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metas */}
            <TabsContent value="goals" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportData.charts.goalProgress.map((goal, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{goal.name}</span>
                        <Badge variant={goal.progress >= 100 ? "default" : "secondary"}>
                          {goal.progress >= 100 ? "Concluída" : "Em Andamento"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Progresso: {goal.progress}%</span>
                          <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${goal.progress >= 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min(goal.progress, 100)}%` }}
                          ></div>
                        </div>
                        {goal.progress < 100 && (
                          <p className="text-sm text-gray-600">
                            Faltam {formatCurrency(goal.target - goal.current)} para atingir a meta
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Reports;

