import { cookies } from "next/headers";
import { getAccessInfo } from "@/lib/auth/session";
import { TailorPage } from "@/components/TailorPage";

/**
 * Server component — reads the adminSession and demoSession cookies before
 * rendering so TailorPage can show the correct access banner on the initial
 * paint without a client-side fetch or flash of wrong content.
 */
export default async function Home() {
  const cookieStore = await cookies();
  const accessInfo = getAccessInfo(cookieStore);
  return <TailorPage accessInfo={accessInfo} />;
}
