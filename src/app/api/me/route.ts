import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { referrals, events } from '@/lib/db/schema'
import { eq, count, and, like } from 'drizzle-orm'

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

    // Look for referrer in referrals table
    const referrer = await db.query.referrals.findFirst({
      where: (referrals, { eq }) => eq(referrals.refCode, refCode),
    })

    if (!referrer) {
      return NextResponse.json(
        { error: 'Código de referencia inválido' },
        { status: 404 }
      )
    }

    // Count referrals by checking events for this referral code
    const [referralCount] = await db
      .select({ count: count() })
      .from(events)
      .where(
        and(
          eq(events.type, 'counter_increment'),
          like(events.payload, `%"refBy":"${refCode}"%`)
        )
      )

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