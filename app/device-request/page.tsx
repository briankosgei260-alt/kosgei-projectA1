import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentDevice, getOwner } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { requestDeviceApproval, refreshDeviceStatus } from "./actions";

export default async function DeviceRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; waiting?: string }>;
}) {
  const user = await getOwner();
  if (!user) redirect("/login");

  const device = await getCurrentDevice(user.id);
  if (device?.status === "approved") redirect("/private");

  const admin = createAdminClient();
  const { count, error } = await admin
    .from("authorized_devices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "approved");

  if (error) throw new Error(`Could not check approved devices: ${error.message}`);

  const params = await searchParams;
  const isFirstDevice = (count ?? 0) === 0;

  return (
    <section>
      <h1>{isFirstDevice ? "Set up your first device" : "Device approval needed"}</h1>
      {device?.status === "pending" ? (
        <>
          <p>
            <strong>{device.name}</strong> is waiting for approval from one of
            your already approved devices.
          </p>
          {params.waiting && <p role="status">Still waiting for approval.</p>}
          <form action={refreshDeviceStatus}>
            <button type="submit">Check approval</button>
          </form>
        </>
      ) : device?.status === "revoked" ? (
        <p>This browser was revoked. Request approval again to use it.</p>
      ) : (
        <>
          <p>
            {isFirstDevice
              ? "Register your first trusted browser using the one-time bootstrap code."
              : "Request access for this browser. Approve it later from an already approved device."}
          </p>
          {params.error === "name" && (
            <p role="alert">Enter a device name between 2 and 48 characters.</p>
          )}
          {params.error === "bootstrap" && (
            <p role="alert">That one-time bootstrap code is not correct.</p>
          )}
          <form action={requestDeviceApproval}>
            <p>
              <label htmlFor="name">Device name</label>
              <br />
              <input
                autoComplete="off"
                id="name"
                maxLength={48}
                minLength={2}
                name="name"
                required
                style={{ marginTop: 6, padding: 10, width: "100%" }}
                placeholder="e.g. My phone"
              />
            </p>
            {isFirstDevice && (
              <p>
                <label htmlFor="bootstrapCode">One-time bootstrap code</label>
                <br />
                <input
                  autoComplete="off"
                  id="bootstrapCode"
                  name="bootstrapCode"
                  required
                  style={{ marginTop: 6, padding: 10, width: "100%" }}
                  type="password"
                />
              </p>
            )}
            <button type="submit">Register this browser</button>
          </form>
        </>
      )}
      <p style={{ marginTop: 24 }}>
        <Link href="/login">Return to sign in</Link>
      </p>
    </section>
  );
}
