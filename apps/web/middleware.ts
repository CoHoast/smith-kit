import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // No middleware needed currently, but leaving file for future use
  return NextResponse.next()
}

export const config = {
  matcher: [],
}