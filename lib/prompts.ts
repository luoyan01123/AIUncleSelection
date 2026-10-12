export const PRIMARY_PROMPTS = [
  "350分能上公办本科吗？",
  "选计算机还是土木？",
] as const;

export const SECONDARY_PROMPTS = [
  "家里没资源，金融还能报吗？",
  "文科生最该躲开哪些专业？",
] as const;

export const ALL_PROMPTS = [...PRIMARY_PROMPTS, ...SECONDARY_PROMPTS];
