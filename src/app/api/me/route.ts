import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signers } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const refCode = searchParams.get('ref')

    if (!refCode) {
      return NextResponse.json(
        { error: 'Código de referencia requerido' },
        { status: 400 }
      )
    }

    // Find the referrer
    const referrer = await db.query.signers.findFirst({
      where: (signers, { eq }) => eq(signers.refCode, refCode),
    })

    if (!referrer) {
      return NextResponse.json(
        { error: 'Código de referencia inválido' },
        { status: 404 }
      )
    }

    // Count referrals (people who signed using this referral code)
    const [referralCount] = await db
      .select({ count: count() })
      .from(signers)
      .where(eq(signers.refBy, refCode))

    return NextResponse.json({
      referrer: {
        name: referrer.name,
        refCode: referrer.refCode,
        createdAt: referrer.createdAt,
      },
      referralCount: referralCount.count,
    })

  } catch (error) {
    console.error('Me API error:', error)
    return NextResponse.json(
      { error: 'Error al obtener información de referencia' },
      { status: 500 }
    )
  }
}