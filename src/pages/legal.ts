import { h } from "../lib/dom";
import type { RouteContext } from "../router";
import { pageHead } from "./_helpers";

type LegalKind = "privacy" | "terms" | "shipping" | "guarantee";
type LegalSection = {
  title?: string;
  paragraphs?: string[];
  items?: string[];
};

const CONTENT: Record<LegalKind, { title: string; lead: string; sections: LegalSection[] }> = {
  privacy: {
    title: "Privatumo politika",
    lead: "Kaip Rethread tvarko informaciją, surinktą svetainėje.",
    sections: [
      {
        paragraphs: [
          "Rethread svetainė priklauso Rethread, kuri yra jūsų asmens duomenų valdytoja.",
          "Šioje Privatumo politikoje nustatoma, kaip tvarkome informaciją, surinktą ReThread svetainėje, ir paaiškinamos priežastys, kodėl privalome rinkti tam tikrus jūsų asmens duomenis. Prieš naudodamiesi ReThread svetaine rekomenduojame perskaityti šią Privatumo politiką.",
          "Mes rūpinamės jūsų asmens duomenimis ir įsipareigojame užtikrinti jų konfidencialumą bei saugumą.",
        ],
      },
      {
        title: "Slapukai",
        paragraphs: [
          "Svetainė naudoja slapukus siekdama suasmeninti jūsų naršymo patirtį internete. Prisijungdami prie ReThread, jūs sutinkate su būtinųjų slapukų naudojimu.",
          "Slapukai gali būti naudojami informacijai rinkti, saugoti ir stebėti statistiniais ar rinkodaros tikslais. Kai kurie slapukai yra būtini svetainės veikimui ir jiems sutikimo nereikia. Trečiųjų šalių slapukai gali būti naudojami per trečiųjų šalių paslaugas mūsų svetainėje.",
        ],
      },
      {
        title: "Renkama asmeninė informacija",
        paragraphs: [
          "Apsilankę ReThread svetainėje, automatiškai renkame tam tikrą informaciją apie jūsų įrenginį: naršyklę, IP adresą, laiko juostą ir kai kuriuos slapukus. Taip pat galime rinkti informaciją apie peržiūrėtus puslapius ar produktus, nukreipusias svetaines ar paieškos terminus ir sąveiką su svetaine.",
          "Galime rinkti formų metu pateiktus asmens duomenis, įskaitant vardą, pavardę, el. paštą, telefono numerį, siuntimo informaciją ir kitus duomenis, reikalingus užklausai ar paslaugai vykdyti. Informacija saugoma tik tiek laiko, kiek būtina sklandžiam svetainės veikimui ir įsipareigojimams įvykdyti.",
        ],
      },
      {
        title: "Jūsų duomenų tvarkymas",
        paragraphs: [
          "Tvarkome tik minimalų naudotojų duomenų kiekį, reikalingą svetainės veikimui užtikrinti. Automatiškai surinkta informacija naudojama galimiems piktnaudžiavimo atvejams nustatyti ir statistinei informacijai apie svetainės naudojimą sudaryti.",
          "Svetainėje galite lankytis neatskleisdami informacijos, pagal kurią būtų galima jus identifikuoti. Jei norite naudotis tam tikromis funkcijomis, gauti naujienlaiškį ar pateikti duomenis per formą, galite pateikti el. paštą, vardą, pavardę, miestą ar telefono numerį.",
          "Galite pasirinkti nepateikti asmens duomenų, tačiau kai kurios svetainės funkcijos tokiu atveju gali būti neprieinamos. Jei nesate tikri, kokia informacija yra privaloma, susisiekite el. paštu business@rethread.lt.",
        ],
      },
      {
        title: "Jūsų teisės",
        paragraphs: [
          "Jeigu esate Europos Sąjungos gyventojas, turite šias teises, susijusias su jūsų asmens duomenimis:",
        ],
        items: [
          "teisę būti informuotam;",
          "teisę susipažinti su duomenimis;",
          "teisę ištaisyti duomenis;",
          "teisę būti pamirštam;",
          "teisę apriboti duomenų tvarkymą;",
          "teisę į duomenų perkeliamumą;",
          "teisę nesutikti su duomenų tvarkymu;",
          "teises, susijusias su automatizuotu sprendimų priėmimu ir profiliavimu.",
        ],
      },
      {
        title: "Duomenų perdavimas ir kitos svetainės",
        paragraphs: [
          "Jeigu esate Europos Sąjungos gyventojas, jūsų duomenys tvarkomi siekiant įvykdyti su jumis sudarytas sutartis arba teisėtus verslo interesus. Duomenys gali būti perduodami už Europos Sąjungos ribų, įskaitant Kanadą ir Jungtines Amerikos Valstijas.",
          "Mūsų svetainėje gali būti nuorodų į kitas svetaines, kurios mums nepriklauso ir nėra mūsų kontroliuojamos. Mes neatsakome už tokių svetainių ar trečiųjų šalių privatumo praktikas.",
        ],
      },
      {
        title: "Informacijos saugumas",
        paragraphs: [
          "Jūsų pateikiamą informaciją saugome apsaugotuose serveriuose, esančiuose kontroliuojamoje ir saugioje aplinkoje. Taikome pagrįstas administracines, technines ir fizines priemones, kad apsaugotume duomenis nuo neteisėtos prieigos, naudojimo, keitimo ar atskleidimo.",
          "Nė vienas duomenų perdavimo per internetą ar belaidį tinklą būdas nėra visiškai saugus.",
        ],
      },
      {
        title: "Teisinis duomenų atskleidimas",
        paragraphs: [
          "Surinktą, naudojamą ar gautą informaciją galime atskleisti, jei to reikalauja ar leidžia įstatymas, taip pat kai manome, kad atskleidimas būtinas siekiant apsaugoti mūsų teises, jūsų ar kitų asmenų saugumą, ištirti sukčiavimo atvejį arba atsakyti į vyriausybės prašymą.",
        ],
      },
      {
        title: "Licencija ir svetainės turinys",
        paragraphs: [
          "Jei nenurodyta kitaip, Rethread ir jos licencijų turėtojai turi visas intelektinės nuosavybės teises į ReThread svetainėje pateiktą medžiagą. Turinį galite naudoti tik asmeniniais tikslais, laikydamiesi taisyklių ir sąlygų apribojimų.",
        ],
        items: [
          "draudžiama kopijuoti ar perskelbti ReThread turinį;",
          "draudžiama pardavinėti, nuomoti ar sublicencijuoti ReThread turinį;",
          "draudžiama dauginti, kopijuoti ar atkurti ReThread turinį;",
          "draudžiama platinti ReThread turinį be leidimo.",
        ],
      },
      {
        title: "Kontaktinė informacija",
        paragraphs: [
          "Jei norite sužinoti daugiau arba turite klausimų, susijusių su jūsų asmens duomenimis ir teisėmis, susisiekite el. paštu business@rethread.lt.",
        ],
      },
    ],
  },
  terms: {
    title: "Paslaugų teikimo sąlygos",
    lead: "Paslaugų pirkimo ir pardavimo sąlygos.",
    sections: [
      {
        paragraphs: [
          "Sveiki atvykę į ReThread. Čia pateikiamos taisyklės ir nuostatos, reglamentuojančios Rethread svetainės, esančios adresu https://rethread.lt, naudojimo sąlygas ir paslaugų teikimo taisykles.",
          "Prisijungdami prie šios svetainės laikome, kad sutinkate su šiomis taisyklėmis ir sąlygomis. Jei nesutinkate su visomis žemiau pateiktomis sąlygomis, prašome nesinaudoti ReThread svetaine.",
        ],
      },
      {
        title: "1. Bendrosios nuostatos",
        paragraphs: [
          "Šios paslaugų pirkimo-pardavimo sąlygos nustato interneto svetainėje www.rethread.lt veikiančios įmonės Rethread ir Svetainės naudotojo teises, pareigas bei atsakomybę, teikiant drabužių taisymo paslaugas nuotoliniu būdu.",
          "Taisyklės taikomos visiems atvejams, kai Klientas Svetainėje pateikia užsakymą, siunčia ar atsiima drabužius, taip pat naudojasi kitomis su paslaugų teikimu susijusiomis funkcijomis.",
          "Pateikdamas užsakymą Svetainėje, Klientas patvirtina, kad susipažino su šiomis Taisyklėmis, jas supranta ir sutinka jų laikytis.",
        ],
      },
      {
        title: "2. Paslaugų pobūdis",
        paragraphs: [
          "Rethread teikia drabužių taisymo, atnaujinimo, pritaikymo ir priežiūros paslaugas, kurias galima užsakyti internetu, siunčiant drabužius per kurjerį ar paštomatą.",
          "Visi darbai atliekami profesionaliai, vadovaujantis gerąja siuvimo praktika ir taikant kokybės standartus.",
          "Rethread pasilieka teisę atsisakyti vykdyti užsakymą, jei drabužiai yra netinkami taisymui.",
        ],
        items: [
          "drabužiai yra nešvarūs, turi nemalonų kvapą ar biologinių dėmių;",
          "drabužiai turi paslėptų defektų, kurie nebuvo nurodyti užsakymo metu;",
          "audinys yra per daug susidėvėjęs, suplonėjęs ar pažeistas;",
          "drabužiai yra drėgni, šlapi ar su pelėsiu;",
          "drabužiai neatitinka užsakyme nurodyto aprašymo ar pateikta informacija klaidinga.",
        ],
      },
      {
        title: "3. Užsakymo pateikimas ir sutarties sudarymas",
        paragraphs: [
          "Svetainėje pateikta forma yra užklausa dėl drabužių taisymo. Paslaugų teikimas pradedamas tik tada, kai Rethread patvirtina užklausą, Klientas gauna siuntimo ir apmokėjimo instrukcijas ir šalys susitaria dėl tolimesnio vykdymo.",
          "Klientas privalo pateikti teisingus kontaktinius duomenis, drabužių aprašymą ir pageidaujamą paslaugą ar kitą būtiną informaciją.",
          "Rethread neatsako už klaidas ar nuostolius, atsiradusius dėl neteisingos ar neišsamios informacijos pateikimo.",
        ],
        items: [
          "jeigu sutartis nutraukiama prieš prasidedant taisymo procesui, Klientas padengia tik pristatymo išlaidas;",
          "jeigu taisymo procesas jau pradėtas, gali būti taikomas paslaugos atšaukimo mokestis už prarastą laiką, pelną ir sunaudotas medžiagas.",
        ],
      },
      {
        title: "4. Kainos ir atsiskaitymas",
        paragraphs: [
          "Svetainėje nurodytos pasirinktos paslaugos kainos yra galutinės, jei nenurodyta kitaip.",
          "Kainos pateikiamos eurais (EUR). Jei reikėtų papildomo, užklausoje nepasirinkto darbo, Rethread pirmiausia susisiekia su Klientu.",
          "Apmokėjimo nuoroda ar kitos apmokėjimo instrukcijos siunčiamos po užklausos patvirtinimo.",
          "Paslaugų teikimas pradedamas tik po užklausos ir apmokėjimo patvirtinimo, išskyrus atvejus, kai sutarta kitaip.",
        ],
      },
      {
        title: "5. Drabužių pristatymas ir grąžinimas",
        paragraphs: [
          "Klientas drabužius pristato į Rethread dirbtuves per pasirinktą siuntimo paslaugų teikėją: paštomatą arba kurjerį.",
          "Klientas atsako už tinkamą drabužių supakavimą ir ženklinimą.",
          "Po taisymo drabužiai grąžinami Klientui tokiu pačiu būdu, kokiu buvo pristatyti, nebent sutarta kitaip.",
          "Siuntos sekimo numeris Klientui pateikiamas el. paštu ar SMS žinute.",
          "Rethread neatsako už drabužių pažeidimus ar praradimą, įvykusius dėl trečiųjų šalių, pavyzdžiui, kurjerių ar paštomatų, kaltės.",
        ],
      },
      {
        title: "6. Paslaugų atlikimo terminai",
        paragraphs: [
          "Įprastas taisymo terminas - 3–7 darbo dienos nuo drabužių gavimo dienos.",
          "Sudėtingesni ar individualūs užsakymai gali užtrukti ilgiau - apie tai Klientas informuojamas iš anksto.",
          "Force majeure aplinkybės, pavyzdžiui, tiekimo sutrikimai, elektros gedimai ar streikai, gali paveikti terminus, už ką Rethread neatsako.",
        ],
      },
      {
        title: "7. Kokybės garantija ir skundai",
        paragraphs: [
          "Rethread suteikia 14 dienų garantiją atliktam taisymui nuo drabužių gavimo dienos.",
          "Jei Klientas pastebi defektą ar neatitikimą užsakymui, jis turi per 14 dienų nuo drabužių gavimo pranešti el. paštu business@rethread.lt.",
          "Rethread įvertins situaciją ir, jei trūkumas pagrįstas, atliks nemokamą pakartotinį taisymą arba pasiūlys kitą sprendimą.",
          "Garantija netaikoma, jei defektai atsirado dėl netinkamos priežiūros, skalbimo ar dėvėjimo.",
        ],
      },
      {
        title: "8. Kliento teisės ir pareigos",
        paragraphs: ["Klientas turi teisę ir įsipareigoja:"],
        items: [
          "gauti aiškią ir teisingą informaciją apie paslaugas, kainas ir sąlygas;",
          "reikalauti kokybiškai atliktų paslaugų;",
          "teikti pretenzijas ir gauti atsakymą per 14 kalendorinių dienų;",
          "pateikti tikslius duomenis apie drabužius ir pageidaujamą taisymą;",
          "apmokėti už paslaugas laiku;",
          "laikytis šių Taisyklių.",
        ],
      },
      {
        title: "9. Rethread teisės ir pareigos",
        paragraphs: ["Rethread įsipareigoja ir turi teisę:"],
        items: [
          "teikti paslaugas laikydamasi Lietuvos Respublikos įstatymų;",
          "užtikrinti Kliento duomenų konfidencialumą;",
          "informuoti apie užsakymo eigą ir galimus pakeitimus;",
          "laikinai stabdyti ar nutraukti paslaugų teikimą dėl techninių ar organizacinių priežasčių;",
          "atsisakyti atlikti taisymą, jei drabužiai netinkami paslaugai teikti.",
        ],
      },
      {
        title: "10. Atsakomybė",
        paragraphs: [
          "Rethread atsako tik už tiesioginius nuostolius, atsiradusius dėl savo kaltės.",
          "Maksimali atsakomybė negali viršyti užsakymo vertės.",
        ],
        items: [
          "Rethread neatsako už drabužių praradimą ar sugadinimą dėl siuntimo klaidų;",
          "Rethread neatsako už paliktus asmeninius daiktus drabužiuose ar siuntose;",
          "Rethread neatsako už netiesioginius nuostolius, pavyzdžiui, prarastą naudą ar emocinę žalą.",
        ],
      },
      {
        title: "11. Asmens duomenų apsauga",
        paragraphs: [
          "Kliento asmens duomenys tvarkomi pagal Bendrąjį duomenų apsaugos reglamentą (BDAR) ir galiojančius Lietuvos teisės aktus.",
          "Duomenys naudojami tik paslaugų vykdymui ir komunikacijai su Klientu.",
          "Išsami informacija pateikta Privatumo politikoje, su kuria Klientas turi susipažinti prieš pateikdamas užsakymą.",
        ],
      },
      {
        title: "12. Ginčų sprendimas",
        paragraphs: [
          "Visi ginčai tarp Kliento ir Rethread sprendžiami derybų būdu.",
          "Nepavykus susitarti, ginčai nagrinėjami Lietuvos Respublikos įstatymų nustatyta tvarka.",
        ],
      },
      {
        title: "13. Taisyklių galiojimas ir keitimas",
        paragraphs: [
          "Rethread pasilieka teisę bet kada keisti šias Taisykles, jas paskelbdama Svetainėje.",
          "Naujos Taisyklės įsigalioja nuo jų paskelbimo dienos ir taikomos tik naujiems užsakymams.",
          "Paskutinį kartą atnaujinta: 2025/10/23.",
        ],
      },
      {
        title: "14. Kontaktai",
        paragraphs: [
          "Pardavėjo rekvizitai: Rethread.",
          "Individualios veiklos vykdymo pažymos Nr. 1365573.",
          "Veiklos vykdytojas: Tadas Baltrūnas.",
          "El. paštas: business@rethread.lt.",
          "Tel.: +37062634234.",
        ],
      },
    ],
  },
  shipping: {
    title: "Siuntimas ir grąžinimas",
    lead: "Patogus drabužių siuntimo ir atsiėmimo procesas visoje Lietuvoje.",
    sections: [
      {
        paragraphs: [
          "Siūlome patogų drabužių siuntimo ir atsiėmimo procesą visoje Lietuvoje.",
          "Mūsų tikslas - kad drabužių taisymas internetu būtų toks pat paprastas, kaip ir įsigijimas.",
        ],
      },
      {
        title: "1. Siuntimas į mūsų dirbtuves",
        paragraphs: [
          "Per kurjerį ar paštomatą: užpildykite užsakymo formą mūsų svetainėje, supakuokite drabužius ir pristatykite juos pasirinktu būdu: DPD, Omniva ar LP Express paštomatu arba kurjeriu.",
          "Siuntos paruošimas: įsitikinkite, kad drabužiai yra švarūs, tvarkingai supakuoti ir aiškiai nurodytas užsakymo numeris arba jūsų kontaktai.",
        ],
      },
      {
        title: "2. Taisymo trukmė",
        items: [
          "įprastai drabužių taisymas trunka 3–7 darbo dienas nuo jų gavimo;",
          "sudėtingesniems užsakymams gali prireikti daugiau laiko - apie tai informuosime iš anksto.",
        ],
      },
      {
        title: "3. Grąžinimas po taisymo",
        items: [
          "atlikus taisymą, drabužiai grąžinami tuo pačiu būdu, kuriuo buvo atsiųsti - per paštomatą arba kurjerį;",
          "pristatymas atgal įprastai trunka 1–3 darbo dienas;",
          "apie siuntos išsiuntimą informuojame el. paštu arba SMS žinute.",
        ],
      },
      {
        title: "Grąžinimai ir pakartotinis taisymas",
        paragraphs: ["Mums svarbu, kad liktumėte patenkinti mūsų darbu."],
      },
      {
        title: "1. Kokybės garantija",
        items: [
          "jei po taisymo pastebėjote defektą ar neatitikimą užsakymui, per 14 dienų nuo siuntos gavimo susisiekite su mumis;",
          "įvertinę situaciją, pasiūlysime nemokamą pakartotinį taisymą arba kitą sprendimą.",
        ],
      },
      {
        title: "2. Grąžinimo procesas",
        items: [
          "susisiekite su mumis el. paštu arba per svetainės kontaktų formą, nurodydami užsakymo numerį ir problemos aprašymą;",
          "gavus patvirtinimą, atsiųsime tolimesnes pakartotinio taisymo ar grąžinimo instrukcijas.",
        ],
      },
      {
        title: "3. Nepriimamos grąžinimo situacijos",
        items: [
          "drabužiai buvo pažeisti po taisymo dėl netinkamo dėvėjimo ar skalbimo;",
          "praėjo daugiau nei 14 dienų nuo siuntos gavimo dienos.",
        ],
      },
      {
        title: "Papildoma informacija",
        items: [
          "siuntimo išlaidos į dirbtuves yra kliento atsakomybė, nebent taikoma speciali akcija;",
          "pakartotinio taisymo ar grąžinimo siuntimo sąlygos patvirtinamos individualiai pagal situaciją;",
          "visos siuntos yra sekamos - užtikriname saugų drabužių pristatymą;",
          "išsamią informaciją apie pristatymą, grąžinimą ir paslaugų teikimą rasite skiltyje „Paslaugų teikimo sąlygos“.",
        ],
      },
    ],
  },
  guarantee: {
    title: "14 dienų taisymo garantija",
    lead: "Ką darome, jei taisymas neatitiko sutarto rezultato.",
    sections: [
      {
        paragraphs: [
          "Rethread suteikia 14 dienų garantiją atliktam taisymo darbui nuo drabužio gavimo dienos.",
          "Jei pastebite, kad taisymas neatitiko patvirtintos užklausos arba defektas pasikartojo dėl mūsų atlikto darbo, susisiekite el. paštu business@rethread.lt ir pridėkite nuotrauką.",
        ],
      },
      {
        title: "Kada taikoma garantija",
        items: [
          "kai taisymo vieta neatitinka patvirtintos užklausos;",
          "kai per 14 dienų išryškėja mūsų atlikto taisymo defektas;",
          "kai drabužis buvo prižiūrimas pagal įprastas audinio priežiūros rekomendacijas.",
        ],
      },
      {
        title: "Kada garantija netaikoma",
        items: [
          "jei drabužis po taisymo buvo pažeistas dėl netinkamo dėvėjimo, skalbimo ar džiovinimo;",
          "jei atsirado naujas defektas kitoje drabužio vietoje;",
          "jei audinys buvo per daug susidėvėjęs, suplonėjęs ar pažeistas ir apie riziką buvote informuoti prieš taisymą;",
          "jei praėjo daugiau nei 14 dienų nuo drabužio gavimo.",
        ],
      },
      {
        title: "Sprendimas",
        paragraphs: [
          "Įvertinę situaciją pasiūlysime nemokamą pakartotinį taisymą arba kitą sąžiningą sprendimą. Jei taisymas negali būti atliktas saugiai ar tvarkingai, apie tai informuosime prieš tęsdami darbą.",
        ],
      },
    ],
  },
};

export function renderLegal(kind: LegalKind, _ctx: RouteContext): HTMLElement {
  const c = CONTENT[kind];
  return h(
    "div.page",
    {},
    h("section.panel.panel--raw", {},
      h("div.shell-narrow", {},
        pageHead({ eyebrow: "Teisinė informacija", title: c.title, lead: c.lead }),
        h("div.prose", { "data-reveal": true }, ...c.sections.map(renderSection)),
      ),
    ),
  );
}

function renderSection(section: LegalSection): HTMLElement {
  return h(
    "section.prose__section",
    {},
    section.title ? h("h2", {}, section.title) : null,
    ...(section.paragraphs ?? []).map((p) => h("p", {}, p)),
    section.items ? h("ul", {}, ...section.items.map((item) => h("li", {}, item))) : null,
  );
}
