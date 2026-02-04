//import { auth } from "@/lib/auth"
//import prisma from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import { getDictionary } from "@/get-dictionary";
import { type Locale } from "@/i18n-config";


export const dynamic = "force-dynamic"

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const dictionary = await getDictionary(locale as Locale)

  //const session = await auth()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{dictionary.common.appName}</h1>

    </div>
  )
}
