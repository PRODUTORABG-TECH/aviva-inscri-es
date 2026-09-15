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
        
        {/* Cabeçalho e Mensagens */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dados para Depósito</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-1">
          Abaixo estão os dados para realizar o pagamento da sua inscrição.
        </p>
        
        {/* Mensagem discreta pedindo para conferir o valor */}
        <p className="text-xs text-gray-400 italic mb-6 px-4">
          * Por favor, certifique-se de conferir e transferir o valor correspondente ao seu formato de inscrição.
        </p>

        {/* Seção do QR Code */}
        <div className="mb-6 flex flex-col items-center">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm inline-block mb-3">
            {/* 
              ⚠️ IMPORTANTE: Coloque a imagem do seu QR Code na pasta "public" do seu projeto Next.js
              e altere o "src" abaixo para o nome do seu arquivo (ex: "/meu-qr-code.png").
              Se preferir usar uma biblioteca que gera na hora, recomendo a "react-qr-code".
            */}
            <img 
              src="/qrcode-pix-aviva27.png" 
              alt="QR Code PIX Aviva Sião" 
              className="w-48 h-48 object-contain bg-slate-50 rounded-xl"
            />
          </div>
          <p className="text-sm font-medium text-gray-600">
            Escaneie o QR Code com o app do seu banco
          </p>
        </div>

        {/* Divisor Visual */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider font-semibold">
            ou copie a chave
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
            Após o pagamento, não se esqueça de enviar o comprovante para nossa equipe confirmar sua inscrição.
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