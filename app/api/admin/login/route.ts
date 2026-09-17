import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { senha } = await request.json();
    const senhaCorreta = process.env.ADMIN_SECRET_KEY;

    if (!senhaCorreta) {
      console.error("Variável de ambiente ADMIN_SECRET_KEY não configurada.");
      return NextResponse.json({ error: 'Erro de configuração no servidor.' }, { status: 500 });
    }
    

    if (senha === senhaCorreta) {
      const response = NextResponse.json({ success: true });
      
      // Define o cookie de forma segura pelo servidor
      response.cookies.set({
        name: 'admin_token',
        value: senhaCorreta,
        path: '/',
        httpOnly: true, // Impede que scripts do navegador roubem o cookie
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Senha incorreta' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}