import { prisma } from "@/lib/prisma";

export async function createNotification(data: {
  title: string;
  message: string;
  type?: string;
  entityId?: string;
  entityType?: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || "info",
        entityId: data.entityId || null,
        entityType: data.entityType || null,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function markAllAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
  }
}
