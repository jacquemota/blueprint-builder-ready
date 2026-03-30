import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { EntregaCesta, Familia } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CestasPage = () => {
  const { user } = useAuth();
  const [cestas, setCestas] = useState<EntregaCesta[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [alerta, setAlerta] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ familiaId: '', dataEntrega: '', quantidade: '1', observacoes: '' });

  const fetchData = async () => {
    const [cestasRes, famRes] = await Promise.all([
      supabase.from('entregas_cestas').select('*').order('data_entrega', { ascending: false }),
      supabase.from('familias').select('id, responsavel'),
    ]);
    setCestas(cestasRes.data || []);
    setFamilias(famRes.data as Familia[] || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getFamiliaNome = (id: string) => familias.find(f => f.id === id)?.responsavel ?? id;

  const filtered = useMemo(() => {
    return cestas.filter(c => !search || getFamiliaNome(c.familia_id).toLowerCase().includes(search.toLowerCase()));
  }, [cestas, search, familias]);

  const checkDuplicidade = (familiaId: string, data: string) => {
    if (!familiaId || !data) { setAlerta(''); return; }
    const dataRef = new Date(data);
    const recente = cestas.find(c => {
      if (c.familia_id !== familiaId) return false;
      const diff = Math.abs(dataRef.getTime() - new Date(c.data_entrega).getTime());
      return diff < 30 * 24 * 60 * 60 * 1000;
    });
    setAlerta(recente ? `Atenção: Esta família recebeu cesta em ${recente.data_entrega}. Menos de 30 dias!` : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('entregas_cestas').insert({
      familia_id: form.familiaId,
      data_entrega: form.dataEntrega,
      quantidade: Number(form.quantidade),
      observacoes: form.observacoes,
      registrado_por: user?.id,
    });
    if (error) {
      toast.error(error.message.includes('30 dias') ? 'Esta família já recebeu cesta nos últimos 30 dias!' : 'Erro: ' + error.message);
      setSubmitting(false);
      return;
    }
    toast.success('Entrega registrada com sucesso!');
    setForm({ familiaId: '', dataEntrega: '', quantidade: '1', observacoes: '' });
    setAlerta('');
    setOpen(false);
    setSubmitting(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('entregas_cestas').delete().eq('id', id);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Registro removido com sucesso!');
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cestas Básicas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Controle de distribuição de cestas básicas</p>
        </div>
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
                  <SelectContent>{familias.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel}</SelectItem>)}</SelectContent>
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
        <Input placeholder="Buscar por família..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Família</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Data da Entrega</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Quantidade</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Observações</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhuma cesta encontrada.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{getFamiliaNome(c.familia_id)}</td>
                  <td className="p-4 text-muted-foreground">{c.data_entrega}</td>
                  <td className="p-4 text-muted-foreground">{c.quantidade}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell"><span className="max-w-[200px] truncate block">{c.observacoes || '—'}</span></td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
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

export default CestasPage;
