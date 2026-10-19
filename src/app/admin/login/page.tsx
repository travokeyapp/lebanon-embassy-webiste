import Image from "next/image";
import LoginForm from "./login-form";

const REASONS: Record<string, string> = {
  "signed-out": "You were signed out because your account or password changed. Please sign in again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; reason?: string | string[] }>;
}) {
  const query = await searchParams;
  const nextPath = (Array.isArray(query.next) ? query.next[0] : query.next) ?? "";
  const reason = (Array.isArray(query.reason) ? query.reason[0] : query.reason) ?? "";
  const notice = REASONS[reason];

  return (
    <main className="admLogin">
      <div className="admCard admLoginCard">
        <div className="admLoginBrand">
          <Image src="/cedar-logo.svg" alt="" width={56} height={56} />
          <h1>Website Admin</h1>
          <p>Embassy of Lebanon · Islamabad</p>
        </div>
        {notice ? (
          <p className="admAlert admAlertInfo" role="status">
            {notice}
          </p>
        ) : null}
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
