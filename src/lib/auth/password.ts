import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;
export const MIN_PASSWORD_LENGTH = 12;

// A real bcrypt hash of an unused password. Compared against when the email
// is unknown so that a login attempt takes the same time either way.
const DUMMY_HASH = "$2b$12$ADza5urWSz55y1lCkOo4puY0Y0W.SM1WChvnKDVZW9VLHA6XZ8T4q";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string | undefined): Promise<boolean> {
  const matched = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return hash ? matched : false;
}

export function validateNewPassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) {
    return "Password must contain both letters and numbers.";
  }
  return null;
}
