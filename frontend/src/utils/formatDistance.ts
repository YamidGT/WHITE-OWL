/**
 * Formatea una distancia en metros a un formato legible
 * @param meters - Distancia en metros
 * @returns String formateado (ej: "1.5 km" o "250 m")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  
  const kilometers = meters / 1000;
  if (kilometers < 10) {
    return `${kilometers.toFixed(1)} km`;
  }
  
  return `${Math.round(kilometers)} km`;
}

export default formatDistance;
