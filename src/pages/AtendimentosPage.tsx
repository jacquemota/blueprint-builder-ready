import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { atendimentosMock, familiasMock, funcionariosMock, tiposAtendimento } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Atendimento } from '@/types';

const AtendimentosPage = () => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>(atendimentosMock);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ familiaId: '', tipoAtendimento: '', profissionalId: '', dataAtendimento: '', observacoes: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: Atendimento = {
      id: String(Date.now()),
      familiaId: form.familiaId,
      tipoAtendimento: form.tipoAtendimento as Atendimento['tipoAtendimento'],
      profissionalId: form.profissionalId,
      dataAtendimento: form.dataAtendimento,
      observacoes: form.observacoes,
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setAtendimentos(prev => [novo, ...prev]);
    setForm({ familiaId: '', tipoAtendimento: '', profissionalId: '', dataAtendimento: '', observacoes: '' });
    setOpen(false);
    toast.success('Atendimento registrado com sucesso!');
  };

  const getFamiliaNome = (id: string) => familiasMock.find(f => f.id === id)?.responsavel ?? id;
  const getFuncNome = (id: string) => funcionariosMock.find(f => f.id === id)?.nome ?? id;

  const columns = [
    { key: 'familiaId', header: 'Família', render: (a: Atendimento) => getFamiliaNome(a.familiaId), searchable: true },
    { key: 'tipoAtendimento', header: 'Tipo', searchable: true },
    { key: 'profissionalId', header: 'Profissional', render: (a: Atendimento) => getFuncNome(a.profissionalId) },
    { key: 'dataAtendimento', header: 'Data' },
    { key: 'observacoes', header: 'Observações', render: (a: Atendimento) => (
      <span className="max-w-[200px] truncate block">{a.observacoes}</span>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Atendimentos"
        description="Registre e consulte atendimentos realizados"
        action={
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
                    <SelectContent>{familiasMock.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel}</SelectItem>)}</SelectContent>
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
                  <Label>Profissional *</Label>
                  <Select required value={form.profissionalId} onValueChange={v => setForm({ ...form, profissionalId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{funcionariosMock.filter(f => f.ativo).map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
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
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Registrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable data={atendimentos as unknown as Record<string, unknown>[]} columns={columns as any} searchPlaceholder="Buscar por família ou tipo..." />
    </div>
  );
};

export default AtendimentosPage;
