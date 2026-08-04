// date-fns mit deutscher Locale als Voreinstellung (M2-Fundament, 2026-08-04).
// Einmal importieren (Root-Layout serverseitig, QueryProvider clientseitig);
// danach geben format(), formatDistance() usw. Deutsch aus, sofern keine
// Locale explizit übergeben wird. Anzeige-Zeitzone bleibt Sache der Aufrufer
// (Konvention §7: UTC speichern, lokal anzeigen).
import { setDefaultOptions } from 'date-fns'
import { de } from 'date-fns/locale'

setDefaultOptions({ locale: de })

export { de as defaultLocale }
