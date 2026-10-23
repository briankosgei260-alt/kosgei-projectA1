import { sendSignInLink } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <section>
      <h1>Private Portal</h1>
      <p>Sign in with the owner email address to continue.</p>
      {params.sent && <p role="status">Check your email for the sign-in link.</p>}
      {params.error === "owner" && (
        <p role="alert">Only the configured owner account can sign in.</p>
      )}
      {params.error === "link" && (
        <p role="alert">That sign-in link is invalid or expired. Request a new one.</p>
      )}
      <form action={sendSignInLink}>
        <label htmlFor="email">Owner email</label>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            autoComplete="email"
            id="email"
            name="email"
            required
            style={{ flex: 1, padding: 10 }}
            type="email"
          />
          <button style={{ padding: "10px 16px" }} type="submit">
            Send sign-in link
          </button>
        </div>
      </form>
    </section>
  );
}
