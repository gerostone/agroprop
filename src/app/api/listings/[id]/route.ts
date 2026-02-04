import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { listingUpdateSchema } from "@/lib/validators/listing";
import slugify from "slugify";
import { ListingStatus } from "@prisma/client";

async function getListingByIdOrSlug(id: string) {
  const byId = await prisma.listing.findUnique({ where: { id }, include: { images: true } });
  if (byId) return byId;
  return prisma.listing.findUnique({ where: { slug: id }, include: { images: true } });
}

async function getUniqueSlug(base: string, excludeId?: string) {
  let slug = slugify(base, { lower: true, strict: true });
  let suffix = 1;

  while (true) {
    const existing = await prisma.listing.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    suffix += 1;
    slug = `${slugify(base, { lower: true, strict: true })}-${suffix}`;
  }
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
  if (parsed.data.title) {
    updateData.slug = await getUniqueSlug(parsed.data.title, listing.id);
  }

  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data: updateData
  });

  return NextResponse.json({ data: updated });
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

  await prisma.listing.delete({ where: { id: listing.id } });
  return NextResponse.json({ ok: true });
}
