import { getSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  redirect("/login")
}
