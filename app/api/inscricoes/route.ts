import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // O Next.js faz a chamada para o n8n adicionando o HEADER SECRETO no servidor
    const response = await fetch("https://n8n.produtorabg.com/webhook/get-all-inscricoes", {
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