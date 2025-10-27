"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"

interface SettingsPanelProps {
  userEmail: string
  userId: string
}

export function SettingsPanel({ userEmail, userId }: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<"profile" | "password" | "users" | "export">("profile")
  const [fullName, setFullName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseClient()

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess("Mot de passe changé avec succès!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError("Une erreur est survenue")
      console.error("[v0] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()

      // Fetch all user data
      const [dailyLogs, advances, staffActivities, partnerActivities] = await Promise.all([
        supabase.from("daily_log").select("*").eq("user_id", userId),
        supabase.from("advances").select("*").eq("user_id", userId),
        supabase.from("staff_activities").select("*").eq("user_id", userId),
        supabase.from("partner_activities").select("*").eq("user_id", userId),
      ])

      const exportData = {
        exportDate: new Date().toISOString(),
        userEmail,
        dailyLogs: dailyLogs.data || [],
        advances: advances.data || [],
        staffActivities: staffActivities.data || [],
        partnerActivities: partnerActivities.data || [],
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `comptabilite-pharmacie-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess("Données exportées avec succès!")
    } catch (err) {
      setError("Erreur lors de l'export")
      console.error("[v0] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection("profile")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeSection === "profile" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveSection("password")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeSection === "password" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mot de Passe
          </button>
          <button
            onClick={() => setActiveSection("export")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeSection === "export" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Export
          </button>
        </div>
      </Card>

      {/* Profile Section */}
      {activeSection === "profile" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations du Profil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" value={userEmail} disabled className="bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
              <Input
                type="text"
                placeholder="Votre nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-600">
              Votre compte est configuré avec les permissions d'administrateur pour gérer la comptabilité de la
              pharmacie.
            </p>
          </div>
        </Card>
      )}

      {/* Password Section */}
      {activeSection === "password" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Changer le Mot de Passe</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Mise à jour..." : "Changer le Mot de Passe"}
            </Button>
          </form>
        </Card>
      )}

      {/* Export Section */}
      {activeSection === "export" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Export des Données</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Téléchargez une copie de toutes vos données comptables au format JSON. Cela inclut les journaux
              quotidiens, les avances, et les activités du personnel.
            </p>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Format:</span> JSON • <span className="font-semibold">Contenu:</span>{" "}
                Tous les journaux, avances et activités
              </p>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>
            )}

            <Button onClick={handleExportData} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              {loading ? "Export en cours..." : "Télécharger les Données"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
