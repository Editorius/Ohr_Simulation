# Eingangskalibrierung und stabile lineare Referenz – 0.10.0

06.10.2026. Umsetzung auf Grundlage der Amplitudenprüfung. Kein virtueller Auslauf; 600 BM-Abschnitte auf 33,5 mm bleiben erhalten.

## In der App umgesetzt

- Schalldruckpegel 20–80 dB SPL am Trommelfell; Default/Reset 40 dB, 1 kHz, passiv.
- Frequenzabhängige Steigbügel-Scheitelamplitude aus menschlicher Messkurve. Anzeige mit drei signifikanten Stellen, je nach Größe pm/nm/µm; das ist eine Anzeigeauflösung, keine individuelle Genauigkeitszusage.
- Alternative direkte mechanische Anregung 1 pm bis 100 nm, logarithmischer Regler. Die Endpunkte sind ein gewählter Experimentierbereich, kein gemessener physiologischer Normbereich.
- Messkurve endet bei 10.998,047 Hz. Oberhalb erfolgt sichtbar der Wechsel zu direkter Anregung, ausgehend von der zuletzt angezeigten Steigbügelamplitude (auf den direkten Regler gerundet). Keine verdeckte Extrapolation. Das Cochleamodell bleibt bis 20 kHz zugänglich. Nach Rückkehr in den Messbereich lässt sich der Schalldruckmodus wieder auswählen.
- Projizierte Quellfläche 2,86 mm² statt historischer 12,566 mm². Die gespeicherten mechanischen Matrizen einschließlich Original-Quellvektor bleiben erhalten; der Solver skaliert den Quellvektor ausdrücklich mit dem Flächenverhältnis. Die historische Fläche ist für Referenztests weiterhin als Solverparameter möglich, aber nicht in der Schuloberfläche auswählbar.
- Aktive Rückkopplung λ=0,80 statt 1,12. λ=0,80 wurde am 600er-Gitter neu im Zustandsraum geprüft: kein instabiler Pol, größter Realteil −0,983917/s. λ=0,90 war ebenfalls stabil (−0,500743/s), wurde wegen des geringeren Stabilitätsabstands nicht gewählt. Ein negativer Polrealteil belegt die Stabilität dieses linearen Modells, nicht dessen physiologische Genauigkeit.
- „Aktive Amplitude“ 30–100 % bleibt eine ausdrücklich didaktische Ausgangsskalierung bei konstantem Peakort und gleicher Steigbügelquelle. Die Achse wird aus der vollen aktiven Antwort bei der aktuellen Anregung bestimmt und bleibt beim Prozentregler unverändert. Bei Änderung des Eingangspegels wird die Skala automatisch angepasst; die physische Änderung ist dann an Achse und Absolutwerten abzulesen.
- Gut lesbare Achsenschritte, gemeinsame Einheiten und Skala für beide Kurven. Ausklappbare passive Detailansicht mit eigener absoluter Achse. Keine versteckte unabhängige Normierung. Fenster und Strömungspfeile bleiben schematisch vergrößert, mit gegensätzlicher Bewegungsrichtung und Geschwindigkeitsphase der Pfeile.

## Messdaten und deren Grenzen

Die neue Kurve verwendet ausschließlich die 144 Zeilen `Group=Human`, `Ossicle=Stapes`, Präparate TB18/TB19/TB20 aus [O’Connell-Rodwell et al. 2024, S2 Data](https://doi.org/10.1371/journal.pone.0298535.s009). Der [Artikel](https://doi.org/10.1371/journal.pone.0298535) behandelt auch Elefanten; deren Daten werden **nicht** verwendet. In Fig. 3/4 sind die menschlichen Kolbenrichtungs-Geschwindigkeiten auf den Gehörgangsdruck nahe dem Trommelfell bezogen. Einheit der CSV-Beträge: mm/s/Pa; Phase: Perioden. Lizenz CC BY 4.0, Quelle und SHA-256 im exportierten Datensatz hinterlegt.

Je 48 gemeinsame Frequenzen. Eigene Aggregation: geometrischer Mittelwert der Beträge, arithmetischer Mittelwert entfalteter Phasen, gleiche Gewichtung je Präparat. Logarithmische Interpolation von Betrag/Frequenz, lineare Interpolation der entfalteten Phase über log(f). Die Kurve ist eine Referenz aus drei Präparaten, keine umfassende menschliche Normkurve. Min/max der Einzelpräparate sind ebenfalls gespeichert, nicht als Konfidenzintervall ausgegeben.

`p_RMS = 20 µPa · 10^(L/20)`; `p_peak = sqrt(2) · p_RMS`; `x_Stapes,peak = |H_vp| · p_peak / (2πf)`.

Die Phase der Steigbügelantwort relativ zum Druck wird als `arg(H_vp) − π/2` bereitgestellt. Die App-Zeitanimation behält als Nullreferenz die Steigbügelauslenkung; sie zeigt noch keinen separaten Druckverlauf. Die Mittelohrübertragung ist eine gemessene Einwegkopplung mit der Last der Präparate, noch kein rückgekoppelter Mittelohr-Rechenkern.

Die neue Stichprobe ist nicht auf den früheren 1-kHz-Anker von Aibara künstlich normiert. Sie ergibt bei 1 kHz/60 dB SPL etwa 0,573 nm Steigbügelamplitude, gegenüber rund 1,49 nm aus Aibaras Mittelwert. Unterschiedliche Messreihen werden nicht stillschweigend gleichgesetzt.

Quellfläche nach [Sim et al. 2013, Tabelle 2](https://pmc.ncbi.nlm.nih.gov/articles/PMC3660917/), projizierte menschliche Fußplattenfläche. Die Änderung ersetzt eine historische Modellannahme; sie ist keine pauschale Korrektur aller Cochlea-Parameter.

## Beispielwerte des neuen Modells

Bei 60 dB SPL, aktive Amplitude 100 %. BM-Werte sind berechnete **lineare Modellantworten**, nicht gemessene menschliche BM-Amplituden:

| Frequenz | Steigbügel | BM passiv | BM aktiv |
|---:|---:|---:|---:|
| 100 Hz | 0,634 nm | 7,23 nm | 25,85 nm |
| 1000 Hz | 0,573 nm | 12,47 nm | 38,70 nm |
| 5000 Hz | 0,0315 nm | 1,03 nm | 2,92 nm |

Die aktive Verstärkung ist schwächer als in der alten instabilen Rechnung. Die neue Peakform kann sich daher ändern. Der Prozentregler selbst verändert weiterhin nur die Höhe.

## Noch nicht umgesetzt / nicht behauptet

Die gewählte Umsetzung ist zunächst die im Prüfbericht vorgesehene **stabile lineare Referenz**. Eine pegelabhängige nichtlineare Rückkopplung oder Sättigung ist nicht enthalten. Insbesondere die aktive Antwort bei mittleren und hohen Pegeln ist nicht physiologisch validiert; dies steht sichtbar in Kachel 2. Der Bereich 20–80 dB ist ein Untersuchungsbereich, keine Gültigkeitszusage des linearen aktiven Modells.

Ein quantitativer passiver BM-Abgleich mit menschlichen Messkurven steht noch aus. Ebenso fehlen eine menschliche Eingangskalibrierung oberhalb 11 kHz und eine mechanische Rückkopplung zum späteren Mittelohrmodul. Stenfelt 2003 ist als passive Vergleichsquelle identifiziert, aber noch nicht als Datensatz ausgewertet. Es wurde kein Amplitudenlimit eingeführt, das diese offenen Punkte verdeckt.

## Prüfung und Wiederherstellung

13 gezielte Tests bestanden: 18 historische komplexe Referenzfälle mit expliziter historischer Quellfläche; 14 neue Python/JavaScript-Vergleiche mit physischer Quellfläche und stabiler Rückkopplung; tatsächlicher Worker und Fallback; Quellen-/Einheitenkonsistenz; unveränderte Kernmatrizen; Reglerhöhe monoton von 30–100 %; passive Antwort unverändert; Reset und Wechsel oberhalb des Messbereichs.

Browserprüfung: aktive/passive Ansicht und passive Detailansicht sichtbar, Prozentuntergrenze bedienbar, keine erfassten Browserwarnungen oder -fehler. Screenshot: `research/absolute-amplitudes-2026-10-06/app-0.10.0.jpg`. Der 20-kHz-Übergang ist durch den Controller-Test geprüft; keine zusätzliche visuelle Abnahme dieses Übergangs behauptet. Keine Prüfung der realen Wiedergabelautstärke.

Vorstand: `_Backups/vor-kalibrierung-0.9.3/`. Neue Sicherung: `_Backups/kalibrierung-0.10.0/` mit SHA-256-Manifest. Altes MATLAB-Modell und frühere Referenzen bleiben erhalten. `reference/export_human_input.py` reproduziert den menschlichen Kurvenexport und neue Antwortfixtures; die Stabilitätsergebnisse liegen separat im Forschungsordner. `reference/export_central_b.py` berücksichtigt die neue geprüfte Aktivitätsstufe bei künftiger Regeneration.

Nächster fachlicher Schritt: menschliche passive BM-Referenzkurven quantitativ abgleichen, anschließend eine begründete nichtlineare aktive Rückkopplung separat aufbauen und prüfen. Die nun stabile lineare Version dient dafür als Vergleichsbasis.
