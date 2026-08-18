// `/v2/coach` selbst hat keine Ansicht — der Menuepunkt fuehrt zwei
// Unterbereiche, und einer davon muss der erste sein.
//
// `[cmd]` `app.jsx:126` der Vorlage macht es genauso:
//     case "coach": case "coach-human": return <CoachModule />;
// Beide Faelle zeigen auf denselben Rahmen. `coach` ohne Zusatz ist
// dort ein Synonym fuer `coach-human`, keine eigene Ansicht.
//
// `[read]` Tom: „Zwei Subnav, weil die optional verfuegbar sein
// werden." Wenn Human Coaches spaeter abbestellbar ist, wird aus
// dieser Weiterleitung eine Entscheidung — dann steht hier, welcher
// Unterbereich gebucht ist. Bis dahin ist es die Vorlage 1:1.
import { redirect } from 'next/navigation'

export default function V2CoachPage() {
  redirect('/v2/coach/human')
}
