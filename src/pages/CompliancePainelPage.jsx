/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, RefreshCw, CheckCircle, Filter, Loader2, X, Upload, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

// Modal de Deliberação
const DeliberacaoModal = ({ alerta, onClose }) => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      novoStatus: 'FALSO_POSITIVO',
      justificativa: ''
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => api.compliance.deliberarAlerta(alerta.alertaId, data),
    onSuccess: () => {
      triggerToast('Alerta deliberado com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['alertasCompliance'] });
      onClose();
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="w-full max-w-lg mx-4 p-6 rounded-2xl animate-scale-up
                   bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60
                   shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-500" />
            Deliberar Alerta #{alerta.alertaId}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <p><strong className="text-slate-800 dark:text-slate-200">Cliente:</strong> {alerta.nomeCliente} ({alerta.cpfCnpj})</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Encontrado na Lista ({alerta.origemLista}):</strong> {alerta.nomeEncontradoLista}</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Score de Similaridade:</strong> {(alerta.scoreSimilaridade * 100).toFixed(0)}%</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label htmlFor="novoStatus">Veredito *</label>
            <select id="novoStatus" {...register('novoStatus', { required: true })}>
              <option value="FALSO_POSITIVO">FALSO POSITIVO (Liberar Cliente)</option>
              <option value="CONFIRMADO">SUSPEITA CONFIRMADA (Bloquear)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="justificativa">Justificativa *</label>
            <textarea 
              id="justificativa" 
              rows="4" 
              {...register('justificativa', { required: "Justificativa é obrigatória", minLength: { value: 10, message: "Mínimo de 10 caracteres." } })}
              placeholder="Descreva a base legal e as evidências para esta deliberação..."
            ></textarea>
            {errors.justificativa && <span className="text-xs text-rose-500 mt-1">{errors.justificativa.message}</span>}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Processando...' : 'Confirmar Deliberação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente do Cartão de Upload com suporte a drag-and-drop
const FileUploaderCard = ({ title, accept, description, onUpload, isPending, message }) => {
  const { triggerToast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const acceptedExtensions = accept.split(',').map(s => s.trim().toLowerCase());
    if (!acceptedExtensions.includes(ext)) {
      setFile(null);
      triggerToast(`Extensão de arquivo inválida. Esperado: ${accept}`, 'danger');
      return;
    }
    setFile(selectedFile);
  };

  const handleUploadSubmit = () => {
    if (!file) return;
    onUpload(file, () => {
      setFile(null);
    });
  };

  return (
    <div className="glass-panel p-5 space-y-4 flex flex-col justify-between">
      <div>
        <h4 className="font-title text-base font-bold text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative
          ${dragActive ? 'border-brand-500 bg-brand-500/10' : 'border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-600'}
        `}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={accept}
          onChange={handleChange}
          disabled={isPending}
          aria-label={`Upload de arquivo para ${title}`}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="w-8 h-8 text-slate-400" />
          {file ? (
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{file.name}</p>
          ) : (
            <>
              <p className="text-sm text-slate-500">Arraste e solte o arquivo aqui ou clique para selecionar</p>
              <p className="text-xs text-slate-400">Formatos aceitos: {accept}</p>
            </>
          )}
        </div>
      </div>

      {message && (
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
          {message}
        </p>
      )}

      <button 
        type="button" 
        className="btn btn-primary btn-block text-xs py-2" 
        disabled={!file || isPending}
        onClick={handleUploadSubmit}
      >
        {isPending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Processando arquivo...
          </>
        ) : (
          'Enviar Arquivo'
        )}
      </button>
    </div>
  );
};

// Aba de Configuração do Agendamento do Job
const ComplianceConfigSection = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const { data: configData, isLoading, error } = useQuery({
    queryKey: ['complianceConfig'],
    queryFn: () => api.compliance.getConfig()
  });

  const mutation = useMutation({
    mutationFn: (data) => api.compliance.updateConfig(data),
    onSuccess: () => {
      triggerToast('Configuração de agendamento atualizada com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['complianceConfig'] });
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  const { data: execucoes, isLoading: loadingExecucoes } = useQuery({
    queryKey: ['complianceExecucoes'],
    queryFn: () => api.compliance.listarExecucoes()
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  React.useEffect(() => {
    if (configData) {
      reset({
        frequencia: configData.frequencia || 'DIARIO',
        horario: configData.horario || '03:00'
      });
    }
  }, [configData, reset]);

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
        Erro ao carregar configurações: {error.message}
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-lg">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
        <Calendar className="w-5 h-5 text-brand-500" />
        <div>
          <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white">
            Configurar Processamento Automático
          </h3>
          <p className="text-xs text-slate-400">Configure a frequência e horário em que o Job de compliance cruza as listas restritivas com a base de clientes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="frequencia">Frequência de Execução *</label>
            <select id="frequencia" {...register('frequencia', { required: "Frequência é obrigatória" })}>
              <option value="DIARIO">Diário</option>
              <option value="SEMANAL">Semanal (Segunda-feira)</option>
              <option value="MENSAL">Mensal (Dia 1)</option>
            </select>
            {errors.frequencia && <span className="text-xs text-rose-500 mt-1">{errors.frequencia.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="horario">Horário de Disparo *</label>
            <input 
              type="time" 
              id="horario" 
              {...register('horario', { required: "Horário é obrigatório" })}
            />
            {errors.horario && <span className="text-xs text-rose-500 mt-1">{errors.horario.message}</span>}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p><strong>Expressão Cron Vigente:</strong> <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-600 dark:text-brand-400">{configData?.cronExpression}</code></p>
          {configData?.dataAtualizacao && (
            <p><strong>Última Atualização:</strong> {new Date(configData.dataAtualizacao).toLocaleString('pt-BR')}</p>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mutation.isPending ? 'Salvando...' : 'Salvar Configuração'}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
        <h4 className="text-md font-title font-bold text-slate-900 dark:text-white mb-4">
          Histórico de Execuções
        </h4>
        {loadingExecucoes ? (
          <div className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
        ) : (
          <div className="table-container text-xs">
            <table>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Gatilho</th>
                  <th>Duração</th>
                  <th>OFAC Status</th>
                  <th>Registros (OFAC/ONU/PEP/IBGE)</th>
                  <th>Erros</th>
                </tr>
              </thead>
              <tbody>
                {execucoes && execucoes.length > 0 ? (
                  execucoes.map(exec => (
                    <tr key={exec.id}>
                      <td className="whitespace-nowrap">{new Date(exec.dataExecucao).toLocaleString('pt-BR')}</td>
                      <td><span className="badge bg-slate-200 text-slate-700">{exec.triggerExecucao}</span></td>
                      <td>{exec.duracaoMs}ms</td>
                      <td>
                        {exec.ofacStatus === 'ONLINE' ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ONLINE</span>
                        ) : (
                          <span className="text-rose-500 font-bold">OFFLINE</span>
                        )}
                      </td>
                      <td className="font-mono text-[10px] text-slate-500">
                        {exec.ofacRegistros} / {exec.onuRegistros} / {exec.pepRegistros} / {exec.ibgeRegistros}
                      </td>
                      <td className="text-rose-500 max-w-[200px] truncate" title={exec.erros}>{exec.erros !== '[]' ? exec.erros : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-slate-500">Nenhum histórico de execução encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const CompliancePainelPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('alertas');
  const [alertaSelecionado, setAlertaSelecionado] = useState(null);

  const [filtroStatus, setFiltroStatus] = useState('PENDENTE_ANALISE');
  const [filtroOrigem, setFiltroOrigem] = useState('');

  // Estados locais para controle de uploads concluídos
  const [pepMessage, setPepMessage] = useState('');
  const [onuMessage, setOnuMessage] = useState('');
  const [ibgeMessage, setIbgeMessage] = useState('');

  const { data: alertasData, isLoading, error } = useQuery({
    queryKey: ['alertasCompliance', filtroStatus, filtroOrigem],
    queryFn: () => api.compliance.listarAlertas(filtroStatus, filtroOrigem),
    enabled: activeTab === 'alertas'
  });

  const { data: execucoes } = useQuery({
    queryKey: ['complianceExecucoes'],
    queryFn: () => api.compliance.listarExecucoes(),
    enabled: activeTab === 'upload' || activeTab === 'config'
  });

  const alertas = alertasData?.content || alertasData || [];

  const syncMutation = useMutation({
    mutationFn: () => api.compliance.sincronizar(),
    onSuccess: (data) => {
      triggerToast('Sincronização manual iniciada em background com sucesso.', 'success');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['alertasCompliance'] });
        queryClient.invalidateQueries({ queryKey: ['complianceExecucoes'] });
      }, 2000);
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  // Mutações de Upload
  const uploadPepMutation = useMutation({
    mutationFn: (file) => api.compliance.uploadPep(file),
    onSuccess: (data) => {
      triggerToast(data.mensagem || 'Arquivo PEP processado com sucesso.', 'success');
      setPepMessage(data.mensagem || 'Arquivo processado.');
      queryClient.invalidateQueries({ queryKey: ['alertasCompliance'] });
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  const uploadOnuMutation = useMutation({
    mutationFn: (file) => api.compliance.uploadOnu(file),
    onSuccess: (data) => {
      triggerToast(data.mensagem || 'Arquivo ONU processado com sucesso.', 'success');
      setOnuMessage(data.mensagem || 'Arquivo processado.');
      queryClient.invalidateQueries({ queryKey: ['alertasCompliance'] });
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  const uploadIbgeMutation = useMutation({
    mutationFn: (file) => api.compliance.uploadIbge(file),
    onSuccess: (data) => {
      triggerToast(data.mensagem || 'Arquivo IBGE processado com sucesso.', 'success');
      setIbgeMessage(data.mensagem || 'Arquivo processado.');
      queryClient.invalidateQueries({ queryKey: ['alertasCompliance'] });
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  const handleSincronizar = () => {
    syncMutation.mutate();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDENTE_ANALISE': return <span className="badge badge-warning">Pendente</span>;
      case 'FALSO_POSITIVO': return <span className="badge badge-success">Falso Positivo</span>;
      case 'CONFIRMADO': return <span className="badge badge-danger">Confirmado</span>;
      default: return <span className="badge bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Gestão de Compliance e PLD/FT
          </h2>
          <p className="text-sm text-slate-400 mt-1">Listas Restritivas e Processamento de Riscos</p>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex border-b border-slate-200 dark:border-slate-700/60">
        <button 
          role="tab"
          aria-selected={activeTab === 'alertas'}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === 'alertas' ? 'border-brand-500 text-brand-500 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('alertas')}
        >
          Alertas PLD/FT
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'upload'}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === 'upload' ? 'border-brand-500 text-brand-500 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('upload')}
        >
          Importar Listas
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'config'}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === 'config' ? 'border-brand-500 text-brand-500 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('config')}
        >
          Agendamento de Job
        </button>
      </div>

      {/* Conteúdo da Aba 1: Alertas */}
      {activeTab === 'alertas' && (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50 dark:bg-slate-900/20 border-b-0 rounded-b-none w-full">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Filtros:</span>
              </div>
              
              <select 
                aria-label="Filtrar por Status"
                className="form-input text-sm py-1.5 min-w-[200px]" 
                value={filtroStatus} 
                onChange={e => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="PENDENTE_ANALISE">Pendentes de Análise</option>
                <option value="FALSO_POSITIVO">Falsos Positivos</option>
                <option value="CONFIRMADO">Confirmados</option>
              </select>

              <select 
                aria-label="Filtrar por Lista de Origem"
                className="form-input text-sm py-1.5 min-w-[200px]" 
                value={filtroOrigem} 
                onChange={e => setFiltroOrigem(e.target.value)}
              >
                <option value="">Todas as Listas</option>
                <option value="OFAC">OFAC (EUA)</option>
                <option value="ONU">ONU</option>
                <option value="PEP">PEP (Portal Transparência)</option>
              </select>
            </div>
            
            <button 
              className="btn btn-outline min-w-[180px] shrink-0" 
              onClick={handleSincronizar}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sincronizar Bases
            </button>
          </div>

          {!isLoading && !error && alertas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-6">
                <h3 className="font-title font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 justify-center">
                  <PieChartIcon className="w-4 h-4 text-brand-500" /> Origem das Ocorrências
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(alertas.reduce((acc, a) => { acc[a.origemLista] = (acc[a.origemLista] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value"
                      >
                        {Object.entries(alertas.reduce((acc, a) => { acc[a.origemLista] = (acc[a.origemLista] || 0) + 1; return acc; }, {})).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#f43f5e'][index % 4]} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass-panel p-6">
                <h3 className="font-title font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 justify-center">
                  <PieChartIcon className="w-4 h-4 text-brand-500" /> Status de Deliberação
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(alertas.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value"
                      >
                        {Object.entries(alertas.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})).map((entry, index) => {
                          const statusColor = entry[0] === 'PENDENTE_ANALISE' ? '#f59e0b' : entry[0] === 'FALSO_POSITIVO' ? '#10b981' : '#f43f5e';
                          return <Cell key={`cell-${index}`} fill={statusColor} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />;
                        })}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3 mt-0">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
              Erro ao carregar alertas: {error.message}
            </div>
          ) : (
            <div className="glass-panel table-container mt-0 rounded-t-none border-t-0">
              <table>
                <thead>
                  <tr>
                    <th>ID Alerta</th>
                    <th>Cliente</th>
                    <th>Origem</th>
                    <th>Nome na Lista</th>
                    <th>Match</th>
                    <th>Status</th>
                    <th>Data Detecção</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(alertas) && alertas.map(a => (
                    <tr key={a.alertaId}>
                      <td className="font-mono text-xs text-slate-400">#{a.alertaId}</td>
                      <td className="font-semibold text-slate-900 dark:text-white">
                        <div>{a.nomeCliente}</div>
                        <div className="font-mono text-[10px] text-slate-400">{a.cpfCnpj}</div>
                      </td>
                      <td><span className="badge bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-bold">{a.origemLista}</span></td>
                      <td className="text-sm font-medium text-amber-700 dark:text-amber-500">{a.nomeEncontradoLista}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${a.scoreSimilaridade >= 0.95 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                              style={{ width: `${a.scoreSimilaridade * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {(a.scoreSimilaridade * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td>{getStatusBadge(a.status)}</td>
                      <td className="text-xs text-slate-500">{new Date(a.dataDeteccao).toLocaleString('pt-BR')}</td>
                      <td>
                        {a.status === 'PENDENTE_ANALISE' && (
                          <button 
                            className="btn btn-primary btn-xs"
                            onClick={() => setAlertaSelecionado(a)}
                          >
                            Deliberar
                          </button>
                        )}
                        {a.status !== 'PENDENTE_ANALISE' && (
                          <span className="text-xs text-slate-400 px-2">Analisado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {alertas.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-slate-500">
                        <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-3 opacity-50" />
                        <p className="text-lg font-semibold">Nenhum alerta encontrado</p>
                        <p className="text-sm mt-1">Sua base de clientes não possui correspondências nestes filtros.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Conteúdo da Aba 2: Importar Listas */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-title font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-500" /> Integração Automática (API OFAC)
              </h3>
              <p className="text-xs text-slate-500 mt-1">O download da lista de sanções (CONS_ADVANCED.XML) ocorre de forma transparente na rotina noturna.</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Último Status:</span>
              {execucoes && execucoes.length > 0 ? (
                execucoes[0].ofacStatus === 'ONLINE' ? (
                  <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> ONLINE
                  </span>
                ) : (
                  <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 font-bold">OFFLINE (Fallback)</span>
                )
              ) : (
                <span className="badge bg-slate-200 text-slate-600">Aguardando Execução...</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FileUploaderCard 
              title="Lista PEP (CSV)"
              accept=".csv"
              description="Carga de Pessoas Expostas Politicamente delimitada por ';' contendo CPFs e nomes."
              onUpload={(file, callback) => uploadPepMutation.mutate(file, { onSuccess: callback })}
              isPending={uploadPepMutation.isPending}
              message={pepMessage}
            />
            <FileUploaderCard 
              title="Lista ONU (XML)"
              accept=".xml"
              description="XML do Conselho de Segurança da ONU contendo indivíduos e entidades sob sanção."
              onUpload={(file, callback) => uploadOnuMutation.mutate(file, { onSuccess: callback })}
              isPending={uploadOnuMutation.isPending}
              message={onuMessage}
            />
            <FileUploaderCard 
              title="Lista IBGE (XLS/XLSX)"
              accept=".xls,.xlsx"
              description="Planilha XLS do IBGE com Municípios de Faixa de Fronteira e Cidades Gêmeas."
              onUpload={(file, callback) => uploadIbgeMutation.mutate(file, { onSuccess: callback })}
              isPending={uploadIbgeMutation.isPending}
              message={ibgeMessage}
            />
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 3: Agendamento */}
      {activeTab === 'config' && (
        <ComplianceConfigSection />
      )}

      {alertaSelecionado && (
        <DeliberacaoModal 
          alerta={alertaSelecionado} 
          onClose={() => setAlertaSelecionado(null)} 
        />
      )}
    </div>
  );
};
