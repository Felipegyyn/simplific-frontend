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
import { Textarea } from './textarea';
import { 
  Target, DollarSign, TrendingUp, Plus, Edit, Trash2, 
  Calendar, CheckCircle, Clock, LogOut, ArrowLeft, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from './services/api';
import logo from './assets/LOGO.png';

const Goals = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Estados para metas e modal
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: '',
    priority: 'média'
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: '',
    priority: 'média'
  });

  // Carregar metas da API
  useEffect(() => {
    loadMetas();
  }, []);

  const loadMetas = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/goals');
      setMetas(response.goals || []);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      setMetas([
        {
          id: 1,
          nome: 'Reserva de Emergência',
          descricao: 'Juntar 6 meses de gastos para emergências',
          valor_meta: 30000,
          valor_atual: 22000,
          progresso: 73.3,
          prazo: '2024-12-31',
          categoria: 'Segurança',
          status: 'ativa',
          prioridade: 'alta'
        },
        {
          id: 2,
          nome: 'Viagem para Europa',
          descricao: 'Economizar para viagem de 15 dias pela Europa',
          valor_meta: 15000,
          valor_atual: 8500,
          progresso: 56.7,
          prazo: '2024-08-31',
          categoria: 'Lazer',
          status: 'ativa',
          prioridade: 'média'
        },
        {
          id: 3,
          nome: 'Carro Novo',
          descricao: 'Entrada para financiamento de carro novo',
          valor_meta: 25000,
          valor_atual: 12000,
          progresso: 48.0,
          prazo: '2025-03-31',
          categoria: 'Transporte',
          status: 'ativa',
          prioridade: 'média'
        },
        {
          id: 4,
          nome: 'Curso de Especialização',
          descricao: 'MBA em Gestão Financeira',
          valor_meta: 8000,
          valor_atual: 8000,
          progresso: 100,
          prazo: '2024-02-28',
          categoria: 'Educação',
          status: 'concluida',
          prioridade: 'alta'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar nova meta
  const criarMeta = async (dadosMeta) => {
    try {
      const response = await apiService.post('/goals', dadosMeta);
      if (response.success) {
        await loadMetas(); // Recarregar lista
        setIsModalOpen(false); // Fechar modal
        setFormData({
          name: '',
          description: '',
          target_amount: '',
          current_amount: '',
          target_date: '',
          category: '',
          priority: 'média'
        }); // Limpar formulário
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      alert('Erro ao criar meta. Tente novamente.');
    }
  };

  // Função para excluir meta
  const excluirMeta = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        await apiService.delete(`/goals/${id}`);
        await loadMetas(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir meta:', error);
        alert('Erro ao excluir meta. Tente novamente.');
      }
    }
  };

  // Função para adicionar valor à meta
  const adicionarValor = async (id, valor) => {
    try {
      const meta = metas.find(m => m.id === id);
      const novoValor = meta.valor_atual + parseFloat(valor);
      await apiService.put(`/goals/${id}`, { current_amount: novoValor });
      await loadMetas(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao adicionar valor:', error);
      alert('Erro ao adicionar valor. Tente novamente.');
    }
  };

  // Função para editar meta
  const editarMeta = async (id, dados) => {
    try {
      const response = await apiService.put(`/goals/${id}`, dados);
      if (response.success) {
        await loadMetas();
        setIsEditModalOpen(false);
        setSelectedMeta(null);
        alert('Meta atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao editar meta:', error);
      alert('Erro ao editar meta. Tente novamente.');
    }
  };

  // Função para abrir modal de edição
  const abrirModalEdicao = (meta) => {
    setSelectedMeta(meta);
    setEditFormData({
      name: meta.nome,
      description: meta.descricao,
      target_amount: meta.valor_meta.toString(),
      current_amount: meta.valor_atual.toString(),
      target_date: meta.prazo,
      category: meta.categoria,
      priority: meta.prioridade
    });
    setIsEditModalOpen(true);
  };

  // Função para lidar com submit do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.target_amount || !formData.target_date || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    criarMeta({
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0
    });
  };

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filtrar metas por status
  const metasAtivas = metas.filter(meta => meta.status === 'ativa');
  const metasConcluidas = metas.filter(meta => meta.status === 'concluida');
  const metasArquivadas = metas.filter(meta => meta.status === 'arquivada');

  // Calcular totais
  const valorTotalMetas = metasAtivas.reduce((sum, meta) => sum + meta.valor_meta, 0);
  const valorAtualTotal = metasAtivas.reduce((sum, meta) => sum + meta.valor_atual, 0);
  const progressoMedio = metasAtivas.length > 0 ? 
    metasAtivas.reduce((sum, meta) => sum + meta.progresso, 0) / metasAtivas.length : 0;

  const getProgressColor = (progresso) => {
    if (progresso >= 100) return 'bg-green-500';
    if (progresso >= 75) return 'bg-blue-500';
    if (progresso >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPrioridadeBadge = (prioridade) => {
    const colors = {
      alta: 'bg-red-100 text-red-800',
      média: 'bg-yellow-100 text-yellow-800',
      baixa: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[prioridade]}>{prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      ativa: 'bg-blue-100 text-blue-800',
      concluida: 'bg-green-100 text-green-800',
      arquivada: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      ativa: 'Ativa',
      concluida: 'Concluída',
      arquivada: 'Arquivada'
    };
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  const diasRestantes = (prazo) => {
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    const diffTime = dataPrazo - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
              <h1 className="text-xl font-semibold text-gray-900">Metas Financeiras</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Metas Financeiras</h2>
            <p className="text-gray-600">Defina e acompanhe seus objetivos financeiros</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Metas</p>
                    <p className="text-2xl font-bold text-blue-600">{metasAtivas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-purple-600">R$ {valorTotalMetas.toLocaleString()}</p>
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
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
                    <p className="text-2xl font-bold text-yellow-600">{progressoMedio.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="ativas" className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="ativas">Ativas ({metasAtivas.length})</TabsTrigger>
                <TabsTrigger value="concluidas">Concluídas ({metasConcluidas.length})</TabsTrigger>
                <TabsTrigger value="arquivadas">Arquivadas ({metasArquivadas.length})</TabsTrigger>
              </TabsList>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Meta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Nova Meta Financeira</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome da Meta *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Ex: Reserva de Emergência"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Descreva sua meta..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="target_amount">Valor Meta (R$) *</Label>
                        <Input
                          id="target_amount"
                          type="number"
                          step="0.01"
                          value={formData.target_amount}
                          onChange={(e) => handleInputChange('target_amount', e.target.value)}
                          placeholder="30000.00"
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
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="target_date">Data Meta *</Label>
                        <Input
                          id="target_date"
                          type="date"
                          value={formData.target_date}
                          onChange={(e) => handleInputChange('target_date', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="média">Média</SelectItem>
                            <SelectItem value="baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Segurança">Segurança</SelectItem>
                          <SelectItem value="Lazer">Lazer</SelectItem>
                          <SelectItem value="Transporte">Transporte</SelectItem>
                          <SelectItem value="Educação">Educação</SelectItem>
                          <SelectItem value="Saúde">Saúde</SelectItem>
                          <SelectItem value="Casa">Casa</SelectItem>
                          <SelectItem value="Investimentos">Investimentos</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Criar Meta
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Metas Ativas */}
            <TabsContent value="ativas" className="space-y-6">
              <div className="grid gap-6">
                {metasAtivas.map((meta) => {
                  const dias = diasRestantes(meta.prazo);
                  return (
                    <Card key={meta.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{meta.nome}</h3>
                              {getPrioridadeBadge(meta.prioridade)}
                              {getStatusBadge(meta.status)}
                            </div>
                            <p className="text-gray-600 mb-3">{meta.descricao}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-600">Categoria</p>
                                <p>{meta.categoria}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Prazo</p>
                                <p className={dias < 30 ? 'text-red-600 font-medium' : ''}>
                                  {new Date(meta.prazo).toLocaleDateString()}
                                  {dias >= 0 && (
                                    <span className="block text-xs">
                                      {dias === 0 ? 'Hoje!' : `${dias} dias`}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Valor Meta</p>
                                <p className="text-blue-600 font-bold">R$ {meta.valor_meta.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Valor Atual</p>
                                <p className="text-green-600 font-bold">R$ {meta.valor_atual.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const valor = prompt('Quanto deseja adicionar à meta?');
                                if (valor && !isNaN(valor)) {
                                  adicionarValor(meta.id, valor);
                                }
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => abrirModalEdicao(meta)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => excluirMeta(meta.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso da Meta</span>
                            <span className="font-medium">{meta.progresso.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${getProgressColor(meta.progresso)}`}
                              style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>R$ {meta.valor_atual.toLocaleString()}</span>
                            <span>R$ {(meta.valor_meta - meta.valor_atual).toLocaleString()} restantes</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Metas Concluídas */}
            <TabsContent value="concluidas" className="space-y-6">
              <div className="grid gap-6">
                {metasConcluidas.map((meta) => (
                  <Card key={meta.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-semibold">{meta.nome}</h3>
                            {getStatusBadge(meta.status)}
                          </div>
                          <p className="text-gray-600 mb-3">{meta.descricao}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-600">Categoria</p>
                              <p>{meta.categoria}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600">Concluída em</p>
                              <p>{new Date(meta.prazo).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600">Valor Alcançado</p>
                              <p className="text-green-600 font-bold">R$ {meta.valor_atual.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress value={100} className="h-3 bg-green-200" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Metas Arquivadas */}
            <TabsContent value="arquivadas" className="space-y-6">
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma meta arquivada</p>
                <p className="text-sm text-gray-400">Metas canceladas ou pausadas aparecerão aqui</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Modal para Editar Meta */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Meta</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editFormData.name || !editFormData.target_amount || !editFormData.target_date || !editFormData.category) {
                  alert('Por favor, preencha todos os campos obrigatórios.');
                  return;
                }
                
                editarMeta(selectedMeta.id, {
                  ...editFormData,
                  target_amount: parseFloat(editFormData.target_amount),
                  current_amount: parseFloat(editFormData.current_amount) || 0
                });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="edit_name">Nome da Meta *</Label>
                  <Input
                    id="edit_name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Ex: Reserva de Emergência"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_description">Descrição</Label>
                  <Textarea
                    id="edit_description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Descreva sua meta..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_target_amount">Valor Meta (R$) *</Label>
                    <Input
                      id="edit_target_amount"
                      type="number"
                      step="0.01"
                      value={editFormData.target_amount}
                      onChange={(e) => setEditFormData(prev => ({...prev, target_amount: e.target.value}))}
                      placeholder="30000.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_current_amount">Valor Atual (R$)</Label>
                    <Input
                      id="edit_current_amount"
                      type="number"
                      step="0.01"
                      value={editFormData.current_amount}
                      onChange={(e) => setEditFormData(prev => ({...prev, current_amount: e.target.value}))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_target_date">Data Meta *</Label>
                    <Input
                      id="edit_target_date"
                      type="date"
                      value={editFormData.target_date}
                      onChange={(e) => setEditFormData(prev => ({...prev, target_date: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_priority">Prioridade</Label>
                    <Select value={editFormData.priority} onValueChange={(value) => setEditFormData(prev => ({...prev, priority: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="média">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
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
                      <SelectItem value="Segurança">Segurança</SelectItem>
                      <SelectItem value="Lazer">Lazer</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Educação">Educação</SelectItem>
                      <SelectItem value="Saúde">Saúde</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Investimentos">Investimentos</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
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

export default Goals;

