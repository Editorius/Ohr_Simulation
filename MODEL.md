# Aktueller Modellvertrag

Stand: App 0.11.0; Dokumentation vom 07.10.2026. Beschreibt die implementierte Näherung, keine vollständige physiologische Validierung. Historische Berichte können frühere Einstellungen beschreiben.

## Mechanischer Kern

Menschliche Cochlea, korrigiertes historisches Modell nach der lokalen MATLAB-Vorlage von Nobili/Mammano (Revision 1997). 600 ungleich lange Abschnitte auf 33,5 mm, kein virtueller Auslauf. Die eingebetteten Matrizen enthalten Flüssigkeitskopplung, Masse, Steifigkeit und Dämpfung einschließlich Scherkopplung. Aktive Rückwirkung nutzt einen TM-Resonanzansatz. Das ist keine vollständige Umsetzung aller Modelle von Elliott und Ni.

Für jede einzelne Frequenz wird eine komplexe stationäre harmonische Antwort gelöst, kein Einschwingvorgang. In Matrixform gilt:

    [K - omega² M + i omega C + D_aktiv(omega)] q = omega² s

Die Quellskalierung berücksichtigt die projizierte Steigbügelfläche 2,86 mm². Der rohe Solver liefert das Verhältnis BM/Steigbügel. response-view.js multipliziert es mit der Steigbügel-Scheitelamplitude in Metern. Die gespeicherten historischen Matrizen verwenden die Normierung des ursprünglichen Modells; sie dürfen nicht ohne Einheitenherleitung als vollständig SI-normierte Matrizen interpretiert werden.

Der apikale Abschluss steckt in den propagatorbasierten Matrizen; der untere Helicotrema-Beitrag wurde gegenüber der historischen Vorlage korrigiert. Es wird weder ein Nullstrom am Apex erzwungen noch die Strömung hinter dem BM-Maximum künstlich abgeschnitten.

## Anregung und Aktivität

- Frequenz: 50–20000 Hz, Start 1000 Hz.
- Direkte Steigbügel-Scheitelamplitude: 1 pm–100 nm, Start/Reset 10 nm. Der Eingaberegler ist logarithmisch verteilt.
- Passiv: Aktivitätsparameter 0. Aktive UI-Rechnung: 0,80; für diese eingebetteten Matrizen als dynamisch stabil geprüft.
- „Aktive Amplitude“: 30–100 % der bereits berechneten komplexen aktiven Antwort. Das verändert deren Höhe, nicht den Rückkopplungsparameter, die Phase oder die Peakposition. Die Steigbügelamplitude bleibt dabei gleich.
- Diese Prozentfunktion ist eine didaktische Bearbeitung und kein physiologisches Hörschadensmodell. Für fachliche Aktivvergleiche 100 % verwenden.
- Historische Testfälle dürfen andere Aktivitätswerte einschließlich instabiler Einstellungen enthalten. Sie sind keine freigegebenen UI-Betriebsarten.

## Phase und Strömung

Zeitkonvention: Re(q exp(i omega t)). Positive BM-Auslenkung zeigt in Richtung Scala vestibuli. Die positive Längsrichtung beider Scalen ist Basis → Apex.

Aus der inkompressiblen Volumenbilanz wird an den Zellgrenzen rekonstruiert:

    Q_SV(x_j) = i omega [A_s y_s + Summe_i<=j (b_eff,i Delta x_i q_i)]
    Q_ST(x_j) = -Q_SV(x_j)
    v_SV = Q_SV / A_SV; v_ST = Q_ST / A_ST

Effektive BM-Breite: halbe geometrische Breite der historischen Vorlage. Scalenquerschnitte: Halbkreise aus den gemittelten Radien benachbarter Original-Messstellen. Die Geometrie verwendet dieselben 600 Zellgrenzen wie der mechanische Kern. fluid-view.js liefert querschnittsgemittelte Geschwindigkeiten, keine räumlichen Wirbel- oder Nahfelder.

17 Pfeilorte je Scala zeigen den zeitlichen Momentanwert aus räumlich interpolierter komplexer Geschwindigkeit. Länge proportional zum Betrag, Orientierung nach Vorzeichen; stationäre Pfeilorte, keine Teilchenbahnen. Beide Scalen teilen einen Vergrößerungsmaßstab aus voller aktiver und passiver Antwort. Bei Modus-/Prozentwechsel sowie innerhalb der Periode bleibt er fest. Sehr kleine Pfeile unter 0,08 SVG-Einheiten werden nicht gezeichnet.

Die Rekonstruktion bei reduzierter aktiver Amplitude erfüllt die Volumenbilanz der bearbeiteten BM-Bewegung, aber nicht zwingend die ursprüngliche mechanische Impulsbilanz. Die Fensteranimation bleibt schematisch vergrößert.

## Verbindliche Darstellungsregeln

- Globales Hüllkurvendiagramm: fest linear 1 pm–16 µm; keine automatische Neuskalierung.
- Momentanwelle: fest linear ±16 µm. Nur die gewählte aktive oder passive Welle wird dunkelgrau durchgezogen gezeigt.
- Maximum-Säulen: eigene gemeinsame lineare Skala. Passiv immer, Aktiv zusätzlich im aktiven Modus. Anpassung an Frequenz/Anregung, nicht an Betriebsart oder aktiven Prozentwert.
- Clipping verändert keine Rechenwerte. Numerische Maximalwerte bleiben verfügbar.
- Peakposition ist ein Knotenmaximum. Zwei Nachkommastellen garantieren weder entsprechende Ortsgenauigkeit noch einen nachgewiesenen menschlichen Hörort.

## Grenzen und Prüfung

Keine pegelabhängige Kompression, keine vollständige Corti-Organ-Geometrie, keine separate Scala media und keine unabhängige Validierung menschlicher BM-Absolutamplituden. Randbereiche und konkurrierende Maxima bleiben prüfbedürftig. Audio ist nicht auf Schalldruck kalibriert.

Die derzeit 17 Tests prüfen komplexe Referenzlösungen, Matrix-Baseline, Worker/Fallback, Bedienlogik, Skalen, Volumenbilanz und Phasenumkehr. Erfolgreiche Regression ist keine physiologische Validierung. Für UI-Änderungen bleibt eine separate Browserprüfung nötig.

## Herkunft und Zuständigkeit

cochlea-model.js/numerics.js: Solver; cochlea-data.js: eingebettete Mechanik; response-view.js: physikalische Antwortskalierung und Anzeigebereiche; fluid-geometry.js/fluid-view.js: Geometrie und Strömung; app.js: Verknüpfung und Animation.

Quellen und Rechte: THIRD_PARTY_NOTICES.md. Fachliche Details: STROEMUNGSANZEIGE_0.11.0.md und KALIBRIERUNG_0.10.0.md (historischer Kalibrierungsschritt). Die aktuelle Erzeugungskette liegt unter scripts/ und data/. python scripts/reproduce.py vergleicht neu berechnete Arrays, Geometrie, Messdaten und 32 komplexe Referenzantworten. --stability berechnet zusätzlich die Eigenwerte. Details und Toleranzen: scripts/README.md.
