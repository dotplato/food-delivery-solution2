import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('🔍 Middleware - Session:', {
      session,
      sessionError,
      userId: session?.user?.id,
      path: request.nextUrl.pathname,
    });

    if (!session) {
      console.log('⛔ No session - redirecting to login');
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    console.log('👤 Middleware - Profile:', {
      profile,
      profileError,
    });

    if (profileError || !profile) {
      console.log('⛔ No profile - redirecting to login');
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    const path = request.nextUrl.pathname;
    
    // Check if accessing admin routes
    if (path.startsWith('/admin')) {
      if (!profile.is_admin) {
        console.log('🚫 Not admin - redirecting to /');
        return NextResponse.redirect(new URL('/', request.url));
      }
      console.log('✅ Admin verified - allowing access');
      return res;
    }
    
    // Check if accessing dine-in order creation routes (admin only)
    if (path.startsWith('/DineIn')) {
      if (!profile.is_admin) {
        console.log('🚫 Not admin for DineIn - redirecting to /');
        return NextResponse.redirect(new URL('/', request.url));
      }
      console.log('✅ DineIn access verified - allowing access');
      return res;
    }
    
    // Check if accessing kitchen routes
    if (path.startsWith('/kitchen')) {
      // Allow staff with role 'kitchen' or 'admin' or 'staff'
      if (!profile.is_admin && !['kitchen', 'admin', 'staff'].includes(profile.role || '')) {
        console.log('🚫 Not authorized for kitchen - redirecting to /');
        return NextResponse.redirect(new URL('/', request.url));
      }
      console.log('✅ Kitchen access verified - allowing access');
      return res;
    }

    return res;
  } catch (error) {
    console.error('❌ Middleware error:', error);
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}


export const config = {
  matcher: ['/admin/:path*', '/admin', '/kitchen/:path*', '/kitchen', '/DineIn/:path*', '/DineIn']
}; 
