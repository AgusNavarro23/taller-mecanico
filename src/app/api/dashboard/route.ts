import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalClients,
      totalVehicles,
      totalServices,
      pendingServices,
      inProgressServices,
      readyServices,
      deliveredServices,
      revenueResult,
      recentServices,
      servicesByArea,
      vehiclesByBrand,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.vehicle.count(),
      prisma.serviceEntry.count(),
      prisma.serviceEntry.count({ where: { status: "PENDIENTE" } }),
      prisma.serviceEntry.count({ where: { status: "EN_REPARACION" } }),
      prisma.serviceEntry.count({ where: { status: "LISTO" } }),
      prisma.serviceEntry.count({ where: { status: "ENTREGADO" } }),
      prisma.serviceEntry.aggregate({ _sum: { totalCost: true } }),
      prisma.serviceEntry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: {
            include: { client: true },
          },
        },
      }),
      prisma.serviceEntry.groupBy({
        by: ["repairArea"],
        _count: { id: true },
        where: { repairArea: { not: null } },
      }),
      prisma.vehicle.groupBy({
        by: ["brand"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.totalCost ?? 0);

    return NextResponse.json({
      totalClients,
      totalVehicles,
      totalServices,
      pendingServices,
      inProgressServices,
      readyServices,
      deliveredServices,
      totalRevenue,
      recentServices,
      servicesByArea: servicesByArea.map((s) => ({
        area: s.repairArea || "Sin especificar",
        count: s._count.id,
      })),
      vehiclesByBrand: vehiclesByBrand.map((v) => ({
        brand: v.brand,
        count: v._count.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
