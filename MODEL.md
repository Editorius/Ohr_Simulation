# Aktueller Modellvertrag

Stand: App 0.11.2; Dokumentation vom 07.10.2026. Beschreibt die implementierte NÃ¤herung, keine vollstÃ¤ndige physiologische Validierung. Historische Berichte kÃ¶nnen frÃ¼here Einstellungen beschreiben.

## Mechanischer Kern

Menschliche Cochlea, korrigiertes historisches Modell nach der lokalen MATLAB-Vorlage von Nobili/Mammano (Revision 1997). 600 ungleich lange Abschnitte auf 33,5 mm, kein virtueller Auslauf. Die eingebetteten Matrizen enthalten FlÃ¼ssigkeitskopplung, Masse, Steifigkeit und DÃ¤mpfung einschlieÃŸlich Scherkopplung. Aktive RÃ¼ckwirkung nutzt einen TM-Resonanzansatz. Das ist keine vollstÃ¤ndige Umsetzung aller Modelle von Elliott und Ni.

FÃ¼r jede einzelne Frequenz wird eine komplexe stationÃ¤re harmonische Antwort gelÃ¶st, kein Einschwingvorgang. In Matrixform gilt:

    [K - omegaÂ² M + i omega C + D_aktiv(omega)] q = omegaÂ² s

Die Quellskalierung berÃ¼cksichtigt die projizierte SteigbÃ¼gelflÃ¤che 2,86 mmÂ². Der rohe Solver liefert das VerhÃ¤ltnis BM/SteigbÃ¼gel. response-view.js multipliziert es mit der SteigbÃ¼gel-Scheitelamplitude in Metern. Die gespeicherten historischen Matrizen verwenden die Normierung des ursprÃ¼nglichen Modells; sie dÃ¼rfen nicht ohne Einheitenherleitung als vollstÃ¤ndig SI-normierte Matrizen interpretiert werden.

Der apikale Abschluss steckt in den propagatorbasierten Matrizen; der untere Helicotrema-Beitrag wurde gegenÃ¼ber der historischen Vorlage korrigiert. Es wird weder ein Nullstrom am Apex erzwungen noch die StrÃ¶mung hinter dem BM-Maximum kÃ¼nstlich abgeschnitten.

## Anregung und AktivitÃ¤t

- Frequenz: 50â€“20000 Hz, Start 1000 Hz.
- Direkte SteigbÃ¼gel-Scheitelamplitude: 1 pmâ€“100 nm, Start/Reset 10 nm. Der Eingaberegler ist logarithmisch verteilt.
- Passiv: AktivitÃ¤tsparameter 0. Aktive UI-Rechnung: 0,80; fÃ¼r diese eingebetteten Matrizen als dynamisch stabil geprÃ¼ft.
- â€žAktive Amplitudeâ€œ: 30â€“100 % der bereits berechneten komplexen aktiven Antwort. Das verÃ¤ndert deren HÃ¶he, nicht den RÃ¼ckkopplungsparameter, die Phase oder die Peakposition. Die SteigbÃ¼gelamplitude bleibt dabei gleich.
- Diese Prozentfunktion ist eine didaktische Bearbeitung und kein physiologisches HÃ¶rschadensmodell. FÃ¼r fachliche Aktivvergleiche 100 % verwenden.
- Historische TestfÃ¤lle dÃ¼rfen andere AktivitÃ¤tswerte einschlieÃŸlich instabiler Einstellungen enthalten. Sie sind keine freigegebenen UI-Betriebsarten.

## Phase und StrÃ¶mung

Zeitkonvention: Re(q exp(i omega t)). Positive BM-Auslenkung zeigt in Richtung Scala vestibuli. Die positive LÃ¤ngsrichtung beider Scalen ist Basis â†’ Apex.

Aus der inkompressiblen Volumenbilanz wird an den Zellgrenzen rekonstruiert:

    Q_SV(x_j) = i omega [A_s y_s + Summe_i<=j (b_eff,i Delta x_i q_i)]
    Q_ST(x_j) = -Q_SV(x_j)
    v_SV = Q_SV / A_SV; v_ST = Q_ST / A_ST

Effektive BM-Breite: halbe geometrische Breite der historischen Vorlage. Scalenquerschnitte: Halbkreise aus den gemittelten Radien benachbarter Original-Messstellen. Die Geometrie verwendet dieselben 600 Zellgrenzen wie der mechanische Kern. fluid-view.js liefert querschnittsgemittelte Geschwindigkeiten, keine rÃ¤umlichen Wirbel- oder Nahfelder.

17 Pfeilorte je Scala zeigen den zeitlichen Momentanwert aus rÃ¤umlich interpolierter komplexer Geschwindigkeit. LÃ¤nge proportional zum Betrag, Orientierung nach Vorzeichen; stationÃ¤re Pfeilorte, keine Teilchenbahnen. Beide Scalen teilen einen VergrÃ¶ÃŸerungsmaÃŸstab aus voller aktiver und passiver Antwort. Bei Modus-/Prozentwechsel sowie innerhalb der Periode bleibt er fest. Sehr kleine Pfeile unter 0,08 SVG-Einheiten werden nicht gezeichnet.

Die Rekonstruktion bei reduzierter aktiver Amplitude erfÃ¼llt die Volumenbilanz der bearbeiteten BM-Bewegung, aber nicht zwingend die ursprÃ¼ngliche mechanische Impulsbilanz. Die Fensteranimation bleibt schematisch vergrÃ¶ÃŸert.

## Verbindliche Darstellungsregeln

- Globales HÃ¼llkurvendiagramm: fest linear 1 pmâ€“16 Âµm; keine automatische Neuskalierung.
- Momentanwelle: fest linear Â±16 Âµm. Nur die gewÃ¤hlte aktive oder passive Welle wird dunkelgrau durchgezogen gezeigt.
- Maximum-SÃ¤ulen: eigene gemeinsame lineare Skala. Passiv immer, Aktiv zusÃ¤tzlich im aktiven Modus. Anpassung an Frequenz/Anregung, nicht an Betriebsart oder aktiven Prozentwert.
- Clipping verÃ¤ndert keine Rechenwerte. Numerische Maximalwerte bleiben verfÃ¼gbar.
- Peakposition ist ein Knotenmaximum. Zwei Nachkommastellen garantieren weder entsprechende Ortsgenauigkeit noch einen nachgewiesenen menschlichen HÃ¶rort.

## Grenzen und PrÃ¼fung

Keine pegelabhÃ¤ngige Kompression, keine vollstÃ¤ndige Corti-Organ-Geometrie, keine separate Scala media und keine unabhÃ¤ngige Validierung menschlicher BM-Absolutamplituden. Randbereiche und konkurrierende Maxima bleiben prÃ¼fbedÃ¼rftig. Audio ist nicht auf Schalldruck kalibriert.

Die derzeit 17 Tests prÃ¼fen komplexe ReferenzlÃ¶sungen, Matrix-Baseline, Worker/Fallback, Bedienlogik, Skalen, Volumenbilanz und Phasenumkehr. Erfolgreiche Regression ist keine physiologische Validierung. FÃ¼r UI-Ã„nderungen bleibt eine separate BrowserprÃ¼fung nÃ¶tig.

## Herkunft und ZustÃ¤ndigkeit

cochlea-model.js/numerics.js: Solver; cochlea-data.js: eingebettete Mechanik; response-view.js: physikalische Antwortskalierung und Anzeigebereiche; fluid-geometry.js/fluid-view.js: Geometrie und StrÃ¶mung; app.js: VerknÃ¼pfung und Animation.

Quellen und Rechte: THIRD_PARTY_NOTICES.md. Fachliche Details: STROEMUNGSANZEIGE_0.11.0.md und KALIBRIERUNG_0.10.0.md (historischer Kalibrierungsschritt). Die aktuelle Erzeugungskette liegt unter scripts/ und data/. python scripts/reproduce.py vergleicht neu berechnete Arrays, Geometrie, Messdaten und 32 komplexe Referenzantworten. --stability berechnet zusÃ¤tzlich die Eigenwerte. Details und Toleranzen: scripts/README.md.

## Cochlea-Kontur und Animation (0.11.2)

Die AuÃŸenkontur ist die freigegebene SVG-Gestaltung mit ausgeprÃ¤gter basaler Erweiterung und VerjÃ¼ngung zum Apex. Sie ist bewusst schematisch und in der HÃ¶he Ã¼berhÃ¶ht: Die grafischen BÃ©zierkurven in cochlea-contour.js sind keine aus Messdaten rekonstruierte Kanalgeometrie. Sie ersetzen die frÃ¼here, optisch zu gleichfÃ¶rmige Kontur aus effektiven Scalenradien. Der Rechenkern verwendet weiterhin ausschlieÃŸlich seine unverÃ¤nderten Geometriedaten und Matrizen.

Die BM liegt auf einer geraden Ortsachse (0â€“33,5 mm). Ihre Auslenkung wird weiterhin Ã¼berall mit demselben festen MaÃŸstab Â±16 Âµm auf Â±34 SVG-Einheiten abgebildet. Es gibt keine Ã¶rtliche Anpassung der Amplitude an die KanalhÃ¶he. Welle, HÃ¼llkurven und Markierungen sind auf diesen Auslenkungsbereich begrenzt. Die Kammern bleiben im gesamten BM-Bereich breiter als dieser Zeichenbereich. Zwischen BM-Ende und apikaler AuÃŸenwand bleibt die schematische Verbindung frei.

SteigbÃ¼gel einschlieÃŸlich FuÃŸplatte sowie rundes Fenster sind eigene SVG-Gruppen. Ihr schematisch vergrÃ¶ÃŸerter Hub betrÃ¤gt Â±6 SVG-Einheiten mit gegenlÃ¤ufigem cos(omega t). Flexible Verbindungslinien halten den Anschluss an die feste AuÃŸenwand. Die sichtbaren HÃ¼be sind weder absolute SteigbÃ¼gelwerte noch eine aus FensterflÃ¤chen bestimmte Volumenbilanz. Die StrÃ¶mungsrechnung verwendet unverÃ¤ndert die eingestellte reale SteigbÃ¼gelamplitude; an der Basis ist ihre Geschwindigkeit gegenÃ¼ber der Auslenkung um eine Viertelperiode verschoben.

Die 17 Pfeilpositionen pro Scala liegen auÃŸerhalb der Kontur und bleiben zeitlich fest. Die horizontale PfeillÃ¤nge (maximal 44 SVG-Einheiten), Richtung und Phase stammen aus der komplexen lokalen mittleren Geschwindigkeit in fluid-view.js. Der gemeinsame Referenzbetrag ist innerhalb einer Periode und bei Passiv/Aktiv sowie aktiver Amplitude unverÃ¤ndert. Kleine Momentanwerte dÃ¼rfen verschwinden; die Pfeile sind keine Teilchenbahnen. Die schematische Kontur wird niemals zur Neuberechnung der StrÃ¶mung verwendet.

## Unterrichtsansicht
Die OberflÃ¤che zeigt keine Greenwood-Referenzlinie, kein Phasendiagramm und keine technische PrÃ¼ftabelle mehr. Diese Vereinfachung entfernt ausschlieÃŸlich Darstellungsfunktionen; komplexe Antworten und Phasen bleiben fÃ¼r die Wanderwelle und StrÃ¶mungsrechnung erhalten. Der Zeitregler zeigt den aktuellen Zeitpunkt in ms bzw. Âµs, am rechten Ende die Periodendauer. Seine interne Einteilung bleibt 0â€“360; ein Einzelschritt entspricht 1/24 Periode. Die Zeitlupe steuert ausschlieÃŸlich die Abspieldauer. Die Skalen und Einheiten der beiden Auslenkungsanzeigen bleiben unverÃ¤ndert.
