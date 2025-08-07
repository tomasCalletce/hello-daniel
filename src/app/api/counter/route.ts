import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { counters, signers } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Get or create counter record (don't rely on signers table)
    let counter = await db.query.counters.findFirst({
      orderBy: (counters, { desc }) => [desc(counters.id)],
    })

    if (!counter) {
      // Create initial counter starting at 0
      [counter] = await db.insert(counters).values({
        total: 0,
      }).returning()
    }

    const currentCount = counter.total

    return NextResponse.json({
      count: currentCount,
      goal: 5000,
      percentage: Math.round((currentCount / 5000) * 100),
      lastUpdated: counter.updatedAt,
    })

  } catch (error) {
    console.error('Counter API error:', error)
    return NextResponse.json(
      { error: 'Error al obtener el contador' },
      { status: 500 }
    )
  }
}