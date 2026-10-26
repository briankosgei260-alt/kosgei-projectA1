'use client'

import { useState } from 'react'
import { loginWithPassword } from './actions'

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await loginWithPassword(formData)

    if (result?.error) {
      setErrorMessage(result.error)
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Private Portal</h2>
      <p>Sign in with your owner account.</p>

      {errorMessage && (
        <div style={{ padding: "0.75rem", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "4px", marginBottom: "1rem" }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "0.6rem", fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  )
}