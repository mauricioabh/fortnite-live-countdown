import Link from "next/link";

export default function DataRequestPage() {
  return (
    <main className="min-h-screen bg-background px-lg py-2xl text-foreground">
      <div className="mx-auto w-full max-w-3xl space-y-xl rounded-lg border border-border bg-card p-xl">
        <header className="space-y-sm">
          <h1 className="text-2xl font-semibold">
            Solicitud de cuenta y datos
          </h1>
          <p className="text-sm text-muted-foreground">
            Canal oficial para solicitar eliminacion de cuenta, eliminacion de
            datos personales, acceso, correccion u oposicion al procesamiento.
          </p>
        </header>

        <section className="space-y-sm">
          <h2 className="text-lg font-medium">
            Como solicitar eliminacion de cuenta
          </h2>
          <ol className="list-decimal space-y-xs pl-lg text-sm text-muted-foreground">
            <li>Escribe a support@wayool.com desde el correo de tu cuenta.</li>
            <li>
              Usa el asunto: Eliminacion de cuenta Fortnite Live Countdown.
            </li>
            <li>
              Incluye tu User ID de Clerk (si lo tienes) y confirma que deseas
              eliminar la cuenta.
            </li>
          </ol>
        </section>

        <section className="space-y-sm">
          <h2 className="text-lg font-medium">
            Que se elimina y que se conserva
          </h2>
          <ul className="list-disc space-y-xs pl-lg text-sm text-muted-foreground">
            <li>
              Se elimina la cuenta de autenticacion y sus datos asociados de
              perfil.
            </li>
            <li>
              Se eliminan preferencias ligadas a la cuenta (como favoritos).
            </li>
            <li>
              Se pueden conservar registros tecnicos minimos cuando la ley lo
              exija o para prevencion de fraude y seguridad.
            </li>
          </ul>
        </section>

        <section className="space-y-sm text-sm text-muted-foreground">
          <p>
            Tiempo de respuesta: confirmacion inicial en hasta 5 dias habiles y
            cierre de solicitud en hasta 30 dias calendario.
          </p>
          <p>
            Para mas detalles de uso y retencion de datos, revisa la{" "}
            <Link className="text-primary underline" href="/privacy-policy">
              Politica de Privacidad
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
