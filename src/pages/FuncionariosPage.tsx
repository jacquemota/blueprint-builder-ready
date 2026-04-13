import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { roleLabels } from "@/types";
import type { Profile, AppRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";
import { validateNome, validateEmail, validateSenha, sanitize } from "@/lib/validators";

interface ProfileWithRole extends Profile {
  role: AppRole;
}

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null;

const FuncionariosPage = () => {
  const [profiles, setProfiles] = useState<ProfileWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProfileWithRole | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nome: "", email: "", password: "", role: "" as string,
  });

  const fetchProfiles = async () => {
    const { data: profilesData } = await supabase.from("profiles").select("*");
    const { data: rolesData } = await supabase.from("user_roles").select("*");
    const merged = (profilesData || []).map((p) => ({
      ...p,
      role: (rolesData?.find((r) => r.user_id === p.user_id)?.role || "consulta") as AppRole,
    }));
    setProfiles(merged);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const filtered = useMemo(() => {
    return profiles.filter((f) =>
      !search ||
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [profiles, search]);

  const resetForm = () => {
    setForm({ nome: "", email: "", password: "", role: "" });
    setEditingId(null);
    setErrors({});
  };

  const openEdit = (p: ProfileWithRole) => {
    setForm({ nome: p.nome, email: p.email, password: "", role: p.role });
    setEditingId(p.user_id);
    setErrors({});
    setOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    const nomeResult = validateNome(form.nome);
    if (!nomeResult.valid) errs.nome = nomeResult.error!;

    if (!editingId) {
      const emailResult = validateEmail(form.email);
      if (!emailResult.valid) errs.email = emailResult.error!;
      // Check email uniqueness
      if (emailResult.valid) {
        const emailLower = form.email.trim().toLowerCase();
        const dup = profiles.find(p => p.email.toLowerCase() === emailLower);
        if (dup) errs.email = 'E-mail já cadastrado no sistema.';
      }

      const senhaResult = validateSenha(form.password);
      if (!senhaResult.valid) errs.password = senhaResult.error!;
    }

    if (!form.role) errs.role = 'Perfil de acesso é obrigatório.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    if (editingId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ nome: sanitize(form.nome), email: form.email })
        .eq("user_id", editingId);

      if (profileError) {
        toast.error("Erro: " + profileError.message);
        setSubmitting(false);
        return;
      }

      if (form.role) {
        await supabase.from("user_roles").update({ role: form.role as AppRole }).eq("user_id", editingId);
      }
      toast.success("Funcionário atualizado com sucesso!");
    } else {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: {
          action: "create",
          email: form.email.trim().toLowerCase(),
          password: form.password,
          nome: sanitize(form.nome),
          role: form.role,
        },
      });

      if (error || data?.error) {
        toast.error("Erro: " + (data?.error || error?.message));
        setSubmitting(false);
        return;
      }
      toast.success("Funcionário cadastrado com sucesso!");
    }

    resetForm();
    setOpen(false);
    setSubmitting(false);
    fetchProfiles();
  };

  const handleDelete = async (profile: ProfileWithRole) => {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "delete", user_id: profile.user_id },
    });
    if (error || data?.error) {
      toast.error("Erro: " + (data?.error || error?.message));
      return;
    }
    toast.success("Funcionário excluído com sucesso!");
    setDeleteTarget(null);
    fetchProfiles();
  };

  const handleToggleAtivo = async (userId: string, ativo: boolean) => {
    const { error } = await supabase.from("profiles").update({ ativo: !ativo }).eq("user_id", userId);
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success(ativo ? "Funcionário desativado." : "Funcionário reativado.");
    fetchProfiles();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const roles = Constants.public.Enums.app_role;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Funcionários</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie os funcionários e seus perfis de acesso</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Funcionário</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Funcionário" : "Cadastrar Funcionário"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
                    setForm({ ...form, nome: val });
                  }}
                  maxLength={120}
                  placeholder="Nome e sobrenome"
                  className={errors.nome ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.nome} />
              </div>
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={form.email}
                  disabled={!!editingId}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                  className={errors.email ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.email} />
              </div>
              {!editingId && (
                <div className="space-y-2">
                  <Label>Senha *</Label>
                  <Input
                    type="password"
                    placeholder="Mínimo 8 caracteres, maiúscula, minúscula e número"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.password} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Perfil de Acesso *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError msg={errors.role} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingId ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou e-mail..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Nome</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">E-mail</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Perfil</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum funcionário encontrado.</td></tr>
              ) : filtered.map((f) => (
                <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{f.nome}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{f.email}</td>
                  <td className="p-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {roleLabels[f.role]}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAtivo(f.user_id, f.ativo)}
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${f.ativo ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                    >
                      {f.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(f)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Editar">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => setDeleteTarget(f)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" title="Excluir">
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

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o funcionário <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FuncionariosPage;
