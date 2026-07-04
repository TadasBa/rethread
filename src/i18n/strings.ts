/* ============================================================================
   Centralized copy. Lithuanian is the only locale shipped in v1, but everything
   lives under `strings.lt` so adding `strings.en` later is a data change plus a
   language switch — not a rewrite. Import `S` for structured content and `t()`
   for flat key lookups.
   ========================================================================== */

export type Locale = "lt" | "en";
export let locale: Locale = "lt";

const lt = {
  brand: {
    name: "Rethread",
    tagline: "Antras gyvenimas drabužiams",
    blurb: "Drabužių taisymas paštu. Atsiųskite paštomatu — grąžinsime kaip naują.",
  },

  nav: {
    how: "Kaip veikia",
    estimator: "Taisymai",
    journal: "Žurnalas",
    faq: "DUK",
    about: "Apie mus",
    contact: "Kontaktai",
    start: "Pradėti taisymą",
    menu: "Meniu",
    close: "Uždaryti",
  },

  common: {
    eur: "€",
    days: "d. d.", // darbo dienos
    workdays: "darbo dienos",
    estimate: "Kaina",
    total: "Iš viso",
    turnaround: "Terminas",
    next: "Toliau",
    back: "Atgal",
    required: "privaloma",
    optional: "nebūtina",
    loading: "Kraunama…",
    notFoundTitle: "Šio siūlo galo nėra",
    notFoundBody: "Puslapis, kurio ieškote, nutrūko. Grįžkime prie pradžios.",
    homeCta: "Į pradžią",
  },

  hero: {
    eyebrow: "Drabužių taisymas paštu — visoje Lietuvoje",
    // The two lines are styled separately; second line carries the stitched accent.
    titleA: "Susiūkime tai,",
    titleB: "kas brangu.",
    lead: "Sutrūkęs užtrauktukas, per ilgos klešnės, prakiurusi alkūnė. Atsiųskite drabužį paštomatu, o mes jį sugrąžinsime kaip naują — su aiškia kaina ir per 3–7 darbo dienas.",
    ctaPrimary: "Sudaryti taisymo sąrašą",
    ctaSecondary: "Kaip tai veikia",
    scroll: "Sekite siūlą",
    stat1Label: "Terminas",
    stat1Value: "3–7 d.d.",
    stat2Label: "Garantija",
    stat2Value: "14 dienų",
    stat3Label: "Kainos",
    stat3Value: "10–30 €",
  },

  // Home: three-step process, woven onto the thread.
  steps: {
    eyebrow: "Trys dygsniai",
    title: "Nuo paštomato iki naujo gyvenimo",
    lead: "Jokių eilių, jokių derybų. Trys žingsniai — ir mėgstamas drabužis vėl su jumis.",
    items: [
      {
        code: "01",
        title: "Pasirinkite taisymus",
        body: "Skaičiuoklėje sudėliokite, ką reikia pataisyti. Iškart matote kainą ir terminą — be paslėptų mokesčių.",
      },
      {
        code: "02",
        title: "Išsiųskite paštomatu",
        body: "Supakuokite drabužį ir išsiųskite artimiausiu paštomatu arba kurjeriu. Adresą ir instrukcijas atsiųsime el. paštu.",
      },
      {
        code: "03",
        title: "Atgaukite kaip naują",
        body: "Meistrai atlieka darbą, patikrina kokybę ir grąžina drabužį jums. 14 dienų garantija kiekvienam dygsniui.",
      },
    ],
  },

  proof: {
    eyebrow: "Meistrystė",
    title: "Dygsnis, kurio nesimato",
    lead: "Naudojame tų pačių atspalvių siūlus ir originalias detales, kad taisymo vietos nesimatytų.",
    cards: [
      { k: "Užtrauktukai", v: "Keičiame ir taisome slankiklius, dantukus, jungtis." },
      { k: "Klešnės ir rankovės", v: "Trumpiname išsaugodami originalų kraštą." },
      { k: "Skylės ir plyšiai", v: "Nematomas taisymas arba matomas „boro“ lopinys." },
      { k: "Siūlės ir sagos", v: "Sutvirtiname tai, kas pradėjo irti." },
    ],
    note: "Nesate tikri, ar drabužis pataisomas? Atsiųskite nuotrauką — atsakysime per dieną.",
  },

  manifesto: {
    eyebrow: "Kodėl taisyti",
    title: "Kiekvienas drabužis turi istoriją. Mes ją pratęsiame.",
    body: "Greitoji mada moko išmesti. Mes tikime priešingai: gerai pasiūtas daiktas nusipelno antro gyvenimo, o ne sąvartyno. Taisymas — ne praeities įprotis, o šiuolaikiškas, atsakingas pasirinkimas.",
    figure: "Kasmet Lietuvoje išmetama tūkstančiai tonų tekstilės. Kiekvienas pataisytas drabužis yra mažas, bet realus žingsnis prieš perteklinį vartojimą.",
  },

  homeCta: {
    title: "Turite drabužį, kurį reikia pataisyti?",
    body: "Pasirinkite taisymo paslaugą ir sužinokite kainą iškart.",
    button: "Pradėti taisymą",
  },

  how: {
    title: "Kaip veikia",
    lead: "Taisymas paštu — nuo užsakymo iki grąžinto drabužio.",
    sections: [
      {
        code: "01",
        title: "Sudarote taisymo sąrašą",
        body: "Skaičiuoklėje pasirenkate drabužį ir taisymus. Matote aiškią kainą ir terminą. Jei apžiūrėjus drabužį paaiškėtų, kad reikia papildomo darbo, pirma susisieksime.",
      },
      {
        code: "02",
        title: "Pateikiate užklausą",
        body: "Paliekate kontaktus ir pastabas. Per vieną darbo dieną atsiunčiame patvirtinimą su siuntimo instrukcijomis ir mūsų paštomato adresu.",
      },
      {
        code: "03",
        title: "Išsiunčiate drabužį",
        body: "Supakuojate ir išsiunčiate paštomatu ar kurjeriu. Rekomenduojame drabužį išskalbti prieš siunčiant.",
      },
      {
        code: "04",
        title: "Taisome ir tikriname",
        body: "Meistrai atlieka darbą per 3–7 darbo dienas. Skubiems atvejams — greitesnis terminas pagal susitarimą.",
      },
      {
        code: "05",
        title: "Grąžiname ir apmokate",
        body: "Grąžiname drabužį jums. Apmokėti galima kortele, „Paysera“, „PayPal“ ar „Apple Pay“. 14 dienų garantija.",
      },
    ],
    shippingTitle: "Siuntimas ir grąžinimas",
    shippingBody: "Dirbame su paštomatais ir kurjeriais visoje Lietuvoje. Siuntimo kaina priklauso nuo pasirinkto tiekėjo ir nurodoma patvirtinime.",
    guaranteeTitle: "14 dienų garantija",
    guaranteeBody: "Jei taisymas neatitiko lūkesčių — pataisysime iš naujo arba grąžinsime pinigus.",
  },

  estimator: {
    title: "Taisymo skaičiuoklė",
    lead: "Pasirinkite drabužį, pridėkite taisymus ir, jei norite, pažymėkite, kur jie reikalingi. Kaina ir terminas matomi iškart.",
    step1: "1 — Koks drabužis?",
    step2: "2 — Ką taisyti?",
    garmentHint: "Pasirinkite drabužio tipą.",
    lockedServices: "Pirma pasirinkite drabužį.",
    toolHint: "Pasirinkite reikiamus taisymus.",
    placePrompt: "Spustelėkite ant drabužio, kur reikia pataisyti:",
    placeIdle: "Galite pažymėti, kur tiksliai yra problema — tai nebūtina.",
    placeDone: "Vietos pažymėtos. Galite tęsti.",
    placeAction: "Pažymėti vietą",
    placedChange: "Keisti vietą",
    placedOk: "vieta pažymėta",
    movePin: "tempkite, kad pakeistumėte vietą",
    added: "pridėta",
    removed: "pašalinta",
    remove: "Pašalinti",
    emptyWorksheet: "Kol kas tuščia. Pridėkite pirmą taisymą.",
    worksheetTitle: "Taisymo sąrašas",
    estimateNote: "Rodoma kaina taikoma pasirinktai paslaugai. Jei reikėtų papildomo, nepasirinkto darbo, pirma susisieksime.",
    cta: "Tęsti į užsakymą",
    ctaEmpty: "Pridėkite bent vieną taisymą",
    liveGarment: "Pasirinktas drabužis",
  },

  order: {
    title: "Užsakymo užklausa",
    lead: "Papasakokite apie drabužį — atsiųsime patvirtinimą su kaina ir siuntimo instrukcijomis per vieną darbo dieną.",
    back: "Į skaičiuoklę",
    summaryTitle: "Jūsų taisymo sąrašas",
    emptySummary: "Sąrašas tuščias. Grįžkite į skaičiuoklę ir pasirinkite taisymus.",
    toEstimator: "Į skaičiuoklę",
    contactTitle: "Jūsų kontaktai",
    garmentTitle: "Apie drabužį",
    repairsTitle: "Taisymų detalės",
    repairsHint: "Kuo tiksliau aprašysite, tuo tiksliau meistras pasiruoš.",
    photosTitle: "Nuotraukos",
    photosHint: "Nuotraukos labai padeda įvertinti darbą — pridėkite iki 5.",
    photosAdd: "Pasirinkti nuotraukas",
    locationLabel: "Pažymėta vieta",
    shippingTitle: "Siuntimas",
    fields: {
      name: "Vardas",
      email: "El. paštas",
      phone: "Telefonas",
      garmentType: "Drabužio tipas ir medžiaga",
      garmentTypePlaceholder: "Pvz. „vilnonis paltas“, „lino suknelė“",
      color: "Spalva",
      colorPlaceholder: "Pvz. „tamsiai mėlyna“",
      shipping: "Kaip siųsite drabužį?",
      shippingOptions: ["Paštomatu", "Kurjeriu", "Dar nežinau"],
      notes: "Papildoma pastaba",
      notesPlaceholder: "Bet kas, ką dar turėtume žinoti",
      consent: "Sutinku, kad su manimi būtų susisiekta dėl šios užklausos.",
    },
    submit: "Pateikti užklausą",
    submitting: "Siunčiama…",
    successTitle: "Užklausa gauta — ačiū!",
    successBody: "Per vieną darbo dieną atsiųsime patvirtinimą su kaina ir siuntimo instrukcijomis. Patikrinkite ir šlamšto aplanką.",
    successCta: "Grįžti į pradžią",
    errorTitle: "Nepavyko išsiųsti.",
    errorBody: "Pabandykite dar kartą arba parašykite mums tiesiogiai.",
    photoTooBig: "Kai kurios nuotraukos per didelės (viršija 4 MB) ir buvo praleistos.",
    photoTooMany: "Galima pridėti iki 5 nuotraukų.",
    validation: {
      name: "Įrašykite vardą",
      email: "Įrašykite teisingą el. paštą",
      consent: "Reikia jūsų sutikimo, kad galėtume susisiekti",
    },
  },

  journal: {
    title: "Žurnalas",
    lead: "Apie taisymą, priežiūrą ir ilgesnį drabužių gyvenimą — trumpai ir be pamokslų.",
    readMore: "Skaityti",
    backToList: "Visi įrašai",
    minutes: "min. skaitymo",
  },

  faq: {
    title: "Dažni klausimai",
    lead: "Neradote atsakymo? Parašykite — atsakysime per dieną.",
    items: [
      {
        q: "Kiek kainuoja taisymas?",
        a: "Kaina priklauso nuo drabužio ir darbo. Skaičiuoklėje matote tikslią pasirinktos paslaugos kainą iškart.",
      },
      {
        q: "Kaip pristatyti drabužį?",
        a: "Paštomatu arba kurjeriu. Kai pateiksite užklausą, atsiųsime tikslų adresą ir instrukcijas el. paštu.",
      },
      {
        q: "Kiek užtrunka?",
        a: "Įprastai 3–7 darbo dienas nuo drabužio gavimo. Skubiems atvejams galimas greitesnis terminas pagal susitarimą.",
      },
      {
        q: "Ar tikrai nesimatys, kad taisyta?",
        a: "Siekiame nematomo taisymo — parenkame tų pačių atspalvių siūlus ir originalias detales. Kai kuriems drabužiams siūlome ir matomą „boro“ stiliaus lopinį kaip sąmoningą akcentą.",
      },
      {
        q: "O jei drabužio pataisyti nepavyks?",
        a: "Prieš imdamiesi darbo visada patvirtiname galimybes. Jei taisymas neįmanomas, grąžiname drabužį be jokio mokesčio už darbą.",
      },
      {
        q: "Kaip apmokėti?",
        a: "Kortele, per „Paysera“, „PayPal“ arba „Apple Pay“. Mokate gavę patvirtinimą ir apmokėjimo nuorodą.",
      },
      {
        q: "Ar galioja garantija?",
        a: "Taip — 14 dienų. Jei kažkas ne taip, pataisysime iš naujo arba grąžinsime pinigus.",
      },
    ],
  },

  about: {
    title: "Apie mus",
    lead: "Rethread — komanda, tikinti, kad drabužio istorija neturi baigtis dėl vieno sutrūkusio siūlo.",
    body1: "Pradėjome nuo paprasto pastebėjimo: dažną mėgstamą drabužį išmetame ne todėl, kad jis nusidėvėjo, o todėl, kad pataisyti atrodo per sudėtinga. Nėra kur nunešti, nežinia kiek kainuos, gaila laiko.",
    body2: "Todėl taisymą padarėme tokį paprastą, koks jis turėtų būti: pasirenkate taisymus internetu, išsiunčiate paštomatu, atgaunate drabužį kaip naują. Aiškiai, greitai ir su pagarba tiek daiktui, tiek jūsų laikui.",
    body3: "Dirbame su patyrusiais siuvėjais ir renkamės kokybiškas medžiagas, nes tikime, kad gerai padarytas taisymas tarnauja metų metus. Tvarumas mums prasideda ne nuo šūkių, o nuo konkretaus dygsnio.",
    valuesTitle: "Kuo tikime",
    values: [
      { k: "Skaidrumas", v: "Kaina aiški iš anksto. Jokių netikėtų mokesčių." },
      { k: "Meistrystė", v: "Taisome taip, kad nesimatytų. Arba taip, kad būtų gražu." },
      { k: "Pagarba laikui", v: "Viskas paštu — nereikia niekur važiuoti." },
      { k: "Tvarumas", v: "Kiekvienas pataisytas drabužis — vienu nauju mažiau." },
    ],
  },

  contact: {
    title: "Kontaktai",
    lead: "Susisiekite su mumis jums patogiu būdu.",
    phoneLabel: "Telefonas",
    phone: "+370 62634234",
    emailLabel: "El. paštas",
    email: "business@rethread.lt",
    hoursLabel: "Darbo laikas",
    hours: "I–VI, 09:00–17:00 · VII nedirbame",
    socialLabel: "Sekite",
    photoTitle: "Turite konkretų drabužį?",
    photoBody: "Greičiausias kelias — atsiųskite nuotrauką ir trumpą aprašymą el. paštu. Pasakysime, ar pataisoma ir kiek kainuotų.",
  },

  footer: {
    tagline: "Antras gyvenimas drabužiams.",
    madeIn: "Sukurta Lietuvoje",
    rights: "Visos teisės saugomos",
    nav: "Nuorodos",
    legal: "Papildoma informacija",
    privacy: "Privatumo politika",
    terms: "Paslaugų teikimo sąlygos",
    shipping: "Siuntimas ir grąžinimas",
    newsletterTitle: "Mūsų naujienlaiškis",
    newsletterBody: "Be spamo. Tik naudingi patarimai ir naujienos.",
    newsletterPlaceholder: "jusu@paštas.lt",
    newsletterCta: "Prenumeruoti",
    newsletterDone: "Ačiū! Netrukus susisieksime.",
  },
} as const;

export const strings = { lt } as const;
export const S = strings[locale];

/** Flat dotted-key lookup, e.g. t("nav.how"). Returns the key if missing. */
export function t(path: string): string {
  const val = path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, S);
  return typeof val === "string" ? val : path;
}
