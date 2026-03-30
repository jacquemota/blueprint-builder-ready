import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { tiposAtendimento } from '@/types';
import type { Atendimento, Familia, Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AtendimentosPage = () => {
  const { user } = useAuth();
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ familiaId: '', tipoAtendimento: '', dataAtendimento: '', observacoes: '' });

  const fetchData = async () => {
    const [atRes, famRes, profRes] = await Promise.all([
      supabase.from('atendimentos').select('*').order('data_atendimento', { ascending: false }),
      supabase.from('familias').select('id, responsavel'),
      supabase.from('profiles').select('user_id, nome'),
    ]);
    setAtendimentos(atRes.data || []);
    setFamilias(famRes.data as Familia[] || []);
    setProfiles(profRes.data as Profile[] || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getFamiliaNome = (id: string) => familias.find(f => f.id === id)?.responsavel ?? id;
  const getProfNome = (id: string) => profiles.find(p => p.user_id === id)?.nome ?? id;

  const filtered = useMemo(() => {
    return atendimentos.filter(a => {
      const matchSearch = !search || getFamiliaNome(a.familia_id).toLowerCase().includes(search.toLowerCase());
      const matchTipo = filterTipo === 'all' || a.tipo_atendimento === filterTipo;
      return matchSearch && matchTipo;
    });
  }, [atendimentos, search, filterTipo, familias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('atendimentos').insert({
      familia_id: form.familiaId,
      tipo_atendimento: form.tipoAtendimento,
      profissional_id: user.id,
      data_atendimento: form.dataAtendimento,
      observacoes: form.observacoes,
    });
    if (error) { toast.error('Erro: ' + error.message); setSubmitting(false); return; }
    toast.success('Atendimento registrado com sucesso!');
    setForm({ familiaId: '', tipoAtendimento: '', dataAtendimento: '', observacoes: '' });
    setOpen(false);
    setSubmitting(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('atendimentos').delete().eq('id', id);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Atendimento removido!');
    fetchData();
  };

  const tipoBadge = (tipo: string) => {
    const map: Record<string, string> = {
      'Fisioterapia': 'bg-primary/10 text-primary',
      'Assistente Social': 'bg-info/10 text-info',
      'Orientação Social': 'bg-success/10 text-success',
      'Outros': 'bg-muted text-muted-foreground',
    };
    return map[tipo] || 'bg-muted text-muted-foreground';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Atendimentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Registre e consulte atendimentos realizados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Atendimento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Atendimento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Família *</Label>
                <Select required value={form.familiaId} onValueChange={v => setForm({ ...form, familiaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a família" /></SelectTrigger>
                  <SelectContent>{familias.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Atendimento *</Label>
                <Select required value={form.tipoAtendimento} onValueChange={v => setForm({ ...form, tipoAtendimento: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{tiposAtendimento.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" required value={form.dataAtendimento} onChange={e => setForm({ ...form, dataAtendimento: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por família..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {tiposAtendimento.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Família</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Profissional</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Observações</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhum atendimento encontrado.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{getFamiliaNome(a.familia_id)}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoBadge(a.tipo_atendimento)}`}>
                      {a.tipo_atendimento}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{getProfNome(a.profissional_id)}</td>
                  <td className="p-4 text-muted-foreground">{a.data_atendimento}</td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell"><span className="max-w-[200px] truncate block">{a.observacoes || '—'}</span></td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AtendimentosPage;
