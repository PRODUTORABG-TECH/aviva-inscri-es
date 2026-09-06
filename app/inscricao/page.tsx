"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DIAS_MES_PAGAMENTO,
  OPCOES_PARCELAS_CARTAO,
  calcularIdade,
  formatarMoeda,
  formatarTelefone,
  getFaixaPagamento,
} from "@/lib/pagamento";

// TODO: configurar a URL real do backend n8n deste projeto (base do webhook
// que expõe generate-otp, validate-otp e o endpoint de envio da inscrição).
const API_BASE = "https://SEU-N8N-AQUI/webhook";

function paraDigitos(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

function paraE164(formatted: string): string {
  return `+55${paraDigitos(formatted)}`;
}

type Step = "telefone" | "otp" | "dados" | "pagamento";

interface FormularioInscricao {
  nomeCompleto: string;
  dataNascimento: string;
  igreja: string;
  bairroCidade: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  formaPagamento: "avista" | "parcelado" | "";
  parcelasCartao: string;
  melhorDiaPagamento: string;
  aceiteTermos: boolean;
}

const FORM_INICIAL: FormularioInscricao = {
  nomeCompleto: "",
  dataNascimento: "",
  igreja: "",
  bairroCidade: "",
  nomeResponsavel: "",
  telefoneResponsavel: "",
  formaPagamento: "",
  parcelasCartao: "",
  melhorDiaPagamento: "",
  aceiteTermos: false,
};

const STORAGE_KEY = "aviva_inscricao_acampamento";

function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(data: object) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default function InscricaoPage() {
  const [step, setStep] = useState<Step>("telefone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [validatedPhone, setValidatedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState<FormularioInscricao>(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dataAtual = useMemo(() => new Date(), []);
  const faixa = useMemo(() => getFaixaPagamento(dataAtual), [dataAtual]);

  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;
    if (saved.step) setStep(saved.step);
    if (saved.name) setName(saved.name);
    if (saved.phone) setPhone(saved.phone);
    if (saved.validatedPhone) setValidatedPhone(saved.validatedPhone);
    if (saved.form) setForm(saved.form);
  }, []);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveSession({ step, name, phone, validatedPhone, form });
  }, [step, name, phone, validatedPhone, form]);

  function handleChange(field: keyof FormularioInscricao, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/generate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: paraDigitos(phone) }),
      });
      const data = await res.json();
      if (data.success) {
        setValidatedPhone(phone);
        if (data.valid) {
          setForm((f) => ({ ...f, nomeCompleto: name }));
          setStep("dados");
        } else {
          setStep("otp");
        }
      } else {
        setError(data.mensagem || "Erro ao enviar código.");
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleValidateOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/validate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: paraE164(validatedPhone), code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, nomeCompleto: name }));
        setStep("dados");
      } else {
        setError(data.message || "Código inválido.");
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmitDados(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep("pagamento");
  }

  async function handleSubmitPagamento(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const idade = calcularIdade(form.dataNascimento, dataAtual);

    const payload = {
      nomeCompleto: form.nomeCompleto,
      telefone: paraE164(validatedPhone),
      dataNascimento: form.dataNascimento,
      idade,
      igreja: form.igreja,
      bairroCidade: form.bairroCidade,
      menorDeIdade: idade !== null && idade < 18,
      nomeResponsavel: idade !== null && idade < 18 ? form.nomeResponsavel : "",
      telefoneResponsavel: idade !== null && idade < 18 ? form.telefoneResponsavel : "",
      formaPagamento: form.formaPagamento,
      faixaPagamento: faixa,
      parcelasCartao: faixa.modo === "cartao-taxas" && form.formaPagamento === "parcelado" ? form.parcelasCartao : "",
      melhorDiaPagamento:
        faixa.modo === "parcelas-fixas" && form.formaPagamento === "parcelado" ? form.melhorDiaPagamento : "",
      aceiteTermos: form.aceiteTermos,
      dataInscricao: dataAtual.toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/inscricao-acampamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        clearSession();
        window.location.href = data.redirect_to || "/inscricao-confirmada";
      } else {
        setError(data.message || "Ocorreu um erro ao processar o envio.");
      }
    } catch (err) {
      setError("Erro ao enviar inscrição. Verifique sua conexão e tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#c185fb] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Acampamento Aviva</h1>
          <p className="text-black mt-1 text-sm">Inscrição</p>
          <StepIndicator step={step} />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {step === "telefone" && (
            <TelefoneStep
              name={name}
              phone={phone}
              loading={loading}
              onNameChange={setName}
              onPhoneChange={(v) => setPhone(formatarTelefone(v))}
              onSubmit={handleRequestOtp}
            />
          )}

          {step === "otp" && (
            <OtpStep
              phone={validatedPhone}
              otp={otp}
              loading={loading}
              onOtpChange={setOtp}
              onSubmit={handleValidateOtp}
              onBack={() => {
                setStep("telefone");
                setError("");
                setOtp("");
              }}
            />
          )}

          {step === "dados" && (
            <DadosStep
              form={form}
              validatedPhone={validatedPhone}
              referencia={dataAtual}
              onChange={handleChange}
              onSubmit={handleSubmitDados}
              onBack={() => setStep("telefone")}
            />
          )}

          {step === "pagamento" && (
            <PagamentoStep
              form={form}
              faixa={faixa}
              loading={loading}
              onChange={handleChange}
              onSubmit={handleSubmitPagamento}
              onBack={() => setStep("dados")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ["telefone", "otp", "dados", "pagamento"];
  const labels = ["Telefone", "Código", "Dados", "Pagamento"];
  const index = steps.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              i <= index ? "bg-[#750eda] text-white" : "bg-white text-[#750eda]"
            }`}
          >
            {i < index ? "✓" : i + 1}
          </div>
          <span className="text-xs hidden sm:block text-black">{labels[i]}</span>
          {i < steps.length - 1 && <div className="w-6 h-px mx-1 bg-[#750eda]" />}
        </div>
      ))}
    </div>
  );
}

function TelefoneStep({
  name,
  phone,
  loading,
  onNameChange,
  onPhoneChange,
  onSubmit,
}: {
  name: string;
  phone: string;
  loading: boolean;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Validação de WhatsApp</h2>
        <p className="text-gray-500 text-sm mt-1">
          Enviaremos um código de 4 dígitos para confirmar seu número.
        </p>
      </div>

      <Field label="Seu nome completo">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="João da Silva"
          className="input"
        />
      </Field>

      <Field label="WhatsApp (com DDD)">
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="(27) 99999-9999"
          className="input"
        />
      </Field>

      <SubmitButton loading={loading} label="Receber código" />
    </form>
  );
}

function OtpStep({
  phone,
  otp,
  loading,
  onOtpChange,
  onSubmit,
  onBack,
}: {
  phone: string;
  otp: string;
  loading: boolean;
  onOtpChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Confirme o código</h2>
        <p className="text-gray-500 text-sm mt-1">
          Enviamos um código para <span className="font-medium text-gray-700">{phone}</span> via WhatsApp.
        </p>
      </div>

      <Field label="Código de 4 dígitos">
        <input
          type="text"
          required
          inputMode="numeric"
          maxLength={4}
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="0000"
          className="input text-center text-2xl tracking-[0.5em] font-mono"
        />
      </Field>

      <SubmitButton loading={loading} label="Validar código" />

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1"
      >
        ← Alterar número
      </button>
    </form>
  );
}

function DadosStep({
  form,
  validatedPhone,
  referencia,
  onChange,
  onSubmit,
  onBack,
}: {
  form: FormularioInscricao;
  validatedPhone: string;
  referencia: Date;
  onChange: (field: keyof FormularioInscricao, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  const idade = calcularIdade(form.dataNascimento, referencia);
  const menorDeIdade = idade !== null && idade < 18;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Dados pessoais</h2>
        <p className="text-gray-500 text-sm mt-1">Preencha os campos abaixo para se inscrever.</p>
      </div>

      <Field label="Nome completo">
        <input
          type="text"
          required
          value={form.nomeCompleto}
          onChange={(e) => onChange("nomeCompleto", e.target.value)}
          placeholder="João da Silva"
          className="input"
        />
      </Field>

      <Field label="WhatsApp validado">
        <input type="text" value={validatedPhone} readOnly className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
      </Field>

      <Field label="Data de nascimento">
        <input
          type="date"
          required
          value={form.dataNascimento}
          onChange={(e) => onChange("dataNascimento", e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Igreja">
        <input
          type="text"
          required
          value={form.igreja}
          onChange={(e) => onChange("igreja", e.target.value)}
          placeholder="Nome da igreja"
          className="input"
        />
      </Field>

      <Field label="Bairro/Cidade">
        <input
          type="text"
          required
          value={form.bairroCidade}
          onChange={(e) => onChange("bairroCidade", e.target.value)}
          placeholder="Ex: Centro, Linhares/ES"
          className="input"
        />
      </Field>

      {menorDeIdade && (
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <p className="text-sm font-semibold text-gray-600">
            Como o inscrito é menor de idade, informe os dados do responsável.
          </p>
          <Field label="Nome do responsável">
            <input
              type="text"
              required
              value={form.nomeResponsavel}
              onChange={(e) => onChange("nomeResponsavel", e.target.value)}
              placeholder="Maria da Silva"
              className="input"
            />
          </Field>
          <Field label="Telefone do responsável">
            <input
              type="tel"
              required
              value={form.telefoneResponsavel}
              onChange={(e) => onChange("telefoneResponsavel", formatarTelefone(e.target.value))}
              placeholder="(27) 99999-9999"
              className="input"
            />
          </Field>
        </div>
      )}

      <SubmitButton loading={false} label="Ir para pagamento" />
      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1"
      >
        ← Alterar número
      </button>
    </form>
  );
}

function PagamentoStep({
  form,
  faixa,
  loading,
  onChange,
  onSubmit,
  onBack,
}: {
  form: FormularioInscricao;
  faixa: ReturnType<typeof getFaixaPagamento>;
  loading: boolean;
  onChange: (field: keyof FormularioInscricao, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  const mostrarMelhorDia = faixa.modo === "parcelas-fixas" && form.formaPagamento === "parcelado";
  const mostrarParcelasCartao = faixa.modo === "cartao-taxas" && form.formaPagamento === "parcelado";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Pagamento</h2>
        <p className="text-gray-500 text-sm mt-1">{faixa.label}</p>
      </div>

      <Field label="Forma de pagamento">
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-1 transition-all ${
              form.formaPagamento === "avista" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="formaPagamento"
              required
              value="avista"
              checked={form.formaPagamento === "avista"}
              onChange={() => onChange("formaPagamento", "avista")}
              className="sr-only"
            />
            <span className="font-semibold text-gray-900">À vista</span>
          </label>

          <label
            className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-1 transition-all ${
              form.formaPagamento === "parcelado" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="formaPagamento"
              required
              value="parcelado"
              checked={form.formaPagamento === "parcelado"}
              onChange={() => onChange("formaPagamento", "parcelado")}
              className="sr-only"
            />
            <span className="font-semibold text-gray-900">Parcelado</span>
          </label>
        </div>
      </Field>

      {faixa.modo === "parcelas-fixas" && form.formaPagamento === "avista" && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-700">
          Valor total à vista: <strong>{formatarMoeda(faixa.valorTotal)}</strong>
        </div>
      )}

      {faixa.modo === "parcelas-fixas" && form.formaPagamento === "parcelado" && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-700 space-y-1">
          <p>
            Entrada de <strong>{formatarMoeda(faixa.entrada)}</strong> + {faixa.numParcelas}x de{" "}
            <strong>{formatarMoeda(faixa.valorParcela)}</strong> sem juros.
          </p>
          <p className="text-xs text-gray-500">
            Número de parcelas determinado automaticamente pela data da inscrição.
          </p>
        </div>
      )}

      {faixa.modo === "cartao-taxas" && form.formaPagamento === "avista" && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-700">
          Pagamento à vista. Valor a confirmar diretamente com a organização.
        </div>
      )}

      {mostrarParcelasCartao && (
        <Field label="Número de parcelas no cartão">
          <select
            required
            value={form.parcelasCartao}
            onChange={(e) => onChange("parcelasCartao", e.target.value)}
            className="input"
          >
            <option value="">Selecionar</option>
            {OPCOES_PARCELAS_CARTAO.map((n) => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Parcelamento no cartão com acréscimo de taxas (percentual a definir pela organização).
          </p>
        </Field>
      )}

      {mostrarMelhorDia && (
        <Field label="Melhor dia do mês para pagamento">
          <select
            required
            value={form.melhorDiaPagamento}
            onChange={(e) => onChange("melhorDiaPagamento", e.target.value)}
            className="input"
          >
            <option value="">Selecionar</option>
            {DIAS_MES_PAGAMENTO.map((dia) => (
              <option key={dia} value={dia}>
                Dia {dia}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Usado para enviarmos lembretes das parcelas mensais via Pix.
          </p>
        </Field>
      )}

      <div className="flex items-start gap-3 pt-1">
        <input
          type="checkbox"
          id="termos"
          required
          checked={form.aceiteTermos}
          onChange={(e) => onChange("aceiteTermos", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
        />
        <label htmlFor="termos" className="text-sm text-gray-600 cursor-pointer leading-snug">
          Li e concordo com os{" "}
          <Link
            href="/termos-pagamento"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            termos de pagamento
          </Link>
          .
        </label>
      </div>

      <SubmitButton loading={loading} label="Finalizar inscrição" />
      <button
        type="button"
        disabled={loading}
        onClick={onBack}
        className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1"
      >
        ← Voltar
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-white font-semibold text-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {loading ? (
        <>
          <Spinner />
          Aguarde...
        </>
      ) : (
        label
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
