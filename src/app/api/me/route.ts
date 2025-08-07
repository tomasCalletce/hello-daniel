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

    // Count referrals by checking events for this referral code (with deduplication)
    const referralEvents = await db
      .select({
        timestamp: events.createdAt,
        payload: events.payload
      })
      .from(events)
      .where(
        and(
          eq(events.type, 'counter_increment'),
          like(events.payload, `%"refBy":"${refCode}"%`)
        )
      )

    // Deduplicate by grouping events that happened within 5 seconds of each other
    const uniqueSignatures = new Set<string>()
    
    referralEvents.forEach(event => {
      try {
        if (!event.payload) {
          // If no payload, use event timestamp
          const timestamp = new Date(event.timestamp).getTime()
          const roundedTime = Math.floor(timestamp / 5000) * 5000
          const key = `${refCode}-${roundedTime}`
          uniqueSignatures.add(key)
          return
        }
        
        const payload = JSON.parse(event.payload)
        const timestamp = new Date(payload.timestamp || event.timestamp).getTime()
        // Round to nearest 5 seconds to group duplicates
        const roundedTime = Math.floor(timestamp / 5000) * 5000
        const key = `${refCode}-${roundedTime}`
        uniqueSignatures.add(key)
      } catch (e) {
        // If payload parsing fails, still count it but use event timestamp
        const timestamp = new Date(event.timestamp).getTime()
        const roundedTime = Math.floor(timestamp / 5000) * 5000
        const key = `${refCode}-${roundedTime}`
        uniqueSignatures.add(key)
      }
    })

    const referralCount = { count: uniqueSignatures.size }

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