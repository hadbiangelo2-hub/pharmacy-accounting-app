"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"

interface MonthlySummaryData {
  totalSales: number
  totalStaffSalary: number
  totalPartnerCommission: number
  totalRent: number
  totalUtilities: number
  totalSupplies: number
  totalOtherExpenses: number
  totalExpenses: number
  totalAdvances: number
  netProfit: number
  daysWithData: number
}

interface MonthlySummaryProps {
  userId: string
}

export function MonthlySummary({ userId }: MonthlySummaryProps) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [summary, setSummary] = useState<MonthlySummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [previousMonth, setPreviousMonth] = useState<MonthlySummaryData | null>(null)

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const [year, monthNum] = month.split("-").map(Number)
        const startDate = `${year}-${String(monthNum).padStart(2, "0")}-01`
        const endDate = new Date(year, monthNum, 0).toISOString().split("T")[0]

        const { data, error } = await supabase
          .from("daily_log")
          .select("*")
          .eq("user_id", userId)
          .gte("date", startDate)
          .lte("date", endDate)

        if (error) {
          console.error("[v0] Error fetching summary:", error)
          return
        }

        const logs = data || []
        const summaryData: MonthlySummaryData = {
          totalSales: logs.reduce((sum, log) => sum + (log.sales_amount || 0), 0),
          totalStaffSalary: logs.reduce((sum, log) => sum + (log.staff_salary || 0), 0),
          totalPartnerCommission: logs.reduce((sum, log) => sum + (log.partner_commission || 0), 0),
          totalRent: logs.reduce((sum, log) => sum + (log.rent || 0), 0),
          totalUtilities: logs.reduce((sum, log) => sum + (log.utilities || 0), 0),
          totalSupplies: logs.reduce((sum, log) => sum + (log.supplies || 0), 0),
          totalOtherExpenses: logs.reduce((sum, log) => sum + (log.other_expenses || 0), 0),
          totalExpenses: logs.reduce((sum, log) => sum + (log.total_expenses || 0), 0),
          totalAdvances: logs.reduce((sum, log) => sum + ((log.staff_advances || 0) + (log.partner_advances || 0)), 0),
          netProfit: logs.reduce((sum, log) => sum + (log.net_profit || 0), 0),
          daysWithData: logs.length,
        }

        setSummary(summaryData)

        // Fetch previous month for comparison
        const prevMonthDate = new Date(year, monthNum - 1, 1)
        const prevYear = prevMonthDate.getFullYear()
        const prevMonthNum = prevMonthDate.getMonth() + 1
        const prevStartDate = `${prevYear}-${String(prevMonthNum).padStart(2, "0")}-01`
        const prevEndDate = new Date(prevYear, prevMonthNum, 0).toISOString().split("T")[0]

        const { data: prevData } = await supabase
          .from("daily_log")
          .select("*")
          .eq("user_id", userId)
          .gte("date", prevStartDate)
          .lte("date", prevEndDate)

        if (prevData) {
          const prevSummary: MonthlySummaryData = {
            totalSales: prevData.reduce((sum, log) => sum + (log.sales_amount || 0), 0),
            totalStaffSalary: prevData.reduce((sum, log) => sum + (log.staff_salary || 0), 0),
            totalPartnerCommission: prevData.reduce((sum, log) => sum + (log.partner_commission || 0), 0),
            totalRent: prevData.reduce((sum, log) => sum + (log.rent || 0), 0),
            totalUtilities: prevData.reduce((sum, log) => sum + (log.utilities || 0), 0),
            totalSupplies: prevData.reduce((sum, log) => sum + (log.supplies || 0), 0),
            totalOtherExpenses: prevData.reduce((sum, log) => sum + (log.other_expenses || 0), 0),
            totalExpenses: prevData.reduce((sum, log) => sum + (log.total_expenses || 0), 0),
            totalAdvances: prevData.reduce(
              (sum, log) => sum + ((log.staff_advances || 0) + (log.partner_advances || 0)),
              0,
            ),
            netProfit: prevData.reduce((sum, log) => sum + (log.net_profit || 0), 0),
            daysWithData: prevData.length,
          }
          setPreviousMonth(prevSummary)
        }
      } catch (err) {
        console.error("[v0] Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlySummary()
  }, [userId, month])

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / Math.abs(previous)) * 100
  }

  const getChangeIndicator = (percentage: number) => {
    if (percentage > 0) return { color: "text-green-600", symbol: "↑" }
    if (percentage < 0) return { color: "text-red-600", symbol: "↓" }
    return { color: "text-gray-600", symbol: "→" }
  }

  if (loading) {
    return <Card className="p-6">Chargement...</Card>
  }

  if (!summary) {
    return <Card className="p-6">Aucune donnée disponible pour ce mois</Card>
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un mois</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total Ventes</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{summary.totalSales.toFixed(2)} DA</p>
          {previousMonth && (
            <p
              className={`text-xs mt-2 ${getChangeIndicator(getChangePercentage(summary.totalSales, previousMonth.totalSales)).color}`}
            >
              {getChangeIndicator(getChangePercentage(summary.totalSales, previousMonth.totalSales)).symbol}{" "}
              {Math.abs(getChangePercentage(summary.totalSales, previousMonth.totalSales)).toFixed(1)}%
            </p>
          )}
        </Card>

        <Card className="p-4 bg-orange-50 border border-orange-200">
          <p className="text-sm text-orange-600 font-medium">Total Dépenses</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{summary.totalExpenses.toFixed(2)} DA</p>
          {previousMonth && (
            <p
              className={`text-xs mt-2 ${getChangeIndicator(getChangePercentage(summary.totalExpenses, previousMonth.totalExpenses)).color}`}
            >
              {getChangeIndicator(getChangePercentage(summary.totalExpenses, previousMonth.totalExpenses)).symbol}{" "}
              {Math.abs(getChangePercentage(summary.totalExpenses, previousMonth.totalExpenses)).toFixed(1)}%
            </p>
          )}
        </Card>

        <Card className="p-4 bg-purple-50 border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Total Avances</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{summary.totalAdvances.toFixed(2)} DA</p>
          {previousMonth && (
            <p
              className={`text-xs mt-2 ${getChangeIndicator(getChangePercentage(summary.totalAdvances, previousMonth.totalAdvances)).color}`}
            >
              {getChangeIndicator(getChangePercentage(summary.totalAdvances, previousMonth.totalAdvances)).symbol}{" "}
              {Math.abs(getChangePercentage(summary.totalAdvances, previousMonth.totalAdvances)).toFixed(1)}%
            </p>
          )}
        </Card>

        <Card
          className={`p-4 ${summary.netProfit >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          <p className={`text-sm font-medium ${summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            Bénéfice Net
          </p>
          <p className={`text-2xl font-bold mt-1 ${summary.netProfit >= 0 ? "text-green-900" : "text-red-900"}`}>
            {summary.netProfit.toFixed(2)} DA
          </p>
          {previousMonth && (
            <p
              className={`text-xs mt-2 ${getChangeIndicator(getChangePercentage(summary.netProfit, previousMonth.netProfit)).color}`}
            >
              {getChangeIndicator(getChangePercentage(summary.netProfit, previousMonth.netProfit)).symbol}{" "}
              {Math.abs(getChangePercentage(summary.netProfit, previousMonth.netProfit)).toFixed(1)}%
            </p>
          )}
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Détail des Dépenses</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Salaires Personnel</span>
            <span className="font-semibold text-gray-900">{summary.totalStaffSalary.toFixed(2)} DA</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Commissions Partenaires</span>
            <span className="font-semibold text-gray-900">{summary.totalPartnerCommission.toFixed(2)} DA</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Loyer</span>
            <span className="font-semibold text-gray-900">{summary.totalRent.toFixed(2)} DA</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Électricité/Eau</span>
            <span className="font-semibold text-gray-900">{summary.totalUtilities.toFixed(2)} DA</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Fournitures</span>
            <span className="font-semibold text-gray-900">{summary.totalSupplies.toFixed(2)} DA</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-gray-700">Autres Dépenses</span>
            <span className="font-semibold text-gray-900">{summary.totalOtherExpenses.toFixed(2)} DA</span>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Jours avec données</p>
            <p className="text-2xl font-bold text-gray-900">{summary.daysWithData}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Ventes moyennes/jour</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.daysWithData > 0 ? (summary.totalSales / summary.daysWithData).toFixed(0) : 0} DA
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Bénéfice moyen/jour</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.daysWithData > 0 ? (summary.netProfit / summary.daysWithData).toFixed(0) : 0} DA
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Taux de marge</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalSales > 0 ? ((summary.netProfit / summary.totalSales) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Ratio Dépenses/Ventes</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalSales > 0 ? ((summary.totalExpenses / summary.totalSales) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Avances/Ventes</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalSales > 0 ? ((summary.totalAdvances / summary.totalSales) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
