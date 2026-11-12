import type { Metadata } from "next";
import { Ban, Scale, Target } from "lucide-react";
import { ChatApp } from "@/components/chat-app";
import { SideRail } from "@/components/side-rail";
import { SiteHeader } from "@/components/site-header";
import { DUAN_PRIMARY_PROMPTS, DUAN_SECONDARY_PROMPTS } from "@/lib/duan-prompts";

export const metadata: Metadata = {
  title: "AI毒舌大叔 · 看生意",
  description: "用段永平的框架看生意：先问对不对，不懂不做，从十年后看回来。",
};

const RULES = [
  {
    icon: Scale,
    title: "先问对不对",
    body: "有诱惑的时候回到本质。\n对不对，比赚不赚钱先。",
  },
  {
    icon: Ban,
    title: "不为清单",
    body: "不做空，不借钱，不懂不做。\n最重要的是不做什么。",
  },
  {
    icon: Target,
    title: "十年回望",
    body: "生意、人、价格。\n从十年后看回来再决定。",
  },
];

export default function DuanPage() {
  return (
    <div className="relative flex h-full flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(211,39,59,0.18),transparent_52%),radial-gradient(ellipse_at_bottom_right,rgba(227,181,106,0.08),transparent_40%)]"
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <SiteHeader
          badge="看生意"
          subtitle="段永平视角 · 做对的事情，把事情做对"
          switchHref="/"
          switchLabel="聊志愿"
        />
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1">
          <SideRail
            kicker="看生意的规矩"
            heading="大道只认这三件事"
            rules={RULES}
          />
          <ChatApp
            persona="duan"
            primaryPrompts={DUAN_PRIMARY_PROMPTS}
            secondaryPrompts={DUAN_SECONDARY_PROMPTS}
            emptyTitle={
              <>
                生意和对的人没说清，
                <br />
                我不会帮你下判断。
              </>
            }
            emptyHint="点一个问题，或者把生意模式、做事的人、你懂不懂直接发过来。"
            placeholder="说说这门生意、做事的人，或者你卡在哪"
            footnote={
              <>
                <span className="hidden sm:inline">Enter 发送，Shift+Enter 换行 · </span>
                以公开言论推断，非本人观点，不构成投资建议
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
