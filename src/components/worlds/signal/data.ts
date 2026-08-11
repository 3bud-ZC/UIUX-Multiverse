/**
 * شَرارة — the material.
 *
 * A learning game for Arabic-speaking children. The four adventure worlds are
 * the spine of the site: picking one repaints the page, reloads the phone and
 * swaps the sticker set, so the data below carries colour and screen content,
 * not just labels.
 */

export type Motif = "letters" | "numbers" | "space" | "sea";

export interface Adventure {
  id: Motif;
  name: string;
  tag: string;
  blurb: string;
  /** The shout that lands when this world is chosen. */
  shout: string;
  accent: string;
  ground: string;
  /** Rows on the phone screen for this world. */
  screen: { label: string; value: string; done: boolean }[];
  /** The big glyph the phone puts on its card. */
  glyph: string;
  levels: number;
  cleared: number;
}

export const ADVENTURES: readonly Adventure[] = [
  {
    id: "letters",
    name: "عالَم الحُروف",
    tag: "٢٨ حرفًا، وكلٌّ منها بابٌ",
    blurb: "تجمع الحروف من الطريق وتبني بها كلمة. كلّ كلمة صحيحة تفتح بابًا جديدًا.",
    shout: "!ألِف",
    accent: "#ff4f74",
    ground: "#ffe9ef",
    glyph: "ص",
    screen: [
      { label: "اجمع الحرف", value: "ص · صَقر", done: true },
      { label: "ركِّب الكلمة", value: "صَـ + ـقر", done: true },
      { label: "اقرأها بصوتك", value: "صَقر", done: false },
    ],
    levels: 28,
    cleared: 19,
  },
  {
    id: "numbers",
    name: "عالَم الأرقام",
    tag: "العدّ، ثم الجمع، ثم الحيلة",
    blurb: "سوقٌ صغيرة فيها بائعٌ ماكر. لا تشتري شيئًا قبل أن تعدّ الباقي بنفسك.",
    shout: "!سَبعة",
    accent: "#ffd23f",
    ground: "#fff6d9",
    glyph: "٧",
    screen: [
      { label: "عُدّ التُّفّاح", value: "٧ حبّات", done: true },
      { label: "ادفع", value: "١٠ قروش", done: true },
      { label: "كم الباقي؟", value: "٣ قروش", done: false },
    ],
    levels: 20,
    cleared: 12,
  },
  {
    id: "space",
    name: "عالَم الفَضاء",
    tag: "ثمانية كواكب وصاروخٌ صغير",
    blurb: "تُطلق صاروخك، وتتعلّم لماذا يسقط الحجر ولا يسقط القمر.",
    shout: "!انطلاق",
    accent: "#8b5cf6",
    ground: "#efe8ff",
    glyph: "🚀",
    screen: [
      { label: "املأ الوقود", value: "٨٠٪", done: true },
      { label: "اختر الكوكب", value: "المِرّيخ", done: true },
      { label: "احسب المسافة", value: "؟؟ يوم", done: false },
    ],
    levels: 16,
    cleared: 6,
  },
  {
    id: "sea",
    name: "عالَم البَحر",
    tag: "تحت الماء، الصوت أسرع",
    blurb: "تغوص مع قُطَيْط وتتعرّف على الكائنات، وتتعلّم لماذا يطفو الخشب ويغرق الحجر.",
    shout: "!غَطس",
    accent: "#2ba7e0",
    ground: "#e2f4ff",
    glyph: "🐟",
    screen: [
      { label: "اغطس", value: "١٢ مترًا", done: true },
      { label: "صوِّر الكائن", value: "سُلَحفاة", done: false },
      { label: "أطفو أم أغرق؟", value: "جرِّب", done: false },
    ],
    levels: 14,
    cleared: 9,
  },
];

export interface Character {
  id: string;
  name: string;
  power: string;
  line: string;
  hue: string;
  face: "spark" | "star" | "cat" | "sprout";
}

export const CHARACTERS: readonly Character[] = [
  {
    id: "sharara",
    name: "شَرارة",
    power: "تُضيء الطريق المظلم",
    line: "«ما فيش حاجة صعبة، فيه حاجة لسّه ما جرّبناهاش.»",
    hue: "#ff4f74",
    face: "spark",
  },
  {
    id: "najma",
    name: "نَجمة",
    power: "تعرف كلّ الاتجاهات",
    line: "«لو تُهت، بُصّ لفوق.»",
    hue: "#ffd23f",
    face: "star",
  },
  {
    id: "qutayt",
    name: "قُطَيْط",
    power: "يسمع ما لا يُسمَع",
    line: "«أنا مش خايف… أنا بفكّر بسرعة.»",
    hue: "#2ba7e0",
    face: "cat",
  },
  {
    id: "burum",
    name: "بُرعُم",
    power: "ينمو كلّما أخطأت",
    line: "«الغلطة سماد.»",
    hue: "#3ec98a",
    face: "sprout",
  },
];

/** كيف تلعب — three panels, read right to left like a comic strip. */
export const STRIP = [
  {
    n: "١",
    title: "اختَر عالَمًا",
    body: "أربعة عوالم، وكلٌّ منها طريق. ابدأ من الحروف أو اقفز إلى الفضاء.",
    bubble: "!يلا بينا",
  },
  {
    n: "٢",
    title: "العَب واجمع الشَّرَر",
    body: "كلّ إجابة صحيحة شَرارة. الشَّرَر يفتح شخصيات جديدة وأدوات.",
    bubble: "!شاطر",
  },
  {
    n: "٣",
    title: "أرِ أهلك",
    body: "تقريرٌ أسبوعي بسيط يقول ماذا تعلَّمت فعلًا، لا كم ساعة قضيت.",
    bubble: "!برافو",
  },
];

export const PARENT_FACTS = [
  { k: "بلا إعلانات", v: "ولا مشتريات داخل التطبيق. أبدًا." },
  { k: "يعمل بلا إنترنت", v: "العوالم الأربعة كلّها تُحمَّل مرّة واحدة." },
  { k: "تقرير أسبوعي", v: "ما تعلَّمه الطفل، لا كم ساعة جلس." },
  { k: "٦ — ١١ سنة", v: "بالعربية الفصحى المبسَّطة، وبصوت عربي." },
];
