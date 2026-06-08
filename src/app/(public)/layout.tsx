import AppHeader from "~/components/AppHeader";
import AppFooter from "~/components/AppFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[--bg]">
      <AppHeader />
      <div className="mx-auto w-full flex-1 max-w-lg md:max-w-2xl lg:max-w-4xl">
        {children}
      </div>
      <AppFooter />
    </div>
  );
}
