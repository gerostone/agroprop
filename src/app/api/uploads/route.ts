import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createSignedUpload } from "@/lib/storage/s3";
import { uploadRequestSchema } from "@/lib/validators/listing";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = uploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  if (listing.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ext = parsed.data.fileName.split(".").pop() ?? "jpg";
  const key = `listings/${listing.id}/${randomUUID()}.${ext}`;

  const signed = await createSignedUpload({
    key,
    contentType: parsed.data.contentType
  });

  return NextResponse.json({ data: signed });
}
