"use client"

import type { User } from "@supabase/supabase-js"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { logout } from "@/app/actions/auth"
import { DailyLogForm } from "./daily-log-form"
import { DailyLogList } from "./daily-log-list"
import { AdvancesForm } from "./advances-form"
import { AdvancesList } from "./advances-list"
import { StaffActivities } from "./staff-activities"
import { MonthlySummary } from "./monthly-summary"

export function DashboardLayout({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<"daily" | "advances" | "summary">("daily")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleFormSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comptabilité Pharmacie</h1>
            <p className="text-sm text-gray-600 mt-1">Connecté en tant que: {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/settings">
              <Button variant="outline">Paramètres</Button>
            </Link>
            <form
              action={async () => {
                await logout()
              }}
            >
              <Button type="submit" variant="outline">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("daily")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "daily"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Journal Quotidien
            </button>
            <button
              onClick={() => setActiveTab("advances")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "advances"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Avances
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "summary"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Résumé Mensuel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "daily" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <DailyLogForm userId={user.id} onSuccess={handleFormSuccess} />
            </div>
            <div className="lg:col-span-2">
              <DailyLogList userId={user.id} refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}

        {activeTab === "advances" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AdvancesForm userId={user.id} onSuccess={handleFormSuccess} />
            </div>
            <div className="lg:col-span-2">
              <AdvancesList userId={user.id} refreshTrigger={refreshTrigger} />
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-6">
            <MonthlySummary userId={user.id} />
            <StaffActivities userId={user.id} refreshTrigger={refreshTrigger} />
          </div>
        )}
      </main>
    </div>
  )
}
