/* Legal pages — lightweight placeholders the owner replaces with real policy
   text before launch. Kept minimal and honest about that. */
import { h } from "../lib/dom";
import type { RouteContext } from "../router";
import { pageHead } from "./_helpers";

type LegalKind = "privacy" | "terms" | "shipping";

const CONTENT: Record<LegalKind, { title: string; lead: string; body: string[] }> = {
  privacy: {
    title: "Privatumo politika",
    lead: "Kaip tvarkome jūsų asmens duomenis.",
    body: [
      "Renkame tik tuos duomenis, kurių reikia užsakymui įvykdyti: vardą, el. paštą, telefoną ir informaciją apie drabužį.",
      "Duomenų neperduodame tretiesiems asmenims, išskyrus siuntų tiekėjus ir mokėjimų partnerius, kiek to reikia paslaugai suteikti.",
      "Turite teisę susipažinti su savo duomenimis, juos ištaisyti ar ištrinti — parašykite labas@rethread.lt.",
      "Ši politika yra pavyzdinė ir turi būti papildyta galutiniu teisiniu tekstu prieš paleidžiant svetainę.",
    ],
  },
  terms: {
    title: "Paslaugų teikimo sąlygos",
    lead: "Bendrosios taisymo paslaugų sąlygos.",
    body: [
      "Preliminari kaina skaičiuoklėje yra orientacinė. Galutinę kainą patvirtiname apžiūrėję drabužį ir tik su jūsų sutikimu.",
      "Taisymo terminas — įprastai 3–7 darbo dienos nuo drabužio gavimo.",
      "Suteikiame 14 dienų garantiją atliktam darbui.",
      "Šios sąlygos yra pavyzdinės ir turi būti papildytos galutiniu teisiniu tekstu prieš paleidžiant svetainę.",
    ],
  },
  shipping: {
    title: "Siuntimas ir grąžinimas",
    lead: "Kaip drabužis keliauja pas mus ir atgal.",
    body: [
      "Dirbame su paštomatais ir kurjeriais visoje Lietuvoje.",
      "Pateikus užklausą, atsiųsime tikslų adresą ir siuntimo instrukcijas el. paštu.",
      "Rekomenduojame drabužį išskalbti prieš siunčiant.",
      "Grąžinimo būdą ir kainą suderiname patvirtinime.",
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
        h("div.prose", { "data-reveal": true }, ...c.body.map((p) => h("p", {}, p))),
      ),
    ),
  );
}
