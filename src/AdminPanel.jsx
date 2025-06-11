import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  Users, Settings, Plus, Edit, Trash2, Eye, EyeOff,
  Shield, UserCheck, UserX, Calendar, LogOut, ArrowLeft,
  Activity, Database, Bell, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/LOGO.png';

const AdminPanel = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Estados para admin
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nome: 'Felipe Administrador',
      email: 'felipegyyn@gmail.com',
      perfil: 'admin',
      status: 'ativo',
      ultimo_login: '2024-06-22 14:30',
      data_criacao: '2024-01-15',
      modulos_acesso: ['todos']
    },
    {
      id: 2,
      nome: 'Maria Silva',
      email: 'maria.silva@empresa.com',
      perfil: 'usuario',
      status: 'ativo',
      ultimo_login: '2024-06-21 09:15',
      data_criacao: '2024-03-10',
      modulos_acesso: ['dashboard', 'planejamento', 'lancamentos']
    },
    {
      id: 3,
      nome: 'João Santos',
      email: 'joao.santos@empresa.com',
      perfil: 'usuario',
      status: 'inativo',
      ultimo_login: '2024-06-18 16:45',
      data_criacao: '2024-02-20',
      modulos_acesso: ['dashboard', 'investimentos']
    }
  ]);

  const [configuracoes, setConfiguracoes] = useState({
    nome_sistema: 'Simplific Pro',
    versao: '1.0.0',
    manutencao: false,
    backup_automatico: true,
    notificacoes_email: true,
    limite_usuarios: 50,
    sessao_timeout: 30,
    log_nivel: 'info'
  });

  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    perfil: '',
    senha: ''
  });

  // Funções do Admin
  const visualizarUsuario = (usuario) => {
    alert(`Visualizando usuário: ${usuario.nome}\nEmail: ${usuario.email}\nPerfil: ${usuario.perfil}`);
  };

  const editarUsuario = (usuario) => {
    const novoNome = prompt('Novo nome:', usuario.nome);
    if (novoNome) {
      const usuariosAtualizados = usuarios.map(u => 
        u.id === usuario.id ? { ...u, nome: novoNome } : u
      );
      setUsuarios(usuariosAtualizados);
      alert('Usuário atualizado com sucesso!');
    }
  };

  const alterarStatusUsuario = (usuario) => {
    const novoStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';
    const usuariosAtualizados = usuarios.map(u => 
      u.id === usuario.id ? { ...u, status: novoStatus } : u
    );
    setUsuarios(usuariosAtualizados);
    alert(`Usuário ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
  };

  const excluirUsuario = (usuario) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      const usuariosAtualizados = usuarios.filter(u => u.id !== usuario.id);
      setUsuarios(usuariosAtualizados);
      alert('Usuário excluído com sucesso!');
    }
  };

  const criarUsuario = () => {
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.perfil) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const novoId = Math.max(...usuarios.map(u => u.id)) + 1;
    const usuarioParaCriar = {
      id: novoId,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      perfil: novoUsuario.perfil,
      status: 'ativo',
      ultimo_login: 'Nunca',
      data_criacao: new Date().toISOString().split('T')[0],
      modulos_acesso: ['dashboard']
    };

    setUsuarios([...usuarios, usuarioParaCriar]);
    setNovoUsuario({ nome: '', email: '', perfil: '', senha: '' });
    alert('Usuário criado com sucesso!');
  };

  const salvarConfiguracoes = () => {
    alert('Configurações salvas com sucesso!');
  };

  const alterarModoManutencao = () => {
    setConfiguracoes(prev => ({
      ...prev,
      manutencao: !prev.manutencao
    }));
    alert(`Modo manutenção ${!configuracoes.manutencao ? 'ativado' : 'desativado'}!`);
  };

  const alterarBackupAutomatico = () => {
    setConfiguracoes(prev => ({
      ...prev,
      backup_automatico: !prev.backup_automatico
    }));
    alert(`Backup automático ${!configuracoes.backup_automatico ? 'ativado' : 'desativado'}!`);
  };

  // Estatísticas do sistema
  const totalUsuarios = usuarios.length;
  const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length;
  const loginsHoje = usuarios.filter(u => {
    const hoje = new Date().toISOString().split('T')[0];
    return u.ultimo_login.startsWith(hoje);
  }).length;
  const novosUsuariosMes = usuarios.filter(u => {
    const mesAtual = new Date().toISOString().slice(0, 7);
    return u.data_criacao.startsWith(mesAtual);
  }).length;

  const getPerfilBadge = (perfil) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      usuario: 'bg-blue-100 text-blue-800',
      visualizador: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      admin: 'Administrador',
      usuario: 'Usuário',
      visualizador: 'Visualizador'
    };
    return <Badge className={colors[perfil]}>{labels[perfil]}</Badge>;
  };

  const getStatusBadge = (status) => {
    return status === 'ativo' ? 
      <Badge className="bg-green-100 text-green-800">Ativo</Badge> :
      <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              <h1 className="text-xl font-semibold text-gray-900">Painel Administrativo</h1>
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
            <h2 className="text-2xl font-bold text-gray-900">Painel Administrativo</h2>
            <p className="text-gray-600">Gerencie usuários e configurações do sistema</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Usuários</p>
                    <p className="text-2xl font-bold text-blue-600">{totalUsuarios}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                    <p className="text-2xl font-bold text-green-600">{usuariosAtivos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Logins Hoje</p>
                    <p className="text-2xl font-bold text-purple-600">{loginsHoje}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Novos no Mês</p>
                    <p className="text-2xl font-bold text-orange-600">{novosUsuariosMes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="usuarios" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usuarios">Usuários</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            </TabsList>

            {/* Gestão de Usuários */}
            <TabsContent value="usuarios" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gestão de Usuários</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>

              <div className="grid gap-6">
                {usuarios.map((usuario) => (
                  <Card key={usuario.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{usuario.nome}</h3>
                            {getPerfilBadge(usuario.perfil)}
                            {getStatusBadge(usuario.status)}
                          </div>
                          <p className="text-gray-600 mb-3">{usuario.email}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-600">Último Login</p>
                              <p>{formatarData(usuario.ultimo_login)}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600">Data Criação</p>
                              <p>{new Date(usuario.data_criacao).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600">Perfil</p>
                              <p className="capitalize">{usuario.perfil}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600">Módulos</p>
                              <p>{usuario.modulos_acesso.includes('todos') ? 'Todos' : usuario.modulos_acesso.length}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => visualizarUsuario(usuario)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => editarUsuario(usuario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {usuario.status === 'ativo' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => alterarStatusUsuario(usuario)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => alterarStatusUsuario(usuario)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => excluirUsuario(usuario)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Formulário de Novo Usuário */}
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input 
                        id="nome" 
                        placeholder="Digite o nome completo"
                        value={novoUsuario.nome}
                        onChange={(e) => setNovoUsuario(prev => ({...prev, nome: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="usuario@email.com"
                        value={novoUsuario.email}
                        onChange={(e) => setNovoUsuario(prev => ({...prev, email: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="perfil">Perfil</Label>
                      <Select value={novoUsuario.perfil} onValueChange={(value) => setNovoUsuario(prev => ({...prev, perfil: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="usuario">Usuário</SelectItem>
                          <SelectItem value="visualizador">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="senha">Senha Temporária</Label>
                      <Input 
                        id="senha" 
                        type="password" 
                        placeholder="Senha temporária"
                        value={novoUsuario.senha}
                        onChange={(e) => setNovoUsuario(prev => ({...prev, senha: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={criarUsuario}>Criar Usuário</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações do Sistema */}
            <TabsContent value="configuracoes" className="space-y-6">
              <h3 className="text-lg font-semibold">Configurações do Sistema</h3>

              <div className="grid gap-6">
                {/* Informações Gerais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Informações Gerais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome_sistema">Nome do Sistema</Label>
                        <Input id="nome_sistema" value={configuracoes.nome_sistema} readOnly />
                      </div>
                      <div>
                        <Label htmlFor="versao">Versão</Label>
                        <Input id="versao" value={configuracoes.versao} readOnly />
                      </div>
                      <div>
                        <Label htmlFor="limite_usuarios">Limite de Usuários</Label>
                        <Input id="limite_usuarios" type="number" value={configuracoes.limite_usuarios} />
                      </div>
                      <div>
                        <Label htmlFor="sessao_timeout">Timeout da Sessão (min)</Label>
                        <Input id="sessao_timeout" type="number" value={configuracoes.sessao_timeout} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Segurança */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Modo Manutenção</p>
                          <p className="text-sm text-gray-600">Bloqueia acesso de usuários não-admin</p>
                        </div>
                        <Button 
                          variant={configuracoes.manutencao ? "destructive" : "outline"}
                          onClick={alterarModoManutencao}
                        >
                          {configuracoes.manutencao ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Backup Automático</p>
                          <p className="text-sm text-gray-600">Backup diário dos dados</p>
                        </div>
                        <Button 
                          variant={configuracoes.backup_automatico ? "default" : "outline"}
                          onClick={alterarBackupAutomatico}
                        >
                          {configuracoes.backup_automatico ? "Ativo" : "Inativo"}
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor="log_nivel">Nível de Log</Label>
                        <Select value={configuracoes.log_nivel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debug">Debug</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notificações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notificações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificações por Email</p>
                          <p className="text-sm text-gray-600">Enviar alertas importantes por email</p>
                        </div>
                        <Button variant={configuracoes.notificacoes_email ? "default" : "outline"}>
                          {configuracoes.notificacoes_email ? "Ativo" : "Inativo"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Banco de Dados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Banco de Dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="text-lg font-bold text-green-600">Conectado</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tamanho</p>
                        <p className="text-lg font-bold text-blue-600">2.4 MB</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Último Backup</p>
                        <p className="text-lg font-bold text-purple-600">Hoje</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Fazer Backup
                      </Button>
                      <Button variant="outline">
                        <Activity className="h-4 w-4 mr-2" />
                        Ver Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={salvarConfiguracoes}>Salvar Configurações</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;

