export const DUAN_PRIMARY_PROMPTS = [
  "朋友想开一家奶茶店，怎么看？",
  "茅台跌了一半，该不该卖？",
] as const;

export const DUAN_SECONDARY_PROMPTS = [
  "我想借钱加杠杆买股票",
  "帮我看看苹果这家公司",
] as const;

export const DUAN_PROMPTS = [...DUAN_PRIMARY_PROMPTS, ...DUAN_SECONDARY_PROMPTS];
