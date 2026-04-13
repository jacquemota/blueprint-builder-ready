// ========================
// Validation utilities
// ========================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ---------- Nome (Responsável / Funcionário) ----------

const NAME_REGEX = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]*$/;

export function validateNome(value: string): ValidationResult {
  const v = value.trim().replace(/\s{2,}/g, ' ');
  if (!v) return { valid: false, error: 'Nome é obrigatório.' };
  if (v.length < 5) return { valid: false, error: 'Nome deve ter pelo menos 5 caracteres.' };
  if (v.length > 120) return { valid: false, error: 'Nome deve ter no máximo 120 caracteres.' };
  const words = v.split(/\s+/).filter(Boolean);
  if (words.length < 2) return { valid: false, error: 'Informe nome e sobrenome (mínimo 2 palavras).' };
  if (!NAME_REGEX.test(v)) return { valid: false, error: 'Nome não pode conter números ou caracteres especiais.' };
  return { valid: true };
}

// ---------- CPF ----------

export function validateCPF(raw: string): ValidationResult {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return { valid: false, error: 'CPF é obrigatório.' };
  if (digits.length !== 11) return { valid: false, error: 'CPF deve ter exatamente 11 dígitos.' };
  // Reject all-same digits
  if (/^(\d)\1{10}$/.test(digits)) return { valid: false, error: 'CPF inválido (dígitos repetidos).' };
  // Verifier digits
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * (len + 1 - i);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  if (calc(9) !== Number(digits[9]) || calc(10) !== Number(digits[10])) {
    return { valid: false, error: 'CPF inválido.' };
  }
  return { valid: true };
}

export function formatCPF(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function cleanCPF(raw: string): string {
  return raw.replace(/\D/g, '');
}

// ---------- Telefone ----------

const VALID_DDDS = [
  11,12,13,14,15,16,17,18,19, // SP
  21,22,24, // RJ
  27,28, // ES
  31,32,33,34,35,37,38, // MG
  41,42,43,44,45,46, // PR
  47,48,49, // SC
  51,53,54,55, // RS
  61, // DF
  62,64, // GO
  63, // TO
  65,66, // MT
  67, // MS
  68, // AC
  69, // RO
  71,73,74,75,77, // BA
  79, // SE
  81,87, // PE
  82, // AL
  83, // PB
  84, // RN
  85,88, // CE
  86,89, // PI
  91,93,94, // PA
  92,97, // AM
  95, // RR
  96, // AP
  98,99, // MA
];

export function validateTelefone(raw: string): ValidationResult {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return { valid: false, error: 'Telefone é obrigatório.' };
  if (digits.length < 10 || digits.length > 11) return { valid: false, error: 'Telefone deve ter 10 ou 11 dígitos.' };
  const ddd = Number(digits.slice(0, 2));
  if (!VALID_DDDS.includes(ddd)) return { valid: false, error: `DDD ${ddd} inválido.` };
  return { valid: true };
}

export function formatTelefone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function cleanTelefone(raw: string): string {
  return raw.replace(/\D/g, '');
}

// ---------- Endereço ----------

export function validateEndereco(value: string): ValidationResult {
  const v = value.trim().replace(/\s{2,}/g, ' ');
  if (!v) return { valid: false, error: 'Endereço é obrigatório.' };
  if (v.length < 5) return { valid: false, error: 'Endereço deve ter pelo menos 5 caracteres.' };
  if (v.length > 200) return { valid: false, error: 'Endereço deve ter no máximo 200 caracteres.' };
  return { valid: true };
}

// ---------- Números de moradores ----------

export function validateMoradores(total: number, criancas: number, idosos: number): ValidationResult {
  if (!Number.isInteger(total) || total < 1) return { valid: false, error: 'Total de moradores deve ser no mínimo 1.' };
  if (!Number.isInteger(criancas) || criancas < 0) return { valid: false, error: 'Número de crianças não pode ser negativo.' };
  if (!Number.isInteger(idosos) || idosos < 0) return { valid: false, error: 'Número de idosos não pode ser negativo.' };
  if (criancas > total) return { valid: false, error: 'Crianças não podem exceder o total de moradores.' };
  if (idosos > total) return { valid: false, error: 'Idosos não podem exceder o total de moradores.' };
  if (criancas + idosos > total) return { valid: false, error: 'Soma de crianças e idosos não pode exceder o total de moradores.' };
  return { valid: true };
}

// ---------- Email ----------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): ValidationResult {
  const v = value.trim().toLowerCase();
  if (!v) return { valid: false, error: 'E-mail é obrigatório.' };
  if (v.length > 255) return { valid: false, error: 'E-mail deve ter no máximo 255 caracteres.' };
  if (!EMAIL_REGEX.test(v)) return { valid: false, error: 'E-mail inválido.' };
  return { valid: true };
}

// ---------- Senha ----------

export function validateSenha(value: string): ValidationResult {
  if (!value) return { valid: false, error: 'Senha é obrigatória.' };
  if (value.length < 8) return { valid: false, error: 'Senha deve ter pelo menos 8 caracteres.' };
  if (!/[A-Z]/.test(value)) return { valid: false, error: 'Senha deve conter pelo menos uma letra maiúscula.' };
  if (!/[a-z]/.test(value)) return { valid: false, error: 'Senha deve conter pelo menos uma letra minúscula.' };
  if (!/\d/.test(value)) return { valid: false, error: 'Senha deve conter pelo menos um número.' };
  return { valid: true };
}

// ---------- Sanitize ----------

export function sanitize(value: string): string {
  return value.trim().replace(/\s{2,}/g, ' ');
}
