export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: 'Administrador' | 'Funcionário';
  ativo: boolean;
  criadoEm: string;
}

export interface Familia {
  id: string;
  responsavel: string;
  cpf: string;
  telefone: string;
  endereco: string;
  bairro: string;
  comunidade: string;
  numMoradores: number;
  numCriancas: number;
  numIdosos: number;
  situacaoSocial: string;
  criadoEm: string;
}

export interface Atendimento {
  id: string;
  familiaId: string;
  tipoAtendimento: 'Fisioterapia' | 'Assistente Social' | 'Orientação Social' | 'Outros';
  profissionalId: string;
  dataAtendimento: string;
  observacoes: string;
  criadoEm: string;
}

export interface CestaBasica {
  id: string;
  familiaId: string;
  dataEntrega: string;
  quantidade: number;
  observacoes: string;
  criadoEm: string;
}

export interface Atividade {
  id: string;
  nomeAtividade: string;
  dataAtividade: string;
  responsavelId: string;
  criadoEm: string;
}

export interface ParticipanteAtividade {
  id: string;
  atividadeId: string;
  familiaId: string;
  nomeParticipante: string;
}

export type UserRole = 'Administrador' | 'Funcionário';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  cargo: UserRole;
}
