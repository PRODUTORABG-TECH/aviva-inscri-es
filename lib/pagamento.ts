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


export interface Lote {
  id_lote: string;
  lote_desc: string;
  data_abertura_lote: string;
  data_fechamento_lote: string;
  is_active: boolean;
  valor_total: number;
  valor_entrada: number;
  quantas_vezes: number;
  valor_parcela: number;
}

export interface LoteResponse {
  success: boolean;
  lotes: Lote[];
}

// Como o seu JSON original é um array de objetos, a tipagem final será um array da interface principal:
export type LotesApiResponse = LoteResponse;

// TODO: confirmar com o cliente o percentual/valor de acréscimo por parcela no
// cartão para inscrições feitas a partir de 16/11. Nenhum cálculo de valor é
// feito enquanto isso não for definido.
export const TAXA_CARTAO_POR_PARCELA_INDEFINIDA = true;

export const OPCOES_PARCELAS_CARTAO = Array.from({ length: 12 }, (_, i) => i + 1);

export const DIAS_MES_PAGAMENTO = Array.from({ length: 28 }, (_, i) => i + 1);


export async function fetchLotesData(): Promise<LotesApiResponse> {
  // Defina sua URL aqui
  const API_URL = 'https://n8n.produtorabg.com/webhook/aviva-get-lotes'; 

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição HTTP: ${response.status} ${response.statusText}`);
    }

    const data: LotesApiResponse = await response.json();

    return data;
    
  } catch (error) {
    console.error('Falha ao buscar os lotes:', error);
    throw error; 
  }
}


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


// ==========================================
// FUNÇÕES AUXILIARES (Uso interno no arquivo)
// ==========================================

function formatarPix(id: string, valor: string): string {
  const tamanho = valor.length.toString().padStart(2, '0');
  return `${id}${tamanho}${valor}`;
}

function calcularCRC16Pix(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// ==========================================
// FUNÇÃO EXPORTADA
// ==========================================

/**
 * Gera um código Pix Copia e Cola.
 * @param valor O valor da cobrança (ex: 150.50)
 * @param descricao Uma descrição opcional para o pagamento
 * @returns String contendo o BR Code (Pix Copia e Cola)
 */
export function gerarPixCopiaECola(valor: number, descricao: string = ''): string {
  // 1. DADOS HARDCODED (Substitua pelos seus dados reais)
  const CHAVE_PIX = '27acc841-cc02-4118-83b2-874c15a237b1'; // Sua chave aleatória
  const NOME_RECEBEDOR = 'IGREJA MONTE SIAO'.substring(0, 25);
  const CIDADE_RECEBEDOR = 'LINHARES'.substring(0, 15);

  // 2. Montagem dos blocos
  const gui = formatarPix('00', 'br.gov.bcb.pix');
  const chavePix = formatarPix('01', CHAVE_PIX);
  const textoDescricao = descricao.substring(0, 37);
  const descricaoPix = textoDescricao ? formatarPix('02', textoDescricao) : '';
  const merchantAccountInfo = formatarPix('26', gui + chavePix + descricaoPix);

  const txId = formatarPix('05', '***');
  const additionalDataField = formatarPix('62', txId);

  // 3. Montagem do Payload Completo
  let payload = 
    '000201' +                                      
    merchantAccountInfo +                           
    '52040000' +                                    
    '5303986' +                                     
    formatarPix('54', valor.toFixed(2)) +           
    '5802BR' +                                      
    formatarPix('59', NOME_RECEBEDOR) +             
    formatarPix('60', CIDADE_RECEBEDOR) +           
    additionalDataField +                           
    '6304';                                         

  // 4. Adiciona o cálculo validador no final
  payload += calcularCRC16Pix(payload);

  return payload;
}