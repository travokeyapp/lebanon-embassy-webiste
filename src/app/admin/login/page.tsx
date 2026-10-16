import Image from "next/image";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const query = await searchParams;
  const nextPath = (Array.isArray(query.next) ? query.next[0] : query.next) ?? "";

  return (
    <main className="admLogin">
      <div className="admCard admLoginCard">
        <div className="admLoginBrand">
          <Image src="/cedar-logo.svg" alt="" width={56} height={56} />
          <h1>Website Admin</h1>
          <p>Embassy of Lebanon · Islamabad</p>
        </div>
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
