"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"

interface Advance {
  id: string
  staff_name: string
  advance_type: string
  amount: number
  advance_date: string
  repayment_date: string | null
  status: string
  notes: string
}

interface AdvancesListProps {
  userId: string
  refreshTrigger?: number
}

export function AdvancesList({ userId, refreshTrigger }: AdvancesListProps) {
  const [advances, setAdvances] = useState<Advance[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "repaid" | "cancelled">("all")

  useEffect(() => {
    const fetchAdvances = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        let query = supabase.from("advances").select("*").eq("user_id", userId).order("advance_date", {
          ascending: false,
        })

        if (filterStatus !== "all") {
          query = query.eq("status", filterStatus)
        }

        const { data, error } = await query

        if (error) {
          console.error("[v0] Error fetching advances:", error)
          return
        }

        setAdvances(data || [])
      } catch (err) {
        console.error("[v0] Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAdvances()
  }, [userId, filterStatus, refreshTrigger])

  const handleStatusChange = async (advanceId: string, newStatus: string) => {
    try {
      const supabase = getSupabaseClient()

      const updateData: Record<string, unknown> = { status: newStatus }
      if (newStatus === "repaid") {
        updateData.repayment_date = new Date().toISOString().split("T")[0]
      }

      const { error } = await supabase.from("advances").update(updateData).eq("id", advanceId)

      if (error) {
        console.error("[v0] Error updating advance:", error)
        return
      }

      setAdvances((prev) =>
        prev.map((adv) =>
          adv.id === advanceId
            ? {
                ...adv,
                status: newStatus,
                repayment_date: newStatus === "repaid" ? new Date().toISOString().split("T")[0] : adv.repayment_date,
              }
            : adv,
        ),
      )
    } catch (err) {
      console.error("[v0] Error:", err)
    }
  }

  const pendingAdvances = advances.filter((a) => a.status === "pending")
  const totalPending = pendingAdvances.reduce((sum, a) => sum + a.amount, 0)

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-50", text: "text-yellow-700", label: "En attente" },
      repaid: { bg: "bg-green-50", text: "text-green-700", label: "Remboursée" },
      cancelled: { bg: "bg-gray-50", text: "text-gray-700", label: "Annulée" },
    }
    const badge = badges[status] || badges.pending
    return badge
  }

  if (loading) {
    return <Card className="p-6">Chargement...</Card>
  }

  return (
    <div className="space-y-4">
      {totalPending > 0 && (
        <Card className="p-4 bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <span className="font-semibold">Avances en attente:</span> {totalPending.toFixed(2)} DA
          </p>
        </Card>
      )}

      <Card className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par statut</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "pending" | "repaid" | "cancelled")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="repaid">Remboursées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Liste des Avances</h2>

        {advances.length === 0 ? (
          <p className="text-gray-600">Aucune avance enregistrée</p>
        ) : (
          <div className="space-y-3">
            {advances.map((advance) => {
              const badge = getStatusBadge(advance.status)
              return (
                <div key={advance.id} className={`p-4 border rounded-lg ${badge.bg}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{advance.staff_name}</p>
                      <p className="text-sm text-gray-600">
                        {advance.advance_type === "staff" ? "Personnel" : "Partenaire"} •{" "}
                        {new Date(advance.advance_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{advance.amount.toFixed(2)} DA</p>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {advance.notes && <p className="text-sm text-gray-600 mb-3">{advance.notes}</p>}

                  {advance.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(advance.id, "repaid")}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Marquer comme remboursée
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(advance.id, "cancelled")}
                        className="text-gray-600 border-gray-200 hover:bg-gray-50"
                      >
                        Annuler
                      </Button>
                    </div>
                  )}

                  {advance.status === "repaid" && advance.repayment_date && (
                    <p className="text-xs text-gray-600">
                      Remboursée le {new Date(advance.repayment_date).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
