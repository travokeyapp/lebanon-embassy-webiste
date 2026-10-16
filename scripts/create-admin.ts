/*
 * Create (or reset the password of) an admin-portal user.
 *
 *   npm run admin:create-user -- --email someone@example.com --name "Full Name"
 *   npm run admin:create-user -- --email someone@example.com --name "Full Name" --password 'ChosenPassword123'
 *   npm run admin:create-user -- --email someone@example.com --reset            (new random password)
 *
 * Without --password a random one is generated and printed once.
 */
import { loadLocalEnv } from "./load-env";
import { closeDb } from "@/lib/db/mongo";
import { validateNewPassword } from "@/lib/auth/password";
import {
  USER_ROLES,
  createUser,
  ensureUserIndexes,
  findUserByEmail,
  generatePassword,
  setUserPassword,
  type UserRole,
} from "@/lib/auth/users";

function parseArgs(argv: string[]): Record<string, string | true> {
  const args: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

async function main() {
  loadLocalEnv();
  const args = parseArgs(process.argv.slice(2));

  const email = typeof args.email === "string" ? args.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    throw new Error("Pass --email <address>.");
  }

  const roleArg = typeof args.role === "string" ? args.role : "admin";
  if (!(USER_ROLES as readonly string[]).includes(roleArg)) {
    throw new Error(`--role must be one of: ${USER_ROLES.join(", ")}`);
  }
  const role = roleArg as UserRole;

  const password = typeof args.password === "string" ? args.password : generatePassword();
  const generated = typeof args.password !== "string";
  const problem = validateNewPassword(password);
  if (problem) {
    throw new Error(problem);
  }

  await ensureUserIndexes();
  const existing = await findUserByEmail(email);

  if (existing) {
    if (!args.reset) {
      throw new Error(`${email} already exists. Add --reset to set a new password.`);
    }
    await setUserPassword(existing._id, password);
    console.log(`Password reset for ${email}.`);
  } else {
    const name = typeof args.name === "string" ? args.name.trim() : "";
    if (!name) {
      throw new Error("Pass --name \"Full Name\" when creating a user.");
    }
    await createUser({ email, name, password, role });
    console.log(`Created ${role} user ${email} (${name}).`);
  }

  if (generated) {
    console.log(`\nPassword (shown once, share it securely):\n\n  ${password}\n`);
  }
  console.log("Sign in at /admin/login");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
