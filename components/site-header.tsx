import { Flame } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-gold/15 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:h-[4.5rem] md:px-6">
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-cinnabar text-paper ring-2 ring-gold/80 ring-offset-2 ring-offset-ink md:size-12">
          <Flame className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-display text-xl tracking-wide text-paper md:text-2xl">
              AI毒舌大叔
            </h1>
            <span className="shrink-0 rounded-sm bg-cinnabar px-1.5 py-0.5 text-[10px] font-medium tracking-[0.22em] text-white">
              聊志愿
            </span>
          </div>
          <p className="truncate text-xs text-mist">
            不废话，说真话 · 先问清楚再下判断
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 text-xs text-mist">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-emerald-400" />
          </span>
          在线
        </div>
      </div>
      <div className="relative h-px overflow-hidden bg-gold/20">
        <div className="animate-sheen absolute inset-y-0 w-1/4 bg-gold" />
      </div>
    </header>
  );
}
