/**
 * أثير — the material.
 *
 * Five bands on one dial, each a decade of Arabic broadcasting. Turning the
 * knob moves between them, so every field here is something the set actually
 * changes when you land on a station: the light in the room, the announcer, the
 * programme, the archive.
 *
 * The performers and programmes are written for this archive rather than taken
 * from a real one — an era can be evoked honestly without borrowing a living
 * estate's names or a label's recordings.
 */

/**
 * What a band actually plays.
 *
 * The recordings this archive is about are not ours, and none are sampled — so
 * every band's music is generated in the browser from these five facts. That is
 * also why the bands sound genuinely different from one another rather than
 * being one loop with a filter on it: a 1930s takht and an 1980s drum box do not
 * share a tempo, a scale, an ensemble or a phrase.
 *
 * The maqamat are given in cents because they are not twelve-tone: Bayati's
 * second sits around 150 cents and Rast's third around 350, neither of which
 * exists on a piano. Those intervals are the sound of the thing.
 */
export interface StationMusic {
  bpm: number;
  /** Tonic as a MIDI note. */
  root: number;
  maqam: string;
  /** Scale in cents from the tonic. */
  cents: readonly number[];
  /** Mix of the ensemble, 0…1 per voice. */
  ensemble: {
    oud: number;
    qanun: number;
    ney: number;
    strings: number;
    riq: number;
    box: number;
  };
  /** The phrase, as scale degrees over sixteen steps. −1 is a rest. */
  phrase: readonly number[];
}

export interface Station {
  id: string;
  /** Position on the dial, 0…1, right to left as the scale is printed. */
  at: number;
  khz: string;
  name: string;
  decade: string;
  /** What this band sounds like, in one line. */
  mood: string;
  announcer: string;
  /** Warmth of the dial lamp on this band. Drives the room's light. */
  glow: string;
  /** Base frequency of the carrier the set whistles while you tune past it. */
  tone: number;
  music: StationMusic;
  programme: { time: string; title: string; kind: string }[];
  archive: { title: string; by: string; year: string; len: string }[];
}

export const STATIONS: readonly Station[] = [
  {
    id: "s1",
    at: 0.06,
    khz: "٥٥٠",
    name: "زمن الأسطوانة",
    decade: "الثلاثينيات",
    mood: "تخت شرقي صغير، وأسطوانة تنتهي قبل أن يكتمل المعنى.",
    announcer: "المذيع: عبد الحميد رِفعت",
    glow: "#d99a3f",
    tone: 174,
    music: {
      bpm: 58,
      root: 50,
      maqam: "بياتي",
      cents: [0, 150, 300, 500, 700, 800, 1000],
      ensemble: { oud: 0.9, qanun: 0.7, ney: 0.35, strings: 0.15, riq: 0.55, box: 0 },
      phrase: [0, -1, 2, 3, -1, 2, 1, 0, -1, 3, 4, 3, 2, -1, 1, -1],
    },
    programme: [
      { time: "٧:٠٠", title: "افتتاح الإرسال", kind: "موسيقى" },
      { time: "٧:٢٠", title: "من التخت الشرقي", kind: "حفل" },
      { time: "٨:٠٥", title: "قصيدة وموشّح", kind: "غناء" },
    ],
    archive: [
      { title: "ليلة في التخت", by: "فرقة الأنوار", year: "١٩٣٤", len: "٤:١٢" },
      { title: "موشّح الصبا", by: "سعاد الحلواني", year: "١٩٣٧", len: "٦:٤٠" },
      { title: "دور المقام", by: "التخت الملكي", year: "١٩٣٩", len: "٨:٢٥" },
    ],
  },
  {
    id: "s2",
    at: 0.29,
    khz: "٦٢٠",
    name: "الإذاعة الوطنية",
    decade: "الخمسينيات",
    mood: "أوركسترا كاملة، وصوتٌ واحد يملأ القاعة بلا مُكبِّر.",
    announcer: "المذيعة: نادية سالم",
    glow: "#e2b45a",
    tone: 196,
    music: {
      bpm: 76,
      root: 48,
      maqam: "راست",
      cents: [0, 200, 350, 500, 700, 900, 1050],
      ensemble: { oud: 0.4, qanun: 0.55, ney: 0.5, strings: 0.9, riq: 0.5, box: 0 },
      phrase: [0, 2, 4, -1, 5, 4, 2, -1, 4, 5, 6, 7, -1, 5, 4, -1],
    },
    programme: [
      { time: "٦:٣٠", title: "نشرة الصباح", kind: "أخبار" },
      { time: "٩:٠٠", title: "الأوركسترا الوطنية", kind: "حفل" },
      { time: "١٠:٤٥", title: "بريد المستمعين", kind: "حديث" },
    ],
    archive: [
      { title: "افتتاحية الوطن", by: "الأوركسترا الوطنية", year: "١٩٥٢", len: "٩:٥٠" },
      { title: "يا ليل", by: "منيرة عبد الجواد", year: "١٩٥٥", len: "١٢:٣٠" },
      { title: "على الناصية", by: "ثلاثي الأصيل", year: "١٩٥٨", len: "٥:١٥" },
    ],
  },
  {
    id: "s3",
    at: 0.52,
    khz: "٧٤٠",
    name: "الوصلة الطويلة",
    decade: "الستينيات",
    mood: "أغنيةٌ واحدة تستغرق الأمسية كلّها، والجمهور يُعيدها ثلاثًا.",
    announcer: "المذيع: كمال الشِّربيني",
    glow: "#e8c874",
    tone: 220,
    music: {
      bpm: 64,
      root: 45,
      maqam: "حجاز",
      cents: [0, 100, 400, 500, 700, 800, 1000],
      ensemble: { oud: 0.85, qanun: 0.8, ney: 0.7, strings: 0.6, riq: 0.7, box: 0 },
      phrase: [0, 1, 2, -1, 1, 0, -1, 4, 3, 2, 1, 0, -1, -1, 2, -1],
    },
    programme: [
      { time: "٨:٠٠", title: "أمسية الخميس", kind: "حفل حي" },
      { time: "١٠:٣٠", title: "إعادة المذهب", kind: "غناء" },
      { time: "١٢:٠٠", title: "ختام السهرة", kind: "موسيقى" },
    ],
    archive: [
      { title: "أمسية الخميس، الوصلة الأولى", by: "ليلى الفرغلي", year: "١٩٦٣", len: "٤٢:١٠" },
      { title: "مقدّمة العود", by: "حسن الدالي", year: "١٩٦٥", len: "٧:٤٠" },
      { title: "الردّ على الجمهور", by: "ليلى الفرغلي", year: "١٩٦٧", len: "١٨:٠٥" },
    ],
  },
  {
    id: "s4",
    at: 0.75,
    khz: "٨٨٠",
    name: "موسيقى الصورة",
    decade: "السبعينيات",
    mood: "كمانٌ وأورغ كهربائي معًا، وشريطٌ يدور في استوديو ضيّق.",
    announcer: "المذيعة: هالة مُنيب",
    glow: "#dd9a4a",
    tone: 233,
    music: {
      bpm: 104,
      root: 47,
      maqam: "نهاوند",
      cents: [0, 200, 300, 500, 700, 800, 1000],
      ensemble: { oud: 0.25, qanun: 0.3, ney: 0.2, strings: 0.85, riq: 0.4, box: 0.45 },
      phrase: [0, -1, 4, -1, 3, -1, 2, 4, 0, -1, 4, -1, 5, 4, 2, -1],
    },
    programme: [
      { time: "٥:٠٠", title: "مقدّمات الأفلام", kind: "موسيقى" },
      { time: "٦:٤٠", title: "المؤلّف يتحدّث", kind: "حديث" },
      { time: "٨:٠٠", title: "تسجيل الاستوديو", kind: "جلسة" },
    ],
    archive: [
      { title: "شارة المسلسل", by: "أوركسترا المدينة", year: "١٩٧٢", len: "٢:٤٥" },
      { title: "مشهد المطاردة", by: "سمير قنديل", year: "١٩٧٥", len: "٣:٣٠" },
      { title: "نهاية سعيدة", by: "أوركسترا المدينة", year: "١٩٧٨", len: "٤:٠٠" },
    ],
  },
  {
    id: "s5",
    at: 0.94,
    khz: "٩٦٠",
    name: "الأغنية القصيرة",
    decade: "الثمانينيات",
    mood: "ثلاث دقائق ونصف، وصندوق إيقاعٍ يضبط الحيّ كلّه.",
    announcer: "المذيع: طارق زيدان",
    glow: "#c9803a",
    tone: 262,
    music: {
      bpm: 118,
      root: 52,
      maqam: "كرد",
      cents: [0, 100, 300, 500, 700, 800, 1000],
      ensemble: { oud: 0.3, qanun: 0.2, ney: 0.1, strings: 0.4, riq: 0.2, box: 0.95 },
      phrase: [0, 0, 3, -1, 2, -1, 0, -1, 5, -1, 4, 3, 2, -1, 0, -1],
    },
    programme: [
      { time: "٤:٠٠", title: "الجديد هذا الأسبوع", kind: "أغنيات" },
      { time: "٦:٠٠", title: "طلبات المستمعين", kind: "طلبات" },
      { time: "٩:٠٠", title: "الحفل المسائي", kind: "حفل" },
    ],
    archive: [
      { title: "على البحر", by: "رامي شوقي", year: "١٩٨٢", len: "٣:٣٥" },
      { title: "ليلة صيف", by: "دُنيا رشدي", year: "١٩٨٥", len: "٣:٥٠" },
      { title: "شارع النيل", by: "فرقة المِشوار", year: "١٩٨٨", len: "٤:١٠" },
    ],
  },
];

/** The set's own specification, printed on a plate on its back. */
export const PLATE = [
  { k: "الطراز", v: "أثير ٥ — مِذياع خشبي" },
  { k: "الموجات", v: "متوسطة · طويلة · قصيرة" },
  { k: "الصندوق", v: "خشب جوز مُلمَّع، واجهة قماشية" },
  { k: "السنة", v: "١٩٥٨" },
];

/**
 * The finishes.
 *
 * A radio was a piece of furniture, and furniture was sold in finishes. Each one
 * here changes the whole object rather than a background: the two woods and their
 * grain, the cloth over the speaker, the front plate, the knobs, the tint of the
 * dial glass, the colour of the pilot lamp, and how the cabinet casts its shadow
 * into the room.
 */
export interface Finish {
  id: string;
  name: string;
  /** One line an actual catalogue would print. */
  note: string;
  woodA: string;
  woodB: string;
  /** Grain contrast, 0…1. Ebony shows almost none; walnut shows a lot. */
  grain: number;
  cloth: string;
  plate: string;
  plateInk: string;
  knob: string;
  knobEdge: string;
  glassA: string;
  glassB: string;
  lamp: string;
  shadow: string;
  /** Swatch on the selector. */
  chip: string;
}

export const FINISHES: readonly Finish[] = [
  {
    id: "walnut",
    name: "جوز",
    note: "الطراز الأصلي، ١٩٥٨.",
    woodA: "#4a2f1c",
    woodB: "#2d1c10",
    grain: 1,
    cloth: "#8a6a44",
    plate: "#d9cdb4",
    plateInk: "#3a2b17",
    knob: "#2a1a10",
    knobEdge: "rgba(255, 220, 170, 0.3)",
    glassA: "#f6e9c8",
    glassB: "#dcc287",
    lamp: "#e2b45a",
    shadow: "rgba(50, 30, 12, 0.75)",
    chip: "linear-gradient(135deg, #6b452a, #2d1c10)",
  },
  {
    id: "ebony",
    name: "أبنوس",
    note: "طلبٌ خاصّ للاستوديوهات.",
    woodA: "#221f19",
    woodB: "#100e0a",
    grain: 0.35,
    cloth: "#5b564a",
    plate: "#b9b2a4",
    plateInk: "#1b1813",
    knob: "#0c0b08",
    knobEdge: "rgba(220, 214, 196, 0.28)",
    glassA: "#e7dcc0",
    glassB: "#c8b489",
    lamp: "#d8a851",
    shadow: "rgba(10, 8, 5, 0.8)",
    chip: "linear-gradient(135deg, #322e26, #100e0a)",
  },
  {
    id: "ivory",
    name: "عاج",
    note: "طرازُ المطبخ، صيف ١٩٦١.",
    woodA: "#e6dbc0",
    woodB: "#cdbf9d",
    grain: 0.25,
    cloth: "#b7a683",
    plate: "#4a4132",
    plateInk: "#f1e9d5",
    knob: "#cbbb96",
    knobEdge: "rgba(70, 58, 38, 0.35)",
    glassA: "#fbf4e2",
    glassB: "#e8d9b2",
    lamp: "#c9803a",
    shadow: "rgba(120, 96, 58, 0.5)",
    chip: "linear-gradient(135deg, #f2e9d2, #cdbf9d)",
  },
  {
    id: "onyx",
    name: "أسود لامع",
    note: "الطراز المُصدَّر، ١٩٧٤.",
    woodA: "#1a1a1c",
    woodB: "#0b0b0c",
    grain: 0.15,
    cloth: "#4a4a50",
    plate: "#a8a8ad",
    plateInk: "#141416",
    knob: "#08080a",
    knobEdge: "rgba(215, 220, 230, 0.3)",
    glassA: "#e4e6ea",
    glassB: "#b9bec8",
    lamp: "#e8ba52",
    shadow: "rgba(6, 6, 8, 0.82)",
    chip: "linear-gradient(135deg, #2c2c30, #0b0b0c)",
  },
  {
    id: "burgundy",
    name: "خمري",
    note: "طرازُ الصالون، ١٩٦٦.",
    woodA: "#4a1620",
    woodB: "#2a0b11",
    grain: 0.6,
    cloth: "#8a5a52",
    plate: "#dcc6b2",
    plateInk: "#3a1119",
    knob: "#22090e",
    knobEdge: "rgba(255, 208, 186, 0.3)",
    glassA: "#f7e6d2",
    glassB: "#e0bf98",
    lamp: "#e0a45c",
    shadow: "rgba(56, 14, 22, 0.75)",
    chip: "linear-gradient(135deg, #63202c, #2a0b11)",
  },
  {
    id: "teal",
    name: "أزرق مِصري",
    note: "طرازُ المقهى، ١٩٦٣.",
    woodA: "#16403c",
    woodB: "#0b2523",
    grain: 0.5,
    cloth: "#4e7a72",
    plate: "#cfd8cf",
    plateInk: "#0f2d29",
    knob: "#08201e",
    knobEdge: "rgba(196, 232, 222, 0.3)",
    glassA: "#eef3e4",
    glassB: "#c9d9b8",
    lamp: "#e2b45a",
    shadow: "rgba(8, 34, 32, 0.75)",
    chip: "linear-gradient(135deg, #1f5a54, #0b2523)",
  },
];
