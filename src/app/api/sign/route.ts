import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { signers } from '@/lib/db/schema'
import { generateReferralCode } from '@/lib/utils/referral'
import { zapSignService } from '@/lib/zapsign'

const signSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format').max(255),
  wantsInvite: z.boolean().default(false),
  refBy: z.string().optional().nullable().transform(val => val || undefined),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signSchema.parse(body)

    // Check if email already exists
    const existingSigner = await db.query.signers.findFirst({
      where: (signers, { eq }) => eq(signers.email, validatedData.email),
    })

    if (existingSigner) {
      return NextResponse.json(
        { error: 'Este correo ya ha firmado anteriormente' },
        { status: 400 }
      )
    }

    // Generate unique referral code that will be used after signing
    let refCode = generateReferralCode()
    let codeExists = true
    let attempts = 0
    
    while (codeExists && attempts < 10) {
      const existing = await db.query.signers.findFirst({
        where: (signers, { eq }) => eq(signers.refCode, refCode),
      })
      if (!existing) {
        codeExists = false
      } else {
        refCode = generateReferralCode()
        attempts++
      }
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Error interno del servidor. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    // Encode signer data in external_id to pass through ZapSign
    const signerPayload = {
      name: validatedData.name,
      email: validatedData.email,
      wantsInvite: validatedData.wantsInvite,
      refBy: validatedData.refBy,
      refCode: refCode,
    }
    
    const externalId = Buffer.from(JSON.stringify(signerPayload)).toString('base64')

    // Create signer in ZapSign directly (no DB storage yet)
    const result = await zapSignService.createSigner({
      name: validatedData.name,
      email: validatedData.email,
      external_id: externalId,
    })

    if (!result.success) {
      console.error('ZapSign error:', result.error)
      return NextResponse.json(
        { error: 'No pudimos crear el documento. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      signerToken: result.signer_token,
      widgetUrl: `https://app.zapsign.co/verificar/${result.signer_token}`,
      refCode: refCode, // Return for UI display, but not stored in DB yet
    })

  } catch (error) {
    console.error('Sign API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}