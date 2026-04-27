import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-lg py-2xl text-foreground">
      <div className="mx-auto w-full max-w-3xl space-y-xl rounded-lg border border-border bg-card p-xl">
        <header className="space-y-sm">
          <h1 className="text-2xl font-semibold">Politica de Privacidad</h1>
          <p className="text-sm text-muted-foreground">
            Ultima actualizacion: 2026-04-27.
          </p>
        </header>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">
            Datos que tratamos
          </h2>
          <p>
            Podemos tratar datos de cuenta (correo e identificadores de usuario)
            y datos funcionales de la app necesarios para ofrecer autenticacion,
            favoritos y funcionamiento basico del servicio.
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">Finalidad</h2>
          <p>
            Usamos estos datos para permitir inicio de sesion, sincronizar
            preferencias, operar funcionalidades principales y mantener la
            seguridad del servicio.
          </p>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">Tus derechos</h2>
          <p>
            Puedes solicitar acceso, correccion, eliminacion de cuenta/datos u
            oposicion al tratamiento escribiendo a support@wayool.com.
          </p>
          <p>
            Tambien puedes usar el canal oficial en{" "}
            <Link className="text-primary underline" href="/data-request">
              /data-request
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
