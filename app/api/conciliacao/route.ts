import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {



  const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const SENHA_SECRETA = process.env.ADMIN_SECRET_KEY;
  
  
    if (token !== SENHA_SECRETA) {
      return NextResponse.json({ error: 'Acesso negado. Não autorizado.' }, { status: 401 });
    }
  
    const n8nUrl_set_inscricoes = process.env.N8N_WEBHOOK_URL_SET_INSCRICAO;
  
  
    if (!n8nUrl_set_inscricoes) {
      console.error("Variável de ambiente N8N_WEBHOOK_URL_SET_INSCRICAO não configurada.");
      return NextResponse.json( 
        { error: 'Erro de configuração no servidor.' },
        { status: 500 }
      );
    }


  try {
    const body = await request.json();

    const { id_inscricao, status } = body;

    // Validação básica
    if (!id_inscricao || !status) {
      return NextResponse.json(
        { error: 'ID da inscrição e status são obrigatórios.' },
        { status: 400 }
      );
    }

    // 2. Monta o payload "Limpo" para o n8n
    // Já mapeamos com os nomes exatos das colunas da planilha (st-ent, st-p1...)
    // para facilitar a atualização lá no nó do Google Sheets.
    const payloadParaN8n = {
      id_inscricao: id_inscricao,
      'st-ent': status.entrada,
      'st-p1': status.p1,
      'st-p2': status.p2,
      'st-p3': status.p3,
      'st-p4': status.p4,
    };

    // 3. Valida as variáveis de ambiente
    const n8nUrl_set_inscricoes = process.env.N8N_WEBHOOK_URL_SET_INSCRICAO;
    const n8nSecret = process.env.N8N_SECRET;

    if (!n8nUrl_set_inscricoes || !n8nSecret) {
      console.error("Variáveis de ambiente do n8n não configuradas.");
      return NextResponse.json(
        { error: 'Erro de configuração no servidor.' },
        { status: 500 }
      );
    }

    // 4. Envia para o n8n com a chave de segurança
    const response = await fetch(n8nUrl_set_inscricoes, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': n8nSecret, // Aqui vai a trava de segurança
      },
      body: JSON.stringify(payloadParaN8n),
    });

    if (!response.ok) {
      throw new Error(`Erro do n8n: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Retorna sucesso para o Front-end
    return NextResponse.json({ 
      success: true, 
      message: 'Status atualizado com sucesso!',
      data 
    });

  } catch (error) {
    console.error('Erro na rota de atualização de conciliação:', error);
    return NextResponse.json(
      { error: 'Falha interna ao processar a atualização.' },
      { status: 500 }
    );
  }
}