"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, signUp, type ActionState } from "@/lib/actions/auth";

const initialState: ActionState = { ok: false, message: "" };

function SubmitButton({ label }: { label: string }) {
  return (
    <Button className="w-full" type="submit">
      {label}
    </Button>
  );
}

export function AuthForm() {
  const [loginState, loginAction, loginPending] = useActionState(signIn, initialState);
  const [registerState, registerAction, registerPending] = useActionState(signUp, initialState);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entra al Mundialito</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="register">Crear cuenta</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="pt-4">
            <form action={loginAction} className="space-y-4">
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
              {loginState.message ? (
                <Alert variant={loginState.ok ? "default" : "destructive"}>
                  <AlertDescription>{loginState.message}</AlertDescription>
                </Alert>
              ) : null}
              <Button className="w-full" type="submit" disabled={loginPending}>
                {loginPending ? <Loader2 className="animate-spin" /> : null}
                Iniciar sesión
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <form action={registerAction} className="space-y-4">
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
              {registerState.message ? (
                <Alert variant={registerState.ok ? "default" : "destructive"}>
                  <AlertDescription>{registerState.message}</AlertDescription>
                </Alert>
              ) : null}
              <SubmitButton label={registerPending ? "Creando..." : "Crear cuenta"} />
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
