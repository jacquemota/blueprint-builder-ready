import { useState, useMemo } from 'react';
import { familiasMock, bairrosMock, comunidadesMock, situacoesSociais } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Eye, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { Familia } from '@/types';

const FamiliasPage = () => {
  const [familias, setFamilias] = useState<Familia[]>(familiasMock);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterBairro, setFilterBairro] = useState('all');
  const [detailFamily, setDetailFamily] = useState<Familia | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = {
    responsavel: '', cpf: '', telefone: '', endereco: '', bairro: '', comunidade: '',
    numMoradores: '', numCriancas: '', numIdosos: '', situacaoSocial: '',
  };
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return familias.filter(f => {
      const matchSearch = !search || f.responsavel.toLowerCase().includes(search.toLowerCase()) || f.cpf.includes(search);
      const matchBairro = filterBairro === 'all' || f.bairro === filterBairro;
      return matchSearch && matchBairro;
    });
  }, [familias, search, filterBairro]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openEdit = (f: Familia) => {
    setForm({
      responsavel: f.responsavel, cpf: f.cpf, telefone: f.telefone, endereco: f.endereco,
      bairro: f.bairro, comunidade: f.comunidade,
      numMoradores: String(f.numMoradores), numCriancas: String(f.numCriancas),
      numIdosos: String(f.numIdosos), situacaoSocial: f.situacaoSocial,
    });
    setEditingId(f.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setFamilias(prev => prev.map(f => f.id === editingId ? {
        ...f, ...form, numMoradores: Number(form.numMoradores),
        numCriancas: Number(form.numCriancas), numIdosos: Number(form.numIdosos),
      } : f));
      toast.success('Família atualizada com sucesso!');
    } else {
      const nova: Familia = {
        id: String(Date.now()), ...form,
        numMoradores: Number(form.numMoradores),
        numCriancas: Number(form.numCriancas),
        numIdosos: Number(form.numIdosos),
        criadoEm: new Date().toISOString().split('T')[0],
      };
      setFamilias(prev => [nova, ...prev]);
      toast.success('Família cadastrada com sucesso!');
    }
    resetForm();
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setFamilias(prev => prev.filter(f => f.id !== id));
    toast.success('Família removida com sucesso!');
  };

  const situacaoStyle = (s: string) => {
    if (s === 'Vulnerabilidade') return 'bg-destructive/10 text-destructive';
    if (s === 'Risco Social') return 'bg-warning/10 text-warning';
    return 'bg-success/10 text-success';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
                <Input required value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input required placeholder="000.000.000-00" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(82) 99999-0000" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Endereço</Label>
                <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Select value={form.bairro} onValueChange={v => setForm({ ...form, bairro: v, comunidade: '' })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{bairrosMock.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Comunidade</Label>
                <Select value={form.comunidade} onValueChange={v => setForm({ ...form, comunidade: v })} disabled={!form.bairro}>
                  <SelectTrigger><SelectValue placeholder="Selecione o bairro primeiro" /></SelectTrigger>
                  <SelectContent>{(comunidadesMock[form.bairro] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nº de Moradores</Label>
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
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterBairro} onValueChange={setFilterBairro}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filtrar por bairro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os bairros</SelectItem>
            {bairrosMock.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
                  <td className="p-4 text-muted-foreground">{f.cpf}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{f.bairro}</td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell">{f.numMoradores}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${situacaoStyle(f.situacaoSocial)}`}>
                      {f.situacaoSocial}
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
                      <button onClick={() => handleDelete(f.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" title="Excluir">
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

      {/* Detail Dialog */}
      <Dialog open={!!detailFamily} onOpenChange={() => setDetailFamily(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Prontuário da Família</DialogTitle>
          </DialogHeader>
          {detailFamily && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Responsável:</span><p className="font-medium">{detailFamily.responsavel}</p></div>
                <div><span className="text-muted-foreground">CPF:</span><p className="font-medium">{detailFamily.cpf}</p></div>
                <div><span className="text-muted-foreground">Telefone:</span><p className="font-medium">{detailFamily.telefone || '—'}</p></div>
                <div><span className="text-muted-foreground">Bairro:</span><p className="font-medium">{detailFamily.bairro}</p></div>
                <div><span className="text-muted-foreground">Comunidade:</span><p className="font-medium">{detailFamily.comunidade || '—'}</p></div>
                <div><span className="text-muted-foreground">Moradores:</span><p className="font-medium">{detailFamily.numMoradores} (Crianças: {detailFamily.numCriancas}, Idosos: {detailFamily.numIdosos})</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Endereço:</span><p className="font-medium">{detailFamily.endereco || '—'}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Situação Social:</span><p className="font-medium">{detailFamily.situacaoSocial}</p></div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">* Histórico de atendimentos, cestas e grupos disponível após integração com banco de dados.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamiliasPage;
