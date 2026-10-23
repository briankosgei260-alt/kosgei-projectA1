import Link from "next/link";
import { requireApprovedDevice } from "@/lib/access";
import { signOut } from "@/app/devices/actions";

export default async function PrivatePage() {
  const { user, device } = await requireApprovedDevice();
  const displayName = process.env.OWNER_NAME?.trim() || user.email;

  return (
    <section>
      <h1>{displayName}&apos;s Private Portal</h1>
      <p>
        Signed in as {user.email} on <strong>{device.name}</strong>.
      </p>
      <p>This page is available only to your account on an approved browser.</p>
      <p><Link href="/devices">Manage authorized devices</Link></p>
      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    </section>
  );
}
