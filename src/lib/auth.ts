export function getRolePg(rol: string): string {
  const roles: Record<string, string> = {
    'veterinario': 'veterinario',
    'recepcionista': 'recepcionista',
    'admin': 'admin',
  };
  return roles[rol] ?? 'recepcionista';
}

export function getVetId(req: Request): string {
  return new Headers(req.headers).get('x-vet-id') ?? '';
}

export function getRol(req: Request): string {
  return new Headers(req.headers).get('x-rol') ?? '';
}