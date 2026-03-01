/**
 * Valida que un correo sea de dominio UNAL
 * @param email - Correo electrónico a validar
 * @returns true si el correo es válido y es del dominio @unal.edu.co
 */
export function validateUNALEmail(email: string): boolean {
  const unalEmailRegex = /^[a-zA-Z0-9._%+-]+@unal\.edu\.co$/;
  return unalEmailRegex.test(email);
}

/**
 * Valida que una fecha sea futura
 * @param dateString - Fecha en formato string
 * @returns true si la fecha es futura
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date > new Date();
}

/**
 * Valida que una fecha esté en formato ISO válido
 * @param dateString - Fecha en formato string
 * @returns true si la fecha es válida
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Valida la fuerza de una contraseña
 * @param password - Contraseña a validar
 * @returns true si la contraseña es fuerte (mínimo 8 caracteres, al menos una mayúscula y un número)
 */
export function isStrongPassword(password: string): boolean {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return strongPasswordRegex.test(password);
}

export default {
  validateUNALEmail,
  isFutureDate,
  isValidDate,
  isStrongPassword,
};
