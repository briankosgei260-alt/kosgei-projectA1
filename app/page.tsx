import { redirect } from "next/navigation";
import { getOwner, getCurrentDevice } from "@/lib/access";

export default async function HomePage() {
  let user = null;
  
  try {
    user = await getOwner();
  } catch (error) {
    // If getting owner throws an error (missing session), handle as logged out
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  let device = null;
  try {
    device = await getCurrentDevice(user.id);
  } catch (error) {
    device = null;
  }

  if (!device || device.status !== "approved") {
    redirect("/device-request");
  }

  redirect("/private");
}