import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { ListingStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ListingStatus | null;

  const data = await prisma.listing.findMany({
    where: status ? { status } : {},
    include: { owner: true, images: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.listingId || !body?.status) {
    return NextResponse.json({ error: "listingId and status required" }, { status: 400 });
  }

  const updated = await prisma.listing.update({
    where: { id: body.listingId },
    data: { status: body.status }
  });

  return NextResponse.json({ data: updated });
}
