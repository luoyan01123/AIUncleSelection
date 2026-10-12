import { ChatApp } from "@/components/chat-app";
import { SideRail } from "@/components/side-rail";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="relative flex h-full flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(211,39,59,0.18),transparent_52%),radial-gradient(ellipse_at_bottom_right,rgba(227,181,106,0.08),transparent_40%)]"
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <SiteHeader />
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1">
          <SideRail />
          <ChatApp />
        </div>
      </div>
    </div>
  );
}
