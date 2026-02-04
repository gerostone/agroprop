import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { listingImagesSchema } from "@/lib/validators/listing";

export async function POST(
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
  const parsed = listingImagesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const images = Array.isArray(parsed.data) ? parsed.data : [parsed.data];

  const created = await prisma.$transaction(
    images.map((img) =>
      prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: img.url,
          sortOrder: img.sortOrder ?? 0
        }
      })
    )
  );

  return NextResponse.json({ data: created }, { status: 201 });
}

export async function DELETE(
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
  if (!body?.imageId) {
    return NextResponse.json({ error: "imageId required" }, { status: 400 });
  }

  const image = await prisma.listingImage.findUnique({ where: { id: body.imageId } });
  if (!image || image.listingId !== listing.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.listingImage.delete({ where: { id: image.id } });

  return NextResponse.json({ ok: true });
}
