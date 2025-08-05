import { NextResponse } from 'next/server'

// This endpoint is no longer needed since we create ZapSign signer directly in /api/sign
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated' },
    { status: 410 }
  )
}