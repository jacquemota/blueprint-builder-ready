import type { Funcionario, Familia, Atendimento, CestaBasica, Atividade, ParticipanteAtividade } from '@/types';

export const funcionariosMock: Funcionario[] = [
  { id: '1', nome: 'Ana Carolina Silva', email: 'ana@maisquesocial.org', cargo: 'Administrador', ativo: true, criadoEm: '2024-01-15' },
  { id: '2', nome: 'Carlos Eduardo Santos', email: 'carlos@maisquesocial.org', cargo: 'Funcionário', ativo: true, criadoEm: '2024-02-10' },
  { id: '3', nome: 'Maria Fernanda Lima', email: 'maria@maisquesocial.org', cargo: 'Funcionário', ativo: true, criadoEm: '2024-03-05' },
  { id: '4', nome: 'João Pedro Oliveira', email: 'joao@maisquesocial.org', cargo: 'Funcionário', ativo: false, criadoEm: '2024-01-20' },
];

export const familiasMock: Familia[] = [
  { id: '1', responsavel: 'Maria da Silva', cpf: '123.456.789-00', telefone: '(82) 99999-0001', endereco: 'Rua das Flores, 123', bairro: 'Vergel do Lago', comunidade: 'Grota do Rafael', numMoradores: 5, numCriancas: 2, numIdosos: 1, situacaoSocial: 'Vulnerabilidade', criadoEm: '2024-03-10' },
  { id: '2', responsavel: 'José Santos', cpf: '987.654.321-00', telefone: '(82) 99999-0002', endereco: 'Travessa São Jorge, 45', bairro: 'Benedito Bentes', comunidade: 'Grota do Cigano', numMoradores: 4, numCriancas: 1, numIdosos: 0, situacaoSocial: 'Risco Social', criadoEm: '2024-03-15' },
  { id: '3', responsavel: 'Ana Paula Ferreira', cpf: '111.222.333-44', telefone: '(82) 99999-0003', endereco: 'Rua do Sol, 78', bairro: 'Jacintinho', comunidade: 'Grota da Alegria', numMoradores: 6, numCriancas: 3, numIdosos: 1, situacaoSocial: 'Vulnerabilidade', criadoEm: '2024-04-01' },
  { id: '4', responsavel: 'Francisco Almeida', cpf: '555.666.777-88', telefone: '(82) 99999-0004', endereco: 'Av. Principal, 200', bairro: 'Tabuleiro do Martins', comunidade: 'Comunidade Nova', numMoradores: 3, numCriancas: 1, numIdosos: 0, situacaoSocial: 'Acompanhamento', criadoEm: '2024-04-10' },
  { id: '5', responsavel: 'Luzia Ribeiro', cpf: '999.888.777-66', telefone: '(82) 99999-0005', endereco: 'Beco da Paz, 10', bairro: 'Vergel do Lago', comunidade: 'Grota do Rafael', numMoradores: 7, numCriancas: 4, numIdosos: 2, situacaoSocial: 'Vulnerabilidade', criadoEm: '2024-05-01' },
  { id: '6', responsavel: 'Pedro Costa', cpf: '222.333.444-55', telefone: '(82) 99999-0006', endereco: 'Rua Nova, 55', bairro: 'Benedito Bentes', comunidade: 'Vila União', numMoradores: 4, numCriancas: 2, numIdosos: 0, situacaoSocial: 'Risco Social', criadoEm: '2024-05-15' },
];

export const atendimentosMock: Atendimento[] = [
  { id: '1', familiaId: '1', tipoAtendimento: 'Assistente Social', profissionalId: '2', dataAtendimento: '2024-06-10', observacoes: 'Primeira visita domiciliar realizada.', criadoEm: '2024-06-10' },
  { id: '2', familiaId: '2', tipoAtendimento: 'Fisioterapia', profissionalId: '3', dataAtendimento: '2024-06-12', observacoes: 'Sessão de fisioterapia para idoso.', criadoEm: '2024-06-12' },
  { id: '3', familiaId: '3', tipoAtendimento: 'Orientação Social', profissionalId: '2', dataAtendimento: '2024-06-15', observacoes: 'Orientação sobre programas de governo.', criadoEm: '2024-06-15' },
  { id: '4', familiaId: '1', tipoAtendimento: 'Fisioterapia', profissionalId: '3', dataAtendimento: '2024-07-01', observacoes: 'Acompanhamento mensal.', criadoEm: '2024-07-01' },
  { id: '5', familiaId: '5', tipoAtendimento: 'Assistente Social', profissionalId: '2', dataAtendimento: '2024-07-05', observacoes: 'Avaliação socioeconômica.', criadoEm: '2024-07-05' },
  { id: '6', familiaId: '4', tipoAtendimento: 'Outros', profissionalId: '3', dataAtendimento: '2024-07-10', observacoes: 'Encaminhamento para CRAS.', criadoEm: '2024-07-10' },
  { id: '7', familiaId: '6', tipoAtendimento: 'Assistente Social', profissionalId: '2', dataAtendimento: '2024-07-15', observacoes: 'Cadastro no CadÚnico.', criadoEm: '2024-07-15' },
  { id: '8', familiaId: '2', tipoAtendimento: 'Orientação Social', profissionalId: '2', dataAtendimento: '2024-08-01', observacoes: 'Orientação sobre benefícios.', criadoEm: '2024-08-01' },
];

export const cestasMock: CestaBasica[] = [
  { id: '1', familiaId: '1', dataEntrega: '2024-06-01', quantidade: 1, observacoes: '', criadoEm: '2024-06-01' },
  { id: '2', familiaId: '2', dataEntrega: '2024-06-01', quantidade: 1, observacoes: '', criadoEm: '2024-06-01' },
  { id: '3', familiaId: '3', dataEntrega: '2024-06-15', quantidade: 1, observacoes: 'Entrega extra por situação emergencial.', criadoEm: '2024-06-15' },
  { id: '4', familiaId: '5', dataEntrega: '2024-07-01', quantidade: 2, observacoes: 'Família grande.', criadoEm: '2024-07-01' },
  { id: '5', familiaId: '1', dataEntrega: '2024-07-01', quantidade: 1, observacoes: '', criadoEm: '2024-07-01' },
  { id: '6', familiaId: '4', dataEntrega: '2024-07-15', quantidade: 1, observacoes: '', criadoEm: '2024-07-15' },
  { id: '7', familiaId: '6', dataEntrega: '2024-08-01', quantidade: 1, observacoes: '', criadoEm: '2024-08-01' },
  { id: '8', familiaId: '2', dataEntrega: '2024-08-01', quantidade: 1, observacoes: '', criadoEm: '2024-08-01' },
];

export const atividadesMock: Atividade[] = [
  { id: '1', nomeAtividade: 'Grupo de Idosos', dataAtividade: '2024-06-05', responsavelId: '3', criadoEm: '2024-06-05' },
  { id: '2', nomeAtividade: 'Atividades Infantis', dataAtividade: '2024-06-10', responsavelId: '2', criadoEm: '2024-06-10' },
  { id: '3', nomeAtividade: 'Roda de Conversa', dataAtividade: '2024-06-20', responsavelId: '3', criadoEm: '2024-06-20' },
  { id: '4', nomeAtividade: 'Oficina de Artes', dataAtividade: '2024-07-05', responsavelId: '2', criadoEm: '2024-07-05' },
  { id: '5', nomeAtividade: 'Grupo de Idosos', dataAtividade: '2024-07-12', responsavelId: '3', criadoEm: '2024-07-12' },
];

export const participantesMock: ParticipanteAtividade[] = [
  { id: '1', atividadeId: '1', familiaId: '1', nomeParticipante: 'Dona Luzia (avó)' },
  { id: '2', atividadeId: '1', familiaId: '5', nomeParticipante: 'Sr. Antônio' },
  { id: '3', atividadeId: '2', familiaId: '1', nomeParticipante: 'Lucas Silva' },
  { id: '4', atividadeId: '2', familiaId: '3', nomeParticipante: 'Ana Júlia' },
  { id: '5', atividadeId: '3', familiaId: '2', nomeParticipante: 'José Santos' },
  { id: '6', atividadeId: '4', familiaId: '6', nomeParticipante: 'Marina Costa' },
  { id: '7', atividadeId: '5', familiaId: '5', nomeParticipante: 'Sr. Antônio' },
];

export const bairrosMock = ['Vergel do Lago', 'Benedito Bentes', 'Jacintinho', 'Tabuleiro do Martins', 'Clima Bom', 'Cidade Universitária'];

export const comunidadesMock: Record<string, string[]> = {
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
