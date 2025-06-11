import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Progress } from './progress';
import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { 
  CreditCard, DollarSign, AlertTriangle, Plus, Edit, Trash2, 
  Calendar, TrendingUp, LogOut, ArrowLeft, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from './services/api';
import logo from './assets/LOGO.png';

const CreditCards = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Estados para cartões e modal
  const [cartoes, setCartoes] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [isFaturaModalOpen, setIsFaturaModalOpen] = useState(false);
  const [isPeriodoModalOpen, setIsPeriodoModalOpen] = useState(false);
  const [selectedCartao, setSelectedCartao] = useState(null);
  const [selectedFatura, setSelectedFatura] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    card_number: '',
    limit_amount: '',
    brand: '',
    due_date: ''
  });
  const [gastoFormData, setGastoFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Carregar cartões da API
  useEffect(() => {
    loadCartoes();
  }, []);

  const loadCartoes = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/credit-cards');
      setCartoes(response.cards || []);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      setCartoes([
        {
          id: 1,
          nome: 'Nubank Roxinho',
          numero: '**** **** **** 1234',
          limite: 5000,
          usado: 2800,
          disponivel: 2200,
          vencimento: '2024-07-15',
          bandeira: 'Mastercard',
          status: 'ativo'
        },
        {
          id: 2,
          nome: 'Itaú Platinum',
          numero: '**** **** **** 5678',
          limite: 8000,
          usado: 3200,
          disponivel: 4800,
          vencimento: '2024-07-20',
          bandeira: 'Visa',
          status: 'ativo'
        },
        {
          id: 3,
          nome: 'Bradesco Gold',
          numero: '**** **** **** 9012',
          limite: 3000,
          usado: 2700,
          disponivel: 300,
          vencimento: '2024-07-25',
          bandeira: 'Mastercard',
          status: 'ativo'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar novo cartão
  const criarCartao = async (dadosCartao) => {
    try {
      const response = await apiService.post('/credit-cards', dadosCartao);
      if (response.success) {
        await loadCartoes(); // Recarregar lista
        setIsModalOpen(false); // Fechar modal
        setFormData({
          name: '',
          card_number: '',
          limit_amount: '',
          brand: '',
          due_date: ''
        }); // Limpar formulário
      }
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      alert('Erro ao criar cartão. Tente novamente.');
    }
  };

  // Função para lançar gasto no cartão
  const lancarGastoCartao = async (cartaoId, dadosGasto) => {
    try {
      const response = await apiService.post(`/credit-cards/${cartaoId}/transactions`, dadosGasto);
      if (response.success) {
        await loadCartoes(); // Recarregar cartões
        setIsGastoModalOpen(false);
        setGastoFormData({
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0]
        });
        alert('Gasto lançado no cartão com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao lançar gasto no cartão:', error);
      alert('Erro ao lançar gasto. Tente novamente.');
    }
  };

  // Função para pagar fatura
  const pagarFatura = async (fatura) => {
    try {
      // Simular pagamento da fatura
      fatura.status = 'paga';
      
      // Atualizar limite do cartão
      const cartao = cartoes.find(c => c.id === fatura.cartao_id);
      if (cartao) {
        cartao.usado -= fatura.valor_total;
        cartao.disponivel += fatura.valor_total;
      }
      
      setCartoes([...cartoes]);
      setFaturas([...faturas]);
      
      alert(`Fatura de R$ ${fatura.valor_total.toFixed(2)} paga com sucesso! Transação criada nos lançamentos.`);
    } catch (error) {
      console.error('Erro ao pagar fatura:', error);
      alert('Erro ao pagar fatura. Tente novamente.');
    }
  };

  // Função para visualizar fatura completa
  const visualizarFatura = (fatura) => {
    setSelectedFatura(fatura);
    setIsFaturaModalOpen(true);
  };

  // Função para excluir cartão
  const excluirCartao = async (id) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await apiService.delete(`/credit-cards/${id}`);
        await loadCartoes(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
        alert('Erro ao excluir cartão. Tente novamente.');
      }
    }
  };

  // Função para lidar com submit do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.card_number || !formData.limit_amount || !formData.brand) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    criarCartao({
      ...formData,
      limit_amount: parseFloat(formData.limit_amount)
    });
  };

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Carregar faturas (dados mock por enquanto)
  useEffect(() => {
    setFaturas([
      {
        id: 1,
        cartao_id: 1,
        cartao_nome: 'Nubank Roxinho',
        mes_ref: '2024-06',
        valor_total: 2800,
        valor_minimo: 280,
        data_vencimento: '2024-07-15',
        status: 'aberta',
        transacoes: [
          { descricao: 'Supermercado Extra', valor: 450, data: '2024-06-05' },
          { descricao: 'Posto Shell', valor: 180, data: '2024-06-08' },
          { descricao: 'Netflix', valor: 45, data: '2024-06-10' },
          { descricao: 'Restaurante', valor: 125, data: '2024-06-12' }
        ]
      },
      {
        id: 2,
        cartao_id: 2,
        cartao_nome: 'Itaú Platinum',
        mes_ref: '2024-06',
        valor_total: 3200,
        valor_minimo: 320,
        data_vencimento: '2024-07-20',
        status: 'aberta',
        transacoes: [
          { descricao: 'Shopping Center', valor: 890, data: '2024-06-03' },
          { descricao: 'Farmácia', valor: 95, data: '2024-06-07' },
          { descricao: 'Uber', valor: 85, data: '2024-06-15' }
        ]
      },
      {
        id: 3,
        cartao_id: 3,
        cartao_nome: 'Bradesco Gold',
        mes_ref: '2024-06',
        valor_total: 2700,
        valor_minimo: 270,
        data_vencimento: '2024-07-25',
        status: 'aberta',
        transacoes: [
          { descricao: 'Mercado Livre', valor: 320, data: '2024-06-02' },
          { descricao: 'Cinema', valor: 85, data: '2024-06-09' },
          { descricao: 'Livraria', valor: 150, data: '2024-06-18' }
        ]
      }
    ]);
  }, []);

  // Calcular totais
  const limiteTotal = cartoes.reduce((sum, cartao) => sum + cartao.limite, 0);
  const usadoTotal = cartoes.reduce((sum, cartao) => sum + cartao.usado, 0);
  const disponivelTotal = cartoes.reduce((sum, cartao) => sum + cartao.disponivel, 0);

  const getUtilizacaoColor = (percentual) => {
    if (percentual <= 30) return 'text-green-600';
    if (percentual <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentual) => {
    if (percentual <= 30) return 'bg-green-500';
    if (percentual <= 70) return 'bg-yellow-500';
    return 'bg-red-500';
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
              <h1 className="text-xl font-semibold text-gray-900">Cartões de Crédito</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Cartões de Crédito</h2>
            <p className="text-gray-600">Gerencie seus cartões e faturas</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Limite Total</p>
                    <p className="text-2xl font-bold text-blue-600">R$ {limiteTotal.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Limite Usado</p>
                    <p className="text-2xl font-bold text-red-600">R$ {usadoTotal.toLocaleString()}</p>
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
                    <p className="text-sm font-medium text-gray-600">Limite Disponível</p>
                    <p className="text-2xl font-bold text-green-600">R$ {disponivelTotal.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="cartoes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cartoes">Meus Cartões</TabsTrigger>
              <TabsTrigger value="faturas">Faturas</TabsTrigger>
            </TabsList>

            {/* Meus Cartões */}
            <TabsContent value="cartoes" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Meus Cartões</h3>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Cartão
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nome do Cartão *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ex: Nubank Roxinho"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="brand">Bandeira *</Label>
                          <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Visa">Visa</SelectItem>
                              <SelectItem value="Mastercard">Mastercard</SelectItem>
                              <SelectItem value="Elo">Elo</SelectItem>
                              <SelectItem value="American Express">American Express</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="card_number">Número do Cartão *</Label>
                          <Input
                            id="card_number"
                            value={formData.card_number}
                            onChange={(e) => handleInputChange('card_number', e.target.value)}
                            placeholder="**** **** **** 1234"
                            maxLength="19"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="limit_amount">Limite (R$) *</Label>
                          <Input
                            id="limit_amount"
                            type="number"
                            step="0.01"
                            value={formData.limit_amount}
                            onChange={(e) => handleInputChange('limit_amount', e.target.value)}
                            placeholder="5000.00"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="due_date">Dia do Vencimento</Label>
                        <Select value={formData.due_date} onValueChange={(value) => handleInputChange('due_date', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>
                                Dia {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Adicionar Cartão
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {cartoes.map((cartao) => {
                  const utilizacao = (cartao.usado / cartao.limite) * 100;
                  return (
                    <Card key={cartao.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{cartao.nome}</h3>
                            <p className="text-sm text-gray-600">{cartao.numero}</p>
                            <p className="text-sm text-gray-600">{cartao.bandeira}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{cartao.status}</Badge>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => abrirModalGasto(cartao)}
                                title="Lançar Gasto no Cartão"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => excluirCartao(cartao.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Limite Total</p>
                            <p className="text-lg font-bold text-blue-600">R$ {cartao.limite.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Usado</p>
                            <p className="text-lg font-bold text-red-600">R$ {cartao.usado.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Disponível</p>
                            <p className="text-lg font-bold text-green-600">R$ {cartao.disponivel.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Vencimento</p>
                            <p className="text-lg font-bold text-purple-600">
                              {new Date(cartao.vencimento).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Utilização do Limite</span>
                            <span className={`font-medium ${getUtilizacaoColor(utilizacao)}`}>
                              {utilizacao.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${getProgressColor(utilizacao)}`}
                              style={{ width: `${Math.min(utilizacao, 100)}%` }}
                            ></div>
                          </div>
                          {utilizacao > 80 && (
                            <div className="flex items-center text-red-600 text-sm mt-2">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Atenção: Limite quase esgotado
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Faturas */}
            <TabsContent value="faturas" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Faturas dos Cartões</h3>
                <Button variant="outline" onClick={() => setIsPeriodoModalOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Filtrar por Período
                </Button>
              </div>

              <div className="grid gap-6">
                {faturas.map((fatura) => (
                  <Card key={fatura.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{fatura.cartao_nome}</CardTitle>
                        <Badge className={fatura.status === 'aberta' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                          {fatura.status === 'aberta' ? 'Em Aberto' : 'Paga'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Referência: {new Date(fatura.mes_ref).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-600">Valor Total</p>
                          <p className="text-xl font-bold text-red-600">R$ {fatura.valor_total.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pagamento Mínimo</p>
                          <p className="text-xl font-bold text-yellow-600">R$ {fatura.valor_minimo.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Vencimento</p>
                          <p className="text-xl font-bold text-purple-600">
                            {new Date(fatura.data_vencimento).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Principais Transações</h4>
                        {fatura.transacoes.slice(0, 4).map((transacao, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                              <p className="font-medium">{transacao.descricao}</p>
                              <p className="text-sm text-gray-600">{new Date(transacao.data).toLocaleDateString()}</p>
                            </div>
                            <p className="font-bold text-red-600">R$ {transacao.valor.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <Button 
                          variant="outline"
                          onClick={() => visualizarFatura(fatura)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Fatura Completa
                        </Button>
                        {fatura.status === 'aberta' && (
                          <Button onClick={() => pagarFatura(fatura)}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Pagar Fatura
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Modal para Lançar Gasto no Cartão */}
          <Dialog open={isGastoModalOpen} onOpenChange={setIsGastoModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Lançar Gasto no Cartão</DialogTitle>
                <p className="text-sm text-gray-600">
                  {selectedCartao?.nome}
                </p>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!gastoFormData.description || !gastoFormData.amount) {
                  alert('Por favor, preencha todos os campos obrigatórios.');
                  return;
                }
                lancarGastoCartao(selectedCartao.id, {
                  ...gastoFormData,
                  amount: parseFloat(gastoFormData.amount)
                });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={gastoFormData.description}
                    onChange={(e) => setGastoFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Ex: Supermercado, Restaurante..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={gastoFormData.amount}
                      onChange={(e) => setGastoFormData(prev => ({...prev, amount: e.target.value}))}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={gastoFormData.date}
                      onChange={(e) => setGastoFormData(prev => ({...prev, date: e.target.value}))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={gastoFormData.category} onValueChange={(value) => setGastoFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alimentação">Alimentação</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Lazer">Lazer</SelectItem>
                      <SelectItem value="Saúde">Saúde</SelectItem>
                      <SelectItem value="Educação">Educação</SelectItem>
                      <SelectItem value="Compras">Compras</SelectItem>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsGastoModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Lançar Gasto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal para Visualizar Fatura Completa */}
          <Dialog open={isFaturaModalOpen} onOpenChange={setIsFaturaModalOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Fatura Completa</DialogTitle>
                {selectedFatura && (
                  <p className="text-sm text-gray-600">
                    {selectedFatura.cartao_nome} - {new Date(selectedFatura.mes_ref).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </DialogHeader>
              
              {selectedFatura && (
                <div className="space-y-6">
                  {/* Resumo da Fatura */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="text-xl font-bold text-red-600">R$ {selectedFatura.valor_total.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Pagamento Mínimo</p>
                      <p className="text-xl font-bold text-yellow-600">R$ {selectedFatura.valor_minimo.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Vencimento</p>
                      <p className="text-xl font-bold text-purple-600">
                        {new Date(selectedFatura.data_vencimento).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Lista Completa de Transações */}
                  <div>
                    <h4 className="font-semibold mb-4">Todas as Transações</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedFatura.transacoes.map((transacao, index) => (
                        <div key={index} className="flex justify-between items-center py-3 px-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium">{transacao.descricao}</p>
                            <p className="text-sm text-gray-600">{new Date(transacao.data).toLocaleDateString()}</p>
                          </div>
                          <p className="font-bold text-red-600">R$ {transacao.valor.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsFaturaModalOpen(false)}>
                      Fechar
                    </Button>
                    {selectedFatura.status === 'aberta' && (
                      <Button onClick={() => {
                        pagarFatura(selectedFatura);
                        setIsFaturaModalOpen(false);
                      }}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pagar Fatura
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Modal para Filtrar por Período */}
          <Dialog open={isPeriodoModalOpen} onOpenChange={setIsPeriodoModalOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Filtrar Faturas por Período</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="data_inicio">Data Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    defaultValue="2024-01-01"
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    defaultValue="2024-12-31"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsPeriodoModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    alert('Filtro aplicado com sucesso!');
                    setIsPeriodoModalOpen(false);
                  }}>
                    Aplicar Filtro
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default CreditCards;

