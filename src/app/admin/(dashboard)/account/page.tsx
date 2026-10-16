import { requireSession } from "@/lib/auth/session";
import PasswordForm from "./password-form";

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <>
      <header className="admPageHead">
        <div>
          <h1>My account</h1>
          <p className="admMuted">
            Signed in as {session.name} ({session.email}), role: {session.role}.
          </p>
        </div>
      </header>
      <section className="admCard">
        <h2 className="admCardTitle">Change password</h2>
        <PasswordForm />
      </section>
    </>
  );
}
