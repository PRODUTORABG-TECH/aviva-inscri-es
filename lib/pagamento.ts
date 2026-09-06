export type FaixaPagamento =
  | {
      modo: "parcelas-fixas";
      label: string;
      valorTotal: number;
      entrada: number;
      numParcelas: number;
      valorParcela: number;
    }
  | {
      modo: "cartao-taxas";
      label: string;
    };

// TODO: confirmar com o cliente o percentual/valor de acréscimo por parcela no
// cartão para inscrições feitas a partir de 16/11. Nenhum cálculo de valor é
// feito enquanto isso não for definido.
export const TAXA_CARTAO_POR_PARCELA_INDEFINIDA = true;

export const OPCOES_PARCELAS_CARTAO = Array.from({ length: 12 }, (_, i) => i + 1);

export const DIAS_MES_PAGAMENTO = Array.from({ length: 28 }, (_, i) => i + 1);

export function getFaixaPagamento(dataAtual: Date): FaixaPagamento {
  // O ciclo de inscrição abre em setembro e se estende até o pagamento final
  // em janeiro do ano seguinte. Para datas de janeiro a agosto, os cortes de
  // 15/09-15/11 pertencem ao ciclo iniciado em setembro do ano anterior.
  const mes = dataAtual.getMonth();
  const anoCiclo = mes >= 8 ? dataAtual.getFullYear() : dataAtual.getFullYear() - 1;
  const corte15Set = new Date(anoCiclo, 8, 15, 23, 59, 59, 999);
  const corte15Out = new Date(anoCiclo, 9, 15, 23, 59, 59, 999);
  const corte15Nov = new Date(anoCiclo, 10, 15, 23, 59, 59, 999);

  if (dataAtual <= corte15Set) {
    return {
      modo: "parcelas-fixas",
      label: "LOTE 01 - Inscrições até 15/09",
      valorTotal: 420,
      entrada: 80,
      numParcelas: 4,
      valorParcela: 85,
    };
  }
  if (dataAtual <= corte15Out) {
    return {
      modo: "parcelas-fixas",
      label: "Inscrições até 15/10",
      valorTotal: 450,
      entrada: 90,
      numParcelas: 3,
      valorParcela: 120,
    };
  }
  if (dataAtual <= corte15Nov) {
    return {
      modo: "parcelas-fixas",
      label: "Inscrições até 15/11",
      valorTotal: 490,
      entrada: 150,
      numParcelas: 2,
      valorParcela: 170,
    };
  }
  return {
    modo: "cartao-taxas",
    label: "Inscrições a partir de 16/11",
  };
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function calcularIdade(dataNascimento: string, referencia: Date = new Date()): number | null {
  if (!dataNascimento) return null;
  const partes = dataNascimento.split("-").map(Number);
  const [ano, mes, dia] = partes;
  if (!ano || !mes || !dia) return null;

  let idade = referencia.getFullYear() - ano;
  const aniversarioEsteAno = new Date(referencia.getFullYear(), mes - 1, dia);
  if (referencia < aniversarioEsteAno) idade--;
  return idade;
}

export function formatarTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
