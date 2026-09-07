"use client";

import Link from "next/link";
import { useState } from "react";

export default function PagamentoInscricaoPage() {
  const [copiado, setCopiado] = useState(false);
  const chavePix = "27acc841-cc02-4118-83b2-874c15a237b1";

  const copiarChavePix = () => {
    navigator.clipboard.writeText(chavePix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        
        {/* Ícone de Sucesso */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Inscrição registrada!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Olá! Sua inscrição para o <strong>Aviva Sião 2027</strong> foi recebida.
        </p>

        {/* Resumo da Inscrição */}
        <div className="bg-slate-50 rounded-xl p-4 text-left text-sm text-gray-700 mb-6 border border-slate-200 shadow-sm">
          <p className="mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Resumo do Pedido</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Lote:</span>
            <span className="font-semibold text-gray-900">Lote 01</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Valor Total:</span>
            <span className="font-medium">R$ 420,00</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">Parcelamento:</span>
            <span className="font-medium">4x de R$ 85,00</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="font-bold text-gray-800">Entrada (a pagar):</span>
            <span className="font-bold text-green-600 text-lg">R$ 80,00</span>
          </div>
        </div>

        {/* Instruções e PIX */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            Efetue o pagamento da entrada para confirmar a sua inscrição. 
          </p>
          
          {/* Caixa da Chave PIX */}
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
          {/* Mensagem de Feedback de Cópia */}
          <div className="h-4 mt-1">
            {copiado && <p className="text-xs text-green-600 font-medium">Chave PIX copiada!</p>}
          </div>
        </div>

        {/* Botão de Suporte / Envio de Comprovante */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-gray-500 mb-3">
            Lembre-se de enviar o comprovante de depósito para nossa equipe de suporte para confirmar o pagamento.
          </p>
          <Link
            href="https://wa.me/5527997558607"
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