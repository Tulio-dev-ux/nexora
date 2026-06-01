import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <Navbar />
      <div className={`min-h-screen bg-[#030712] grid-bg pt-28 ${className}`}>
        {children}
      </div>
      <Footer />
    </>
  );
}
