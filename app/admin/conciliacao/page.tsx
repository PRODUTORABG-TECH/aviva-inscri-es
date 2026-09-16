"use client";

import { useState, useEffect, useMemo } from "react";

// --- TIPAGENS ---
interface StatusPagamento {
  entrada: string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
}

interface InscricaoAdmin {
  id_inscricao: string;
  nome: string;
  telefone: string;
  data_inscricao: string;
  lote: {
    lote_desc: string;
    valor_total: number;
  } | null;
  status: StatusPagamento;
}

// 1. COMPONENTE DE BOTÃO EXTRAÍDO PARA FORA
const StatusBotao = ({ 
  label, 
  campo, 
  valorAtual, 
  isCarregando, 
  onToggle 
}: { 
  label: string; 
  campo: keyof StatusPagamento; 
  valorAtual: string;
  isCarregando: boolean;
  onToggle: (campo: keyof StatusPagamento) => void;
}) => {
  const isNA = valorAtual === "NA";
  const isPago = valorAtual.toLowerCase() === "pago";

  let cores = "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"; // Pendente
  if (isNA) cores = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"; // Não Aplicável
  else if (isPago) cores = "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"; // Pago

  return (
    <button
      onClick={() => onToggle(campo)}
      disabled={isNA || isCarregando}
      // AJUSTE: Padding responsivo e largura garantida
      className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border transition-all w-full overflow-hidden ${cores} ${isCarregando ? "opacity-50 cursor-wait" : ""}`}
    >
      {/* AJUSTE: Texto menor no celular */}
      <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-1 opacity-70 text-center">
        {label}
      </span>
      {/* AJUSTE: truncate adicionado caso a palavra seja absurda, mas text-xs garante que caiba */}
      <span className="text-xs sm:text-sm font-bold uppercase text-center w-full truncate px-1">
        {valorAtual}
      </span>
    </button>
  );
};

// 2. COMPONENTE PRINCIPAL
export default function DashboardConciliacao() {
  const [inscricoes, setInscricoes] = useState<InscricaoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busca, setBusca] = useState("");
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarInscricoes();
  }, []);

  const carregarInscricoes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/inscricoes");
      if (!response.ok) throw new Error("Falha ao carregar os dados.");
      
      const data = await response.json();
      if (data.success && data.inscricoes) {
        setInscricoes(data.inscricoes);
      }
    } catch (err: any) {
      setError("Erro ao conectar com o servidor. Tente atualizar a página.");
    } finally {
      setLoading(false);
    }
  };

  const inscricoesFiltradas = useMemo(() => {
    if (!busca) return inscricoes;
    const termo = busca.toLowerCase();
    return inscricoes.filter(
      (insc) => 
        insc.nome.toLowerCase().includes(termo) || 
        insc.id_inscricao.includes(termo)
    );
  }, [busca, inscricoes]);

  const handleToggleStatus = async (inscricao: InscricaoAdmin, campo: keyof StatusPagamento) => {
    const valorAtual = inscricao.status[campo];
    if (valorAtual === "NA" || atualizandoId) return;

    const novoValor = valorAtual.toLowerCase() === "pago" ? "pendente" : "pago";

    const statusAtualizado = {
      ...inscricao.status,
      [campo]: novoValor,
    };

    try {
      setAtualizandoId(inscricao.id_inscricao); 
      
      const response = await fetch("/api/conciliacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_inscricao: inscricao.id_inscricao,
          status: statusAtualizado,
        }),
      });

      if (!response.ok) throw new Error("Falha ao atualizar");

      setInscricoes((prev) =>
        prev.map((item) =>
          item.id_inscricao === inscricao.id_inscricao
            ? { ...item, status: statusAtualizado }
            : item
        )
      );
    } catch (err) {
      alert("Erro ao atualizar o status. Verifique a conexão.");
    } finally {
      setAtualizandoId(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      
      {/* CABEÇALHO E BUSCA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Inscrições e Conciliação</h2>
            <p className="text-sm text-slate-500">Gerencie os pagamentos e dê baixas manuais.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-100 self-start md:self-auto">
            Total: {inscricoesFiltradas.length} inscrições
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por Nome ou #ID da Inscrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full p-4 pl-12 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <svg className="w-6 h-6 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-500 animate-pulse font-medium">
          Carregando banco de dados...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-200">
          {error}
        </div>
      )}

      {/* GRID DE INSCRIÇÕES */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {inscricoesFiltradas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              Nenhuma inscrição encontrada para "{busca}".
            </div>
          ) : (
            inscricoesFiltradas.map((insc) => (
              <div 
                key={insc.id_inscricao} 
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all shadow-sm relative overflow-hidden ${atualizandoId === insc.id_inscricao ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:shadow-md"}`}
              >
                
                {atualizandoId === insc.id_inscricao && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                )}

                {/* AJUSTE: flex-col no mobile, flex-row no desktop. gap-3 pra dar respiro */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                  <div className="w-full">
                    {/* line-clamp-2 garante que o nome grande não vaze do card */}
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-2" title={insc.nome}>
                      {insc.nome}
                    </h3>
                    
                    {/* flex-wrap garante que o texto desça de forma elegante */}
                    <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap gap-2 items-center mt-1">
                      <span>{insc.telefone}</span>
                      {insc.data_inscricao && (
                        <>
                          <span className="text-slate-300 hidden sm:inline">|</span>
                          <span>{insc.data_inscricao}</span>
                        </>
                      )}
                    </p>
                  </div>
                  
                  {/* AJUSTE: Fica na própria linha no mobile, garantindo que cabe todo o ID */}
                  <div className="shrink-0 self-start">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono font-bold break-all inline-block max-w-full">
                      #{insc.id_inscricao}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg flex flex-wrap gap-2 justify-between items-center mb-5 border border-slate-100 text-sm">
                  <span className="font-medium text-slate-700">
                    {insc.lote ? insc.lote.lote_desc : "Lote Indefinido"}
                  </span>
                  <span className="font-bold text-slate-900">
                    {insc.lote ? insc.lote.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}) : "-"}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                    Conciliação de Pagamentos
                  </p>
                  
                  {/* AJUSTE PRINCIPAL: grid responsivo. 
                      Celular = 2 colunas. Tablet = 3 colunas. PC = 5 colunas. */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                    <StatusBotao 
                      label="Entrada" 
                      campo="entrada" 
                      valorAtual={insc.status.entrada} 
                      isCarregando={atualizandoId === insc.id_inscricao}
                      onToggle={(campo) => handleToggleStatus(insc, campo)} 
                    />
                    <StatusBotao 
                      label="Parc. 1" 
                      campo="p1" 
                      valorAtual={insc.status.p1} 
                      isCarregando={atualizandoId === insc.id_inscricao}
                      onToggle={(campo) => handleToggleStatus(insc, campo)} 
                    />
                    <StatusBotao 
                      label="Parc. 2" 
                      campo="p2" 
                      valorAtual={insc.status.p2} 
                      isCarregando={atualizandoId === insc.id_inscricao}
                      onToggle={(campo) => handleToggleStatus(insc, campo)} 
                    />
                    <StatusBotao 
                      label="Parc. 3" 
                      campo="p3" 
                      valorAtual={insc.status.p3} 
                      isCarregando={atualizandoId === insc.id_inscricao}
                      onToggle={(campo) => handleToggleStatus(insc, campo)} 
                    />
                    <StatusBotao 
                      label="Parc. 4" 
                      campo="p4" 
                      valorAtual={insc.status.p4} 
                      isCarregando={atualizandoId === insc.id_inscricao}
                      onToggle={(campo) => handleToggleStatus(insc, campo)} 
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}