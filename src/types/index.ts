
export interface VacunaBody {
  mascota_id: unknown;
  vacuna_id: unknown;
  veterinario_id: unknown;
  costo_cobrado?: unknown;
}

export interface CitaBody {
  mascota_id: unknown;
  veterinario_id: unknown;
  fecha_hora: unknown;
  motivo?: unknown;
}

export interface MascotaPendiente {
  id: number;
  nombre: string;
}

export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  fecha_nacimiento: string;
  dueno: string;
  telefono: string;
}