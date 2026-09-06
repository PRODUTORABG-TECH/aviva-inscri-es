import Link from "next/link";

export const metadata = {
  title: "Inscrição Confirmada - Aviva Sião 2027",
  description: "Inscrição registrada para o Aviva.",
};

export default function InscricaoConfirmadaPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Inscrição enviada!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Sua inscrição para o <strong>Aviva Sião 2027</strong> foi registrada. A vaga será confirmada
          após o pagamento da entrada.
        </p>
        <Link
            href="https://wa.me/5527997558607"
            className=" mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            Suporte
          </Link>
        <div className="mt-6 text-xs text-gray-400">Aviva Sião 2027</div>
      </div>
    </div>
  );
}
