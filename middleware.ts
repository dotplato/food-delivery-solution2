import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // No protected routes to check anymore
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
