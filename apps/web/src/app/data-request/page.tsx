"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type RequestType =
  | "access"
  | "deletion"
  | "correction"
  | "portability"
  | "objection";

const REQUEST_LABELS: Record<RequestType, string> = {
  access: "Acceder a mis datos",
  deletion: "Eliminar mi cuenta y datos",
  correction: "Corregir mis datos",
  portability: "Exportar mis datos (portabilidad)",
  objection: "Oponerme al procesamiento",
};

export default function DataRequestPage() {
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<RequestType>("access");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  const requestId = useMemo(() => {
    return `FLC-${Date.now().toString(36).toUpperCase()}`;
  }, [sent]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(
      `Solicitud de datos (${REQUEST_LABELS[requestType]}) - ${requestId}`,
    );
    const body = encodeURIComponent(
      [
        `Solicitud ID: ${requestId}`,
        `Correo del solicitante: ${email}`,
        `Tipo de solicitud: ${REQUEST_LABELS[requestType]}`,
        "",
        "Detalles adicionales:",
        details || "(sin detalles)",
      ].join("\n"),
    );

    window.location.href = `mailto:support@wayool.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-background px-lg py-2xl text-foreground">
      <div className="mx-auto w-full max-w-3xl space-y-lg">
        <section className="rounded-lg border border-border bg-card p-lg">
          <h1 className="text-2xl font-semibold">
            Solicitud de cuenta y datos
          </h1>
          <p className="mt-sm text-base text-muted-foreground">
            Canal oficial para solicitudes de proteccion de datos y eliminacion
            de cuenta.
          </p>

          <p className="mt-md text-sm text-muted-foreground">
            Esta pagina cubre solicitudes de eliminacion de cuenta, eliminacion
            de datos personales, acceso, correccion, portabilidad y oposicion al
            procesamiento.
          </p>

          <h2 className="mt-md text-lg font-semibold">
            Como solicitar eliminacion de cuenta
          </h2>
          <ol className="mt-sm list-decimal space-y-xs pl-lg text-sm text-muted-foreground">
            <li>Usa el mismo correo con el que inicias sesion.</li>
            <li>En tipo de solicitud, elige Eliminar mi cuenta y datos.</li>
            <li>Opcional: incluye tu User ID de Clerk en detalles.</li>
            <li>Conserva el ID de solicitud para seguimiento.</li>
          </ol>

          <p className="mt-md text-sm text-muted-foreground">
            Procesamos solicitudes en hasta 30 dias calendario, sujeto a
            validacion de identidad y ley aplicable. Para mas detalles de
            retencion y uso de datos, revisa la{" "}
            <Link className="text-primary underline" href="/privacy-policy">
              Politica de Privacidad
            </Link>
            .
          </p>
          <p className="mt-sm text-sm text-muted-foreground">
            Durante y despues del proceso, podemos conservar registros minimos
            tecnicos de seguridad, antifraude y cumplimiento legal cuando sea
            necesario.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-lg">
          <h2 className="text-xl font-semibold">
            Solicitud de Proteccion de Datos
          </h2>
          <p className="mt-xs text-sm text-muted-foreground">
            Ejerce tus derechos de acceso, correccion, eliminacion, portabilidad
            y oposicion.
          </p>

          {sent ? (
            <div className="mt-md rounded-md border border-primary/30 bg-primary/10 p-md">
              <p className="text-sm">
                Solicitud preparada. Si tu cliente de correo no se abrio,
                escribe a{" "}
                <span className="font-medium">support@wayool.com</span> y agrega
                el ID <span className="font-medium">{requestId}</span>.
              </p>
            </div>
          ) : null}

          <form className="mt-md space-y-md" onSubmit={handleSubmit}>
            <div className="space-y-xs">
              <label className="text-sm font-medium" htmlFor="email">
                Direccion de correo electronico *
              </label>
              <input
                className="w-full rounded-md border border-input bg-background px-md py-sm text-sm"
                id="email"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu.correo@ejemplo.com"
              />
            </div>

            <div className="space-y-xs">
              <label className="text-sm font-medium" htmlFor="request_type">
                Tipo de solicitud *
              </label>
              <select
                className="w-full rounded-md border border-input bg-background px-md py-sm text-sm"
                id="request_type"
                value={requestType}
                onChange={(event) =>
                  setRequestType(event.target.value as RequestType)
                }
              >
                {Object.entries(REQUEST_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-xs">
              <label className="text-sm font-medium" htmlFor="details">
                Detalles adicionales (opcional)
              </label>
              <textarea
                className="min-h-24 w-full rounded-md border border-input bg-background px-md py-sm text-sm"
                id="details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Incluye contexto util para procesar tu solicitud."
              />
            </div>

            <div className="rounded-md border border-border bg-muted p-md text-sm text-muted-foreground">
              Al enviar, se abrira tu cliente de correo con la solicitud
              prellenada para que la mandes a soporte.
            </div>

            <button
              className="inline-flex rounded-md bg-primary px-lg py-sm text-sm font-medium text-primary-foreground"
              type="submit"
            >
              Enviar solicitud
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
