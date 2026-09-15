"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { gerarPixCopiaECola } from "@/lib/pagamento";


const formatarValorUrl = (valor: string | null) => {
  if (!valor) return null;

  // Troca vírgula por ponto (caso o n8n mande "420,5") e converte para número
  const numero = parseFloat(valor.replace(",", "."));

  // Se por algum motivo o valor for inválido, retorna um fallback seguro
  if (isNaN(numero)) return valor;

  // Formata o número forçando sempre 2 casas decimais (ex: 420 vira "420,00")
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Subcomponente que lida com a lógica da URL e renderiza o conteúdo
function PagamentoInscricaoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extração dos parâmetros da URL
  const id = searchParams.get("id");
  const nome = searchParams.get("nome");
  const lote = searchParams.get("lote");
  const valorTotal = searchParams.get("valorTotal");
  const valorEntrada = searchParams.get("valorEntrada");
  const parcelas = searchParams.get("parcelas");
  const vlrParcela = searchParams.get("vlrParcela");

  const [copiado, setCopiado] = useState(false);
  const chavePix = valorEntrada && id ? gerarPixCopiaECola(parseFloat(valorEntrada), `AVIVA27-ENT-${id}`): "27acc841-cc02-4118-83b2-874c15a237b1";

  // Redireciona se não houver ID de inscrição na URL
  useEffect(() => {
    if (!id) {
      router.push("/inscricao");
    }
  }, [id, router]);

  const copiarChavePix = () => {
    navigator.clipboard.writeText(chavePix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Se não tiver ID, retorna null para não "piscar" a tela antes de redirecionar
  if (!id) return null;


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        
        {/* Cabeçalho */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Inscrição Concluída!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Sua vaga está pré-reservada. Realize o pagamento da entrada para confirmar sua participação.
        </p>

        {/* Resumo Dinâmico da Inscrição */}
        <div className="bg-slate-50 rounded-xl p-5 text-left text-sm text-gray-700 mb-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-1">
            Resumo da Inscrição
          </h2>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ID do Pedido:</span>
              <span className="font-mono font-semibold text-gray-900">#{id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Inscrito(a):</span>
              <span className="font-medium text-gray-900 truncate max-w-[180px]">{nome || "Não informado"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Inscrito no Lote:</span>
              <span className="font-medium text-gray-900">{lote || "Lote vigente"}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Valor Total:</span>
              <span className="font-medium text-gray-700">{valorTotal ? `R$ ${formatarValorUrl(valorTotal)}` : "-"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Parcelamento:</span>
              <span>{parcelas && vlrParcela ? `${parcelas}x de ${formatarValorUrl(vlrParcela)}` : "À vista"}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-300 bg-green-50 -mx-5 px-5 pb-2">
            <span className="font-bold text-gray-800 mt-2">Valor da Entrada (PIX):</span>
            <span className="font-bold text-green-700 text-lg mt-2">
              {valorEntrada ? `R$ ${formatarValorUrl(valorEntrada)}` : "-"}
            </span>
          </div>
        </div>

    

        {/* Divisor Visual */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider font-semibold">
            Copie a chave {valorEntrada && id ? " | PIX COPIA E COLA" : ""}
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Chave PIX Copia e Cola */}
        <div className="mb-8">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <code className="text-xs text-gray-700 break-all flex-1 text-left px-2 select-all">
              {chavePix}
            </code>
            <button
              onClick={copiarChavePix}
              className={`p-2 rounded-md transition-colors shrink-0 flex items-center justify-center ${
                copiado ? "bg-green-600 text-white" : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
              title="Copiar chave PIX"
            >
              {copiado ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <div className="h-4 mt-1">
            {copiado && <p className="text-xs text-green-600 font-medium">Chave PIX copiada!</p>}
          </div>
        </div>

        {/* Botão de Suporte / Envio de Comprovante */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-gray-500 mb-3">
            Após o pagamento, envie o comprovante citando o <strong>ID #{id}</strong> para nossa equipe.
          </p>
          <Link
            href={`https://wa.me/5527997558607?text=Ol%C3%A1%2C%20segue%20o%20comprovante%20da%20inscri%C3%A7%C3%A3o%20%23${id}%20em%20nome%20de%20${nome}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex justify-center items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            Enviar Comprovante / Suporte
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-400">Aviva Sião 2027</div>
      </div>
    </div>
  );
}

// Componente Principal que exporta a página envelopada no Suspense
export default function PagamentoInscricaoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Carregando dados da inscrição...</div>
      </div>
    }>
      <PagamentoInscricaoContent />
    </Suspense>
  );
}