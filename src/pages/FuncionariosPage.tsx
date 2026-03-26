import { useState, useMemo } from 'react';
import { funcionariosMock } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { Funcionario } from '@/types';

const FuncionariosPage = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(funcionariosMock);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', email: '', cargo: '' as string });

  const filtered = useMemo(() => {
    return funcionarios.filter(f => {
      return !search || f.nome.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase());
    });
  }, [funcionarios, search]);

  const resetForm = () => {
    setForm({ nome: '', email: '', cargo: '' });
    setEditingId(null);
  };

  const openEdit = (f: Funcionario) => {
    setForm({ nome: f.nome, email: f.email, cargo: f.cargo });
    setEditingId(f.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setFuncionarios(prev => prev.map(f => f.id === editingId ? { ...f, nome: form.nome, email: form.email, cargo: form.cargo as Funcionario['cargo'] } : f));
      toast.success('Funcionário atualizado com sucesso!');
    } else {
      const novo: Funcionario = {
        id: String(Date.now()),
        nome: form.nome,
        email: form.email,
        cargo: form.cargo as Funcionario['cargo'],
        ativo: true,
        criadoEm: new Date().toISOString().split('T')[0],
      };
      setFuncionarios(prev => [novo, ...prev]);
      toast.success('Funcionário cadastrado com sucesso!');
    }
    resetForm();
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setFuncionarios(prev => prev.filter(f => f.id !== id));
    toast.success('Funcionário removido com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Funcionários</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cadastre e gerencie os funcionários da ONG</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Funcionário</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cargo *</Label>
                <Select required value={form.cargo} onValueChange={v => setForm({ ...form, cargo: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Funcionário">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou e-mail..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">E-mail</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Cargo</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum funcionário encontrado.</td></tr>
              ) : filtered.map(f => (
                <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{f.nome}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{f.email}</td>
                  <td className="p-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {f.cargo}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${f.ativo ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {f.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(f)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(f.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
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
    </div>
  );
};

export default FuncionariosPage;
