import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Textarea } from './textarea';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Edit, Trash2, 
  PieChart, BarChart3, Calendar, LogOut, ArrowLeft, Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useNavigate } from 'react-router-dom';
import  apiService  from './services/api';
import logo from './assets/LOGO.png';

const Investments = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Estados para investimentos e modal
  const [investimentos, setInvestimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    invested_amount: '',
    current_amount: '',
    purchase_date: new Date().toISOString().split('T')[0],
    category: ''
  });

  // Carregar investimentos da API
  useEffect(() => {
    loadInvestimentos();
  }, []);

  const loadInvestimentos = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/investments');
      setInvestimentos(response.investments || []);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
      setInvestimentos([
        {
          id: 1,
          nome: 'Tesouro Selic 2029',
          tipo: 'Renda Fixa',
          valor_investido: 5000,
          valor_atual: 5280,
          rentabilidade: 5.6,
          data_compra: '2024-01-15',
          vencimento: '2029-01-15',
          categoria: 'Tesouro Direto'
        },
        {
          id: 2,
          nome: 'ITSA4',
          tipo: 'Ações',
          valor_investido: 3000,
          valor_atual: 3450,
          rentabilidade: 15.0,
          data_compra: '2024-02-10',
          vencimento: null,
          categoria: 'Ações'
        },
        {
          id: 3,
          nome: 'HGLG11',
          tipo: 'FII',
          valor_investido: 2500,
          valor_atual: 2625,
          rentabilidade: 5.0,
          data_compra: '2024-03-05',
          vencimento: null,
          categoria: 'Fundos Imobiliários'
        },
        {
          id: 4,
          nome: 'CDB Banco Inter',
          tipo: 'Renda Fixa',
          valor_investido: 4000,
          valor_atual: 4250,
          rentabilidade: 6.25,
          data_compra: '2024-01-20',
          vencimento: '2025-01-20',
          categoria: 'CDB'
        },
        {
          id: 5,
          nome: 'PETR4',
          tipo: 'Ações',
          valor_investido: 2000,
          valor_atual: 1850,
          rentabilidade: -7.5,
          data_compra: '2024-04-01',
          vencimento: null,
          categoria: 'Ações'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar novo investimento
  const criarInvestimento = async (dadosInvestimento) => {
    try {
      const response = await apiService.post('/investments', dadosInvestimento);
      if (response.success) {
        await loadInvestimentos(); // Recarregar lista
        setIsModalOpen(false); // Fechar modal
        setFormData({
          name: '',
          type: '',
          invested_amount: '',
          current_amount: '',
          purchase_date: new Date().toISOString().split('T')[0],
          category: ''
        }); // Limpar formulário
      }
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      alert('Erro ao criar investimento. Tente novamente.');
    }
  };

  // Função para excluir investimento
  const excluirInvestimento = async (id) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      try {
        await apiService.delete(`/investments/${id}`);
        await loadInvestimentos(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir investimento:', error);
        alert('Erro ao excluir investimento. Tente novamente.');
      }
    }
  };

  // Função para lidar com submit do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.type || !formData.invested_amount || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    criarInvestimento({
      ...formData,
      invested_amount: parseFloat(formData.invested_amount),
      current_amount: parseFloat(formData.current_amount) || parseFloat(formData.invested_amount)
    });
  };

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Dados para gráfico de evolução
  const evolucaoData = [
    { mes: 'Jan', valor: 12000 },
    { mes: 'Fev', valor: 13200 },
    { mes: 'Mar', valor: 14100 },
    { mes: 'Abr', valor: 15800 },
    { mes: 'Mai', valor: 16200 },
    { mes: 'Jun', valor: 16455 }
  ];

  // Dados para distribuição por tipo
  const distribuicaoData = [
    { name: 'Renda Fixa', value: 9530, color: '#10b981' },
    { name: 'Ações', value: 5300, color: '#3b82f6' },
    { name: 'FII', value: 2625, color: '#8b5cf6' }
  ];

  // Calcular totais
  const valorTotalInvestido = investimentos.reduce((sum, inv) => sum + inv.valor_investido, 0);
  const valorAtualTotal = investimentos.reduce((sum, inv) => sum + inv.valor_atual, 0);
  const lucroTotal = valorAtualTotal - valorTotalInvestido;
  const rentabilidadeTotal = ((valorAtualTotal - valorTotalInvestido) / valorTotalInvestido) * 100;

  const getRentabilidadeColor = (rentabilidade) => {
    return rentabilidade >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTipoBadge = (tipo) => {
    const colors = {
      'Renda Fixa': 'bg-green-100 text-green-800',
      'Ações': 'bg-blue-100 text-blue-800',
      'FII': 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[tipo]}>{tipo}</Badge>;
  };

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
              <h1 className="text-xl font-semibold text-gray-900">Investimentos</h1>
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Carteira de Investimentos</h2>
            <p className="text-gray-600">Acompanhe seus investimentos e rentabilidade</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Investido</p>
                    <p className="text-2xl font-bold text-blue-600">R$ {valorTotalInvestido.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Valor Atual</p>
                    <p className="text-2xl font-bold text-green-600">R$ {valorAtualTotal.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {lucroTotal >= 0 ? 
                      <TrendingUp className="h-8 w-8 text-green-600" /> :
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    }
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Lucro/Prejuízo</p>
                    <p className={`text-2xl font-bold ${getRentabilidadeColor(lucroTotal)}`}>
                      R$ {lucroTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rentabilidade</p>
                    <p className={`text-2xl font-bold ${getRentabilidadeColor(rentabilidadeTotal)}`}>
                      {rentabilidadeTotal.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="carteira" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="carteira">Carteira</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="analise">Análise</TabsTrigger>
            </TabsList>

            {/* Carteira */}
            <TabsContent value="carteira" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Meus Investimentos</h3>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Investimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Novo Investimento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome do Investimento *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Ex: Tesouro Selic 2029, ITSA4"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Tipo *</Label>
                          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ações">Ações</SelectItem>
                              <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                              <SelectItem value="FII">Fundos Imobiliários</SelectItem>
                              <SelectItem value="Criptomoedas">Criptomoedas</SelectItem>
                              <SelectItem value="Fundos">Fundos de Investimento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="category">Categoria *</Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tesouro Direto">Tesouro Direto</SelectItem>
                              <SelectItem value="CDB">CDB</SelectItem>
                              <SelectItem value="LCI/LCA">LCI/LCA</SelectItem>
                              <SelectItem value="Ações">Ações</SelectItem>
                              <SelectItem value="Fundos Imobiliários">Fundos Imobiliários</SelectItem>
                              <SelectItem value="Fundos Multimercado">Fundos Multimercado</SelectItem>
                              <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="invested_amount">Valor Investido (R$) *</Label>
                          <Input
                            id="invested_amount"
                            type="number"
                            step="0.01"
                            value={formData.invested_amount}
                            onChange={(e) => handleInputChange('invested_amount', e.target.value)}
                            placeholder="5000.00"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="current_amount">Valor Atual (R$)</Label>
                          <Input
                            id="current_amount"
                            type="number"
                            step="0.01"
                            value={formData.current_amount}
                            onChange={(e) => handleInputChange('current_amount', e.target.value)}
                            placeholder="Deixe vazio para usar valor investido"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="purchase_date">Data da Compra</Label>
                        <Input
                          id="purchase_date"
                          type="date"
                          value={formData.purchase_date}
                          onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Adicionar Investimento
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {investimentos.map((inv) => (
                  <Card key={inv.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{inv.nome}</h3>
                            {getTipoBadge(inv.tipo)}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{inv.categoria}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-600">Valor Investido</p>
                              <p className="text-blue-600 font-bold">R$ {inv.valor_investido.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600">Valor Atual</p>
                              <p className="text-green-600 font-bold">R$ {inv.valor_atual.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600">Rentabilidade</p>
                              <p className={`font-bold ${getRentabilidadeColor(inv.rentabilidade)}`}>
                                {inv.rentabilidade > 0 ? '+' : ''}{inv.rentabilidade.toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600">Data Compra</p>
                              <p>{new Date(inv.data_compra).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {inv.vencimento && (
                            <div className="mt-2 text-sm">
                              <p className="font-medium text-gray-600">Vencimento</p>
                              <p>{new Date(inv.vencimento).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => excluirInvestimento(inv.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Carteira</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolucaoData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
                        <Line 
                          type="monotone" 
                          dataKey="valor" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Melhores Performances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {investimentos
                        .filter(inv => inv.rentabilidade > 0)
                        .sort((a, b) => b.rentabilidade - a.rentabilidade)
                        .slice(0, 3)
                        .map((inv, index) => (
                          <div key={inv.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium">{inv.nome}</p>
                              <p className="text-sm text-gray-600">{inv.tipo}</p>
                            </div>
                            <p className="text-green-600 font-bold">+{inv.rentabilidade.toFixed(2)}%</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Atenção Necessária</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {investimentos
                        .filter(inv => inv.rentabilidade < 0)
                        .map((inv, index) => (
                          <div key={inv.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium">{inv.nome}</p>
                              <p className="text-sm text-gray-600">{inv.tipo}</p>
                            </div>
                            <p className="text-red-600 font-bold">{inv.rentabilidade.toFixed(2)}%</p>
                          </div>
                        ))}
                      {investimentos.filter(inv => inv.rentabilidade < 0).length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Todos os investimentos estão positivos! 🎉</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Análise */}
            <TabsContent value="analise" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={distribuicaoData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {distribuicaoData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo da Carteira</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total de Ativos</p>
                          <p className="text-2xl font-bold text-blue-600">{investimentos.length}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Ativos Positivos</p>
                          <p className="text-2xl font-bold text-green-600">
                            {investimentos.filter(inv => inv.rentabilidade > 0).length}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold">Distribuição por Valor</h4>
                        {distribuicaoData.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded mr-3" 
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span>{item.name}</span>
                            </div>
                            <span className="font-medium">R$ {item.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Investments;

