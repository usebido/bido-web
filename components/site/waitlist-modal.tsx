"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowRight, CheckCircle2, Loader2, ChevronDown } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";

type FormState = {
  nome: string;
  email: string;
  empresa: string;
  segmento: string;
  segmentoOutro: string;
  orcamento: string;
};

const EMPTY: FormState = {
  nome: "",
  email: "",
  empresa: "",
  segmento: "",
  segmentoOutro: "",
  orcamento: "",
};

export function WaitlistModal({
  open,
  onClose,
  initialEmail = "",
}: {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}) {
  const { messages } = useI18n();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const firstRef = useRef<HTMLInputElement>(null);
  const SEGMENTOS = [
    { value: "ecommerce", label: messages.waitlist.segments.ecommerce },
    { value: "delivery", label: messages.waitlist.segments.delivery },
    { value: "servicos", label: messages.waitlist.segments.services },
    { value: "outro", label: messages.waitlist.segments.other },
  ];
  const ORCAMENTOS = [
    { value: "500-2k", label: messages.waitlist.budgetRanges.range1 },
    { value: "2k-10k", label: messages.waitlist.budgetRanges.range2 },
    { value: "10k+", label: messages.waitlist.budgetRanges.range3 },
  ];

  const handleClose = useCallback(() => {
    setStatus("idle");
    setForm(EMPTY);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setForm((current) => ({ ...current, email: initialEmail }));
      setTimeout(() => firstRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [initialEmail, open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  if (!open) return null;

  const set =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("nome", form.nome);
      formData.append("email", form.email);
      formData.append("empresa", form.empresa);
      formData.append(
        "segmento",
        form.segmento === "outro" ? form.segmentoOutro : form.segmento,
      );
      formData.append("orcamento", form.orcamento);
      formData.append("_subject", "Nova entrada na lista de espera - Bido");
      formData.append("_captcha", "false");
      formData.append("_template", "table");

      const response = await fetch("https://formsubmit.co/bellujrb@gmail.com", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Form submit failed");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        aria-hidden
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={messages.waitlist.dialogLabel}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="animate-in fade-in zoom-in-95 duration-300 relative w-full max-w-lg rounded-2xl border border-border bg-surface-2 shadow-2xl shadow-black/70">
          <div className="flex items-start justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">{messages.waitlist.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {messages.waitlist.description}
              </p>
            </div>

            <button
              onClick={handleClose}
              aria-label={messages.waitlist.closeModal}
              className="ml-4 mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-soft">
                <CheckCircle2 className="h-7 w-7 text-violet" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{messages.waitlist.successTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {messages.waitlist.successDescription}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-2 text-sm font-semibold text-violet transition hover:underline"
              >
                {messages.common.close}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
              <Field label={messages.waitlist.name}>
                <Input
                  id="wl-nome"
                  ref={firstRef}
                  placeholder={messages.waitlist.form.namePlaceholder}
                  value={form.nome}
                  onChange={set("nome")}
                  required
                  autoComplete="name"
                />
              </Field>

              <Field label={messages.waitlist.email}>
                <Input
                  id="wl-email"
                  type="email"
                  placeholder={messages.waitlist.form.emailPlaceholder}
                  value={form.email}
                  onChange={set("email")}
                  required
                  autoComplete="email"
                />
              </Field>

              <Field label={messages.waitlist.company}>
                <Input
                  id="wl-empresa"
                  placeholder={messages.waitlist.form.companyPlaceholder}
                  value={form.empresa}
                  onChange={set("empresa")}
                  required
                  autoComplete="organization"
                />
              </Field>

              <Field label={messages.waitlist.segment}>
                <SelectField
                  id="wl-segmento"
                  value={form.segmento}
                  onChange={set("segmento")}
                  required
                >
                  <option value="" disabled>
                    {messages.waitlist.segmentPlaceholder}
                  </option>
                  {SEGMENTOS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </SelectField>

                {form.segmento === "outro" ? (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input
                      id="wl-segmento-outro"
                      placeholder={messages.waitlist.segmentOtherPlaceholder}
                      value={form.segmentoOutro}
                      onChange={set("segmentoOutro")}
                      required
                    />
                  </div>
                ) : null}
              </Field>

              <Field label={messages.waitlist.budget}>
                <SelectField
                  id="wl-orcamento"
                  value={form.orcamento}
                  onChange={set("orcamento")}
                  required
                >
                  <option value="" disabled>
                    {messages.waitlist.budgetPlaceholder}
                  </option>
                  {ORCAMENTOS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
              </Field>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-violet px-6 text-sm font-semibold text-violet-foreground shadow-lg shadow-violet/20 transition-colors duration-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0 bg-white transition-all duration-300 ease-out group-hover:h-full"
                  />
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {messages.waitlist.sending}
                      </>
                    ) : (
                      <>
                        {messages.waitlist.submit}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </span>
                </button>
              </div>

              {status === "error" ? (
                <p className="text-sm font-medium text-red-400">
                  {messages.waitlist.error}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground/80">{label}</label>
      {children}
    </div>
  );
}

const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
}) => (
  <input
    {...props}
    className={`h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition focus:border-violet/60 focus:ring-2 focus:ring-violet/25 ${className ?? ""}`}
  />
);

function SelectField({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`h-11 w-full appearance-none rounded-lg border border-border bg-surface pl-4 pr-10 text-sm text-foreground outline-none transition focus:border-violet/60 focus:ring-2 focus:ring-violet/25 cursor-pointer ${className ?? ""}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
