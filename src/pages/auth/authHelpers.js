// Maps AuthError codes to translation keys.
export const authErrorKey = (e) => ({
  invalid_credentials: 'auth.error.invalid', email_taken: 'auth.error.emailTaken', username_taken: 'auth.error.usernameTaken',
}[e?.code] || 'auth.error.network');

export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/dashboard');
// Only follow a "from" path that matches the account's area.
export const safeRedirect = (from, user) => {
  // Internal absolute paths only: reject //host, /\host and anything with a backslash (open-redirect hardening).
  if (!from || typeof from !== 'string' || !/^\/(?![/\\])[^\\]*$/.test(from)) return homeFor(user);
  if (from.startsWith('/admin') && user?.role !== 'admin') return homeFor(user);
  return from;
};
