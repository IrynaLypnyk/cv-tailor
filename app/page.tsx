import { cookies } from "next/headers";
import { getAccessInfo } from "@/lib/auth/session";
import { TailorPage } from "@/components/TailorPage";

/**
 * Server component — reads cookies and searchParams before rendering so
 * TailorPage receives the correct access state on the initial paint.
 *
 * ?mode=demo is supported for admins who want to preview the demo experience.
 * Query params can only reduce access, never grant it — an unauthenticated
 * visitor with ?mode=demo is already in demo mode and sees no difference.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const [cookieStore, params] = await Promise.all([cookies(), searchParams]);
  const accessInfo = getAccessInfo(cookieStore);
  const isForcedDemoMode = accessInfo.isAdmin && params.mode === "demo";
  return (
    <TailorPage accessInfo={accessInfo} isForcedDemoMode={isForcedDemoMode} />
  );
}
