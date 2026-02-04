import { PrismaClient, ListingStatus, ListingType, ListingModality, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@agroprop.local";
  const userEmail = "user@agroprop.local";

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const userPasswordHash = await bcrypt.hash("User123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      name: "Usuario",
      email: userEmail,
      passwordHash: userPasswordHash,
      role: Role.USER
    }
  });

  const listingTitle = "Campo mixto con acceso todo el año";
  const listingSlug = slugify(listingTitle, { lower: true, strict: true });

  await prisma.listing.upsert({
    where: { slug: listingSlug },
    update: {},
    create: {
      ownerId: user.id,
      title: listingTitle,
      slug: listingSlug,
      locationText: "Zona rural cercana a centro poblado",
      department: "Departamento Placeholder",
      district: "Distrito Placeholder",
      hectaresTotal: 120,
      lat: null,
      lng: null,
      description:
        "Campo con buen acceso y suelos aptos para uso mixto. Servicios básicos disponibles en la zona. " +
        "Ideal para producción ganadera y agrícola con disponibilidad de agua y energía cercana.",
      type: ListingType.MIXTO,
      modality: ListingModality.VENTA,
      salePriceTotalUsd: 250000,
      phoneWhatsapp: "+595981234567",
      contactEmail: "contacto@agroprop.local",
      waterSources: ["ARROYO"],
      hasElectricity: true,
      yearRoundAccess: true,
      status: ListingStatus.PUBLISHED,
      images: {
        create: [
          { url: "https://picsum.photos/seed/agroprop-1/1200/800", sortOrder: 0 },
          { url: "https://picsum.photos/seed/agroprop-2/1200/800", sortOrder: 1 }
        ]
      }
    }
  });

  console.log("Seed complete:", { admin: admin.email, user: user.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
