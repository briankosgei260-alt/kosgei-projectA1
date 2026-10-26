import { getOwner } from "@/lib/access";
import { redirect } from "next/navigation";
import { login } from "./actions";

export default async function LoginPage() {
  let user = null;

  try {
    user = await getOwner();
  } catch (error) {
    user = null;
  }

  // If already logged in, redirect to private route
  if (user) {
    redirect("/private");
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Private Portal</h2>
      <p>Sign in with the owner email address to continue.</p>
      
      <form action={login} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label htmlFor="email">Owner email</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          placeholder="briankosgei260@gmail.com"
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem", fontSize: "1rem", cursor: "pointer" }}>
          Send sign-in link
        </button>
      </form>
    </div>
  );
}