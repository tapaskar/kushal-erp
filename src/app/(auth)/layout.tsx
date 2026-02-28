import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr]">
      {/* Left: branded dark panel */}
      <div className="hidden lg:flex flex-col justify-between bg-sidebar px-12 py-10">
        {/* Top brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary/15">
            <Logo className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sidebar-foreground font-bold text-base tracking-tight">
              Kushal-RWA
            </span>
            <span className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-medium">
              Society ERP
            </span>
          </div>
        </div>

        {/* Middle: quote / features */}
        <div className="space-y-8">
          <div>
            <h2 className="text-sidebar-foreground text-2xl font-semibold leading-snug">
              Everything your society needs,{" "}
              <span className="text-sidebar-primary">in one place.</span>
            </h2>
            <p className="mt-3 text-sidebar-foreground/50 text-sm leading-relaxed max-w-xs">
              From maintenance billing and complaints to procurement and vendor
              management — built for Indian Resident Welfare Associations.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              "Automated maintenance collection & reminders",
              "Complaint tracking with resident notifications",
              "Purchase requests, RFQs & vendor quotes",
              "3-level purchase order approval workflow",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-sidebar-foreground/60">
                <span className="mt-0.5 h-4 w-4 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                  <span className="block h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom copyright */}
        <p className="text-sidebar-foreground/25 text-xs">
          © 2026 Kushal-RWA · Society ERP Platform
        </p>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center bg-background px-8 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
