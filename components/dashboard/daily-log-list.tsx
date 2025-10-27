"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"

interface DailyLog {
  id: string
  date: string
  sales_amount: number
  total_expenses: number
  staff_advances: number
  partner_advances: number
  net_profit: number
  notes: string
}

interface DailyLogListProps {
  userId: string
  refreshTrigger?: number
}

export function DailyLogList({ userId, refreshTrigger }: DailyLogListProps) {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const startDate = `${filterMonth}-01`
        const endDate = new Date(
          Number.parseInt(filterMonth.split("-")[0]),
          Number.parseInt(filterMonth.split("-")[1]),
          0,
        )
          .toISOString()
          .split("T")[0]

        const { data, error } = await supabase
          .from("daily_log")
          .select("*")
          .eq("user_id", userId)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching logs:", error)
          return
        }

        setLogs(data || [])
      } catch (err) {
        console.error("[v0] Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [userId, filterMonth, refreshTrigger])

  const monthlyTotals = logs.reduce(
    (acc, log) => ({
      sales: acc.sales + log.sales_amount,
      expenses: acc.expenses + log.total_expenses,
      advances: acc.advances + (log.staff_advances + log.partner_advances),
      profit: acc.profit + log.net_profit,
    }),
    { sales: 0, expenses: 0, advances: 0, profit: 0 },
  )

  if (loading) {
    return <Card className="p-6">Chargement...</Card>
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par mois</label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>

      {logs.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="font-semibold text-gray-900 mb-4">Résumé du Mois</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Ventes</p>
              <p className="text-2xl font-bold text-blue-600">{monthlyTotals.sales.toFixed(2)} DA</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Dépenses</p>
              <p className="text-2xl font-bold text-orange-600">{monthlyTotals.expenses.toFixed(2)} DA</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Avances</p>
              <p className="text-2xl font-bold text-purple-600">{monthlyTotals.advances.toFixed(2)} DA</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bénéfice Net</p>
              <p className={`text-2xl font-bold ${monthlyTotals.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {monthlyTotals.profit.toFixed(2)} DA
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historique des Entrées</h2>

        {logs.length === 0 ? (
          <p className="text-gray-600">Aucune entrée enregistrée pour ce mois</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-900">Ventes</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-900">Dépenses</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-900">Avances</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-900">Bénéfice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{new Date(log.date).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{log.sales_amount.toFixed(2)} DA</td>
                    <td className="px-4 py-2 text-right text-gray-900">{log.total_expenses.toFixed(2)} DA</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {(log.staff_advances + log.partner_advances).toFixed(2)} DA
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-semibold ${
                        log.net_profit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {log.net_profit.toFixed(2)} DA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
