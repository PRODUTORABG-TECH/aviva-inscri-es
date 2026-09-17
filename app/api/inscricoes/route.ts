import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {

  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const SENHA_SECRETA = process.env.ADMIN_SECRET_KEY;


  if (token !== SENHA_SECRETA) {
    return NextResponse.json({ error: 'Acesso negado. Não autorizado.' }, { status: 401 });
  }

  const n8nUrl_get_inscricoes = process.env.N8N_WEBHOOK_URL_GET_INSCRICAO;


  if (!n8nUrl_get_inscricoes) {
    console.error("Variável de ambiente N8N_WEBHOOK_URL_GET_INSCRICAO não configurada.");
    return NextResponse.json( 
      { error: 'Erro de configuração no servidor.' },
      { status: 500 }
    );
  }

  try {
    // O Next.js faz a chamada para o n8n adicionando o HEADER SECRETO no servidor
    const response = await fetch(n8nUrl_get_inscricoes, {
      method: 'GET',
      headers: {
        'x-n8n-secret': process.env.N8N_SECRET || '',
      },
    });


    if (!response.ok) {
      throw new Error('Erro ao comunicar com o servidor de dados.');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno ao processar requisição' }, { status: 500 });
  }
}