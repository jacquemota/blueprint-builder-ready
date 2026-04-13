import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tiposAtividade } from '@/types';
import type { Familia, Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AtividadeWithCount {
  id: string;
  nome: string;
  data_atividade: string;
  responsavel_id: string | null;
  descricao: string | null;
  created_at: string;
  participantes_count: number;
}

const GruposPage = () => {
  const [atividades, setAtividades] = useState<AtividadeWithCount[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nomeAtividade: '', dataAtividade: '', responsavelId: '', familiaId: '', nomeParticipante: '' });

  const fetchData = async () => {
    setLoading(true);
    const [atRes, famRes, profRes] = await Promise.all([
      supabase.from('atividades').select('*, participantes_atividade(count)').order('data_atividade', { ascending: false }),
      supabase.from('familias').select('id, responsavel'),
      supabase.from('profiles').select('user_id, nome'),
    ]);

    if (atRes.error) {
      console.error('Erro ao buscar atividades:', atRes.error);
      toast.error('Erro ao carregar atividades: ' + atRes.error.message);
    }
    if (famRes.error) {
      console.error('Erro ao buscar famílias:', famRes.error);
    }
    if (profRes.error) {
      console.error('Erro ao buscar perfis:', profRes.error);
    }

    const mapped = (atRes.data || []).map((a: any) => ({
      ...a,
      participantes_count: a.participantes_atividade?.[0]?.count || 0,
    }));
    setAtividades(mapped);
    setFamilias(famRes.data as Familia[] || []);
    setProfiles(profRes.data as Profile[] || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getProfNome = (id: string | null) => {
    if (!id) return '—';
    return profiles.find(p => p.user_id === id)?.nome ?? id;
  };

  const filtered = useMemo(() => {
    return atividades.filter(a => !search || a.nome.toLowerCase().includes(search.toLowerCase()));
  }, [atividades, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { data: atividade, error } = await supabase.from('atividades').insert({
      nome: form.nomeAtividade,
      data_atividade: form.dataAtividade,
      responsavel_id: form.responsavelId || null,
    }).select().single();

    if (error) { toast.error('Erro: ' + error.message); setSubmitting(false); return; }

    // Add participant if provided
    if (form.nomeParticipante && atividade) {
      await supabase.from('participantes_atividade').insert({
        atividade_id: atividade.id,
        familia_id: form.familiaId || null,
        nome_participante: form.nomeParticipante,
      });
    }

    toast.success('Atividade registrada com sucesso!');
    setForm({ nomeAtividade: '', dataAtividade: '', responsavelId: '', familiaId: '', nomeParticipante: '' });
    setOpen(false);
    setSubmitting(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('atividades').delete().eq('id', id);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Atividade removida!');
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grupos de Socialização</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie atividades e participações em grupos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Atividade</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Atividade</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Atividade *</Label>
                <Select required value={form.nomeAtividade} onValueChange={v => setForm({ ...form, nomeAtividade: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{tiposAtividade.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" required value={form.dataAtividade} onChange={e => setForm({ ...form, dataAtividade: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={form.responsavelId} onValueChange={v => setForm({ ...form, responsavelId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{profiles.map(p => <SelectItem key={p.user_id} value={p.user_id}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Família do Participante (opcional)</Label>
                <Select value={form.familiaId} onValueChange={v => setForm({ ...form, familiaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{familias.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome do Participante (opcional)</Label>
                <Input value={form.nomeParticipante} onChange={e => setForm({ ...form, nomeParticipante: e.target.value })} placeholder="Nome do participante" />
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por atividade..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Atividade</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Responsável</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Participantes</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhuma atividade encontrada.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{a.nome}</td>
                  <td className="p-4 text-muted-foreground">{a.data_atividade}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{getProfNome(a.responsavel_id)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                      {a.participantes_count} participantes
                    </span>
                  </td>
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

export default GruposPage;
