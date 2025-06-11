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
  Calendar, Clock, CheckCircle, AlertTriangle, Plus, Edit, Trash2, 
  DollarSign, Bell, LogOut, ArrowLeft, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from './services/api';
import logo from './assets/LOGO.png';

const Schedule = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Estados para eventos e modal
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '09:00',
    type: 'pagamento',
    amount: '',
    priority: 'média',
    category: ''
  });

  // Carregar eventos da API
  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/schedule');
      setEventos(response.events || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEventos([
        {
          id: 1,
          titulo: 'Pagamento Cartão Nubank',
          descricao: 'Vencimento da fatura do cartão de crédito',
          data: '2024-06-25',
          hora: '09:00',
          tipo: 'pagamento',
          valor: 2800,
          status: 'pendente',
          prioridade: 'alta',
          categoria: 'Cartão de Crédito'
        },
        {
          id: 2,
          titulo: 'Reunião com Consultor Financeiro',
          descricao: 'Revisão da carteira de investimentos',
          data: '2024-06-28',
          hora: '14:30',
          tipo: 'reuniao',
          valor: null,
          status: 'pendente',
          prioridade: 'média',
          categoria: 'Consultoria'
        },
        {
          id: 3,
          titulo: 'Vencimento CDB Banco Inter',
          descricao: 'Resgate automático do CDB',
          data: '2024-07-15',
          hora: '10:00',
          tipo: 'vencimento',
          valor: 4250,
          status: 'pendente',
          prioridade: 'média',
          categoria: 'Investimentos'
        },
        {
          id: 4,
          titulo: 'Pagamento Aluguel',
          descricao: 'Pagamento mensal do aluguel',
          data: '2024-06-30',
          hora: '08:00',
          tipo: 'pagamento',
          valor: 2800,
          status: 'pendente',
          prioridade: 'alta',
          categoria: 'Moradia'
        },
        {
          id: 5,
          titulo: 'Recebimento Dividendos ITSA4',
          descricao: 'Pagamento de dividendos das ações',
          data: '2024-06-22',
          hora: '12:00',
          tipo: 'recebimento',
          valor: 150,
          status: 'concluido',
          prioridade: 'baixa',
          categoria: 'Investimentos'
        },
        {
          id: 6,
          titulo: 'Revisão Orçamento Mensal',
          descricao: 'Análise dos gastos do mês',
          data: '2024-06-20',
          hora: '19:00',
          tipo: 'tarefa',
          valor: null,
          status: 'concluido',
          prioridade: 'média',
          categoria: 'Planejamento'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar novo evento
  const criarEvento = async (dadosEvento) => {
    try {
      const response = await apiService.post('/schedule', dadosEvento);
      if (response.success) {
        await loadEventos(); // Recarregar lista
        setIsModalOpen(false); // Fechar modal
        setFormData({
          title: '',
          description: '',
          event_date: new Date().toISOString().split('T')[0],
          event_time: '09:00',
          type: 'pagamento',
          amount: '',
          priority: 'média',
          category: ''
        }); // Limpar formulário
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento. Tente novamente.');
    }
  };

  // Função para marcar evento como concluído
  const marcarConcluido = async (id) => {
    try {
      await apiService.put(`/schedule/${id}`, { status: 'concluido' });
      await loadEventos(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao marcar evento como concluído:', error);
      alert('Erro ao marcar evento como concluído. Tente novamente.');
    }
  };

  // Função para excluir evento
  const excluirEvento = async (id) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await apiService.delete(`/schedule/${id}`);
        await loadEventos(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
        alert('Erro ao excluir evento. Tente novamente.');
      }
    }
  };

  // Função para lidar com submit do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.title || !formData.event_date || !formData.type) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    criarEvento({
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : null
    });
  };

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filtrar eventos
  const hoje = new Date().toISOString().split('T')[0];
  const eventosProximos = eventos.filter(evento => evento.data >= hoje && evento.status === 'pendente');
  const eventosHoje = eventos.filter(evento => evento.data === hoje);
  const eventosConcluidos = eventos.filter(evento => evento.status === 'concluido');
  const eventosAtrasados = eventos.filter(evento => evento.data < hoje && evento.status === 'pendente');

  // Calcular totais
  const pagamentosPendentes = eventos.filter(e => e.tipo === 'pagamento' && e.status === 'pendente')
                                    .reduce((sum, e) => sum + (e.valor || 0), 0);

  const getTipoBadge = (tipo) => {
    const configs = {
      pagamento: { color: 'bg-red-100 text-red-800', label: 'Pagamento' },
      recebimento: { color: 'bg-green-100 text-green-800', label: 'Recebimento' },
      reuniao: { color: 'bg-blue-100 text-blue-800', label: 'Reunião' },
      vencimento: { color: 'bg-yellow-100 text-yellow-800', label: 'Vencimento' },
      tarefa: { color: 'bg-purple-100 text-purple-800', label: 'Tarefa' }
    };
    const config = configs[tipo] || configs.tarefa;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPrioridadeBadge = (prioridade) => {
    const colors = {
      alta: 'bg-red-100 text-red-800',
      média: 'bg-yellow-100 text-yellow-800',
      baixa: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[prioridade]}>{prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}</Badge>;
  };

  const getStatusIcon = (status) => {
    return status === 'concluido' ? 
      <CheckCircle className="h-5 w-5 text-green-600" /> :
      <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const isEventoAtrasado = (data) => {
    return data < hoje;
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit' 
    });
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
              <h1 className="text-xl font-semibold text-gray-900">Agenda Financeira</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Agenda Financeira</h2>
            <p className="text-gray-600">Organize seus compromissos e lembretes financeiros</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Próximos Eventos</p>
                    <p className="text-2xl font-bold text-blue-600">{eventosProximos.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hoje</p>
                    <p className="text-2xl font-bold text-green-600">{eventosHoje.length}</p>
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
                    <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
                    <p className="text-2xl font-bold text-red-600">R$ {pagamentosPendentes.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Atrasados</p>
                    <p className="text-2xl font-bold text-yellow-600">{eventosAtrasados.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="proximos" className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList className="grid w-full sm:w-auto grid-cols-4">
                <TabsTrigger value="proximos">Próximos ({eventosProximos.length})</TabsTrigger>
                <TabsTrigger value="hoje">Hoje ({eventosHoje.length})</TabsTrigger>
                <TabsTrigger value="concluidos">Concluídos ({eventosConcluidos.length})</TabsTrigger>
                <TabsTrigger value="atrasados">Atrasados ({eventosAtrasados.length})</TabsTrigger>
              </TabsList>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Novo Evento da Agenda</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título do Evento *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Ex: Pagamento Cartão, Reunião..."
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Descreva o evento..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="event_date">Data *</Label>
                          <Input
                            id="event_date"
                            type="date"
                            value={formData.event_date}
                            onChange={(e) => handleInputChange('event_date', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event_time">Horário</Label>
                          <Input
                            id="event_time"
                            type="time"
                            value={formData.event_time}
                            onChange={(e) => handleInputChange('event_time', e.target.value)}
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
                              <SelectItem value="pagamento">Pagamento</SelectItem>
                              <SelectItem value="recebimento">Recebimento</SelectItem>
                              <SelectItem value="vencimento">Vencimento</SelectItem>
                              <SelectItem value="reuniao">Reunião</SelectItem>
                              <SelectItem value="tarefa">Tarefa</SelectItem>
                              <SelectItem value="lembrete">Lembrete</SelectItem>
                            </SelectContent>
                          </Select>
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="amount">Valor (R$)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => handleInputChange('amount', e.target.value)}
                            placeholder="Opcional"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Categoria</Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                              <SelectItem value="Moradia">Moradia</SelectItem>
                              <SelectItem value="Investimentos">Investimentos</SelectItem>
                              <SelectItem value="Consultoria">Consultoria</SelectItem>
                              <SelectItem value="Planejamento">Planejamento</SelectItem>
                              <SelectItem value="Saúde">Saúde</SelectItem>
                              <SelectItem value="Educação">Educação</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Criar Evento
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Próximos Eventos */}
            <TabsContent value="proximos" className="space-y-4">
              {eventosProximos.map((evento) => (
                <Card key={evento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(evento.status)}
                          <h3 className="text-lg font-semibold">{evento.titulo}</h3>
                          {getTipoBadge(evento.tipo)}
                          {getPrioridadeBadge(evento.prioridade)}
                        </div>
                        <p className="text-gray-600 mb-3">{evento.descricao}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">Data</p>
                            <p>{formatarData(evento.data)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Horário</p>
                            <p>{evento.hora}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Categoria</p>
                            <p>{evento.categoria}</p>
                          </div>
                          {evento.valor && (
                            <div>
                              <p className="font-medium text-gray-600">Valor</p>
                              <p className={`font-bold ${evento.tipo === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {evento.valor.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => marcarConcluido(evento.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => excluirEvento(evento.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {eventosProximos.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum evento próximo</p>
                </div>
              )}
            </TabsContent>

            {/* Eventos de Hoje */}
            <TabsContent value="hoje" className="space-y-4">
              {eventosHoje.map((evento) => (
                <Card key={evento.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(evento.status)}
                          <h3 className="text-lg font-semibold">{evento.titulo}</h3>
                          {getTipoBadge(evento.tipo)}
                          <Badge className="bg-blue-100 text-blue-800">Hoje</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{evento.descricao}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">Horário</p>
                            <p className="font-bold">{evento.hora}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Categoria</p>
                            <p>{evento.categoria}</p>
                          </div>
                          {evento.valor && (
                            <div>
                              <p className="font-medium text-gray-600">Valor</p>
                              <p className={`font-bold ${evento.tipo === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {evento.valor.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Bell className="h-4 w-4 mr-1" />
                          Lembrar
                        </Button>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {eventosHoje.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum evento para hoje</p>
                </div>
              )}
            </TabsContent>

            {/* Eventos Concluídos */}
            <TabsContent value="concluidos" className="space-y-4">
              {eventosConcluidos.map((evento) => (
                <Card key={evento.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold">{evento.titulo}</h3>
                          {getTipoBadge(evento.tipo)}
                          <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{evento.descricao}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">Data</p>
                            <p>{formatarData(evento.data)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Horário</p>
                            <p>{evento.hora}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Categoria</p>
                            <p>{evento.categoria}</p>
                          </div>
                          {evento.valor && (
                            <div>
                              <p className="font-medium text-gray-600">Valor</p>
                              <p className={`font-bold ${evento.tipo === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {evento.valor.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Eventos Atrasados */}
            <TabsContent value="atrasados" className="space-y-4">
              {eventosAtrasados.map((evento) => (
                <Card key={evento.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <h3 className="text-lg font-semibold">{evento.titulo}</h3>
                          {getTipoBadge(evento.tipo)}
                          <Badge className="bg-red-100 text-red-800">Atrasado</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{evento.descricao}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">Data</p>
                            <p className="text-red-600 font-medium">{formatarData(evento.data)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Horário</p>
                            <p>{evento.hora}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Categoria</p>
                            <p>{evento.categoria}</p>
                          </div>
                          {evento.valor && (
                            <div>
                              <p className="font-medium text-gray-600">Valor</p>
                              <p className={`font-bold ${evento.tipo === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {evento.valor.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {eventosAtrasados.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum evento atrasado! 🎉</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Schedule;

