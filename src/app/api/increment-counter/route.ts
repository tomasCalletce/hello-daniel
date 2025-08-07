import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { counters, events } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { refBy } = body
    const currentTime = new Date()

    // Check for recent duplicate events (within last 10 seconds)
    const recentEvents = await db.query.events.findMany({
      where: (events, { and, eq, gte }) => and(
        eq(events.type, 'counter_increment'),
        gte(events.createdAt, new Date(currentTime.getTime() - 10000)) // Last 10 seconds
      ),
      orderBy: (events, { desc }) => [desc(events.createdAt)],
      limit: 5
    })

    // Check if we have a very recent event with same refBy
    const duplicateEvent = recentEvents.find(event => {
      try {
        if (!event.payload) return false
        const payload = JSON.parse(event.payload)
        const eventTime = new Date(payload.timestamp || event.createdAt).getTime()
        const timeDiff = currentTime.getTime() - eventTime
        
        // If same refBy and within 5 seconds, consider it a duplicate
        return payload.refBy === (refBy || null) && timeDiff < 5000
      } catch (e) {
        return false
      }
    })

    if (duplicateEvent) {
      console.log('Duplicate increment detected, returning cached result')
      try {
        const duplicatePayload = JSON.parse(duplicateEvent.payload || '{}')
        return NextResponse.json({
          success: true,
          count: duplicatePayload.newCount,
          message: 'Counter already incremented (duplicate prevented)'
        })
      } catch (e) {
        // Fall through to normal increment if payload parsing fails
      }
    }

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
        timestamp: currentTime.toISOString(),
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