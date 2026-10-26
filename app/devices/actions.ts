import { getOwner } from "@/lib/access";
import { redirect } from "next/navigation";
import { loginWithPassword } from "./actions";

export default async function LoginPage() {
  let user = null;

  try {
    user = await getOwner();
  } catch (error) {
    user = null;
  }

  if (user) {
    redirect("/private");
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Private Portal</h2>
      <p>Sign in with your owner account.</p>
      
      <form action={loginWithPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "0.25rem" }}>Email</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            placeholder="briankosgei260@gmail.com"
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: "block", marginBottom: "0.25rem" }}>Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            placeholder="••••••••"
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem", boxSizing: "border-box" }}
          />
        </div>

        <button type="submit" style={{ padding: "0.6rem", fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" }}>
          Sign In
        </button>
      </form>
    </div>
  );
}