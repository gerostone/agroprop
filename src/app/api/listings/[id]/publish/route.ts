import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listingPublishSchema } from "@/lib/validators/listing";
import slugify from "slugify";
import { ListingStatus } from "@prisma/client";
import { sanitizeText } from "@/lib/utils/sanitize";
import { calculateCompletenessScore } from "@/lib/listing/completeness";

async function getUniqueSlug(base: string) {
  let slug = slugify(base, { lower: true, strict: true });
  let suffix = 1;

  while (await prisma.listing.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugify(base, { lower: true, strict: true })}-${suffix}`;
  }

  return slug;
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { images: true }
  });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.status === ListingStatus.ARCHIVED) {
    return NextResponse.json({ error: "Listing archived" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (listing.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const titleCandidate =
    listing.title ??
    `Campo ${listing.type ?? ""} en ${listing.district ?? ""}, ${listing.department ?? ""}`
      .replace(/\s+/g, " ")
      .replace(/,\s*$/, "")
      .trim();
  const title = titleCandidate && titleCandidate.length >= 5 ? titleCandidate : "Campo en Paraguay";
  const description = listing.description ? sanitizeText(listing.description) : listing.description;

  const parsed = listingPublishSchema.safeParse({
    ...listing,
    title,
    description
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Publish validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const slug = listing.slug ?? (title ? await getUniqueSlug(title) : null);

  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data: {
      title,
      description,
      slug,
      status: ListingStatus.PUBLISHED,
      completenessScore: listing.completenessScore
    }
  });

  const score = calculateCompletenessScore(updated, listing.images);
  const scored = await prisma.listing.update({
    where: { id: listing.id },
    data: { completenessScore: score }
  });

  return NextResponse.json({ data: scored });
}
