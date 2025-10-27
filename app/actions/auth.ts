"use server"

import { getSupabaseServer } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function logout() {
  const supabase = await getSupabaseServer()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
