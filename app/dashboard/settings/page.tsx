import { getSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { SettingsPanel } from "@/components/dashboard/settings-panel"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-sm text-gray-600 mt-1">Gérez vos paramètres et préférences</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Retour au Tableau de Bord</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsPanel userEmail={user.email || ""} userId={user.id} />
      </main>
    </div>
  )
}
