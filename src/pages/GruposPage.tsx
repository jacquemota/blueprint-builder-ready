import { useState, useMemo } from 'react';
import { atividadesMock, participantesMock, familiasMock, funcionariosMock, tiposAtividade } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Atividade } from '@/types';

const GruposPage = () => {
  const [atividades, setAtividades] = useState<Atividade[]>(atividadesMock);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nomeAtividade: '', dataAtividade: '', responsavelId: '', familiaId: '', nomeParticipante: '' });

  const getFuncNome = (id: string) => funcionariosMock.find(f => f.id === id)?.nome ?? id;
  const getParticipantes = (atividadeId: string) => participantesMock.filter(p => p.atividadeId === atividadeId).length;

  const filtered = useMemo(() => {
    return atividades.filter(a => {
      return !search || a.nomeAtividade.toLowerCase().includes(search.toLowerCase());
    });
  }, [atividades, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: Atividade = {
      id: String(Date.now()),
      nomeAtividade: form.nomeAtividade,
      dataAtividade: form.dataAtividade,
      responsavelId: form.responsavelId,
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setAtividades(prev => [nova, ...prev]);
    setForm({ nomeAtividade: '', dataAtividade: '', responsavelId: '', familiaId: '', nomeParticipante: '' });
    setOpen(false);
    toast.success('Atividade registrada com sucesso!');
  };

  const handleDelete = (id: string) => {
    setAtividades(prev => prev.filter(a => a.id !== id));
    toast.success('Atividade removida com sucesso!');
  };

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
                  <SelectContent>{funcionariosMock.filter(f => f.ativo).map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Família do Participante (opcional)</Label>
                <Select value={form.familiaId} onValueChange={v => setForm({ ...form, familiaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{familiasMock.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome do Participante (opcional)</Label>
                <Input value={form.nomeParticipante} onChange={e => setForm({ ...form, nomeParticipante: e.target.value })} placeholder="Nome do participante" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por atividade..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
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
                  <td className="p-4 font-medium text-foreground">{a.nomeAtividade}</td>
                  <td className="p-4 text-muted-foreground">{a.dataAtividade}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{getFuncNome(a.responsavelId)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                      {getParticipantes(a.id)} participantes
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
