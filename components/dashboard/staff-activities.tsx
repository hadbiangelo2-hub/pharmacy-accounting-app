"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"

interface StaffActivity {
  id: string
  staff_name: string
  activity_date: string
  activity_type: string
  hours_worked: number | null
  amount: number | null
}

interface StaffActivitiesProps {
  userId: string
  refreshTrigger?: number
}

export function StaffActivities({ userId, refreshTrigger }: StaffActivitiesProps) {
  const [activities, setActivities] = useState<StaffActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [staffName, setStaffName] = useState("")
  const [activityType, setActivityType] = useState("")
  const [hoursWorked, setHoursWorked] = useState("")
  const [amount, setAmount] = useState("")
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split("T")[0])
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
          .from("staff_activities")
          .select("*")
          .eq("user_id", userId)
          .order("activity_date", { ascending: false })
          .limit(20)

        if (error) {
          console.error("[v0] Error fetching activities:", error)
          return
        }

        setActivities(data || [])
      } catch (err) {
        console.error("[v0] Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [userId, refreshTrigger])

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase.from("staff_activities").insert({
        user_id: userId,
        staff_name: staffName,
        activity_type: activityType,
        hours_worked: hoursWorked ? Number.parseFloat(hoursWorked) : null,
        amount: amount ? Number.parseFloat(amount) : null,
        activity_date: activityDate,
      })

      if (error) {
        console.error("[v0] Error:", error)
        return
      }

      setStaffName("")
      setActivityType("")
      setHoursWorked("")
      setAmount("")
      setActivityDate(new Date().toISOString().split("T")[0])
      setShowForm(false)

      // Refresh activities
      const { data } = await supabase
        .from("staff_activities")
        .select("*")
        .eq("user_id", userId)
        .order("activity_date", { ascending: false })
        .limit(20)

      setActivities(data || [])
    } catch (err) {
      console.error("[v0] Error:", err)
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return <Card className="p-6">Chargement...</Card>
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Activités du Personnel</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          {showForm ? "Annuler" : "Ajouter une Activité"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAddActivity} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="Nom du personnel"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Type d'activité"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.5"
              placeholder="Heures travaillées"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Montant (DA)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} required />
          <Button type="submit" disabled={formLoading} className="w-full bg-green-600 hover:bg-green-700">
            {formLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      )}

      {activities.length === 0 ? (
        <p className="text-gray-600">Aucune activité enregistrée</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{activity.staff_name}</p>
                  <p className="text-sm text-gray-600">
                    {activity.activity_type} • {new Date(activity.activity_date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="text-right text-sm">
                  {activity.hours_worked && <p className="text-gray-600">{activity.hours_worked}h</p>}
                  {activity.amount && <p className="font-semibold text-gray-900">{activity.amount.toFixed(2)} DA</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
