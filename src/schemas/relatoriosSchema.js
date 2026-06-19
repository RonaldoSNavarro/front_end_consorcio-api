import { z } from 'zod';

// Esquema para o filtro do relatório PLD/FT
export const pldFtFiltroSchema = z.object({
  dataInicio: z.string().min(1, "A data inicial é obrigatória"),
  dataFim: z.string().min(1, "A data final é obrigatória"),
}).refine((data) => {
  const inicio = new Date(data.dataInicio);
  const fim = new Date(data.dataFim);
  return inicio <= fim;
}, {
  message: "A data inicial não pode ser maior que a data final",
  path: ["dataInicio"], // Exibe o erro no campo dataInicio
});

// Esquema para o filtro do Balancete Contábil
export const balanceteFiltroSchema = z.object({
  grupoId: z.coerce.number().min(1, "Selecione um grupo válido"),
  dataReferencia: z.string().optional()
});

// Esquema para o filtro de Estatísticas do Grupo
export const estatisticasFiltroSchema = z.object({
  grupoId: z.coerce.number().min(1, "Selecione um grupo válido"),
  dataInicio: z.string().min(1, "A data inicial é obrigatória"),
  dataFim: z.string().min(1, "A data final é obrigatória"),
}).refine((data) => {
  const inicio = new Date(data.dataInicio);
  const fim = new Date(data.dataFim);
  return inicio <= fim;
}, {
  message: "A data inicial não pode ser maior que a data final",
  path: ["dataInicio"],
});
