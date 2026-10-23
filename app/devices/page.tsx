import { createAdminClient } from "@/lib/supabase/admin";
import { requireApprovedDevice } from "@/lib/access";
import Link from "next/link";
import { approveDevice, revokeCurrentDevice, revokeDevice } from "./actions";

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user, device: currentDevice } = await requireApprovedDevice();
  const admin = createAdminClient();
  const { data: devices, error } = await admin
    .from("authorized_devices")
    .select("id, name, status, created_at, approved_at, last_seen_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load devices: ${error.message}`);

  const params = await searchParams;

  return (
    <section>
      <p><Link href="/private">Back to private portal</Link></p>
      <h1>Approved devices</h1>
      <p>Approve only devices you personally control.</p>
      {params.error === "current" && (
        <p role="alert">Use “Revoke this device” below to remove the current device.</p>
      )}
      {params.error === "last" && (
        <p role="alert">
          Keep at least one approved device. Approve another device before
          revoking this one.
        </p>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {(devices ?? []).map((item) => (
          <li
            key={item.id}
            style={{
              background: "white",
              border: "1px solid #d9deea",
              borderRadius: 8,
              marginBottom: 12,
              padding: 16,
            }}
          >
            <strong>{item.name}</strong> — {item.status}
            {item.id === currentDevice.id && " (this browser)"}
            <div style={{ color: "#576176", fontSize: 14, marginTop: 6 }}>
              Added {new Date(item.created_at).toLocaleString()}
              {item.last_seen_at &&
                ` · Last seen ${new Date(item.last_seen_at).toLocaleString()}`}
            </div>
            {item.status === "pending" && (
              <form action={approveDevice} style={{ display: "inline-block", marginTop: 10 }}>
                <input name="deviceId" type="hidden" value={item.id} />
                <button type="submit">Approve</button>
              </form>
            )}
            {item.status === "approved" && item.id !== currentDevice.id && (
              <form action={revokeDevice} style={{ display: "inline-block", marginLeft: 8 }}>
                <input name="deviceId" type="hidden" value={item.id} />
                <button type="submit">Revoke</button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <form action={revokeCurrentDevice}>
        <button type="submit">Revoke this device</button>
      </form>
    </section>
  );
}
