import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Progress } from './progress';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { 
  BarChart3, DollarSign, TrendingUp, Plus, Edit, Trash2, 
  Calendar, Target, LogOut, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from './services/api';
import logo from './assets/LOGO.png';

const Planning = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Estados para planejamentos e modal
  const [planejamentos, setPlanejamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlanejamento, setSelectedPlanejamento] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_amount: '',
    start_date: '',
    end_date: ''
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    total_amount: '',
    start_date: '',
    end_date: ''
  });

  // Carregar planejamentos da API
  useEffect(() => {
    loadPlanejamentos();
  }, []);

  const loadPlanejamentos = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/planning');
      setPlanejamentos(response.plannings || []);
    } catch (error) {
      console.error('Erro ao carregar planejamentos:', error);
      // Fallback para dados mock se API falhar
      setPlanejamentos([
        {
          id: 1,
          title: 'Planejamento Anual 2024',
          description: 'Planejamento financeiro para o ano de 2024',
          total_amount: 120000,
          spent_amount: 45000,
          progress: 37.5,
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        },
        {
          id: 2,
          title: 'Viagem Europa',
          description: 'Planejamento para viagem de férias',
          total_amount: 15000,
          spent_amount: 8500,
          progress: 56.7,
          status: 'active',
          start_date: '2024-03-01',
          end_date: '2024-08-31'
        },
        {
          id: 3,
          title: 'Reserva de Emergência',
          description: 'Construção de reserva de emergência',
          total_amount: 30000,
          spent_amount: 22000,
          progress: 73.3,
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Função para editar planejamento
  const editarPlanejamento = async (id, dados) => {
    try {
      const response = await apiService.put(`/planning/${id}`, dados);
      if (response.success) {
        await loadPlanejamentos();
        setIsEditModalOpen(false);
        setSelectedPlanejamento(null);
        alert('Planejamento atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao editar planejamento:', error);
      alert('Erro ao editar planejamento. Tente novamente.');
    }
  };

  // Função para excluir planejamento
  const excluirPlanejamento = async (id) => {
    if (confirm('Tem certeza que deseja excluir este planejamento?')) {
      try {
        await apiService.delete(`/planning/${id}`);
        await loadPlanejamentos();
        alert('Planejamento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir planejamento:', error);
        alert('Erro ao excluir planejamento. Tente novamente.');
      }
    }
  };

  // Função para confirmar planejamento
  const confirmarPlanejamento = async (id) => {
    try {
      const response = await apiService.put(`/planning/${id}`, { status: 'confirmed' });
      if (response.success) {
        await loadPlanejamentos();
        alert('Planejamento confirmado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao confirmar planejamento:', error);
      alert('Erro ao confirmar planejamento. Tente novamente.');
    }
  };

  // Função para abrir modal de edição
  const abrirModalEdicao = (planejamento) => {
    setSelectedPlanejamento(planejamento);
    setEditFormData({
      title: planejamento.title,
      description: planejamento.description,
      total_amount: planejamento.total_amount.toString(),
      start_date: planejamento.start_date,
      end_date: planejamento.end_date
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.post('/planning', formData);
      await loadPlanejamentos(); // Recarregar lista
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        total_amount: '',
        start_date: '',
        end_date: ''
      });
    } catch (error) {
      console.error('Erro ao criar planejamento:', error);
      alert('Erro ao criar planejamento. Tente novamente.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Dados mock para orçamentos por categoria
  const [orcamentos] = useState([
    { categoria: 'Moradia', orcado: 3500, gasto: 3200, progresso: 91.4 },
    { categoria: 'Alimentação', orcado: 1200, gasto: 980, progresso: 81.7 },
    { categoria: 'Transporte', orcado: 800, gasto: 650, progresso: 81.3 },
    { categoria: 'Lazer', orcado: 600, gasto: 420, progresso: 70.0 },
    { categoria: 'Saúde', orcado: 500, gasto: 280, progresso: 56.0 }
  ]);

  const getProgressColor = (progresso) => {
    if (progresso <= 50) return 'bg-green-500';
    if (progresso <= 80) return 'bg-yellow-500';
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
              <h1 className="text-xl font-semibold text-gray-900">Planejamento Financeiro</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Planejamento Financeiro</h2>
            <p className="text-gray-600">Gerencie seus planejamentos e orçamentos</p>
          </div>

          <Tabs defaultValue="visao-geral" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="planejamentos">Planejamentos</TabsTrigger>
              <TabsTrigger value="orcamento">Orçamento por Categoria</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="visao-geral" className="space-y-6">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Target className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Planejado</p>
                        <p className="text-2xl font-bold text-blue-600">R$ 165.000,00</p>
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
                        <p className="text-sm font-medium text-gray-600">Total Gasto</p>
                        <p className="text-2xl font-bold text-red-600">R$ 75.500,00</p>
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
                        <p className="text-sm font-medium text-gray-600">Disponível</p>
                        <p className="text-2xl font-bold text-green-600">R$ 89.500,00</p>
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
                        <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
                        <p className="text-2xl font-bold text-purple-600">55.8%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Planejamentos Ativos */}
              <Card>
                <CardHeader>
                  <CardTitle>Planejamentos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {planejamentos.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{plan.nome}</h3>
                          <Badge variant="outline">{plan.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="font-medium">R$ {plan.valor_total.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Gasto</p>
                            <p className="font-medium">R$ {plan.valor_gasto.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Disponível</p>
                            <p className="font-medium">R$ {(plan.valor_total - plan.valor_gasto).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Progresso</p>
                            <p className="font-medium">{plan.progresso.toFixed(1)}%</p>
                          </div>
                        </div>
                        <Progress value={plan.progresso} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Planejamentos */}
            <TabsContent value="planejamentos" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Meus Planejamentos</h3>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Planejamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Planejamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Ex: Planejamento Anual 2024"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Descrição do planejamento"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total_amount">Valor Total (R$)</Label>
                        <Input
                          id="total_amount"
                          name="total_amount"
                          type="number"
                          value={formData.total_amount}
                          onChange={handleInputChange}
                          placeholder="0,00"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_date">Data Início</Label>
                          <Input
                            id="start_date"
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_date">Data Fim</Label>
                          <Input
                            id="end_date"
                            name="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Criar Planejamento
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {planejamentos.map((plan) => (
                  <Card key={plan.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{plan.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => confirmarPlanejamento(plan.id)}
                            title="Confirmar Planejamento"
                          >
                            Confirmar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => abrirModalEdicao(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => excluirPlanejamento(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Valor Total</p>
                          <p className="text-xl font-bold text-blue-600">R$ {plan.total_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Valor Gasto</p>
                          <p className="text-xl font-bold text-red-600">R$ {(plan.spent_amount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Disponível</p>
                          <p className="text-xl font-bold text-green-600">R$ {(plan.total_amount - (plan.spent_amount || 0)).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Progresso</p>
                          <p className="text-xl font-bold text-purple-600">{(plan.progress || 0).toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso do Planejamento</span>
                          <span>{(plan.progress || 0).toFixed(1)}%</span>
                        </div>
                        <Progress value={plan.progress || 0} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Orçamento por Categoria */}
            <TabsContent value="orcamento" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Orçamento por Categoria</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>

              <div className="grid gap-4">
                {orcamentos.map((orc, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{orc.categoria}</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Orçado</p>
                          <p className="text-lg font-bold text-blue-600">R$ {orc.orcado.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Gasto</p>
                          <p className="text-lg font-bold text-red-600">R$ {orc.gasto.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Disponível</p>
                          <p className="text-lg font-bold text-green-600">R$ {(orc.orcado - orc.gasto).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Utilização do Orçamento</span>
                          <span className={`font-medium ${orc.progresso > 90 ? 'text-red-600' : orc.progresso > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {orc.progresso.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${getProgressColor(orc.progresso)}`}
                            style={{ width: `${Math.min(orc.progresso, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Modal para Editar Planejamento */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Planejamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                editarPlanejamento(selectedPlanejamento.id, {
                  ...editFormData,
                  total_amount: parseFloat(editFormData.total_amount)
                });
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_title">Título</Label>
                  <Input
                    id="edit_title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({...prev, title: e.target.value}))}
                    placeholder="Ex: Planejamento Anual 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_description">Descrição</Label>
                  <Input
                    id="edit_description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Descrição do planejamento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_total_amount">Valor Total (R$)</Label>
                  <Input
                    id="edit_total_amount"
                    type="number"
                    value={editFormData.total_amount}
                    onChange={(e) => setEditFormData(prev => ({...prev, total_amount: e.target.value}))}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_start_date">Data Início</Label>
                    <Input
                      id="edit_start_date"
                      type="date"
                      value={editFormData.start_date}
                      onChange={(e) => setEditFormData(prev => ({...prev, start_date: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_end_date">Data Fim</Label>
                    <Input
                      id="edit_end_date"
                      type="date"
                      value={editFormData.end_date}
                      onChange={(e) => setEditFormData(prev => ({...prev, end_date: e.target.value}))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
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

export default Planning;

