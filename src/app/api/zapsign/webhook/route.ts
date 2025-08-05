import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signers, counters, events } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

interface WebhookPayload {
  event_type: string
  document_id: string
  signer_external_id: string
  signer_email: string
  timestamp: string
  signature_status: string
}

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  )
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-zapsign-signature')
    const rawBody = await request.text()
    
    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.ZAPSIGN_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const payload: WebhookPayload = JSON.parse(rawBody)
    
    // Log the webhook event
    await db.insert(events).values({
      type: 'webhook_received',
      payload: rawBody,
    })

    // Handle document signed event
    if (payload.event_type === 'document_signed' && payload.signature_status === 'signed') {
      // Check if already processed to prevent duplicates
      const existingSigner = await db.query.signers.findFirst({
        where: (signers, { eq }) => eq(signers.email, payload.signer_email),
      })

      if (existingSigner) {
        // Already processed, prevent duplicate
        return NextResponse.json({ status: 'already_processed' })
      }

      // Decode signer data from external_id
      let signerData
      try {
        const decodedData = Buffer.from(payload.signer_external_id, 'base64').toString('utf8')
        signerData = JSON.parse(decodedData)
      } catch (error) {
        console.error('Failed to decode signer data:', error)
        return NextResponse.json({ status: 'invalid_external_id' })
      }

      // Validate decoded data
      if (!signerData.name || !signerData.email || !signerData.refCode) {
        console.error('Invalid signer data:', signerData)
        return NextResponse.json({ status: 'invalid_signer_data' })
      }

      // NOW create the signer record in the database (verified from the start)
      const [newSigner] = await db.insert(signers).values({
        name: signerData.name,
        email: signerData.email,
        city: 'N/A',
        role: 'Supporter',
        wantsInvite: signerData.wantsInvite || false,
        verified: true, // Immediately verified since webhook confirms signature
        refCode: signerData.refCode,
        refBy: signerData.refBy || null,
      }).returning()

      // Update counter
      const currentCount = await db.query.signers.findMany({
        where: (signers, { eq }) => eq(signers.verified, true),
      }).then(results => results.length)

      // Get or create counter record
      let counter = await db.query.counters.findFirst({
        orderBy: (counters, { desc }) => [desc(counters.id)],
      })

      if (!counter) {
        await db.insert(counters).values({
          total: currentCount,
        })
      } else {
        await db.update(counters)
          .set({ 
            total: currentCount, 
            updatedAt: new Date() 
          })
          .where(eq(counters.id, counter.id))
      }

      // Log signature verification event
      await db.insert(events).values({
        type: 'sign_verified',
        payload: JSON.stringify({
          signerId: newSigner.id,
          city: 'N/A',
          role: 'Supporter',
          refBy: signerData.refBy,
          totalCount: currentCount,
        }),
      })

      console.log(`Signature verified and record created for ${newSigner.email}, total count: ${currentCount}`)
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Return 200 to prevent ZapSign from retrying
    return NextResponse.json({ 
      status: 'error', 
      message: 'Internal error' 
    })
  }
}