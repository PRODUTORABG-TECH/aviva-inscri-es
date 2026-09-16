"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(false);

    // Verifica se a senha bate com a do Middleware
    if (senha === "siao2027admin") {
      // Cria um cookie que dura 7 dias. Assim ele não precisa logar todo dia.
      document.cookie = `admin_token=${senha}; path=/; max-age=${60 * 60 * 24 * 7}`;
      
      // Redireciona para o painel
      router.push("/admin/conciliacao");
    } else {
      setErro(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl">
        
        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">Acesso Restrito</h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Área administrativa da conciliação.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Digite a senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>

          {erro && (
            <p className="text-red-400 text-sm text-center font-medium">
              Senha incorreta. Tente novamente.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition"
          >
            Entrar no Painel
          </button>
        </form>

      </div>
    </div>
  );
}