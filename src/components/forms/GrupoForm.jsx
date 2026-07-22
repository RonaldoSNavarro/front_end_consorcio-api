import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Loader2 } from 'lucide-react';

const grupoSchema = z.object({
  codigo: z.string().min(3, "Código BCB deve ter pelo menos 3 caracteres"),
  taxaAdministracao: z.coerce.number().min(1, "A taxa de administração mínima permitida é 1%"),
  quantidadeCotas: z.coerce.number().min(1, "Quantidade de cotas inválida"),
  diaBaseAssembleias: z.coerce.number().min(1).max(31, "Dia inválido"),
  diasAntecedenciaVencimento: z.coerce.number().min(1, "Obrigatório"),
  prazosPermitidos: z.string().transform(v => v.split(',').map(n => Number(n.trim())).filter(n => n > 0)),
  bensPermitidos: z.array(z.string()).min(1, "Selecione ao menos um bem"),
  categoriaBem: z.string().min(1, "Categoria do bem é obrigatória"),
  valorCredito: z.coerce.number().min(1, "Valor do crédito é obrigatório e deve ser maior que zero"),
  prazoMeses: z.coerce.number().min(1, "Prazo em meses é obrigatório")
});

const FormField = ({ label, id, error, children, className = '' }) => (
  <div className={`form-group ${className}`}>
    <label htmlFor={id}>{label}</label>
    {children}
    {error && (
      <span id={`error-${id}`} className="error-text" role="alert">
        {error.message}
      </span>
    )}
  </div>
);

// eslint-disable-next-line react/prop-types
export const GrupoForm = ({ onClose }) => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const { data: bens = [] } = useQuery({
    queryKey: ['bens'],
    queryFn: () => api.bens.listar()
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(grupoSchema),
    defaultValues: {
      taxaAdministracao: 15,
      quantidadeCotas: 100,
      diaBaseAssembleias: 10,
      diasAntecedenciaVencimento: 5,
      prazosPermitidos: '36, 60, 72',
      bensPermitidos: [],
      categoriaBem: 'VEICULO_AUTOMOTOR',
      valorCredito: 60000,
      prazoMeses: 60
    }
  });

  const selectedCategoria = watch('categoriaBem');
  const bensFiltrados = bens.filter(bem => {
    if (!selectedCategoria) return true;
    const cat = bem.categoria || bem.categoriaBem;
    return !cat || cat === selectedCategoria;
  });

  const mutation = useMutation({
    mutationFn: (data) => api.grupos.salvar(data),
    onSuccess: () => {
      triggerToast("Grupo em Formação constituído com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
      onClose();
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const modalContent = (
    <div className="modal-backdrop flex items-center justify-center p-4 sm:p-6 z-[9999]" onClick={onClose}>
      <div 
        className="w-full max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl animate-scale-up
                   bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700/60
                   shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white">
              Novo Grupo Financeiro
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Constituição Segura de Grupo (Zod Validation)
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código do Grupo (BACEN) *" id="grupo-codigo" error={errors.codigo}>
              <input id="grupo-codigo" type="text" {...register('codigo')} placeholder="Ex: GRUPO-A12" aria-required="true" aria-invalid={!!errors.codigo} aria-describedby={errors.codigo ? 'error-grupo-codigo' : undefined} />
            </FormField>

            <FormField label="Quantidade de Cotas *" id="grupo-quantidade" error={errors.quantidadeCotas}>
              <input id="grupo-quantidade" type="number" {...register('quantidadeCotas')} aria-required="true" aria-invalid={!!errors.quantidadeCotas} aria-describedby={errors.quantidadeCotas ? 'error-grupo-quantidade' : undefined} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Valor do Crédito (R$) *" id="grupo-valor" error={errors.valorCredito}>
              <input id="grupo-valor" type="number" step="0.01" {...register('valorCredito')} aria-required="true" aria-invalid={!!errors.valorCredito} />
            </FormField>

            <FormField label="Prazo em Meses *" id="grupo-prazo" error={errors.prazoMeses}>
              <input id="grupo-prazo" type="number" {...register('prazoMeses')} aria-required="true" aria-invalid={!!errors.prazoMeses} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Taxa Admin (%) *" id="grupo-taxa" error={errors.taxaAdministracao}>
              <input id="grupo-taxa" type="number" step="0.01" {...register('taxaAdministracao')} aria-required="true" aria-invalid={!!errors.taxaAdministracao} aria-describedby={errors.taxaAdministracao ? 'error-grupo-taxa' : undefined} />
            </FormField>

            <FormField label="Dia Base Assemb. *" id="grupo-dia" error={errors.diaBaseAssembleias}>
              <input id="grupo-dia" type="number" {...register('diaBaseAssembleias')} aria-required="true" aria-invalid={!!errors.diaBaseAssembleias} aria-describedby={errors.diaBaseAssembleias ? 'error-grupo-dia' : undefined} />
            </FormField>

            <FormField label="Dias Ant. Vencimento *" id="grupo-ant" error={errors.diasAntecedenciaVencimento}>
              <input id="grupo-ant" type="number" {...register('diasAntecedenciaVencimento')} aria-required="true" aria-invalid={!!errors.diasAntecedenciaVencimento} aria-describedby={errors.diasAntecedenciaVencimento ? 'error-grupo-ant' : undefined} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Prazos Permitidos (meses separados por vírgula) *" id="grupo-prazos" error={errors.prazosPermitidos}>
              <input id="grupo-prazos" type="text" placeholder="Ex: 36, 60, 72" {...register('prazosPermitidos')} aria-required="true" aria-invalid={!!errors.prazosPermitidos} aria-describedby={errors.prazosPermitidos ? 'error-grupo-prazos' : undefined} />
            </FormField>

            <FormField label="Categoria do Bem *" id="grupo-categoria" error={errors.categoriaBem}>
              <select id="grupo-categoria" {...register('categoriaBem')} aria-required="true" aria-invalid={!!errors.categoriaBem} aria-describedby={errors.categoriaBem ? 'error-grupo-categoria' : undefined}>
                <option value="IMOVEL">Imóvel</option>
                <option value="VEICULO_AUTOMOTOR">Veículo Automotor</option>
                <option value="SERVICO">Serviço</option>
                <option value="OUTROS_BENS_MOVEIS">Outros Bens Móveis</option>
              </select>
            </FormField>
          </div>

          <FormField label="Bens Permitidos *" id="grupo-bens" error={errors.bensPermitidos}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {bensFiltrados.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum bem cadastrado para esta categoria.</p>
              ) : (
                bensFiltrados.map(bem => (
                  <label key={bem.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input type="checkbox" value={bem.id} {...register('bensPermitidos')} className="rounded border-slate-300" />
                    {bem.nome || bem.descricao}
                  </label>
                ))
              )}
            </div>
          </FormField>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50 mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Constituindo...' : 'Constituir Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
