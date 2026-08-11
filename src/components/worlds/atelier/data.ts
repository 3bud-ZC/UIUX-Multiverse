/**
 * مِجاز — the material.
 *
 * Every verse here is classical Arabic poetry whose author died between the
 * sixth and fourteenth centuries, so the text is long out of copyright and can
 * be set in full. The prosody is real: each poet carries the metre they are
 * actually written in and that metre's feet, because the metre section reads
 * them rather than decorating with them.
 *
 * The collection is organised by era, and the era is art direction rather than a
 * filter: each one carries its own ink, its own paper temperature, its own
 * degree of ornament and its own marginal hand. A جاهلي page is dry ink on sand
 * with almost no illumination; an أندلسي page is green and gold and covered in
 * it. The five periods are the real ones.
 */

export interface Era {
  id: string;
  name: string;
  span: string;
  /** One line of atmosphere, said the way a scholar of the period would say it. */
  note: string;
  /** Paper ground, ink, accent — the page's temperature for this century. */
  base: string;
  ink: string;
  accent: string;
  accentAlt: string;
  rule: string;
  /** 0 — bare, 3 — fully illuminated. Ornament restraint is period-accurate. */
  ornament: 0 | 1 | 2 | 3;
  /** How much surface grain the paper carries. */
  grain: number;
}

export const ERAS: readonly Era[] = [
  {
    id: "jahili",
    name: "الجاهلي",
    span: "قبل ٦٢٢ م",
    note: "لا كتابَ ولا مِحبرة. الشِّعر محفوظٌ في الصدور، ومطلعُه وقوفٌ على أثرِ بيتٍ رحل أهلُه.",
    base: "#171310",
    ink: "#efe4d0",
    accent: "#c98b3c",
    accentAlt: "#8f7a5c",
    rule: "#3a2f24",
    ornament: 0,
    grain: 0.9,
  },
  {
    id: "sadr",
    name: "صدر الإسلام",
    span: "٦٢٢ — ٦٦١ م",
    note: "لغةٌ واحدة تتّسع لدينٍ جديد. الرثاء يبلغ ذروته، والمدح يصير مسؤولية.",
    base: "#12161a",
    ink: "#eae7de",
    accent: "#b8a06a",
    accentAlt: "#6f8a86",
    rule: "#2b3238",
    ornament: 1,
    grain: 0.7,
  },
  {
    id: "umawi",
    name: "الأُموي",
    span: "٦٦١ — ٧٥٠ م",
    note: "دمشق، والقصيدة تدخل البلاط. غزلٌ عذريّ في البادية، وهجاءٌ محترف في الحضر.",
    base: "#101820",
    ink: "#e8eaea",
    accent: "#cf9b4a",
    accentAlt: "#7e9fd6",
    rule: "#25313c",
    ornament: 2,
    grain: 0.5,
  },
  {
    id: "abbasi",
    name: "العبّاسي",
    span: "٧٥٠ — ١٢٥٨ م",
    note: "بغداد، والورق. صناعةُ الكتاب تولد، فيولد معها شاعرٌ يعرف أنّ كلامه سيُنسَخ.",
    base: "#0d1420",
    ink: "#f2e9d8",
    accent: "#d9a441",
    accentAlt: "#7e9fd6",
    rule: "#26344b",
    ornament: 3,
    grain: 0.35,
  },
  {
    id: "andalusi",
    name: "الأندلسي",
    span: "٧٥٦ — ١٤٩٢ م",
    note: "ماءٌ وظلٌّ وأنهار. الموشَّح يخرج على أوزان الخليل، والقصيدة تتعلَّم الغناء.",
    base: "#0c1613",
    ink: "#f0ecdc",
    accent: "#d8b053",
    accentAlt: "#4f9c86",
    rule: "#1f342d",
    ornament: 3,
    grain: 0.4,
  },
];

export interface Verse {
  /** صدر — the opening hemistich. */
  sadr: string;
  /** عجز — the closing hemistich. */
  ajuz: string;
}

export interface Poet {
  id: string;
  era: string;
  name: string;
  kunya: string;
  years: string;
  epithet: string;
  /** One line on why this poet is in the collection. */
  note: string;
  /** The form the poem takes — قصيدة، معلَّقة، موشَّح، رثاء. */
  form: string;
  bahr: string;
  /** التفعيلات — the feet of the metre, in order. */
  feet: string[];
  /** The syllable pattern of one foot: ● long, ○ short. */
  pattern: string[];
  verse: Verse;
  /** A longer passage for the reading room. */
  passage: string[];
  /** Marginal glosses, keyed to the passage lines they sit beside. */
  gloss: { line: number; term: string; meaning: string }[];
}

const TAWIL = {
  bahr: "الطَويل",
  feet: ["فَعولُن", "مَفاعيلُن", "فَعولُن", "مَفاعِلُن"],
  pattern: ["○●●", "○●●●", "○●●", "○●○●"],
};
const BASIT = {
  bahr: "البَسيط",
  feet: ["مُستَفعِلُن", "فاعِلُن", "مُستَفعِلُن", "فَعِلُن"],
  pattern: ["●●○●", "●○●", "●●○●", "○○●"],
};
const KAMIL = {
  bahr: "الكامِل",
  feet: ["مُتَفاعِلُن", "مُتَفاعِلُن", "مُتَفاعِلُن"],
  pattern: ["○○●○●", "○○●○●", "○○●○●"],
};
const RAMAL = {
  bahr: "الرَمَل",
  feet: ["فاعِلاتُن", "فاعِلاتُن", "فاعِلُن"],
  pattern: ["●○●●", "●○●●", "●○●"],
};

export const POETS: readonly Poet[] = [
  /* ── الجاهلي ─────────────────────────────────────────────────────────── */
  {
    id: "imru",
    era: "jahili",
    name: "امرؤ القَيس",
    kunya: "جُندُح بن حُجر الكِندي",
    years: "نحو ٥٠١ — ٥٤٥ م",
    epithet: "صاحب المُعَلَّقة الأولى",
    note: "أوّل من وقف على الطلل، وأوّل من جعل البكاء مطلعًا.",
    form: "مُعَلَّقة",
    ...TAWIL,
    verse: {
      sadr: "قِفا نَبكِ مِن ذِكرى حَبيبٍ وَمَنزِلِ",
      ajuz: "بِسِقطِ اللِوى بَينَ الدَخولِ فَحَومَلِ",
    },
    passage: [
      "قِفا نَبكِ مِن ذِكرى حَبيبٍ وَمَنزِلِ",
      "بِسِقطِ اللِوى بَينَ الدَخولِ فَحَومَلِ",
      "فَتوضِحَ فَالمِقراةِ لَم يَعفُ رَسمُها",
      "لِما نَسَجَتها مِن جَنوبٍ وَشَمأَلِ",
    ],
    gloss: [
      { line: 1, term: "سِقط اللِوى", meaning: "منقطَع الرمل، موضع بنجد" },
      { line: 2, term: "لَم يَعفُ", meaning: "لم يَندرِس ولم يَنمحِ" },
      { line: 3, term: "شَمأَل", meaning: "ريح الشمال" },
    ],
  },
  {
    id: "zuhayr",
    era: "jahili",
    name: "زُهَير بن أبي سُلمى",
    kunya: "زهير بن ربيعة المُزَني",
    years: "نحو ٥٢٠ — ٦٠٩ م",
    epithet: "شاعر الحِكمة والصُّلح",
    note: "كان يَنقُل البيت سنةً قبل أن يُخرجه، فسُمِّيت قصائده الحَوليّات.",
    form: "مُعَلَّقة",
    ...TAWIL,
    verse: {
      sadr: "وَمَن يَجعَلِ المَعروفَ مِن دونِ عِرضِهِ",
      ajuz: "يَفِرهُ وَمَن لا يَتَّقِ الشَتمَ يُشتَمِ",
    },
    passage: [
      "وَمَن يَجعَلِ المَعروفَ مِن دونِ عِرضِهِ",
      "يَفِرهُ وَمَن لا يَتَّقِ الشَتمَ يُشتَمِ",
      "وَمَن هابَ أَسبابَ المَنِيّاتِ يَلقَها",
      "وَلَو رامَ أَسبابَ السَماءِ بِسُلَّمِ",
    ],
    gloss: [
      { line: 1, term: "يَفِرهُ", meaning: "يُوفِّره ويَصونه" },
      { line: 2, term: "هابَ", meaning: "خافَ واتّقى" },
      { line: 3, term: "رامَ", meaning: "طلبَ وقصد" },
    ],
  },
  {
    id: "antara",
    era: "jahili",
    name: "عَنتَرة بن شَدّاد",
    kunya: "عنترة بن عمرو العَبسي",
    years: "نحو ٥٢٥ — ٦٠٨ م",
    epithet: "فارس عَبس",
    note: "لم يَفصِل بين البيت والسيف، فجاء الغزل عنده وعليه غبار المعركة.",
    form: "مُعَلَّقة",
    ...KAMIL,
    verse: {
      sadr: "وَلَقَد ذَكَرتُكِ وَالرِماحُ نَواهِلٌ",
      ajuz: "مِنّي وَبيضُ الهِندِ تَقطُرُ مِن دَمي",
    },
    passage: [
      "وَلَقَد ذَكَرتُكِ وَالرِماحُ نَواهِلٌ",
      "مِنّي وَبيضُ الهِندِ تَقطُرُ مِن دَمي",
      "فَوَدِدتُ تَقبيلَ السُيوفِ لِأَنَّها",
      "لَمَعَت كَبارِقِ ثَغرِكِ المُتَبَسِّمِ",
    ],
    gloss: [
      { line: 0, term: "نَواهِل", meaning: "شاربةٌ من الدم، جمع ناهل" },
      { line: 1, term: "بيض الهِند", meaning: "السيوف الهنديّة" },
      { line: 3, term: "بارِق", meaning: "لامع كالبرق" },
    ],
  },

  /* ── صدر الإسلام ─────────────────────────────────────────────────────── */
  {
    id: "khansa",
    era: "sadr",
    name: "الخَنساء",
    kunya: "تُماضِر بنت عمرو السُّلَمية",
    years: "نحو ٥٧٥ — ٦٤٥ م",
    epithet: "سيّدة الرثاء",
    note: "رثَت أخاها صخرًا حتى صار الرثاء كلّه على مقاسها.",
    form: "رِثاء",
    ...BASIT,
    verse: {
      sadr: "وَإِنَّ صَخراً لَتَأتَمُّ الهُداةُ بِهِ",
      ajuz: "كَأَنَّهُ عَلَمٌ في رَأسِهِ نارُ",
    },
    passage: [
      "قَذىً بِعَينِكِ أَم بِالعَينِ عُوّارُ",
      "أَم ذَرَّفَت إِذ خَلَت مِن أَهلِها الدارُ",
      "وَإِنَّ صَخراً لَتَأتَمُّ الهُداةُ بِهِ",
      "كَأَنَّهُ عَلَمٌ في رَأسِهِ نارُ",
    ],
    gloss: [
      { line: 0, term: "عُوّار", meaning: "رمَدٌ يُصيب العين" },
      { line: 1, term: "ذَرَّفَت", meaning: "سالَ دمعُها" },
      { line: 3, term: "عَلَم", meaning: "الجبل الطويل يُهتدى به" },
    ],
  },
  {
    id: "kaab",
    era: "sadr",
    name: "كَعب بن زُهَير",
    kunya: "كعب بن زهير بن أبي سُلمى",
    years: "توفي نحو ٦٤٥ م",
    epithet: "صاحب البانة",
    note: "أنشدَ لاميّتَه اعتذارًا، فصارت أشهرَ اعتذارٍ في العربية.",
    form: "قصيدة",
    ...BASIT,
    verse: {
      sadr: "بانَت سُعادُ فَقَلبي اليَومَ مَتبولُ",
      ajuz: "مُتَيَّمٌ إِثرَها لَم يُفدَ مَكبولُ",
    },
    passage: [
      "بانَت سُعادُ فَقَلبي اليَومَ مَتبولُ",
      "مُتَيَّمٌ إِثرَها لَم يُفدَ مَكبولُ",
      "وَما سُعادُ غَداةَ البَينِ إِذ رَحَلوا",
      "إِلّا أَغَنُّ غَضيضُ الطَرفِ مَكحولُ",
    ],
    gloss: [
      { line: 0, term: "مَتبول", meaning: "أسقمَه الحبّ" },
      { line: 1, term: "مَكبول", meaning: "مُقيَّد بالكَبل" },
      { line: 3, term: "أَغَنّ", meaning: "في صوته غُنّة، يُوصف به الظبي" },
    ],
  },

  /* ── الأُموي ─────────────────────────────────────────────────────────── */
  {
    id: "jarir",
    era: "umawi",
    name: "جَرير",
    kunya: "جرير بن عَطيّة الخَطَفي",
    years: "نحو ٦٥٣ — ٧٣٣ م",
    epithet: "أهجى الثلاثة",
    note: "هَجا نصفَ العرب ثم كتب في العيون بيتًا لم يُنسَ.",
    form: "قصيدة",
    ...BASIT,
    verse: {
      sadr: "إِنَّ العُيونَ الَّتي في طَرفِها حَوَرٌ",
      ajuz: "قَتَلنَنا ثُمَّ لَم يُحيينَ قَتلانا",
    },
    passage: [
      "إِنَّ العُيونَ الَّتي في طَرفِها حَوَرٌ",
      "قَتَلنَنا ثُمَّ لَم يُحيينَ قَتلانا",
      "يَصرَعنَ ذا اللُبِّ حَتّى لا حَراكَ بِهِ",
      "وَهُنَّ أَضعَفُ خَلقِ اللَهِ أَركانا",
    ],
    gloss: [
      { line: 0, term: "حَوَر", meaning: "شدّة بياض العين في سوادها" },
      { line: 2, term: "ذا اللُبّ", meaning: "صاحب العقل الراجح" },
      { line: 3, term: "أَركانا", meaning: "جمع رُكن، القوّة والجانب" },
    ],
  },
  {
    id: "omar",
    era: "umawi",
    name: "عُمَر بن أبي رَبيعة",
    kunya: "عمر بن عبد الله المَخزومي",
    years: "٦٤٤ — ٧١٢ م",
    epithet: "شاعر الحجاز",
    note: "نقلَ الغزل من البادية إلى الطواف، وجعل المرأة تتكلّم في القصيدة.",
    form: "غَزَل",
    ...TAWIL,
    verse: {
      sadr: "أَمِن آلِ نُعمٍ أَنتَ غادٍ فَمُبكِرُ",
      ajuz: "غَداةَ غَدٍ أَم رائِحٌ فَمُهَجِّرُ",
    },
    passage: [
      "أَمِن آلِ نُعمٍ أَنتَ غادٍ فَمُبكِرُ",
      "غَداةَ غَدٍ أَم رائِحٌ فَمُهَجِّرُ",
      "لِحاجَةِ نَفسٍ لَم تَقُل في جَوابِها",
      "فَتُبلِغَ عُذراً وَالمَقالَةُ تُعذِرُ",
    ],
    gloss: [
      { line: 0, term: "غادٍ", meaning: "ذاهبٌ في الغُدوة، أوّل النهار" },
      { line: 1, term: "مُهَجِّر", meaning: "سائرٌ في الهاجرة، شدّة الحرّ" },
      { line: 2, term: "حاجَة نَفس", meaning: "أمرٌ في القلب لم يُقَل" },
    ],
  },

  /* ── العبّاسي ────────────────────────────────────────────────────────── */
  {
    id: "mutanabbi",
    era: "abbasi",
    name: "المُتَنَبّي",
    kunya: "أبو الطيّب أحمد بن الحسين",
    years: "٩١٥ — ٩٦٥ م",
    epithet: "مالئ الدنيا وشاغل الناس",
    note: "الفخر عنده حكمة، والحكمة عنده سيف.",
    form: "قصيدة",
    ...BASIT,
    verse: {
      sadr: "الخَيلُ وَاللَيلُ وَالبَيداءُ تَعرِفُني",
      ajuz: "وَالسَيفُ وَالرُمحُ وَالقِرطاسُ وَالقَلَمُ",
    },
    passage: [
      "إذا غامَرتَ في شَرَفٍ مَرومِ",
      "فَلا تَقنَع بِما دونَ النُجومِ",
      "فَطَعمُ المَوتِ في أَمرٍ حَقيرٍ",
      "كَطَعمِ المَوتِ في أَمرٍ عَظيمِ",
    ],
    gloss: [
      { line: 0, term: "مَروم", meaning: "مطلوب، يُسعى إليه" },
      { line: 1, term: "تَقنَع", meaning: "تَرضى بالقليل" },
      { line: 2, term: "حَقير", meaning: "زهيدٌ لا قيمة له" },
    ],
  },
  {
    id: "nuwas",
    era: "abbasi",
    name: "أبو نُوّاس",
    kunya: "الحسن بن هانئ الحَكَمي",
    years: "٧٥٦ — ٨١٤ م",
    epithet: "شاعر المدينة والمجون",
    note: "خرج على الطلل، وقال للقدماء: ابكوا أنتم، أنا في الحانة.",
    form: "خَمريّة",
    ...BASIT,
    verse: {
      sadr: "دَع عَنكَ لَومي فَإِنَّ اللَومَ إِغراءُ",
      ajuz: "وَداوِني بِالَّتي كانَت هِيَ الداءُ",
    },
    passage: [
      "دَع عَنكَ لَومي فَإِنَّ اللَومَ إِغراءُ",
      "وَداوِني بِالَّتي كانَت هِيَ الداءُ",
      "صَفراءُ لا تَنزِلُ الأَحزانُ ساحَتَها",
      "لَو مَسَّها حَجَرٌ مَسَّتهُ سَرّاءُ",
    ],
    gloss: [
      { line: 0, term: "إِغراء", meaning: "تحريضٌ يزيد الرغبة" },
      { line: 2, term: "صَفراء", meaning: "كناية عن لون الشراب" },
      { line: 3, term: "سَرّاء", meaning: "فرحٌ وسعة" },
    ],
  },
  {
    id: "maarri",
    era: "abbasi",
    name: "أبو العَلاء المَعَرّي",
    kunya: "أحمد بن عبد الله التَّنوخي",
    years: "٩٧٣ — ١٠٥٧ م",
    epithet: "رَهين المَحبِسَين",
    note: "حبسَ نفسَه في بيته وفي عماه، فاتّسع الكلام.",
    form: "لُزوميّة",
    ...TAWIL,
    verse: {
      sadr: "وَإِنّي وَإِن كُنتُ الأَخيرَ زَمانُهُ",
      ajuz: "لَآتٍ بِما لَم تَستَطِعهُ الأَوائِلُ",
    },
    passage: [
      "وَإِنّي وَإِن كُنتُ الأَخيرَ زَمانُهُ",
      "لَآتٍ بِما لَم تَستَطِعهُ الأَوائِلُ",
      "أَرى جيلَنا لا يَستَفيقُ مِنَ الهَوى",
      "وَلِلعَقلِ في أَعناقِهِم سَلاسِلُ",
    ],
    gloss: [
      { line: 1, term: "لَآتٍ", meaning: "لَقادمٌ، لَجائٍ" },
      { line: 2, term: "يَستَفيق", meaning: "يَصحو ويَنتبه" },
      { line: 3, term: "سَلاسِل", meaning: "قيود، جمع سلسلة" },
    ],
  },

  /* ── الأندلسي ────────────────────────────────────────────────────────── */
  {
    id: "zaydun",
    era: "andalusi",
    name: "ابن زَيدون",
    kunya: "أبو الوليد أحمد بن عبد الله",
    years: "١٠٠٣ — ١٠٧١ م",
    epithet: "صاحب النونيّة",
    note: "كتب في الفراق ما لم يُكتَب بعده، وهو ينظر إلى قرطبة من بعيد.",
    form: "قصيدة",
    ...BASIT,
    verse: {
      sadr: "أَضحى التَنائي بَديلاً مِن تَدانينا",
      ajuz: "وَنابَ عَن طيبِ لُقيانا تَجافينا",
    },
    passage: [
      "أَضحى التَنائي بَديلاً مِن تَدانينا",
      "وَنابَ عَن طيبِ لُقيانا تَجافينا",
      "بِنتُم وَبِنّا فَما ابتَلَّت جَوانِحُنا",
      "شَوقاً إِلَيكُم وَلا جَفَّت مَآقينا",
    ],
    gloss: [
      { line: 0, term: "التَنائي", meaning: "التباعُد" },
      { line: 1, term: "تَجافينا", meaning: "تباعُدنا وهجرُنا" },
      { line: 3, term: "المَآقي", meaning: "مجاري الدمع من العين" },
    ],
  },
  {
    id: "khatib",
    era: "andalusi",
    name: "لِسان الدِّين بن الخَطيب",
    kunya: "محمد بن عبد الله السَّلماني",
    years: "١٣١٣ — ١٣٧٤ م",
    epithet: "وزير غرناطة وشاعرها",
    note: "كتب موشَّحًا واحدًا صار نشيدًا للأندلس كلّها بعد أن ضاعت.",
    form: "مُوَشَّح",
    ...RAMAL,
    verse: {
      sadr: "جادَكَ الغَيثُ إِذا الغَيثُ هَمى",
      ajuz: "يا زَمانَ الوَصلِ بِالأَندَلُسِ",
    },
    passage: [
      "جادَكَ الغَيثُ إِذا الغَيثُ هَمى",
      "يا زَمانَ الوَصلِ بِالأَندَلُسِ",
      "لَم يَكُن وَصلُكَ إِلّا حُلُماً",
      "في الكَرى أَو خِلسَةَ المُختَلِسِ",
    ],
    gloss: [
      { line: 0, term: "جادَكَ", meaning: "سقاكَ بكرمٍ ووفرة" },
      { line: 1, term: "الوَصل", meaning: "اللقاء، ضدّ الهجر" },
      { line: 3, term: "الكَرى", meaning: "النوم" },
    ],
  },
];

/**
 * الأشكال — the forms, with what each one actually is.
 *
 * A poetry house that never explains its own forms is a wall of quotations. Each
 * entry names the shape, when it was used, and one line that is genuinely in it.
 */
export interface Form {
  id: string;
  name: string;
  when: string;
  what: string;
  /** A line that demonstrates the form. */
  line: string;
  by: string;
}

export const FORMS: readonly Form[] = [
  {
    id: "muallaqa",
    name: "المُعَلَّقة",
    when: "الجاهلي",
    what: "قصيدةٌ طويلة من سبعٍ أو عشرٍ، تبدأ بالوقوف على الطلل ثم الرحلة ثم الغرض. سُمِّيت مُعَلَّقةً لأنّها عُلِّقت في الأذهان قبل أن تُعلَّق على أستار الكعبة في ما يُروى.",
    line: "أَلا عِم صَباحاً أَيُّها الطَلَلُ البالي",
    by: "امرؤ القيس",
  },
  {
    id: "qasida",
    name: "القَصيدة",
    when: "من الجاهلي إلى اليوم",
    what: "بيتٌ من شطرين، وقافيةٌ واحدة تلتزمها الأبيات كلّها. عمودُ الشعر العربي، ووحدةُ قياسه.",
    line: "وَلَم أَرَ في عُيوبِ الناسِ عَيباً",
    by: "المتنبي",
  },
  {
    id: "ritha",
    name: "الرِّثاء",
    when: "صدر الإسلام",
    what: "غرضٌ لا شكل: تُبنى القصيدة كلّها على فقدٍ واحد، فيصير التعداد بلاغةً والتكرار وزنًا.",
    line: "أَعَينَيَّ جودا وَلا تَجمُدا",
    by: "الخنساء",
  },
  {
    id: "ghazal",
    name: "الغَزَل العُذري",
    when: "الأموي",
    what: "حبٌّ لا يَصِل. القصيدة تُبنى على المسافة نفسها، فكلّما بَعُدَ المحبوب اتّسع الكلام.",
    line: "وَإِنّي لَأَستَغشي وَما بِيَ نَعسَةٌ",
    by: "جميل بثينة",
  },
  {
    id: "muwashah",
    name: "المُوَشَّح",
    when: "الأندلسي",
    what: "خرجَ على أوزان الخليل وعلى القافية الواحدة: أدوارٌ وأقفال وخَرجة، مبنيّة لتُغَنّى لا لتُنشَد. آخرُ ما أضافته العربية إلى شكل القصيدة.",
    line: "وَخَريفٍ وَرَقُهُ مُنتَثِرُ",
    by: "من الموشحات الأندلسية",
  },
];

/** المعرض — four illuminated plates, each a single line with its own geometry. */
export const PLATES = [
  {
    id: "p1",
    line: "لا تَحسَبِ المَجدَ تَمراً أَنتَ آكِلُهُ",
    by: "المتنبي · الطويل",
    motif: "star" as const,
  },
  {
    id: "p2",
    line: "وَعَينُ الرِضا عَن كُلِّ عَيبٍ كَليلَةٌ",
    by: "عبد الله بن معاوية · الطويل",
    motif: "knot" as const,
  },
  {
    id: "p3",
    line: "أَلا كُلُّ شَيءٍ ما خَلا اللَهَ باطِلُ",
    by: "لبيد بن ربيعة · الطويل",
    motif: "arch" as const,
  },
  {
    id: "p4",
    line: "وَإِذا كانَتِ النُفوسُ كِباراً",
    by: "المتنبي · الخفيف",
    motif: "vine" as const,
  },
];

/**
 * Strips the Arabic short vowels and sukun from a run of text.
 *
 * The verse stage writes the letters first and lets the diacritics settle onto
 * them afterwards, which is the order a scribe actually works in: the hand runs
 * the skeleton of the line, then goes back over it and points it. Both strings
 * occupy the same width — harakat are combining marks — so the two layers can be
 * stacked without the line moving.
 */
export function bare(text: string): string {
  return text.replace(/[ً-ْٰٓ-ٕـ]/g, "");
}
