import type { Tables, Enums } from '@/integrations/supabase/types';

// Database row types
export type Familia = Tables<'familias'>;
export type Atendimento = Tables<'atendimentos'>;
export type EntregaCesta = Tables<'entregas_cestas'>;
export type Atividade = Tables<'atividades'>;
export type ParticipanteAtividade = Tables<'participantes_atividade'>;
export type MembroFamilia = Tables<'membros_familia'>;
export type Profile = Tables<'profiles'>;
export type UserRole = Tables<'user_roles'>;
export type LogAuditoria = Tables<'logs_auditoria'>;

export type AppRole = Enums<'app_role'>;

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: AppRole;
}

// Static data
export const bairrosList = ['Vergel do Lago', 'Benedito Bentes', 'Jacintinho', 'Tabuleiro do Martins', 'Clima Bom', 'Cidade Universitária'];

export const comunidadesMap: Record<string, string[]> = {
  'Vergel do Lago': ['Grota do Rafael', 'Grota da Alegria', 'Vila dos Pescadores'],
  'Benedito Bentes': ['Grota do Cigano', 'Vila União', 'Conjunto Frei Damião'],
  'Jacintinho': ['Grota da Alegria', 'Grota do Aterro', 'Vila Emater'],
  'Tabuleiro do Martins': ['Comunidade Nova', 'Vila Esperança'],
  'Clima Bom': ['Grota da Macaxeira', 'Vila Verde'],
  'Cidade Universitária': ['Comunidade Universitária'],
};

export const tiposAtendimento = ['Fisioterapia', 'Assistente Social', 'Orientação Social', 'Outros'] as const;
export const tiposAtividade = ['Grupo de Idosos', 'Atividades Infantis', 'Rodas de Conversa', 'Oficinas', 'Outros'] as const;
export const situacoesSociais = ['Vulnerabilidade', 'Risco Social', 'Acompanhamento', 'Estável'] as const;

export const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  assistente_social: 'Assistente Social',
  atendimento: 'Atendimento',
  consulta: 'Consulta',
  auditoria: 'Auditoria',
};
