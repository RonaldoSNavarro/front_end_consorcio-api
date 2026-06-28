import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Dice5, Save, Loader2, CheckCircle, CalendarDays } from 'lucide-react';

export const LoteriaFederalPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const [concurso, setConcurso] = useState('');
  const [dataSorteio, setDataSorteio] = useState('');
  const [premio1, setPremio1] = useState('');
  const [premio2, setPremio2] = useState('');
  const [premio3, setPremio3] = useState('');
  const [premio4, setPremio4] = useState('');
  const [premio5, setPremio5] = useState('');

  const { data: sorteiosData, isLoading } = useQuery({
    queryKey: ['loteria-federal'],
    queryFn: async () => {
      const data = await api.loteriaFederal.listar();
      return data;
    }
  });
  
  const sorteios = sorteiosData || [];

  const registrarMutation = useMutation({
    mutationFn: async (payload) => {
      const data = await api.loteriaFederal.registrar(payload);
      return data;
    },
    onSuccess: () => {
      triggerToast('Extrato da Loteria Federal registrado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['loteria-federal'] });
      setConcurso('');
      setDataSorteio('');
      setPremio1('');
      setPremio2('');
      setPremio3('');
      setPremio4('');
      setPremio5('');
    },
    onError: (err) => {
      triggerToast(err.response?.data?.message || err.message || 'Erro ao registrar extrato.', 'danger');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registrarMutation.mutate({
      concurso,
      dataSorteio,
      premio1,
      premio2,
      premio3,
      premio4,
      premio5
    });
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Dice5 className="w-7 h-7 text-brand-500" /> Sorteios Loteria Federal
        </h2>
        <p className="text-sm text-slate-400 mt-1">Registros oficiais de extrações para cálculo da Pedra Chave.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-title font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <CalendarDays className="w-4 h-4 text-brand-500" /> Registrar Extração
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label>Nº do Concurso</label>
                <input type="text" className="form-input" required value={concurso} onChange={e => setConcurso(e.target.value)} placeholder="Ex: 5824" />
              </div>
              <div className="form-group">
                <label>Data do Sorteio</label>
                <input type="date" className="form-input" required value={dataSorteio} onChange={e => setDataSorteio(e.target.value)} />
              </div>
              
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                <div className="form-group flex items-center gap-3">
                  <label className="w-20 text-xs font-bold text-slate-500">1º Prêmio</label>
                  <input type="text" className="form-input font-mono" required maxLength="6" value={premio1} onChange={e => setPremio1(e.target.value)} placeholder="00000" />
                </div>
                <div className="form-group flex items-center gap-3">
                  <label className="w-20 text-xs font-bold text-slate-500">2º Prêmio</label>
                  <input type="text" className="form-input font-mono" required maxLength="6" value={premio2} onChange={e => setPremio2(e.target.value)} placeholder="00000" />
                </div>
                <div className="form-group flex items-center gap-3">
                  <label className="w-20 text-xs font-bold text-slate-500">3º Prêmio</label>
                  <input type="text" className="form-input font-mono" required maxLength="6" value={premio3} onChange={e => setPremio3(e.target.value)} placeholder="00000" />
                </div>
                <div className="form-group flex items-center gap-3">
                  <label className="w-20 text-xs font-bold text-slate-500">4º Prêmio</label>
                  <input type="text" className="form-input font-mono" required maxLength="6" value={premio4} onChange={e => setPremio4(e.target.value)} placeholder="00000" />
                </div>
                <div className="form-group flex items-center gap-3">
                  <label className="w-20 text-xs font-bold text-slate-500">5º Prêmio</label>
                  <input type="text" className="form-input font-mono" required maxLength="6" value={premio5} onChange={e => setPremio5(e.target.value)} placeholder="00000" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block mt-4" disabled={registrarMutation.isPending}>
                {registrarMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Registrar Sorteio
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-panel p-6">
            <h3 className="font-title font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4">
              <CheckCircle className="w-4 h-4 text-brand-500" /> Extratos Registrados
            </h3>

            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
            ) : sorteios.length === 0 ? (
              <p className="text-center text-slate-400 p-8 text-sm">Nenhum registro encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Concurso</th>
                      <th>Data</th>
                      <th>1º Prêmio</th>
                      <th>2º Prêmio</th>
                      <th>3º Prêmio</th>
                      <th>4º Prêmio</th>
                      <th>5º Prêmio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorteios.map(s => (
                      <tr key={s.id}>
                        <td className="font-bold text-slate-700 dark:text-slate-300">#{s.concurso}</td>
                        <td className="text-slate-500">{new Date(s.dataSorteio + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="font-mono text-brand-600 dark:text-brand-400 font-bold">{s.premio1}</td>
                        <td className="font-mono text-slate-500">{s.premio2}</td>
                        <td className="font-mono text-slate-500">{s.premio3}</td>
                        <td className="font-mono text-slate-500">{s.premio4}</td>
                        <td className="font-mono text-slate-500">{s.premio5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
