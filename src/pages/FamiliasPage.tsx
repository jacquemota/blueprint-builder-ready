import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { bairrosList, comunidadesMap, situacoesSociais } from '@/types';
import type { Familia } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Eye, Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  validateNome, validateCPF, validateTelefone, validateEndereco, validateMoradores,
  formatCPF, formatTelefone, cleanCPF, cleanTelefone, sanitize,
} from '@/lib/validators';

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null;

const FamiliasPage = () => {
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterBairro, setFilterBairro] = useState('all');
  const [detailFamily, setDetailFamily] = useState<Familia | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Familia | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emptyForm = {
    responsavel: '', cpf: '', telefone: '', endereco: '', bairro: '', comunidade: '',
    numMoradores: '1', numCriancas: '0', numIdosos: '0', situacaoSocial: 'Estável',
  };
  const [form, setForm] = useState(emptyForm);

  const fetchFamilias = async () => {
    const { data, error } = await supabase.from('familias').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar famílias'); return; }
    setFamilias(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFamilias(); }, []);

  const filtered = useMemo(() => {
    return familias.filter(f => {
      const matchSearch = !search || f.responsavel.toLowerCase().includes(search.toLowerCase()) || f.cpf.includes(search.replace(/\D/g, ''));
      const matchBairro = filterBairro === 'all' || f.bairro === filterBairro;
      return matchSearch && matchBairro;
    });
  }, [familias, search, filterBairro]);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setErrors({}); };

  const openEdit = (f: Familia) => {
    setForm({
      responsavel: f.responsavel, cpf: formatCPF(f.cpf), telefone: formatTelefone(f.telefone),
      endereco: f.endereco, bairro: f.bairro, comunidade: f.comunidade,
      numMoradores: String(f.num_moradores), numCriancas: String(f.num_criancas),
      numIdosos: String(f.num_idosos), situacaoSocial: f.situacao_social,
    });
    setEditingId(f.id);
    setErrors({});
    setOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    const nomeResult = validateNome(form.responsavel);
    if (!nomeResult.valid) errs.responsavel = nomeResult.error!;

    const cpfResult = validateCPF(form.cpf);
    if (!cpfResult.valid) errs.cpf = cpfResult.error!;

    // Check CPF uniqueness
    if (cpfResult.valid) {
      const cpfClean = cleanCPF(form.cpf);
      const duplicate = familias.find(f => f.cpf === cpfClean && f.id !== editingId);
      if (duplicate) errs.cpf = 'CPF já cadastrado no sistema.';
    }

    const telResult = validateTelefone(form.telefone);
    if (!telResult.valid) errs.telefone = telResult.error!;

    const endResult = validateEndereco(form.endereco);
    if (!endResult.valid) errs.endereco = endResult.error!;

    if (!form.bairro) errs.bairro = 'Bairro é obrigatório.';

    const total = Number(form.numMoradores);
    const criancas = Number(form.numCriancas);
    const idosos = Number(form.numIdosos);
    const morResult = validateMoradores(total, criancas, idosos);
    if (!morResult.valid) errs.moradores = morResult.error!;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      responsavel: sanitize(form.responsavel),
      cpf: cleanCPF(form.cpf),
      telefone: cleanTelefone(form.telefone),
      endereco: sanitize(form.endereco),
      bairro: form.bairro,
      comunidade: form.comunidade,
      num_moradores: Number(form.numMoradores),
      num_criancas: Number(form.numCriancas),
      num_idosos: Number(form.numIdosos),
      situacao_social: form.situacaoSocial,
    };

    if (editingId) {
      const { error } = await supabase.from('familias').update(payload).eq('id', editingId);
      if (error) { toast.error('Erro ao atualizar: ' + error.message); setSubmitting(false); return; }
      toast.success('Família atualizada com sucesso!');
    } else {
      const { error } = await supabase.from('familias').insert(payload);
      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          toast.error('CPF já cadastrado no sistema.');
        } else {
          toast.error('Erro ao cadastrar: ' + error.message);
        }
        setSubmitting(false);
        return;
      }
      toast.success('Família cadastrada com sucesso!');
    }
    resetForm();
    setOpen(false);
    setSubmitting(false);
    fetchFamilias();
  };

  const handleDelete = async (family: Familia) => {
    const { error } = await supabase.from('familias').delete().eq('id', family.id);
    if (error) { toast.error('Erro ao excluir: ' + error.message); return; }
    toast.success('Família removida com sucesso!');
    setDeleteTarget(null);
    fetchFamilias();
  };

  const situacaoStyle = (s: string) => {
    if (s === 'Vulnerabilidade') return 'bg-destructive/10 text-destructive';
    if (s === 'Risco Social') return 'bg-warning/10 text-warning';
    return 'bg-success/10 text-success';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Famílias</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cadastre, consulte e gerencie as famílias atendidas</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Família</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Família' : 'Cadastrar Nova Família'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Nome do Responsável *</Label>
                <Input
                  value={form.responsavel}
                  onChange={e => {
                    const val = e.target.value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
                    setForm({ ...form, responsavel: val });
                  }}
                  maxLength={120}
                  placeholder="Nome e sobrenome"
                  className={errors.responsavel ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.responsavel} />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={form.cpf}
                  onChange={e => {
                    const onlyDigits = e.target.value.replace(/\D/g, '');
                    setForm({ ...form, cpf: formatCPF(onlyDigits) });
                  }}
                  onKeyDown={e => {
                    const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
                    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
                    if (!/\d/.test(e.key)) e.preventDefault();
                  }}
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={errors.cpf ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.cpf} />
              </div>
              <div className="space-y-2">
                <Label>Telefone *</Label>
                <Input
                  value={form.telefone}
                  onChange={e => {
                    const onlyDigits = e.target.value.replace(/\D/g, '');
                    setForm({ ...form, telefone: formatTelefone(onlyDigits) });
                  }}
                  onKeyDown={e => {
                    const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
                    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
                    if (!/\d/.test(e.key)) e.preventDefault();
                  }}
                  inputMode="numeric"
                  placeholder="(82) 99999-0000"
                  maxLength={15}
                  className={errors.telefone ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.telefone} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Endereço *</Label>
                <Input
                  value={form.endereco}
                  onChange={e => setForm({ ...form, endereco: e.target.value })}
                  maxLength={200}
                  className={errors.endereco ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.endereco} />
              </div>
              <div className="space-y-2">
                <Label>Bairro *</Label>
                <Select value={form.bairro} onValueChange={v => setForm({ ...form, bairro: v, comunidade: '' })}>
                  <SelectTrigger className={errors.bairro ? 'border-destructive' : ''}><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{bairrosList.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
                <FieldError msg={errors.bairro} />
              </div>
              <div className="space-y-2">
                <Label>Comunidade</Label>
                <Select value={form.comunidade} onValueChange={v => setForm({ ...form, comunidade: v })} disabled={!form.bairro}>
                  <SelectTrigger><SelectValue placeholder="Selecione o bairro primeiro" /></SelectTrigger>
                  <SelectContent>{(comunidadesMap[form.bairro] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nº de Moradores *</Label>
                <Input type="number" min={1} value={form.numMoradores} onChange={e => setForm({ ...form, numMoradores: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nº de Crianças</Label>
                <Input type="number" min={0} value={form.numCriancas} onChange={e => setForm({ ...form, numCriancas: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nº de Idosos</Label>
                <Input type="number" min={0} value={form.numIdosos} onChange={e => setForm({ ...form, numIdosos: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Situação Social</Label>
                <Select value={form.situacaoSocial} onValueChange={v => setForm({ ...form, situacaoSocial: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{situacoesSociais.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {errors.moradores && (
                <div className="md:col-span-2">
                  <FieldError msg={errors.moradores} />
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingId ? 'Salvar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterBairro} onValueChange={setFilterBairro}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filtrar por bairro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os bairros</SelectItem>
            {bairrosList.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Responsável</th>
                <th className="text-left p-4 font-medium text-muted-foreground">CPF</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Bairro</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Moradores</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Situação</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhuma família encontrada.</td></tr>
              ) : filtered.map(f => (
                <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{f.responsavel}</td>
                  <td className="p-4 text-muted-foreground">{formatCPF(f.cpf)}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{f.bairro}</td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell">{f.num_moradores}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${situacaoStyle(f.situacao_social)}`}>
                      {f.situacao_social}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setDetailFamily(f)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Ver prontuário">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => openEdit(f)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Editar">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => setDeleteTarget(f)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" title="Excluir">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a família de <strong>{deleteTarget?.responsavel}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail dialog */}
      <Dialog open={!!detailFamily} onOpenChange={() => setDetailFamily(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Prontuário da Família</DialogTitle></DialogHeader>
          {detailFamily && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Responsável:</span><p className="font-medium">{detailFamily.responsavel}</p></div>
                <div><span className="text-muted-foreground">CPF:</span><p className="font-medium">{formatCPF(detailFamily.cpf)}</p></div>
                <div><span className="text-muted-foreground">Telefone:</span><p className="font-medium">{detailFamily.telefone ? formatTelefone(detailFamily.telefone) : '—'}</p></div>
                <div><span className="text-muted-foreground">Bairro:</span><p className="font-medium">{detailFamily.bairro}</p></div>
                <div><span className="text-muted-foreground">Comunidade:</span><p className="font-medium">{detailFamily.comunidade || '—'}</p></div>
                <div><span className="text-muted-foreground">Moradores:</span><p className="font-medium">{detailFamily.num_moradores} (Crianças: {detailFamily.num_criancas}, Idosos: {detailFamily.num_idosos})</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Endereço:</span><p className="font-medium">{detailFamily.endereco || '—'}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Situação Social:</span><p className="font-medium">{detailFamily.situacao_social}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamiliasPage;
