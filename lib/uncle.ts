export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const PROVINCES = [
  "内蒙古",
  "黑龙江",
  "北京",
  "天津",
  "上海",
  "重庆",
  "河北",
  "山西",
  "辽宁",
  "吉林",
  "江苏",
  "浙江",
  "安徽",
  "福建",
  "江西",
  "山东",
  "河南",
  "湖北",
  "湖南",
  "广东",
  "广西",
  "海南",
  "四川",
  "贵州",
  "云南",
  "陕西",
  "甘肃",
  "青海",
  "宁夏",
  "新疆",
  "西藏",
].sort((a, b) => b.length - a.length);

const HOT = new Set([
  "河南",
  "山东",
  "河北",
  "广东",
  "江苏",
  "浙江",
  "安徽",
  "湖南",
  "湖北",
  "四川",
]);

const LOW_LINE = new Set(["青海", "宁夏", "西藏"]);

function findProvince(text: string) {
  return PROVINCES.find((name) => text.includes(name)) ?? null;
}

function findScore(text: string) {
  const match = text.match(/(\d{2,3})\s*分/);
  if (!match) return null;
  const score = Number(match[1]);
  if (score < 150 || score > 900) return null;
  return score;
}

function findTrack(text: string) {
  if (/物理|理科/.test(text)) return "物理类";
  if (/历史|文科/.test(text)) return "历史类";
  return null;
}

function askBasics(
  score: number | null,
  province: string | null,
  track: string | null,
) {
  const known = [score ? `${score}分` : null, province, track]
    .filter(Boolean)
    .join("，");
  const lead = known
    ? `我先记下：${known}。还差条件，差一样我就不给学校名单。`
    : "我先不给你学校名单。名单是最后一步，你现在缺的是决策条件。";

  return `${lead}

回我这四样里还缺的：

1. 多少分，哪个省，位次大概多少
2. 物理还是历史，有没有死活不读的专业
3. 家里做什么的，就业上有没有人能托一把
4. 能接受去哪些城市，一年学费扛多少

说全了，我直接告诉你选哪条，不选哪条。

> 没问清楚就给方案，那是算命，不是咨询。`;
}

function publicUndergraduate(input: {
  score: number | null;
  province: string | null;
  track: string | null;
}) {
  const { score, province, track } = input;
  const scoreText = score ? `${score}分` : "这个分数";
  const trackText = track ? `，${track}` : "";

  if (province === "海南") {
    return `停。海南满分是 **900**，不是 750。

**${scoreText}在海南，公办本科不用谈。** 这个分连不少公办专科都悬，别拿外省的分数线安慰自己。

你现在就两件事：

1. 打开省考试院对专科线，别对培训机构的表。
2. 能上公办专科，就挑护理、电力、铁道这类上手就能干活的。别借钱去读民办本科。

> 满分不一样，裸分就不能横着比。先活在线上。`;
  }

  if (province === "上海") {
    return `上海满分 **660**，别拿外省的 750 分制来套。

**${scoreText}在上海，按近年水位多半够不着公办本科。** 我不会给你报一所“可能捡漏”的民办来充数。

没有位次，我只给方向：

1. 过了当年本科线，再谈公办里好就业的工科和师范。
2. 没过线，公办专科优先，放弃高收费本科。
3. 把位次发我，我才收学校，现在点名就是算命。

> 录取看位次，不看你心里的学校名。`;
  }

  if (province && LOW_LINE.has(province)) {
    return `${province}的分数线和河南、山东不是一档。我不会拿裸分 ${scoreText} 直接判你死刑。

公办本科也不是张嘴就有。把 **位次** 发我，我按位次说能不能碰。在这之前：

1. 先对省控线，再对学校往年投档线。
2. 位次不够就停在公办专科，别为了“本科”两个字付民办的学费。
3. ${track ? `你是${track}，方案按这个选科来。` : "再补一句：物理还是历史。"}

> 这些省，位次比裸分诚实。`;
  }

  if (province && HOT.has(province) && (score === null || score < 450)) {
    return `${province}${trackText}，${scoreText}。我直接说。

**公办本科，基本没戏。** 这个省的本科线水位，这个分过不去。拿外省征集、民办本科的广告安慰自己，是在花家里的钱买一个更难就业的学历。

就三条：

1. 对一下当年省控线，看自己在线下面多少。
2. 公办专科里挑能上手的：电力、护理、铁道、口腔医学技术。
3. 别读高学费民办本科。筛子更严，债先背上了。

> ${province}不相信捡漏。先上一所能吃上饭的公办。`;
  }

  if (!province) {
    if (score !== null && score >= 480) {
      return `${scoreText}，省还没说，我不会给你报学校。

海南满分 900，上海满分 660，大多数省满分 750。同一个数字，在三个卷子里不是一种命运。

按满分 750 的省先给方向，不给名单：

1. 这个分有得谈，优先电气、计算机、护理、师范里能进编制的。
2. 金融、新闻、工商管理，家里没资源就别碰。
3. 把省份、选科、位次补齐，我只给三个档，不给三十个。

> 有分不代表有选择，选择是排出来的。`;
    }

    return `停。${scoreText}离开省份，就是个没意义的数字。

海南满分 **900**，上海满分 **660**，大多数省满分 750。你不说省，我不会假装能报学校。

**先按满分 750 的省给你兜底：** ${scoreText}在河南、山东、河北、广东、江苏这种地方，近年过不了公办本科线。别用民办本科的广告骗自己。

你补三样，我再往下收：

1. 哪个省，物理还是历史
2. 位次。没有位次，至少说大概名次
3. 家里一年学费能扛多少

青海、宁夏、西藏的线不是这个水位。你要是这些省的，直接说，我按位次判，不按裸分吓你。

> 筛子都过不去，专业名气没用。`;
  }

  if (score !== null && score < 430) {
    return `${province}${trackText}，${scoreText}。

多数满分 750 的省，这个分近年摸不到公办本科。${province}我没有拿你当河南那么狠，但也不会给你画“冲一冲就有”的饼。

1. 对省控线。过线了再谈公办本科，专业别碰纯房建和没资源的金融。
2. 没过线，公办专科优先：电力、护理、铁道。
3. 位次发我，我才告诉你哪几所能碰。现在说学校就是算命。

> 先确认自己在不在线上，再谈学校名字。`;
  }

  return `${province}${trackText}${score ? `，${scoreText}` : ""}。这个分有得谈，但公办本科不是一张通知书就完了。

专业我先卡方向，学校等你的位次：

1. 普通家庭优先电气、计算机、护理，以及师范里能进编制的。
2. 金融、新闻、工商管理，家里没资源就别碰。
3. 把位次发我。我只给三个学校档，不给三十个。

> 有分不代表有选择，选择是排出来的。`;
}

function csVsCivil(score: number | null, province: string | null) {
  const context = [province, score ? `${score}分` : null].filter(Boolean).join("，");
  const contextLine = context
    ? `你刚才的条件是 ${context}。学校档次得看位次，专业我今天就能定。`
    : "分数和省份你还没说。学校档次得看位次，专业方向我今天就能定。";

  return `普通家庭，孩子数学和逻辑还扛得住，**选计算机，不选土木。**

土木这些年被地产拖下水了。中位数不是设计院画到年薪五十万，是工地、甲方、赶工期。城市更新和基建还招人，纯房建的坑，普通家庭踩不起。

计算机也不是铁饭碗。只会做增删改查的岗位，正在被工具挤掉。你要学的是能解决问题的那一层：数据结构、网络，外加一个能拿给人看的项目。只拿一个专业名头混四年，毕业一样被筛掉。

两条都别幻想：

1. 孩子看到报错就烦，物理也烂——别硬上计算机，去电气、自动化，别去纯房建。
2. 家里就是做工程的，资质和工地你接得住——土木可以碰。那是资源，不是热爱。
3. 两个都想骑墙——不行。主路只留一条。

${contextLine}

> 选择比努力值钱。前提是这条路你扛得住，而且你得先吃上饭。`;
}

function finance(score: number | null, province: string | null) {
  const where = [province, score ? `${score}分` : null].filter(Boolean).join("，");
  const whereLine = where ? `就按你说的 ${where}，` : "";

  return `${whereLine}家里没有银行、券商、基金的人，**金融别碰。**

你看见的是年薪百万的基金经理。中位数是网点里卖理财、跟 985 抢一份简历都过不了筛的岗位。双非金融，连筛子都过不去。

普通家庭就换赛道：

1. 理科底子还行，去计算机或电气，毕业手里有一门手艺。
2. 偏文，去师范或能考证的会计，别去“看起来在金融街”的专业名。
3. 家里真有这个行业的人，能把实习和入行门路接上，再来谈金融。没有这条件，热爱也不算理由。

> 看起来光鲜的专业，最贵。贵的是你四年后没处去。`;
}

function liberalArts(score: number | null, province: string | null) {
  const where = [province, score ? `${score}分` : null].filter(Boolean).join("，");
  const lead = where
    ? `${where}。文科不是不能读，是不能读那些毕业即转行的。`
    : "文科不是不能读，是不能读那些毕业即转行的。";

  return `${lead}

躲开这几个：**新闻、工商管理、市场营销，还有哲学、历史、社会学。** 中位数不是主持人，也不是学者，是找不到对口岗。

普通家庭的文科，路要窄，窄了才稳：

1. 师范，能进编制的优先。薪资天花板不高，但筛子好过。
2. 会计可以碰，前提是你肯考证。基础岗位已经很挤。
3. 学校比专业更挡筛子。文科这条，比理工科更硬。

分数、省份、选科发齐，我只给三个方向。

> 先谋生，再谈喜欢。喜欢可以留到你站稳以后。`;
}

export function buildUncleReply(messages: ChatTurn[]) {
  const users = messages.filter((message) => message.role === "user");
  const last = users.at(-1)?.content.trim() ?? "";
  const corpus = users.map((message) => message.content).join("\n");
  const previous =
    [...messages].reverse().find((message) => message.role === "assistant")
      ?.content ?? "";

  const province = findProvince(corpus);
  const score = findScore(corpus);
  const track = findTrack(corpus);

  if (!last) return askBasics(score, province, track);

  const aboutCs = /计算机/.test(last) && /土木/.test(last);
  const aboutFinance = /金融/.test(last);
  const aboutLine = /公办|本科|专科/.test(last);
  const aboutLiberal =
    /文科|新闻|工商管理|市场营销|哲学|历史|社会学/.test(last) && !aboutCs;

  if (aboutCs) return csVsCivil(score, province);
  if (aboutFinance) return finance(score, province);
  if (aboutLiberal) return liberalArts(score, province);
  if (aboutLine || (score !== null && province !== null)) {
    return publicUndergraduate({ score, province, track });
  }

  const shortFollowUp = last.length <= 40;
  if (shortFollowUp && previous && (province || score || track)) {
    if (/公办|本科|专科|位次|省份/.test(previous)) {
      return publicUndergraduate({ score, province, track });
    }
    if (/计算机|土木/.test(previous)) return csVsCivil(score, province);
    if (/金融/.test(previous)) return finance(score, province);
    if (/文科|新闻|师范/.test(previous)) return liberalArts(score, province);
  }

  return askBasics(score, province, track);
}
