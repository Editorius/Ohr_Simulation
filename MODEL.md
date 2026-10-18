# Aktueller Modellvertrag

Stand: App 0.12.0; Dokumentation vom 11.10.2026. Beschreibt die implementierte Näherung, keine vollständige physiologische Validierung. Historische Berichte können frühere Einstellungen beschreiben.

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

- Globales Hüllkurvendiagramm: linear 1 pm–8 µm in Passiv, 1 pm–18 µm in Aktiv; beim Moduswechsel ändert sich der gemeinsame Maßstab beider Kurven. Innerhalb eines Modus keine automatische Neuskalierung.
- Momentanwelle: fest linear ±16 µm. Nur die gewählte aktive oder passive Welle wird dunkelgrau durchgezogen gezeigt.
- Maximum-Säulen: eigene gemeinsame lineare Skala. Passiv immer, Aktiv zusätzlich im aktiven Modus. Anpassung an Frequenz/Anregung, nicht an Betriebsart oder aktiven Prozentwert.
- Clipping verändert keine Rechenwerte. Numerische Maximalwerte bleiben verfügbar.
- Peakposition ist ein Knotenmaximum. Zwei Nachkommastellen garantieren weder entsprechende Ortsgenauigkeit noch einen nachgewiesenen menschlichen Hörort.

## Grenzen und Prüfung

Keine pegelabhängige Kompression, keine vollständige Corti-Organ-Geometrie, keine separate Scala media und keine unabhängige Validierung menschlicher BM-Absolutamplituden. Randbereiche und konkurrierende Maxima bleiben prüfbedürftig. Audio ist nicht auf Schalldruck kalibriert.

Die automatisierten Tests prüfen komplexe Referenzlösungen, Matrix-Baseline, Worker/Fallback, Bedienlogik, Skalen, Volumenbilanz und Phasenumkehr. Erfolgreiche Regression ist keine physiologische Validierung. Für UI-Änderungen bleibt eine separate Browserprüfung nötig.

## Herkunft und Zuständigkeit

cochlea-model.js/numerics.js: Solver; cochlea-data.js: eingebettete Mechanik; response-view.js: physikalische Antwortskalierung und Anzeigebereiche; fluid-geometry.js/fluid-view.js: Geometrie und Strömung; app.js: Verknüpfung und Animation.

Quellen und Rechte: THIRD_PARTY_NOTICES.md. Fachliche Details: STROEMUNGSANZEIGE_0.11.0.md und KALIBRIERUNG_0.10.0.md (historischer Kalibrierungsschritt). Die aktuelle Erzeugungskette liegt unter scripts/ und data/. python scripts/reproduce.py vergleicht neu berechnete Arrays, Geometrie, Messdaten und 32 komplexe Referenzantworten. --stability berechnet zusätzlich die Eigenwerte. Details und Toleranzen: scripts/README.md.

## Cochlea-Kontur und Animation (0.11.2)

Die Außenkontur ist die freigegebene SVG-Gestaltung mit ausgeprägter basaler Erweiterung und Verjüngung zum Apex. Sie ist bewusst schematisch und in der Höhe überhöht: Die grafischen Bézierkurven in cochlea-contour.js sind keine aus Messdaten rekonstruierte Kanalgeometrie. Sie ersetzen die frühere, optisch zu gleichförmige Kontur aus effektiven Scalenradien. Der Rechenkern verwendet weiterhin ausschließlich seine unveränderten Geometriedaten und Matrizen.

Die BM liegt auf einer geraden Ortsachse (0–33,5 mm). Ihre Auslenkung wird weiterhin überall mit demselben festen Maßstab ±16 µm auf ±34 SVG-Einheiten abgebildet. Es gibt keine örtliche Anpassung der Amplitude an die Kanalhöhe. Welle, Hüllkurven und Markierungen sind auf diesen Auslenkungsbereich begrenzt. Die Kammern bleiben im gesamten BM-Bereich breiter als dieser Zeichenbereich. Zwischen BM-Ende und apikaler Außenwand bleibt die schematische Verbindung frei.

Steigbügel einschließlich Fußplatte sowie rundes Fenster sind eigene SVG-Gruppen. Ihr schematisch vergrößerter Hub beträgt ±6 SVG-Einheiten mit gegenläufigem cos(omega t). Flexible Verbindungslinien halten den Anschluss an die feste Außenwand. Die sichtbaren Hübe sind weder absolute Steigbügelwerte noch eine aus Fensterflächen bestimmte Volumenbilanz. Die Strömungsrechnung verwendet unverändert die eingestellte reale Steigbügelamplitude; an der Basis ist ihre Geschwindigkeit gegenüber der Auslenkung um eine Viertelperiode verschoben.

Die 17 Pfeilpositionen pro Scala liegen außerhalb der Kontur und bleiben zeitlich fest. Die horizontale Pfeillänge (maximal 44 SVG-Einheiten), Richtung und Phase stammen aus der komplexen lokalen mittleren Geschwindigkeit in fluid-view.js. Der gemeinsame Referenzbetrag ist innerhalb einer Periode und bei Passiv/Aktiv sowie aktiver Amplitude unverändert. Kleine Momentanwerte dürfen verschwinden; die Pfeile sind keine Teilchenbahnen. Die schematische Kontur wird niemals zur Neuberechnung der Strömung verwendet.

## Unterrichtsansicht
Die Oberfläche zeigt keine Greenwood-Referenzlinie, kein Phasendiagramm und keine technische Prüftabelle mehr. Diese Vereinfachung entfernt ausschließlich Darstellungsfunktionen; komplexe Antworten und Phasen bleiben für die Wanderwelle und Strömungsrechnung erhalten. Der Zeitregler zeigt den aktuellen Zeitpunkt in ms bzw. µs, am rechten Ende die Periodendauer. Seine interne Einteilung bleibt 0–360; ein Einzelschritt entspricht 1/24 Periode. Die Zeitlupe steuert ausschließlich die Abspieldauer. Die Skalen und Einheiten der beiden Auslenkungsanzeigen bleiben unverändert.

Die schematische Kontur einschließlich Fenster und Steigbügel ist seit 0.11.5 vertikal um 10 % zur BM-Ruhelage komprimiert (y = 270 + 0,9 · (y_original − 270)). Strömungspfeile folgen der komprimierten Kontur. BM, Hüllkurven und Auslenkungsmaßstab werden nicht komprimiert; die Hüllkurven liegen marineblau hinter der Wanderwelle.

Die Wanderwellenlupe zeigt dieselben komplexen BM-Werte und dieselbe Phase im Bereich Peak ±3 mm, an den Modellgrenzen abgeschnitten. Ihre Höhe folgt der maximalen Hüllkurve im Ausschnitt mit 15 % Reserve und ist während der Periode konstant. Keine extrapolierten Werte, kein eigener Solver. Die Hauptanimation bleibt bei ±16 µm; die Lupe ist bewusst ohne numerische Skala und als vergrößert gekennzeichnet.

## Anatomische Orientierung (lokaler Integrationsstand)

Die 3D-Ansicht OpenEar Delta erhält ausschließlich `result.peakX * 1000` (Meter nach Millimeter) der gewählten passiven/aktiven Antwort. Keine neue Tonotopieformel, Peakverschiebung oder Änderung des Rechenkerns. Die anatomische Ortsreferenz 0–33,5 mm ist eine vorläufige Registrierung, keine am Präparat gemessene BM-Länge. Rot markiert Oberflächenquerschnitte beider Scalen; eine Basilarmembran ist im Datensatz nicht segmentiert. Der rote Bezugspunkt folgt kontinuierlich, die Konturen verwenden den nächsten vorberechneten Schnitt (etwa 0,335 mm, terminal 0,01 mm). Die Zeichnungsbreite ist didaktisch vergrößert. Ohne gültiges Maximum bleibt die Markierung aus.

Die iframe-Ansicht wird nach erfolgreicher Berechnung und Modus-/Anregungswechsel aktualisiert. Bei ausstehender oder ungültiger Rechnung bleibt wie in den bestehenden Diagrammen das letzte gültige Ergebnis sichtbar. Die Kamera bleibt bei solchen Wechseln erhalten. Nachrichten werden nur vom tatsächlich eingebetteten Fenster bzw. dessen Elternfenster angenommen; Positionen außerhalb 0–33,5 mm werden verworfen.


## Separates Unterrichtsmodell: einzelner Schwinger

`learning-model.js` berechnet einen lokalen erzwungenen Feder-Masse-Schwinger aus den linear interpolierten dimensionalen 1-mm-Profilen. f_b = sqrt(D_base/m_base)/(2π) ersetzt die Greenwood-Vorgabe. Vor dem ersten Knoten gilt dessen Wert. Es ist keine Eigenmode des flüssigkeitsgekoppelten Rechenkerns; der Cochlea-Solver bleibt unverändert.

Für relative Masse m_r und Steifigkeit D_r gilt f₀ = f_b √(D_r/m_r). Der Dämpfungsregler setzt das dimensionslose Dämpfungsmaß ζ (0,05 bis 0,8); bei Änderung von Masse/Steifigkeit bleibt ζ konstant, nicht der dimensionale Reibungskoeffizient. Die stationäre Antwort bei konstanter Kraftamplitude hat den relativen Betrag A = 1/[D_r √((1-r²)²+(2ζr)²)] mit r=f/f₀ und die Verzögerung atan2(2ζr,1-r²). Das folgt aus m y″ + b y′ + D y = F₀ cos(ωt). Die Normierung entspricht F₀/D_base; die Regler zeigen effektive Masse in µg und Steifigkeit in N/m; die Amplitude bleibt relativ zu F₀/D_base.

Das Amplitudenmaximum liegt bei f₀ √(1−2ζ²), sofern ζ<1/√2; sonst fällt die Kurve monoton ab f=0. Die Animation zeigt die stationäre Antwort, keine Einschwingvorgänge; 2 Bildschirmsekunden entsprechen einer Anregungsperiode. Plot und Bewegung sind relativ skaliert. Die Steigbügelamplitude und aktive Verstärkung beeinflussen dieses Lernmodell nicht. Ein Ortswechsel oder Frequenzwechsel erzeugt keinen Eingriff in den bestehenden Solver. Türkis markiert den Lernabschnitt, Rot weiterhin das Solvermaximum.

Die Ansicht „Modelldaten“ zeigt dimensionale Modellparameter bezogen auf eine einheitliche lokale Abschnittslänge von 1 mm. `learning-profiles.js` wird mit `python scripts/build_learning_profiles.py` erzeugt. Die ursprünglichen Dateien mass.m und twave.m dokumentieren kg/BETA bzw. kg/(BETA s²), BETA = 0,0335 m. Daher werden beide örtlichen Koeffizienten mit 0,001/0,0335 multipliziert: Ergebnis kg bzw. kg/s² = N/m. Masse in der Grafik: µg (kg × 10⁹). Dies ist die äquivalente lokale Masse/Steifigkeit für 1 mm, keine Integration über ein verschobenes 1-mm-Fenster und keine Masse einer ungleich langen Rechenzelle. Die Masse umfasst die effektive Cochlea-Partition einschließlich Corti-Organ, ohne die separate Flüssigkeitsmatrix. Die Steifigkeit verwendet den Solverwert 2000 an der Basis, nicht den abweichenden Wert 1675 aus phyplots.m. Quelle und Herleitung: data/LEARNING_PROFILE_UNITS.md. Die Erzeugung prüft M, k und x gegen die unveränderten Solver-Daten. Keine Rückwirkung auf Solver oder Lehrschwinger.

Die Regler bleiben intern logarithmische Faktoren, zeigen aber dimensionale Werte. Dynamische Grenzen halten die Eigenfrequenz bei 50–20.000 Hz und den jeweils anderen Parameter fest. Original-Ortsvorgaben außerhalb dieses Bereichs bleiben beim Reset unverändert und gekennzeichnet. Beim Wechsel zu Selbst untersuchen wird die Steifigkeit an die nächste Grenze angepasst. Die Amplitudenachse nutzt einen gemeinsamen Zehnerfaktor, die Frequenzachse runde Teilstriche und bei Bedarf kHz.
