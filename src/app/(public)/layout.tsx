import { cookies } from "next/headers";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import MobileTabBar from "@/components/MobileTabBar";
import Splash from "@/components/Splash";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const hasSeenSplash = store.get("hp_splash_seen")?.value === "1";

  if (!hasSeenSplash) {
    return <Splash />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <div className="pb-16 md:pb-0">
        <PublicFooter />
      </div>
      <MobileTabBar />
      <WhatsAppFloatButton />
    </div>
  );
}
