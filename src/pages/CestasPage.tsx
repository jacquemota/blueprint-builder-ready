import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { cestasMock, familiasMock } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { CestaBasica } from '@/types';

const CestasPage = () => {
  const [cestas, setCestas] = useState<CestaBasica[]>(cestasMock);
  const [open, setOpen] = useState(false);
  const [alerta, setAlerta] = useState('');
  const [form, setForm] = useState({ familiaId: '', dataEntrega: '', quantidade: '1', observacoes: '' });

  const checkDuplicidade = (familiaId: string, data: string) => {
    if (!familiaId || !data) { setAlerta(''); return; }
    const dataRef = new Date(data);
    const recente = cestas.find(c => {
      if (c.familiaId !== familiaId) return false;
      const diff = Math.abs(dataRef.getTime() - new Date(c.dataEntrega).getTime());
      return diff < 30 * 24 * 60 * 60 * 1000;
    });
    setAlerta(recente ? `Atenção: Esta família recebeu cesta em ${recente.dataEntrega}. Menos de 30 dias!` : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: CestaBasica = {
      id: String(Date.now()),
      familiaId: form.familiaId,
      dataEntrega: form.dataEntrega,
      quantidade: Number(form.quantidade),
      observacoes: form.observacoes,
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setCestas(prev => [nova, ...prev]);
    setForm({ familiaId: '', dataEntrega: '', quantidade: '1', observacoes: '' });
    setAlerta('');
    setOpen(false);
    toast.success('Entrega registrada com sucesso!');
  };

  const getFamiliaNome = (id: string) => familiasMock.find(f => f.id === id)?.responsavel ?? id;

  const columns = [
    { key: 'familiaId', header: 'Família', render: (c: CestaBasica) => getFamiliaNome(c.familiaId), searchable: true },
    { key: 'dataEntrega', header: 'Data da Entrega' },
    { key: 'quantidade', header: 'Quantidade' },
    { key: 'observacoes', header: 'Observações', render: (c: CestaBasica) => (
      <span className="max-w-[200px] truncate block">{c.observacoes || '—'}</span>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Cestas Básicas"
        description="Controle de distribuição de cestas básicas"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Entrega</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Registrar Entrega de Cesta</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Família *</Label>
                  <Select required value={form.familiaId} onValueChange={v => { setForm({ ...form, familiaId: v }); checkDuplicidade(v, form.dataEntrega); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione a família" /></SelectTrigger>
                    <SelectContent>{familiasMock.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data da Entrega *</Label>
                  <Input type="date" required value={form.dataEntrega} onChange={e => { setForm({ ...form, dataEntrega: e.target.value }); checkDuplicidade(form.familiaId, e.target.value); }} />
                </div>
                {alerta && (
                  <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    {alerta}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input type="number" min={1} value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} />
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
      <DataTable data={cestas as unknown as Record<string, unknown>[]} columns={columns as any} searchPlaceholder="Buscar por família..." />
    </div>
  );
};

export default CestasPage;
