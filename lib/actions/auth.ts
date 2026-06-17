"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/actions/queries";
import { loginSchema, registerSchema } from "@/lib/validations/auth-schema";

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function signIn(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      ok: false,
      message: `No pudimos iniciar sesión: ${error.message}`,
    };
  }

  const profile = await ensureProfile();
  if (!profile) {
    return {
      ok: false,
      message: "Iniciaste sesión, pero no pudimos crear tu perfil. Revisa las políticas de Supabase.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
      },
    },
  });

  if (error || !data.user) {
    return {
      ok: false,
      message: `No pudimos crear la cuenta: ${error?.message ?? "Supabase no regresó usuario."}`,
    };
  }

  if (!data.session) {
    return {
      ok: true,
      message: "Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.",
    };
  }

  const profile = await ensureProfile();
  if (!profile) {
    return {
      ok: false,
      message: "Cuenta creada, pero no pudimos crear tu perfil. Revisa las políticas de Supabase.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
