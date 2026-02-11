// Validation restrictions for usernames and passwords
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const MAX_USERNAME_LENGTH = 30;
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

type ValidationResult = {
  isValid: boolean;
  error: string | null;
};

/**
 * Validates a username based on specific criteria.
 *
 * @param username - The username to validate
 * @param simple - A flag indicating whether to use simple validation (empty check only)
 * @returns A ValidationResult object indicating whether the username is valid and an error message if it is not
 */
export function validateUsername(
  username: string,
  simple?: boolean
): ValidationResult {
  if (!username || username.trim() === "") {
    return { isValid: false, error: "El nombre de usuario es obligatorio." };
  }

  if (simple) return { isValid: true, error: null };

  if (
    username.length < MIN_USERNAME_LENGTH ||
    username.length > MAX_USERNAME_LENGTH
  ) {
    return {
      isValid: false,
      error: `El nombre de usuario debe tener entre ${MIN_USERNAME_LENGTH} y ${MAX_USERNAME_LENGTH} caracteres.`,
    };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      isValid: false,
      error:
        "El nombre de usuario solo puede contener letras, números y guiones bajos.",
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a password and its confirmation based on specific criteria.
 *
 * @param password - The password to validate
 * @param confirmPassword - The confirmation password to validate
 * @param simple - A flag indicating whether to use simple validation (empty check only)
 * @returns A ValidationResult object indicating whether the password is valid and an error message if it is not
 */
export function validatePassword(
  password: string,
  confirmPassword?: string,
  simple?: boolean
): ValidationResult {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "La contraseña es obligatoria." };
  }

  if (simple) return { isValid: true, error: null };

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error:
        "La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número.",
    };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Las contraseñas no coinciden." };
  }

  return { isValid: true, error: null };
}
