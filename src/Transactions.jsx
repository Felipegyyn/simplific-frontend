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
  DollarSign, TrendingUp, TrendingDown, Plus, Edit, Trash2, 
  Search, Filter, Calendar, CheckCircle, Clock, LogOut, ArrowLeft
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import apiService from './services/api';
import logo from './assets/LOGO.png';

const Transactions = ({ user, onLogout }) => {
  const navigate = useNavigate();
  // Estados para transações e modal
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransacao, setSelectedTransacao] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    transaction_date: new Date().toISOString().split('T')[0],
    status: 'confirmed'
  });
  const [editFormData, setEditFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    transaction_date: '',
    status: 'confirmed'
  });

  // Carregar transações da API
  useEffect(() => {
    loadTransacoes();
  }, []);

  const loadTransacoes = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/transactions');
      setTransacoes(response.transactions || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      // Fallback para dados mock se API falhar
      setTransacoes([
        {
          id: 1,
          descricao: 'Salário',
          valor: 8500,
          tipo: 'receita',
          categoria: 'Salário',
          data: '2024-06-01',
          status: 'confirmada',
          conta: 'Conta Corrente'
        },
        {
          id: 2,
          descricao: 'Aluguel',
          valor: -2800,
          tipo: 'despesa',
          categoria: 'Moradia',
          data: '2024-06-05',
          status: 'confirmada',
          conta: 'Conta Corrente'
        },
        {
          id: 3,
          descricao: 'Supermercado',
          valor: -450,
          tipo: 'despesa',
          categoria: 'Alimentação',
          data: '2024-06-08',
          status: 'confirmada',
          conta: 'Cartão de Débito'
        },
    {
      id: 4,
      descricao: 'Freelance',
      valor: 1200,
      tipo: 'receita',
      categoria: 'Trabalho Extra',
      data: '2024-06-10',
      status: 'pendente',
      conta: 'Conta Corrente'
    },
    {
      id: 5,
      descricao: 'Combustível',
      valor: -180,
      tipo: 'despesa',
      categoria: 'Transporte',
      data: '2024-06-12',
      status: 'confirmada',
      conta: 'Cartão de Débito'
    },
    {
      id: 6,
      descricao: 'Cinema',
      valor: -85,
      tipo: 'despesa',
      categoria: 'Lazer',
      data: '2024-06-15',
      status: 'pendente',
      conta: 'Cartão de Crédito'
    },
    {
      id: 7,
      descricao: 'Dividendos',
      valor: 320,
      tipo: 'receita',
      categoria: 'Investimentos',
      data: '2024-06-18',
      status: 'confirmada',
      conta: 'Conta Investimentos'
    },
    {
      id: 8,
      descricao: 'Farmácia',
      valor: -95,
      tipo: 'despesa',
      categoria: 'Saúde',
      data: '2024-06-20',
      status: 'confirmada',
      conta: 'Cartão de Débito'
    }
    ]);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar nova transação
  const criarTransacao = async (dadosTransacao) => {
    try {
      const response = await apiService.post('/transactions', dadosTransacao);
      if (response.success) {
        await loadTransacoes(); // Recarregar lista
        setIsModalOpen(false); // Fechar modal
        setFormData({
          description: '',
          amount: '',
          type: 'expense',
          category: '',
          transaction_date: new Date().toISOString().split('T')[0],
          status: 'confirmed'
        }); // Limpar formulário
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      alert('Erro ao criar transação. Tente novamente.');
    }
  };

  // Função para confirmar transação
  const confirmarTransacao = async (id) => {
    try {
      // Simular confirmação da transação
      const transacaoIndex = transacoes.findIndex(t => t.id === id);
      if (transacaoIndex !== -1) {
        const novasTransacoes = [...transacoes];
        novasTransacoes[transacaoIndex].status = 'confirmada';
        setTransacoes(novasTransacoes);
        alert('Transação confirmada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao confirmar transação:', error);
      alert('Erro ao confirmar transação. Tente novamente.');
    }
  };

  // Função para editar transação
  const editarTransacao = async (id, dados) => {
    try {
      const response = await apiService.put(`/transactions/${id}`, dados);
      if (response.success) {
        await loadTransacoes();
        setIsEditModalOpen(false);
        setSelectedTransacao(null);
        alert('Transação atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao editar transação:', error);
      alert('Erro ao editar transação. Tente novamente.');
    }
  };

  // Função para abrir modal de edição
  const abrirModalEdicao = (transacao) => {
    setSelectedTransacao(transacao);
    setEditFormData({
      description: transacao.descricao,
      amount: Math.abs(transacao.valor).toString(),
      type: transacao.valor >= 0 ? 'income' : 'expense',
      category: transacao.categoria,
      transaction_date: transacao.data,
      status: transacao.status
    });
    setIsEditModalOpen(true);
  };

  // Função para excluir transação
  const excluirTransacao = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await apiService.delete(`/transactions/${id}`);
        await loadTransacoes(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Erro ao excluir transação. Tente novamente.');
      }
    }
  };

  // Função para lidar com submit do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.description || !formData.amount || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Converter amount para número e aplicar sinal negativo se for despesa
    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    criarTransacao({
      ...formData,
      amount: finalAmount
    });
  };

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [filtroAtivo, setFiltroAtivo] = useState('todas');
  const [busca, setBusca] = useState('');

  // Filtrar transações
  const transacoesFiltradas = transacoes.filter(transacao => {
    const matchBusca = transacao.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                      transacao.categoria.toLowerCase().includes(busca.toLowerCase());
    
    switch (filtroAtivo) {
      case 'receitas':
        return transacao.tipo === 'receita' && matchBusca;
      case 'despesas':
        return transacao.tipo === 'despesa' && matchBusca;
      case 'pendentes':
        return transacao.status === 'pendente' && matchBusca;
      default:
        return matchBusca;
    }
  });

  // Calcular totais
  const totalReceitas = transacoes.filter(t => t.tipo === 'receita' && t.status === 'confirmada')
                                 .reduce((sum, t) => sum + t.valor, 0);
  const totalDespesas = Math.abs(transacoes.filter(t => t.tipo === 'despesa' && t.status === 'confirmada')
                                          .reduce((sum, t) => sum + t.valor, 0));
  const saldoLiquido = totalReceitas - totalDespesas;
  const totalPendentes = transacoes.filter(t => t.status === 'pendente').length;

  const getStatusBadge = (status) => {
    return status === 'confirmada' ? 
      <Badge className="bg-green-100 text-green-800">Confirmada</Badge> :
      <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
  };

  const getTipoBadge = (tipo) => {
    return tipo === 'receita' ? 
      <Badge className="bg-blue-100 text-blue-800">Receita</Badge> :
      <Badge className="bg-red-100 text-red-800">Despesa</Badge>;
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
              <h1 className="text-xl font-semibold text-gray-900">Lançamentos</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Lançamentos Financeiros</h2>
            <p className="text-gray-600">Gerencie suas receitas e despesas</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Receitas</p>
                    <p className="text-2xl font-bold text-green-600">R$ {totalReceitas.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Despesas</p>
                    <p className="text-2xl font-bold text-red-600">R$ {totalDespesas.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {saldoLiquido.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">{totalPendentes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={filtroAtivo} onValueChange={setFiltroAtivo} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-4">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="receitas">Receitas</TabsTrigger>
                <TabsTrigger value="despesas">Despesas</TabsTrigger>
                <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar transações..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Transação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Nova Transação</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="description">Descrição *</Label>
                          <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Ex: Salário, Aluguel..."
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="amount">Valor *</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => handleInputChange('amount', e.target.value)}
                            placeholder="0,00"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Tipo *</Label>
                          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
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
                              {formData.type === 'income' ? (
                                <>
                                  <SelectItem value="Salário">Salário</SelectItem>
                                  <SelectItem value="Freelance">Freelance</SelectItem>
                                  <SelectItem value="Investimentos">Investimentos</SelectItem>
                                  <SelectItem value="Outros">Outros</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="Alimentação">Alimentação</SelectItem>
                                  <SelectItem value="Moradia">Moradia</SelectItem>
                                  <SelectItem value="Transporte">Transporte</SelectItem>
                                  <SelectItem value="Saúde">Saúde</SelectItem>
                                  <SelectItem value="Lazer">Lazer</SelectItem>
                                  <SelectItem value="Educação">Educação</SelectItem>
                                  <SelectItem value="Outros">Outros</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="transaction_date">Data</Label>
                          <Input
                            id="transaction_date"
                            type="date"
                            value={formData.transaction_date}
                            onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmada</SelectItem>
                              <SelectItem value="pending">Pendente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Criar Transação
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value={filtroAtivo} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {filtroAtivo === 'todas' && 'Todas as Transações'}
                    {filtroAtivo === 'receitas' && 'Receitas'}
                    {filtroAtivo === 'despesas' && 'Despesas'}
                    {filtroAtivo === 'pendentes' && 'Transações Pendentes'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transacoesFiltradas.map((transacao) => (
                      <div key={transacao.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{transacao.descricao}</h3>
                              {getTipoBadge(transacao.tipo)}
                              {getStatusBadge(transacao.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <p className="font-medium">Categoria</p>
                                <p>{transacao.categoria}</p>
                              </div>
                              <div>
                                <p className="font-medium">Data</p>
                                <p>{new Date(transacao.data).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="font-medium">Conta</p>
                                <p>{transacao.conta}</p>
                              </div>
                              <div>
                                <p className="font-medium">Valor</p>
                                <p className={`text-lg font-bold ${transacao.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  R$ {Math.abs(transacao.valor).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {transacao.status === 'pendente' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => confirmarTransacao(transacao.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => abrirModalEdicao(transacao)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => excluirTransacao(transacao.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {transacoesFiltradas.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nenhuma transação encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modal para Editar Transação */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Transação</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editFormData.description || !editFormData.amount || !editFormData.category) {
                  alert('Por favor, preencha todos os campos obrigatórios.');
                  return;
                }
                
                const amount = parseFloat(editFormData.amount);
                const finalAmount = editFormData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
                
                editarTransacao(selectedTransacao.id, {
                  ...editFormData,
                  amount: finalAmount
                });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="edit_description">Descrição *</Label>
                  <Input
                    id="edit_description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Ex: Supermercado, Salário..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_amount">Valor *</Label>
                    <Input
                      id="edit_amount"
                      type="number"
                      step="0.01"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData(prev => ({...prev, amount: e.target.value}))}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_type">Tipo *</Label>
                    <Select value={editFormData.type} onValueChange={(value) => setEditFormData(prev => ({...prev, type: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit_category">Categoria *</Label>
                  <Select value={editFormData.category} onValueChange={(value) => setEditFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {editFormData.type === 'income' ? (
                        <>
                          <SelectItem value="Salário">Salário</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Investimentos">Investimentos</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Alimentação">Alimentação</SelectItem>
                          <SelectItem value="Moradia">Moradia</SelectItem>
                          <SelectItem value="Transporte">Transporte</SelectItem>
                          <SelectItem value="Saúde">Saúde</SelectItem>
                          <SelectItem value="Lazer">Lazer</SelectItem>
                          <SelectItem value="Educação">Educação</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_transaction_date">Data</Label>
                    <Input
                      id="edit_transaction_date"
                      type="date"
                      value={editFormData.transaction_date}
                      onChange={(e) => setEditFormData(prev => ({...prev, transaction_date: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_status">Status</Label>
                    <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({...prev, status: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default Transactions;

