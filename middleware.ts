import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Pegamos o cookie de autenticação, se existir
  const token = request.cookies.get('admin_token')?.value;
  
  // A senha que os voluntários vão usar
  const SENHA_SECRETA = process.env.ADMIN_SECRET_KEY || 'siao2027admin';

  // Se tentar acessar qualquer rota dentro de /admin (exceto a própria página de login)
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    
    // Se não tiver cookie ou a senha não bater, manda para a tela de login
    if (token !== SENHA_SECRETA) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configura o middleware para rodar apenas nas rotas /admin
export const config = {
  matcher: '/admin/:path*',
};