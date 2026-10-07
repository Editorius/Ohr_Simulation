# Lokale Strömungsanzeige – 0.11.0

Die unveränderte komplexe BM-Lösung wird über die Volumenerhaltung in querschnittsgemittelte Längsgeschwindigkeiten übersetzt. SI-Einheiten, Zeitkonvention Re(q exp(i omega t)). Mit positivem historischem BM-q in Richtung SV gilt:

Q_SV(x_j) = i omega [A_s y_s + Summe bis j (b_eff,i Delta x_i q_i)], Q_ST = -Q_SV.
v_SV = Q_SV / A_SV; v_ST = -Q_SV / A_ST.

b_eff ist die halbe geometrische BM-Breite aus greenf.m. Exportierte Zellgrenzen exakt aus cochlea-data.js; Breiten mit derselben Splinefunktion wie im historischen Solver. Querschnitte entsprechend g0.m: Halbkreise aus den gemittelten Radien benachbarter Original-Messstellen. Geometriedatei fluid-geometry.js, Rekonstruktion fluid-view.js. Keine mechanischen Matrizen verändert.

Pfeile: 17 Orte pro Scala, komplexe Geschwindigkeit räumlich linear interpoliert, Momentanwert pro Animationsbild. Gegenläufige Volumenströme, wegen unterschiedlicher Flächen nicht notwendigerweise gleiche Geschwindigkeitsbeträge. Keine Vorgabe eines Abbruchs am BM-Maximum oder eines verschwindenden Helicotrema-Stroms. Positive Membranauslenkung in der Animation jetzt nach oben zur SV, konsistent mit historischer Quellkonvention. Fensterbewegungen bleiben schematisch vergrößert.

Gemeinsame Pfeillängenskalierung aus maximaler Geschwindigkeit beider Scalen für passive und volle aktive Antwort; fest während einer Periode und bei Modus/Prozentänderungen. Kleinste Pfeile unter 0,08 SVG-Einheiten werden aus Lesbarkeitsgründen nicht gezeichnet. Ausgeblendete Pfeile bedeuten nicht exakt null. Pfeilpositionen bleiben stationär, Länge und Richtung zeigen Geschwindigkeit, keine Teilchenbahn. Die Pfeile liegen außen als Indikatoren für die Strömung innen.

Grenzen: querschnittsgemittelte Rekonstruktion, kein 3D-Nahfeld oder Wirbelbild. Keine unabhängige physiologische Validierung. Die didaktische Skalierung der aktiven BM-Antwort bei unverändertem Steigbügel ist keine neue physikalische Solverlösung; die daraus rekonstruierte Strömung erfüllt Volumenerhaltung, aber nicht zwingend die Impulsbilanz des ursprünglichen Modells. Für den physikalischen Aktivvergleich 100 % verwenden.

Prüfung: 17 Tests insgesamt erfolgreich (nach Korrektur der Rundungsfehlertoleranz für Differenzen kleiner Zellflüsse). Analytischer Kanal ohne BM-Bewegung, exakte apikale Auslöschung eines konstruierten Falls, Phasenumkehr nach halber Periode, Zellvolumenbilanz und gegenläufige Scala-Flüsse bei 50, 100, 1000, 5000 und 20000 Hz jeweils passiv/aktiv; unveränderte mechanische Referenzlösungen, Controller/Worker. Keine neue visuelle Browserprüfung.
