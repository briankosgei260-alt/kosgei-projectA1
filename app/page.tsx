import { redirect } from "next/navigation";
import { getOwner, getCurrentDevice } from "@/lib/access";

export default async function HomePage() {
  const user = await getOwner();
  if (!user) redirect("/login");

  const device = await getCurrentDevice(user.id);
  if (!device || device.status !== "approved") redirect("/device-request");

  redirect("/private");
}
