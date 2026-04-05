import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { roleLabels } from "@/types";
import type { Profile, AppRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";

interface ProfileWithRole extends Profile {
  role: AppRole;
}

const FuncionariosPage = () => {
  const [profiles, setProfiles] = useState<ProfileWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", role: "" as string });

  const fetchProfiles = async () => {
    const { data: profilesData } = await supabase.from("profiles").select("*");
    const { data: rolesData } = await supabase.from("user_roles").select("*");

    const merged = (profilesData || []).map((p) => ({
      ...p,
      role: (rolesData?.find((r) => r.user_id === p.user_id)?.role ||
        "consulta") as AppRole,
    }));
    setProfiles(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const filtered = useMemo(() => {
    return profiles.filter(
      (f) =>
        !search ||
        f.nome.toLowerCase().includes(search.toLowerCase()) ||
        f.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [profiles, search]);

  const resetForm = () => {
    setForm({ nome: "", email: "", role: "" });
    setEditingId(null);
  };

  const openEdit = (p: ProfileWithRole) => {
    setForm({ nome: p.nome, email: p.email, role: p.role });
    setEditingId(p.user_id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) {
      toast.error(
        "Para criar novos usuários, use o cadastro via autenticação.",
      );
      return;
    }
    setSubmitting(true);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        nome: form.nome,
        email: form.email,
      })
      .eq("user_id", editingId);

    if (profileError) {
      toast.error("Erro: " + profileError.message);
      setSubmitting(false);
      return;
    }

    // Update role - delete old and insert new
    if (form.role) {
      await supabase
        .from("user_roles")
        .update({ user_id: editingId, role: form.role as AppRole })
        .eq("user_id", editingId);
    }

    toast.success("Funcionário atualizado com sucesso!");
    resetForm();
    setOpen(false);
    setSubmitting(false);
    fetchProfiles();
  };

  const handleToggleAtivo = async (userId: string, ativo: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ ativo: !ativo })
      .eq("user_id", userId);
    if (error) {
      toast.error("Erro: " + error.message);
      return;
    }
    toast.success(ativo ? "Funcionário desativado." : "Funcionário reativado.");
    fetchProfiles();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  const roles = Constants.public.Enums.app_role;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gestão de Funcionários
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os funcionários e seus perfis de acesso
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2" disabled>
              <Plus className="h-4 w-4" /> Novo (via Auth)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Funcionário" : "Cadastrar Funcionário"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Perfil de Acesso *</Label>
                <Select
                  required
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabels[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Nome
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  E-mail
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Perfil
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-muted-foreground"
                  >
                    Nenhum funcionário encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-foreground">
                      {f.nome}
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {f.email}
                    </td>
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
                      <button
                        onClick={() => openEdit(f)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FuncionariosPage;
