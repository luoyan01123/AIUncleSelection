import { MessageCircleQuestion, Signpost, Users } from "lucide-react";

const RULES = [
  {
    icon: MessageCircleQuestion,
    title: "先问清楚",
    body: "分数、省份、家里资源。\n缺一样，不报学校。",
  },
  {
    icon: Users,
    title: "看中位数",
    body: "不看状元。\n看普通毕业生五年后在哪。",
  },
  {
    icon: Signpost,
    title: "最多三条路",
    body: "选项再多就是没选。\n要明确选什么、不选什么。",
  },
];

export function SideRail() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-white/8 px-6 py-8 lg:flex">
      <p className="text-[11px] tracking-[0.22em] text-gold">咨询规矩</p>
      <p className="mt-3 font-display text-2xl leading-snug text-paper">
        大叔只认这三件事
      </p>
      <ol className="mt-8 space-y-6">
        {RULES.map((rule) => (
          <li key={rule.title} className="flex gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-gold/25 text-gold">
              <rule.icon className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium text-paper">{rule.title}</span>
              <span className="mt-1 block whitespace-pre-line text-sm leading-6 text-mist">
                {rule.body}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
