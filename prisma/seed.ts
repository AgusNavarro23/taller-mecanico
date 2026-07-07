import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg("postgresql://user:password@ep-xxx-yyy.region.aws.neon.tech/taller?sslmode=require");
const prisma = new PrismaClient({ adapter }) as any;

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@taller.com" },
    update: {},
    create: {
      email: "admin@taller.com",
      name: "Administrador",
      password: hashedPassword,
    },
  });

  console.log("Admin user created:", admin.email);

  const client1 = await prisma.client.create({
    data: {
      name: "Juan Perez",
      phone: "+54 11 1234-5678",
      email: "juan.perez@email.com",
      dni: "12345678",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Maria Garcia",
      phone: "+54 11 8765-4321",
      email: "maria.garcia@email.com",
      dni: "87654321",
    },
  });

  console.log("Sample clients created");

  const vehicle1 = await prisma.vehicle.create({
    data: {
      plate: "ABC123",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      color: "Blanco",
      clientId: client1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      plate: "XYZ789",
      brand: "Ford",
      model: "Focus",
      year: 2019,
      color: "Negro",
      clientId: client2.id,
    },
  });

  console.log("Sample vehicles created");

  await prisma.serviceEntry.create({
    data: {
      description: "Cambio de aceite y filtros. Se realizo cambio de aceite sintetico y filtro de aceite.",
      status: "LISTO",
      entryDate: new Date("2024-01-15"),
      exitDate: new Date("2024-01-15"),
      laborCost: 5000,
      partsCost: 3500,
      totalCost: 8500,
      notes: "Cliente solicita aceite sintetico",
      vehicleId: vehicle1.id,
    },
  });

  await prisma.serviceEntry.create({
    data: {
      description: "Reparacion de motor. Se detecto ruido anormal en el motor. Se realizo diagnostico y reparacion.",
      status: "EN_REPARACION",
      entryDate: new Date("2024-01-14"),
      laborCost: 25000,
      partsCost: 15000,
      totalCost: 40000,
      notes: "Requiere seguimiento",
      vehicleId: vehicle2.id,
    },
  });

  await prisma.serviceEntry.create({
    data: {
      description: "Cambio de frenos delanteros. Se reemplazaron balatas y discos.",
      status: "PENDIENTE",
      entryDate: new Date("2024-01-13"),
      laborCost: 8000,
      partsCost: 12000,
      totalCost: 20000,
      vehicleId: vehicle1.id,
    },
  });

  console.log("Sample services created");
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
