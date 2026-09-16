"use client";

import { useState } from "react";
import { gerarPixCopiaECola } from "@/lib/pagamento"; 

interface Parcela {
  numero: number;
  status: string; 
}

interface Lote {
  id_lote: string;
  lote_desc: string;
  valor_total: number;
  valor_entrada: number;
  valor_parcela: number;
  quantas_vezes: number;
}

interface Inscricao {
  id_inscricao: string;
  nome: string;
  data_inscricao: string; 
  lote: Lote;
  pagamentos: {
    is_pagamento_unico: boolean;
    entrada: string | null;
    parcelas: Parcela[];
  };
}

// NOVA FUNÇÃO: Agora retorna a data formatada e um boolean informando se já venceu
const calcularVencimento = (dataBase: string, mesesParaFrente: number) => {
  if (!dataBase) return { dataFormatada: "--/--/----", isVencido: false };

  try {
    let data: Date;
    
    if (dataBase.includes("/")) {
      const parteData = dataBase.split(" ")[0]; 
      const [dia, mes, anoStr] = parteData.split("/");
      
      let ano = Number(anoStr);
      if (ano < 100) {
        ano += 2000;
      }

      data = new Date(ano, Number(mes) - 1, Number(dia));
    } else {
      data = new Date(dataBase);
    }

    if (isNaN(data.getTime())) return { dataFormatada: "--/--/----", isVencido: false };

    // Adiciona os meses
    data.setMonth(data.getMonth() + mesesParaFrente);
    
    // Define a hora para o fim do dia (23:59:59), assim só acusa atraso no dia seguinte
    data.setHours(23, 59, 59, 999);

    const hoje = new Date();
    const isVencido = hoje > data;

    const dataFormatada = data.toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return { dataFormatada, isVencido };
  } catch (error) {
    return { dataFormatada: "--/--/----", isVencido: false };
  }
};

export default function ConsultaInscricaoPage() {
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [inscricoes, setInscricoes] = useState<Inscricao[] | null>(null);
  const [abaAtiva, setAbaAtiva] = useState(0);

  const [pixAberto, setPixAberto] = useState<{ id: string; valor: number; titulo: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, ""); 
    
    if (valor.length <= 2) {
      valor = valor.length > 0 ? `(${valor}` : "";
    } else if (valor.length <= 7) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`;
    }
    
    setTelefone(valor);
  };

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const telLimpo = telefone.replace(/\D/g, "");
      
      if (telLimpo.length < 10) {
        throw new Error("Por favor, digite um telefone válido com DDD.");
      }

      const API_URL = `https://n8n.produtorabg.com/webhook/aviva27-get-inscricao?telefone=55${telLimpo}`;
      
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Falha ao buscar dados.");
      
      const data = await response.json();

      if (data.inscricoes && data.inscricoes.length > 0) {
        setInscricoes(data.inscricoes);
        setAbaAtiva(0); 
        setPixAberto(null); 
      } else {
        setError("Nenhuma inscrição encontrada com esse telefone.");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao consultar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const sair = () => {
    setInscricoes(null);
    setTelefone("");
    setPixAberto(null);
  };

  const handleCopiarPix = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (!inscricoes) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Consultar Inscrição</h1>
          <p className="text-gray-500 text-sm mb-6">
            Digite o número de telefone (com DDD) usado na inscrição para ver seus pagamentos.
          </p>

          <form onSubmit={handleConsultar} className="space-y-4">
            <div>
              <input
                type="tel"
                placeholder="(27) 99999-9999"
                maxLength={15} 
                className="w-full p-4 border border-slate-300 rounded-xl text-center text-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                value={telefone}
                onChange={handleTelefoneChange} 
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Consultar Inscrições"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const inscricaoAtual = inscricoes[abaAtiva];
  const chavePixAtual = pixAberto ? gerarPixCopiaECola(pixAberto.valor, pixAberto.id) : "";

  const textoCartao = `Olá, gostaria de realizar o pagamento no cartão referente à inscrição #${inscricaoAtual.id_inscricao} em nome de ${inscricaoAtual.nome}.`;
  const linkWhatsAppCartao = `https://wa.me/5527997558607?text=${encodeURIComponent(textoCartao)}`;

  const StatusBadge = ({ status }: { status: string }) => {
    const isPago = status?.toLowerCase() === "pago";
    return (
      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
        isPago ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      }`}>
        {isPago ? "Pago" : "Pendente"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Minhas Inscrições</h1>
          <button onClick={sair} className="text-sm font-medium text-blue-600 hover:underline">
            Sair
          </button>
        </div>

        {/* Abas de Navegação */}
        {inscricoes.length > 1 && (
          <div className="flex overflow-x-auto space-x-2 mb-4 pb-2 scrollbar-hide">
            {inscricoes.map((insc, index) => {
              const nomeExibicao = insc.nome.split(" ").slice(0, 2).join(" ");
              
              return (
                <button
                  key={insc.id_inscricao}
                  onClick={() => {
                    setAbaAtiva(index);
                    setPixAberto(null); 
                  }}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    abaAtiva === index
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-500 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {nomeExibicao}
                </button>
              );
            })}
          </div>
        )}

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          
          <div className="bg-slate-800 p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Inscrito</p>
                <h2 className="text-xl font-bold">{inscricaoAtual.nome}</h2>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">ID</p>
                <p className="font-mono text-sm">#{inscricaoAtual.id_inscricao}</p>
              </div>
            </div>
            
            {inscricaoAtual.lote && (
              <div className="bg-slate-700/50 rounded-lg p-3 inline-block">
                <p className="text-sm">
                  <span className="font-semibold">{inscricaoAtual.lote.lote_desc}</span> | 
                  Total: {formatarMoeda(inscricaoAtual.lote.valor_total)}
                </p>
              </div>
            )}
          </div>

          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Status Financeiro</h3>

            {/* SE FOR PAGAMENTO ÚNICO */}
            {inscricaoAtual.pagamentos.is_pagamento_unico ? (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 text-center">
                <div className="flex justify-center items-center gap-2 mb-3">
                  <p className="text-purple-800 font-medium">Situação:</p>
                  <StatusBadge status={inscricaoAtual.pagamentos.entrada || "pendente"} />
                </div>

                {inscricaoAtual.pagamentos.entrada?.toLowerCase() !== "pago" ? (
                  <>
                    <p className="text-sm text-purple-700 mb-4">
                      Sua inscrição está configurada para pagamento à vista ou cartão.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => setPixAberto({
                          id: `AVIVA27-${inscricaoAtual.id_inscricao}`,
                          valor: inscricaoAtual.lote?.valor_total || 0,
                          titulo: "Pagamento à Vista"
                        })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Gerar PIX Total
                      </button>
                      <a 
                        href={linkWhatsAppCartao} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Pagar no Cartão
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm font-semibold mt-4">
                    🎉 Pagamento total concluído! Sua participação está confirmada.
                  </div>
                )}
              </div>
            ) : (
              /* SE FOR PARCELADO */
              <div className="space-y-4">
                
                {/* ENTRADA */}
                {(() => {
                  // Lógica para saber se a entrada está atrasada
                  const vencEntrada = calcularVencimento(inscricaoAtual.data_inscricao, 0);
                  const statusEntrada = inscricaoAtual.pagamentos.entrada || "pendente";
                  const isEntradaAtrasada = vencEntrada.isVencido && statusEntrada.toLowerCase() !== "pago";

                  return (
                    <div className={`flex items-center justify-between p-4 border rounded-xl ${isEntradaAtrasada ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Entrada</p>
                        <p className="text-gray-500 text-sm">
                          {formatarMoeda(inscricaoAtual.lote?.valor_entrada || 0)}
                          <span className={`text-xs block sm:inline sm:ml-2 ${isEntradaAtrasada ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            • Venc. {vencEntrada.dataFormatada}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={statusEntrada} />
                        {statusEntrada.toLowerCase() !== "pago" && (
                          <button 
                            onClick={() => setPixAberto({
                              id: `ENT-${inscricaoAtual.id_inscricao}`,
                              valor: inscricaoAtual.lote?.valor_entrada || 0,
                              titulo: "Entrada"
                            })}
                            className="text-blue-600 font-semibold text-sm hover:underline"
                          >
                            Pagar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* PARCELAS */}
                {inscricaoAtual.pagamentos.parcelas.map((parcela) => {
                  // Lógica para saber se a parcela está atrasada
                  const vencParcela = calcularVencimento(inscricaoAtual.data_inscricao, parcela.numero);
                  const isParcelaAtrasada = vencParcela.isVencido && parcela.status?.toLowerCase() !== "pago";

                  return (
                    <div key={parcela.numero} className={`flex items-center justify-between p-4 border rounded-xl ${isParcelaAtrasada ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Parcela {parcela.numero}</p>
                        <p className="text-gray-500 text-sm">
                          {formatarMoeda(inscricaoAtual.lote?.valor_parcela || 0)}
                          <span className={`text-xs block sm:inline sm:ml-2 ${isParcelaAtrasada ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            • Venc. {vencParcela.dataFormatada}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={parcela.status} />
                        {parcela.status?.toLowerCase() !== "pago" && (
                          <button 
                            onClick={() => setPixAberto({
                              id: `P${parcela.numero}-${inscricaoAtual.id_inscricao}`,
                              valor: inscricaoAtual.lote?.valor_parcela || 0,
                              titulo: `Parcela ${parcela.numero}`
                            })}
                            className="text-blue-600 font-semibold text-sm hover:underline"
                          >
                            Pagar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ÁREA DE EXIBIÇÃO DO PIX */}
            {pixAberto && (
              <div className="mt-6 p-5 border-2 border-blue-200 bg-blue-50 rounded-xl animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-blue-900">
                    Pagamento: {pixAberto.titulo} ({formatarMoeda(pixAberto.valor)})
                  </h4>
                  <button onClick={() => setPixAberto(null)} className="text-blue-500 hover:text-blue-700">
                    ✕
                  </button>
                </div>
                
                <p className="text-xs text-blue-700 mb-2">Copie a chave abaixo e pague no app do seu banco:</p>
                
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-200 mb-4">
                  <code className="text-xs text-gray-900 font-mono break-all flex-1 select-all">{chavePixAtual}</code>
                  <button
                    onClick={() => handleCopiarPix(chavePixAtual)}
                    className={`p-2 rounded-md transition-colors shrink-0 ${
                      copiado ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {copiado ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                
                <div className="bg-amber-100 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg mb-4 shadow-sm">
                  <strong>⚠️ Atenção:</strong> É obrigatório enviar o comprovante para validar este pagamento. A atualização do status de "Pendente" para "Pago" nesta tela <strong>não é instantânea</strong> e depende da verificação da nossa equipe.
                </div>

                <a 
                  href={`https://wa.me/5527997558607?text=${encodeURIComponent(`Olá, segue o comprovante do pagamento da ${pixAberto.titulo} (Inscrição #${inscricaoAtual.id_inscricao}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-semibold transition"
                >
                  Enviar Comprovante (WhatsApp)
                </a>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}