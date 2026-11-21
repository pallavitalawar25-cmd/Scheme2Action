// Normalised auth errors so the UI never depends on a specific backend.
// codes: invalid_credentials | email_taken | username_taken | network | unknown
export class AuthError extends Error {
  constructor(code, message) { super(message || code); this.name = 'AuthError'; this.code = code; }
}
