interface SignerData {
  name: string
  email: string
  external_id: string
  send_automatic_email?: boolean
  send_automatic_whatsapp?: boolean
}

interface ZapSignResponse {
  success: boolean
  signer_token?: string
  error?: string
}

export class ZapSignService {
  private apiKey: string
  private templateId: string
  private baseUrl = 'https://api.zapsign.co'

  constructor() {
    this.apiKey = process.env.ZAPSIGN_API_KEY!
    this.templateId = process.env.ZAPSIGN_DOCUMENT_TEMPLATE_ID!
    
    if (!this.apiKey || !this.templateId) {
      throw new Error('ZapSign API key and template ID are required')
    }
  }

  async createSigner(signerData: SignerData): Promise<ZapSignResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${this.templateId}/signers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signerData.name,
          email: signerData.email,
          external_id: signerData.external_id,
          send_automatic_email: signerData.send_automatic_email ?? false,
          send_automatic_whatsapp: signerData.send_automatic_whatsapp ?? false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return {
        success: true,
        signer_token: data.signer_token,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  generateUniqueExternalId(): string {
    return `signer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const zapSignService = new ZapSignService()