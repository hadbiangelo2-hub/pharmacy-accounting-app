"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"

interface DailyLogFormProps {
  userId: string
  onSuccess?: () => void
}

export function DailyLogForm({ userId, onSuccess }: DailyLogFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [salesAmount, setSalesAmount] = useState("")
  const [staffSalary, setStaffSalary] = useState("")
  const [partnerCommission, setPartnerCommission] = useState("")
  const [rent, setRent] = useState("")
  const [utilities, setUtilities] = useState("")
  const [supplies, setSupplies] = useState("")
  const [otherExpenses, setOtherExpenses] = useState("")
  const [staffAdvances, setStaffAdvances] = useState("")
  const [partnerAdvances, setPartnerAdvances] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const calculateTotals = () => {
    const sales = Number.parseFloat(salesAmount) || 0
    const staff = Number.parseFloat(staffSalary) || 0
    const partner = Number.parseFloat(partnerCommission) || 0
    const rentVal = Number.parseFloat(rent) || 0
    const util = Number.parseFloat(utilities) || 0
    const supp = Number.parseFloat(supplies) || 0
    const other = Number.parseFloat(otherExpenses) || 0
    const staffAdv = Number.parseFloat(staffAdvances) || 0
    const partnerAdv = Number.parseFloat(partnerAdvances) || 0

    const totalExpenses = staff + partner + rentVal + util + supp + other
    const totalAdvances = staffAdv + partnerAdv
    const netProfit = sales - totalExpenses - totalAdvances

    return { totalExpenses, totalAdvances, netProfit, sales }
  }

  const totals = calculateTotals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const supabase = getSupabaseClient()

      const staffSalaryNum = Number.parseFloat(staffSalary) || 0
      const partnerCommissionNum = Number.parseFloat(partnerCommission) || 0
      const rentNum = Number.parseFloat(rent) || 0
      const utilitiesNum = Number.parseFloat(utilities) || 0
      const suppliesNum = Number.parseFloat(supplies) || 0
      const otherExpensesNum = Number.parseFloat(otherExpenses) || 0
      const staffAdvancesNum = Number.parseFloat(staffAdvances) || 0
      const partnerAdvancesNum = Number.parseFloat(partnerAdvances) || 0

      const totalExpenses =
        staffSalaryNum + partnerCommissionNum + rentNum + utilitiesNum + suppliesNum + otherExpensesNum
      const totalAdvances = staffAdvancesNum + partnerAdvancesNum
      const netProfit = Number.parseFloat(salesAmount) - totalExpenses - totalAdvances

      const { error: insertError } = await supabase.from("daily_log").upsert(
        {
          date,
          user_id: userId,
          sales_amount: Number.parseFloat(salesAmount) || 0,
          staff_salary: staffSalaryNum,
          partner_commission: partnerCommissionNum,
          rent: rentNum,
          utilities: utilitiesNum,
          supplies: suppliesNum,
          other_expenses: otherExpensesNum,
          staff_advances: staffAdvancesNum,
          partner_advances: partnerAdvancesNum,
          total_expenses: totalExpenses,
          net_profit: netProfit,
          notes,
        },
        { onConflict: "date,user_id" },
      )

      if (insertError) {
        setError(insertError.message)
        return
      }

      setSuccess("Journal quotidien enregistré avec succès!")
      // Reset form
      setSalesAmount("")
      setStaffSalary("")
      setPartnerCommission("")
      setRent("")
      setUtilities("")
      setSupplies("")
      setOtherExpenses("")
      setStaffAdvances("")
      setPartnerAdvances("")
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
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ajouter une Entrée Quotidienne</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Revenus</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ventes (DA)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={salesAmount}
              onChange={(e) => setSalesAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Dépenses Fixes</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire Personnel (DA)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={staffSalary}
                onChange={(e) => setStaffSalary(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission Partenaire (DA)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={partnerCommission}
                onChange={(e) => setPartnerCommission(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loyer (DA)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Électricité/Eau (DA)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={utilities}
                onChange={(e) => setUtilities(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournitures (DA)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={supplies}
                onChange={(e) => setSupplies(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autres Dépenses (DA)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Avances</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avances Personnel (DA)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={staffAdvances}
                onChange={(e) => setStaffAdvances(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avances Partenaire (DA)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={partnerAdvances}
                onChange={(e) => setPartnerAdvances(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Résumé Financier</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ventes:</span>
              <span className="font-semibold text-gray-900">{totals.sales.toFixed(2)} DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dépenses:</span>
              <span className="font-semibold text-gray-900">{totals.totalExpenses.toFixed(2)} DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avances:</span>
              <span className="font-semibold text-gray-900">{totals.totalAdvances.toFixed(2)} DA</span>
            </div>
            <div
              className={`flex justify-between pt-2 border-t ${totals.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              <span className="font-semibold">Bénéfice Net:</span>
              <span className="font-bold text-lg">{totals.netProfit.toFixed(2)} DA</span>
            </div>
          </div>
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
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </Card>
  )
}
