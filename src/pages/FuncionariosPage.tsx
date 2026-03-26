import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { funcionariosMock } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Funcionario } from '@/types';

const FuncionariosPage = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(funcionariosMock);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', cargo: '' as string });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: Funcionario = {
      id: String(Date.now()),
      nome: form.nome,
      email: form.email,
      cargo: form.cargo as Funcionario['cargo'],
      ativo: true,
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setFuncionarios(prev => [novo, ...prev]);
    setForm({ nome: '', email: '', cargo: '' });
    setOpen(false);
    toast.success('Funcionário cadastrado com sucesso!');
  };

  const columns = [
    { key: 'nome', header: 'Nome', searchable: true },
    { key: 'email', header: 'E-mail', searchable: true },
    { key: 'cargo', header: 'Cargo' },
    { key: 'ativo', header: 'Status', render: (f: Funcionario) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${f.ativo ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
        {f.ativo ? 'Ativo' : 'Inativo'}
      </span>
    )},
    { key: 'criadoEm', header: 'Cadastrado em' },
  ];

  return (
    <div>
      <PageHeader
        title="Gestão de Funcionários"
        description="Cadastre e gerencie os funcionários da ONG"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Funcionário</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Cadastrar Funcionário</DialogTitle></DialogHeader>
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
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Cadastrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable data={funcionarios as unknown as Record<string, unknown>[]} columns={columns as any} searchPlaceholder="Buscar por nome ou e-mail..." />
    </div>
  );
};

export default FuncionariosPage;
