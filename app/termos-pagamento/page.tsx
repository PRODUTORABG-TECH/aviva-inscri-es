import type { Metadata } from "next";
import Link from "next/link";
import { formatarMoeda, getFaixaPagamento } from "@/lib/pagamento";

export const metadata: Metadata = {
  title: "Termos de Pagamento — Acampamento Aviva",
};

export default function TermosPagamentoPage() {
  const faixaAtual = getFaixaPagamento(new Date());

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
            Acampamento Aviva
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Termos de Pagamento</h1>
        </header>

        <Section title="Valores por data de inscrição">
          <ul className="space-y-2">
            <FaixaItem
              texto="Inscrições até 15/09: valor total R$ 420. Entrada de R$ 80 + 4x de R$ 85 sem juros."
              destaque={faixaAtual.modo === "parcelas-fixas" && faixaAtual.label === "Inscrições até 15/09"}
            />
            <FaixaItem
              texto="Inscrições até 15/10: valor total R$ 450. Entrada de R$ 90 + 3x de R$ 120 sem juros."
              destaque={faixaAtual.modo === "parcelas-fixas" && faixaAtual.label === "Inscrições até 15/10"}
            />
            <FaixaItem
              texto="Inscrições até 15/11: valor total R$ 490. Entrada de R$ 150 + 2x de R$ 170 sem juros."
              destaque={faixaAtual.modo === "parcelas-fixas" && faixaAtual.label === "Inscrições até 15/11"}
            />
            <FaixaItem
              texto="A partir de 16/11, as inscrições são feitas à vista ou parceladas no cartão, com acréscimo das taxas."
              destaque={faixaAtual.modo === "cartao-taxas"}
            />
          </ul>
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            {faixaAtual.modo === "parcelas-fixas" ? (
              <p>
                Faixa vigente hoje: <strong>{faixaAtual.label}</strong> — entrada de{" "}
                <strong>{formatarMoeda(faixaAtual.entrada)}</strong> + {faixaAtual.numParcelas}x de{" "}
                <strong>{formatarMoeda(faixaAtual.valorParcela)}</strong> sem juros (total{" "}
                {formatarMoeda(faixaAtual.valorTotal)}).
              </p>
            ) : (
              <p>
                Faixa vigente hoje: <strong>{faixaAtual.label}</strong> — pagamento à vista ou parcelado no
                cartão com acréscimo de taxas.
              </p>
            )}
          </div>
        </Section>

        <Section title="Condições gerais">
          <ul className="space-y-3">
            <li>A inscrição só é confirmada mediante o pagamento da entrada.</li>
            <li>
              As parcelas sem juros devem ser pagas via Pix, e os comprovantes precisam ser enviados todos os
              meses.
            </li>
            <li>
              A última parcela ou o saldo devedor precisa ser pago até o dia <strong>15/01</strong>, podendo ser
              pago via cartão de crédito com o adicional das taxas.
            </li>
            <li>
              Após o dia 15/01, se o pagamento total não tiver sido feito, a inscrição será desconsiderada.
            </li>
            <li>
              Em caso de desistência (exceto exclusivamente por motivo de saúde) <strong>NÃO</strong> haverá
              reembolso do montante pago. Pode haver transferência da inscrição para outra pessoa, desde que
              mantidas as mesmas condições de sexo, faixa etária e origem do transporte.
            </li>
            <li>As acomodações são em alojamentos (beliches).</li>
            <li>É obrigatória a participação nas plenárias.</li>
            <li>Está incluso: café da manhã, almoço, café da tarde, jantar e transporte.</li>
          </ul>
        </Section>

        <div className="pt-2 text-center">
          <Link
            href="/inscricao"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            Voltar para a inscrição
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

function FaixaItem({ texto, destaque }: { texto: string; destaque: boolean }) {
  return (
    <li className={`flex gap-2 rounded-lg px-2 py-1 ${destaque ? "bg-blue-50" : ""}`}>
      <span className="text-blue-500 font-bold shrink-0">•</span>
      <span className={destaque ? "font-semibold text-gray-900" : ""}>{texto}</span>
    </li>
  );
}
