import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import config from '@/lib/const.json';
import { hasDateRestrictionExpired } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const dateRestrictionEnabled = config.dateRestriction?.enabled !== false;

  if (!dateRestrictionEnabled) {
    return NextResponse.next();
  }

  if (hasDateRestrictionExpired(new Date())) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};

