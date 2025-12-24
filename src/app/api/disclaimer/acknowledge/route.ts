import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { disclaimerAcknowledgedAt: new Date() },
      select: { disclaimerAcknowledgedAt: true },
    })

    return NextResponse.json({ 
      success: true, 
      acknowledgedAt: user.disclaimerAcknowledgedAt 
    })
  } catch (error) {
    console.error("Disclaimer acknowledgment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { disclaimerAcknowledgedAt: true },
    })

    return NextResponse.json({ 
      acknowledged: !!user?.disclaimerAcknowledgedAt,
      acknowledgedAt: user?.disclaimerAcknowledgedAt 
    })
  } catch (error) {
    console.error("Disclaimer check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
