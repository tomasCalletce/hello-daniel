import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { referrals, events } from '@/lib/db/schema'
import { eq, count, and, like } from 'drizzle-orm'

export async function GET() {
  try {
    // Get all referrals
    const allReferrals = await db.query.referrals.findMany({
      orderBy: (referrals, { desc }) => [desc(referrals.createdAt)],
    })

    // Count signatures for each referral by checking events
    const referralData = await Promise.all(
      allReferrals.map(async (referral) => {
        const [signatureCount] = await db
          .select({ count: count() })
          .from(events)
          .where(
            and(
              eq(events.type, 'counter_increment'),
              like(events.payload, `%"refBy":"${referral.refCode}"%`)
            )
          )

        return {
          id: referral.id,
          refCode: referral.refCode,
          name: referral.name,
          email: referral.email,
          description: referral.description,
          isActive: referral.isActive,
          totalSignatures: signatureCount.count,
          createdAt: referral.createdAt,
          updatedAt: referral.updatedAt,
        }
      })
    )

    // Sort by signature count descending, then by creation date descending
    const sortedData = referralData.sort((a, b) => {
      if (b.totalSignatures !== a.totalSignatures) {
        return b.totalSignatures - a.totalSignatures
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json(sortedData)
  } catch (error) {
    console.error('Failed to fetch referrals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, description } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Use name as referral code (cleaned up)
    const refCode = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    
    if (refCode.length === 0) {
      return NextResponse.json(
        { error: 'Name must contain at least one alphanumeric character' },
        { status: 400 }
      )
    }

    // Check if referral code already exists
    const existingReferral = await db.query.referrals.findFirst({
      where: (referrals, { eq }) => eq(referrals.refCode, refCode),
    })

    if (existingReferral) {
      return NextResponse.json(
        { error: 'Referral code already exists. Please use a different name.' },
        { status: 409 }
      )
    }

    const [newReferral] = await db.insert(referrals).values({
      refCode,
      name: name.trim(),
      email: email?.trim() || null,
      description: description?.trim() || null,
      isActive: true,
    }).returning()

    return NextResponse.json(newReferral, { status: 201 })
  } catch (error) {
    console.error('Failed to create referral:', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}
