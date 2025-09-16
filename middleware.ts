
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // No authentication or route checks — always allow the request
  return NextResponse.next();
}

export const config = {
  // Keep this if you want middleware to still run on all routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
