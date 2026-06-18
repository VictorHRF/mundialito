"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginPending(true);
    setLoginMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginPending(false);

    if (error) {
      setLoginMessage(`No pudimos iniciar sesión: ${error.message}`);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterPending(true);
    setRegisterMessage("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error || !data.user) {
      setRegisterPending(false);
      setRegisterMessage(`No pudimos crear la cuenta: ${error?.message ?? "Supabase no regresó usuario."}`);
      return;
    }

    if (!data.session) {
      setRegisterPending(false);
      setRegisterMessage("Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      name,
    });

    setRegisterPending(false);

    if (profileError) {
      setRegisterMessage(`Cuenta creada, pero no pudimos crear tu perfil: ${profileError.message}`);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Card className="relative w-full max-w-md overflow-hidden border-0 shadow-2xl">
      <div className="cup-color-bar" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <CardHeader>
        <CardTitle className="text-cup-navy">Entra al Mundialito</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="register">Crear cuenta</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Correo</Label>
                <Input id="login-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {loginMessage ? (
                <Alert variant="destructive">
                  <AlertDescription>{loginMessage}</AlertDescription>
                </Alert>
              ) : null}
              <Button className="w-full" type="submit" disabled={loginPending}>
                {loginPending ? <Loader2 className="animate-spin" /> : null}
                Iniciar sesión
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nombre</Label>
                <Input id="register-name" name="name" autoComplete="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Correo</Label>
                <Input id="register-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              {registerMessage ? (
                <Alert variant={registerMessage.startsWith("Cuenta creada") ? "default" : "destructive"}>
                  <AlertDescription>{registerMessage}</AlertDescription>
                </Alert>
              ) : null}
              <Button className="w-full" type="submit" disabled={registerPending}>
                {registerPending ? <Loader2 className="animate-spin" /> : null}
                Crear cuenta
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
