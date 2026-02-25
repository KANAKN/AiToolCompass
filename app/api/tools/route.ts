import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const tools = await prisma.tool.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ tools }, {
    headers: { "Cache-Control": "no-store" },
  });
}
