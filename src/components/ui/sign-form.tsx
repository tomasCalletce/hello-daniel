"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface SignFormProps {
  onSubmit: (data: SignFormData) => void
  isLoading?: boolean
  error?: string
}

export interface SignFormData {
  name: string
  email: string
  wantsInvite: boolean
}



export function SignForm({ onSubmit, isLoading, error }: SignFormProps) {
  const [formData, setFormData] = useState<SignFormData>({
    name: "",
    email: "",
    wantsInvite: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isValid = formData.name && formData.email

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name" className="text-xs font-mono text-black/80 tracking-wider">
          NOMBRE
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="h-8 border-black/20 focus:border-black/40 focus:ring-0 text-sm font-mono text-black placeholder:text-black/40"
          placeholder="Tu nombre completo"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs font-mono text-black/80 tracking-wider">
          EMAIL
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="h-8 border-black/20 focus:border-black/40 focus:ring-0 text-sm font-mono text-black placeholder:text-black/40"
          placeholder="tu@email.com"
          required
        />
      </div>



      <div className="flex items-center space-x-2 py-1">
        <Checkbox
          id="invite"
          checked={formData.wantsInvite}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, wantsInvite: checked as boolean }))
          }
        />
        <Label 
          htmlFor="invite" 
          className="text-xs font-mono text-black/60 cursor-pointer tracking-wide"
        >
          INVITAR A DANIEL COMO JUEZ
        </Label>
      </div>

      {error && (
        <div className="text-xs font-mono text-black bg-black/5 p-2 border border-black/20">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full h-9 bg-black hover:bg-black/80 text-white font-mono text-sm tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "PROCESANDO..." : "FIRMAR AHORA"}
      </Button>
    </form>
  )
}