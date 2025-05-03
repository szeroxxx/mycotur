import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'mycotur-secret-key' });
  if (pathname === '/login') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/activities') || 
      pathname.startsWith('/events') || 
      pathname.startsWith('/agents')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/activities/:path*', '/events/:path*', '/agents/:path*', '/login'],
};