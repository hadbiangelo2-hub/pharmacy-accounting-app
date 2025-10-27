"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"

interface AdvancesFormProps {
  userId: string
  onSuccess?: () => void
}

export function AdvancesForm({ userId, onSuccess }: AdvancesFormProps) {
  const [staffName, setStaffName] = useState("")
  const [advanceType, setAdvanceType] = useState<"staff" | "partner">("staff")
  const [amount, setAmount] = useState("")
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const supabase = getSupabaseClient()

      const { error: insertError } = await supabase.from("advances").insert({
        user_id: userId,
        staff_name: staffName,
        advance_type: advanceType,
        amount: Number.parseFloat(amount),
        advance_date: advanceDate,
        status: "pending",
        notes,
      })

      if (insertError) {
        setError(insertError.message)
        return
      }

      setSuccess("Avance enregistrée avec succès!")
      setStaffName("")
      setAmount("")
      setAdvanceDate(new Date().toISOString().split("T")[0])
      setNotes("")

      if (onSuccess) {
        setTimeout(onSuccess, 500)
      }
    } catch (err) {
      setError("Une erreur est survenue")
      console.error("[v0] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ajouter une Avance</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type d'Avance</label>
          <select
            value={advanceType}
            onChange={(e) => setAdvanceType(e.target.value as "staff" | "partner")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="staff">Personnel</option>
            <option value="partner">Partenaire</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <Input
            type="text"
            placeholder="Nom du personnel ou partenaire"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Montant (DA)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de l'Avance</label>
          <Input type="date" value={advanceDate} onChange={(e) => setAdvanceDate(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            placeholder="Notes supplémentaires..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>
        )}

        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
          {loading ? "Enregistrement..." : "Enregistrer l'Avance"}
        </Button>
      </form>
    </Card>
  )
}
