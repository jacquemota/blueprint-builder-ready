import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const users = [
    { email: "admin@maisquesocial.org", password: "admin123", nome: "Administrador Geral", role: "admin" },
    { email: "func@maisquesocial.org", password: "func123", nome: "Maria Funcionária", role: "atendimento" },
  ];

  const results = [];

  for (const u of users) {
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((x: any) => x.email === u.email);

    if (existing) {
      // Update role
      await supabase.from("user_roles").upsert(
        { user_id: existing.id, role: u.role },
        { onConflict: "user_id" }
      );
      // Update profile name
      await supabase.from("profiles").update({ nome: u.nome }).eq("user_id", existing.id);
      results.push({ email: u.email, status: "already exists, role updated" });
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { nome: u.nome },
    });

    if (error) {
      results.push({ email: u.email, error: error.message });
      continue;
    }

    // The trigger should create profile + role, but let's ensure role is correct
    await supabase.from("user_roles").upsert(
      { user_id: data.user.id, role: u.role },
      { onConflict: "user_id" }
    );

    results.push({ email: u.email, status: "created", id: data.user.id });
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
