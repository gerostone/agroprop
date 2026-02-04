import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadSchema } from "@/lib/validators/lead";
import { rateLimit } from "@/lib/rate-limit";

function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const key = getClientKey(request);
  const limit = rateLimit(`lead:${key}`, 5, 60 * 60 * 1000);

  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId }
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const lead = await prisma.lead.create({
    data: {
      listingId: parsed.data.listingId,
      senderName: parsed.data.senderName,
      senderEmail: parsed.data.senderEmail,
      senderPhone: parsed.data.senderPhone,
      message: parsed.data.message
    }
  });

  return NextResponse.json({ data: lead }, { status: 201 });
}
