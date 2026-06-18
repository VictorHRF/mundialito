import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getProfile } from "@/lib/actions/queries";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <div className="cup-page-pattern min-h-screen">
      <div className="cup-color-bar" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <Navbar profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-5 pb-24 md:px-6 md:py-8 md:pb-8">
        {children}
      </main>
      <MobileNav profile={profile} />
    </div>
  );
}
