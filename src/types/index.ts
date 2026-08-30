export type StatusCota = 'DISPONIVEL' | 'RESERVADA' | 'ATIVA' | 'CONTEMPLADA' | 'CANCELADA' | 'QUITADA';

export type StatusParcela = 'PENDENTE' | 'PAGA' | 'ATRASADA' | 'CANCELADA';

export type TipoLance = 'EMBUTIDO' | 'FIRME' | 'MISTO' | 'FGTS' | 'SEGURO_OBITO';

export type ModalidadeLance = 'LIVRE' | 'FIXO';

export interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone?: string;
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
}

export interface Grupo {
  id: number;
  codigoGrupo: string;
  descricao?: string;
  valorCredito: number;
  prazoMeses: number;
  taxaAdministracao: number;
  fundoReserva: number;
  status: 'FORMACAO' | 'ANDAMENTO' | 'ENCERRADO';
}

export interface Cota {
  id: number;
  codigoCota: number;
  grupoId: number;
  clienteId?: number;
  status: StatusCota;
  versao: number;
}

export interface Parcela {
  id: number;
  cotaId: number;
  numeroParcela: number;
  valorParcela: number;
  dataVencimento: string;
  status: StatusParcela;
  valorPago?: number;
  dataPagamento?: string;
}

export interface Assembleia {
  id: number;
  grupoId: number;
  numeroAssembleia: number;
  dataAssembleia: string;
  status: 'AGENDADA' | 'EM_ANDAMENTO' | 'ENCERRADA' | 'CANCELADA';
  cotaSorteadaId?: number;
}