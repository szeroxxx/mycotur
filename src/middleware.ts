import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'mycotur-secret-key' });

  // Allow direct access to login pages
  if (pathname === '/admin/login' || pathname === '/login') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/activities') || 
      pathname.startsWith('/events') || 
      pathname.startsWith('/agents') ||
      pathname.startsWith('/profile')) {
    
    if (!token) {
      const isAdminRoute = pathname.startsWith('/agents') || pathname.startsWith('/admin');
      const loginUrl = new URL(isAdminRoute ? '/admin/login' : '/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (pathname.startsWith('/agents') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/profile') && token.role !== 'agent') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/activities/:path*', 
    '/events/:path*', 
    '/agents/:path*',
    '/profile/:path*',
    '/login',
    '/admin/login'
  ],
};