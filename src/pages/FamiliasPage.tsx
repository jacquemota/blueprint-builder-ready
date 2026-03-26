import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { familiasMock, bairrosMock, comunidadesMock, situacoesSociais } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Familia } from '@/types';

const FamiliasPage = () => {
  const [familias, setFamilias] = useState<Familia[]>(familiasMock);
  const [open, setOpen] = useState(false);
  const [selectedBairro, setSelectedBairro] = useState('');
  const [detailFamily, setDetailFamily] = useState<Familia | null>(null);

  const [form, setForm] = useState({
    responsavel: '', cpf: '', telefone: '', endereco: '', bairro: '', comunidade: '',
    numMoradores: '', numCriancas: '', numIdosos: '', situacaoSocial: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: Familia = {
      id: String(Date.now()),
      responsavel: form.responsavel,
      cpf: form.cpf,
      telefone: form.telefone,
      endereco: form.endereco,
      bairro: form.bairro,
      comunidade: form.comunidade,
      numMoradores: Number(form.numMoradores),
      numCriancas: Number(form.numCriancas),
      numIdosos: Number(form.numIdosos),
      situacaoSocial: form.situacaoSocial,
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setFamilias(prev => [nova, ...prev]);
    setForm({ responsavel: '', cpf: '', telefone: '', endereco: '', bairro: '', comunidade: '', numMoradores: '', numCriancas: '', numIdosos: '', situacaoSocial: '' });
    setOpen(false);
    toast.success('Família cadastrada com sucesso!');
  };

  const columns = [
    { key: 'responsavel', header: 'Responsável', searchable: true },
    { key: 'cpf', header: 'CPF', searchable: true },
    { key: 'bairro', header: 'Bairro', searchable: true },
    { key: 'comunidade', header: 'Comunidade' },
    { key: 'numMoradores', header: 'Moradores' },
    { key: 'situacaoSocial', header: 'Situação', render: (f: Familia) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        f.situacaoSocial === 'Vulnerabilidade' ? 'bg-destructive/10 text-destructive' :
        f.situacaoSocial === 'Risco Social' ? 'bg-warning/10 text-warning' :
        'bg-success/10 text-success'
      }`}>{f.situacaoSocial}</span>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Gestão de Famílias"
        description="Cadastre, consulte e gerencie as famílias atendidas"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Família</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Família</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
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
                <div className="space-y-2 sm:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Select value={form.bairro} onValueChange={v => { setForm({ ...form, bairro: v, comunidade: '' }); setSelectedBairro(v); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{bairrosMock.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Comunidade</Label>
                  <Select value={form.comunidade} onValueChange={v => setForm({ ...form, comunidade: v })} disabled={!selectedBairro}>
                    <SelectTrigger><SelectValue placeholder="Selecione o bairro primeiro" /></SelectTrigger>
                    <SelectContent>{(comunidadesMock[selectedBairro] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Cadastrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        data={familias as unknown as Record<string, unknown>[]}
        columns={columns as any}
        searchPlaceholder="Buscar por nome, CPF ou bairro..."
        onRowClick={(item: any) => setDetailFamily(item as Familia)}
      />

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
                <div><span className="text-muted-foreground">Telefone:</span><p className="font-medium">{detailFamily.telefone}</p></div>
                <div><span className="text-muted-foreground">Bairro:</span><p className="font-medium">{detailFamily.bairro}</p></div>
                <div><span className="text-muted-foreground">Comunidade:</span><p className="font-medium">{detailFamily.comunidade}</p></div>
                <div><span className="text-muted-foreground">Moradores:</span><p className="font-medium">{detailFamily.numMoradores} (Crianças: {detailFamily.numCriancas}, Idosos: {detailFamily.numIdosos})</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Endereço:</span><p className="font-medium">{detailFamily.endereco}</p></div>
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
