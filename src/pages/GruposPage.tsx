import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { atividadesMock, participantesMock, familiasMock, funcionariosMock, tiposAtividade } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Atividade } from '@/types';

const GruposPage = () => {
  const [atividades, setAtividades] = useState<Atividade[]>(atividadesMock);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nomeAtividade: '', dataAtividade: '', responsavelId: '' });

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
    setForm({ nomeAtividade: '', dataAtividade: '', responsavelId: '' });
    setOpen(false);
    toast.success('Atividade registrada com sucesso!');
  };

  const getFuncNome = (id: string) => funcionariosMock.find(f => f.id === id)?.nome ?? id;
  const getParticipantes = (atividadeId: string) => participantesMock.filter(p => p.atividadeId === atividadeId).length;

  const columns = [
    { key: 'nomeAtividade', header: 'Atividade', searchable: true },
    { key: 'dataAtividade', header: 'Data' },
    { key: 'responsavelId', header: 'Responsável', render: (a: Atividade) => getFuncNome(a.responsavelId) },
    { key: 'id', header: 'Participantes', render: (a: Atividade) => (
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {getParticipantes(a.id)} participantes
      </span>
    ), searchable: false },
  ];

  return (
    <div>
      <PageHeader
        title="Grupos de Socialização"
        description="Gerencie atividades e participações em grupos"
        action={
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
                  <Label>Responsável *</Label>
                  <Select required value={form.responsavelId} onValueChange={v => setForm({ ...form, responsavelId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{funcionariosMock.filter(f => f.ativo).map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
                  </Select>
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
      <DataTable data={atividades as unknown as Record<string, unknown>[]} columns={columns as any} searchPlaceholder="Buscar por atividade..." />
    </div>
  );
};

export default GruposPage;
