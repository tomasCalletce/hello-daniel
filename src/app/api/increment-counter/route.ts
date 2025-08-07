import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { counters, events } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { refBy } = body

    // Get current counter
    let counter = await db.query.counters.findFirst({
      orderBy: (counters, { desc }) => [desc(counters.id)],
    })

    const newCount = (counter?.total || 0) + 1

    if (!counter) {
      // Create initial counter
      [counter] = await db.insert(counters).values({
        total: newCount,
      }).returning()
    } else {
      // Update existing counter
      [counter] = await db.update(counters)
        .set({ 
          total: newCount, 
          updatedAt: new Date() 
        })
        .where(eq(counters.id, counter.id))
        .returning()
    }

    // Log the increment event with referral info
    await db.insert(events).values({
      type: 'counter_increment',
      payload: JSON.stringify({
        oldCount: newCount - 1,
        newCount: newCount,
        source: 'iframe_signing',
        refBy: refBy || null,
        timestamp: new Date().toISOString(),
      }),
    })

    return NextResponse.json({
      success: true,
      count: newCount,
      message: 'Counter incremented successfully'
    })

  } catch (error) {
    console.error('Counter increment error:', error)
    return NextResponse.json(
      { error: 'Failed to increment counter' },
      { status: 500 }
    )
  }
}