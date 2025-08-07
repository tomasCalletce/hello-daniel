"use client"

import { useState } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface Referral {
  id: number
  refCode: string
  name: string
  email?: string
  description?: string
  isActive: boolean
  totalSignatures: number
  createdAt: string
  updatedAt: string
}

interface NewReferralData {
  name: string
  email?: string
  description?: string
}

export default function ReferralsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<NewReferralData>({
    name: '',
    email: '',
    description: ''
  })
  const queryClient = useQueryClient()

  const { data: referrals, isLoading } = useQuery<Referral[]>({
    queryKey: ['referrals'],
    queryFn: async () => {
      const response = await fetch('/api/referrals')
      if (!response.ok) throw new Error('Failed to fetch referrals')
      return response.json()
    },
    refetchInterval: 10000,
  })

  const createReferralMutation = useMutation({
    mutationFn: async (data: NewReferralData) => {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create referral')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      setFormData({ name: '', email: '', description: '' })
      setShowForm(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    createReferralMutation.mutate(formData)
  }

  const copyReferralLink = async (refCode: string) => {
    const url = `${window.location.origin}?ref=${refCode}`
    await navigator.clipboard.writeText(url)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-mono font-medium text-black tracking-tight">
            Referral Dashboard
          </h1>
          <p className="text-sm text-black/60 font-mono">
            Sigue el progreso de las firmas generadas a través de tus enlaces de referido
          </p>
        </div>

        <div className="text-center">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-black hover:bg-black/80 text-white font-mono text-sm tracking-wider"
          >
            {showForm ? 'Cancel' : 'Create New Referral'}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 border border-black/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-mono text-black/80">
                  Name (will become referral code)
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-black/50 font-mono">
                  Code: {formData.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'preview'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-mono text-black/80">
                  Email (optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-mono text-black/80">
                  Description (optional)
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  className="font-mono text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={createReferralMutation.isPending || !formData.name.trim()}
                className="w-full bg-black hover:bg-black/80 text-white font-mono text-sm"
              >
                {createReferralMutation.isPending ? 'Creating...' : 'Create Referral'}
              </Button>

              {createReferralMutation.error && (
                <p className="text-red-600 text-sm font-mono">
                  {createReferralMutation.error.message}
                </p>
              )}
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm font-mono text-black/60">Loading referrals...</p>
            </div>
          ) : !referrals || referrals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-mono text-black/60">No referrals found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {referrals.map((referral) => (
                <Card key={referral.id} className="p-4 border border-black/10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-mono font-medium text-black">
                          {referral.name}
                        </h3>
                        <span className="text-xs font-mono text-black/60 bg-black/5 px-2 py-1">
                          {referral.refCode}
                        </span>
                        <span className="text-lg font-mono font-bold text-black">
                          {referral.totalSignatures}
                        </span>
                      </div>
                      {referral.email && (
                        <p className="text-xs font-mono text-black/60">
                          {referral.email}
                        </p>
                      )}
                      {referral.description && (
                        <p className="text-xs font-mono text-black/80">
                          {referral.description}
                        </p>
                      )}
                      <p className="text-xs font-mono text-black/50">
                        Created: {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => copyReferralLink(referral.refCode)}
                      variant="outline"
                      size="sm"
                      className="border-black/20 hover:border-black/40 hover:bg-black/5 text-xs font-mono"
                    >
                      Copy Link
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="text-center pt-6 border-t border-black/10">
          <a
            href="/"
            className="text-xs font-mono text-black/60 hover:text-black/80 underline"
          >
            ← Back to Main Page
          </a>
        </div>
      </div>
    </div>
  )
}
