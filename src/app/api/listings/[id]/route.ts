import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { listingUpdateSchema } from "@/lib/validators/listing";
import { ListingStatus } from "@prisma/client";
import { sanitizeText } from "@/lib/utils/sanitize";
import { calculateCompletenessScore } from "@/lib/listing/completeness";

async function getListingByIdOrSlug(id: string) {
  const byId = await prisma.listing.findUnique({ where: { id }, include: { images: true } });
  if (byId) return byId;
  return prisma.listing.findUnique({ where: { slug: id }, include: { images: true } });
}

async function updateCompletenessScore(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: true }
  });
  if (!listing) return null;

  const score = calculateCompletenessScore(listing, listing.images);
  return prisma.listing.update({
    where: { id: listingId },
    data: { completenessScore: score }
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const listing = await getListingByIdOrSlug(params.id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (listing.status !== ListingStatus.PUBLISHED) {
    const session = await getServerAuthSession();
    if (!session?.user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: listing });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.status === ListingStatus.ARCHIVED) {
    return NextResponse.json({ error: "Listing archived" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (listing.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = listingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const updateData: any = { ...parsed.data };
  delete updateData.status;
  if (updateData.description) {
    updateData.description = sanitizeText(updateData.description);
  }

  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data: updateData
  });

  const withScore = await updateCompletenessScore(updated.id);
  return NextResponse.json({ data: withScore ?? updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (listing.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const archived = await prisma.listing.update({
    where: { id: listing.id },
    data: { status: ListingStatus.ARCHIVED }
  });
  return NextResponse.json({ data: archived });
}
