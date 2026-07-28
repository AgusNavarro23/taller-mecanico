import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const clientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  dni: z.string().optional(),
});

export const vehicleSchema = z.object({
  plate: z.string().min(6, "La patente debe tener al menos 6 caracteres").toUpperCase(),
  brand: z.string().min(1, "La marca es requerida"),
  model: z.string().min(1, "El modelo es requerido"),
  year: z.number().min(1900, "Año inválido").max(new Date().getFullYear() + 1, "Año inválido"),
  color: z.string().optional(),
  vin: z.string().optional(),
  mileage: z.number().min(0, "El kilometraje no puede ser negativo").optional(),
  clientId: z.string().min(1, "El cliente es requerido"),
});

export const serviceSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  status: z.enum(["PENDIENTE", "EN_REPARACION", "LISTO", "ENTREGADO"]),
  repairArea: z.string().optional(),
  entryDate: z.string().min(1, "La fecha de ingreso es requerida"),
  exitDate: z.string().optional(),
  laborCost: z.number().min(0, "El costo no puede ser negativo"),
  partsCost: z.number().min(0, "El costo no puede ser negativo").optional().default(0),
  notes: z.string().optional(),
  parts: z.array(z.object({
    name: z.string().min(1, "El nombre del repuesto es requerido"),
    quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
    price: z.number().min(0, "El precio no puede ser negativo"),
  })).optional(),
  vehicleId: z.string().min(1, "El vehículo es requerido"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
