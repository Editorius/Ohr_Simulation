# Änderungen

Kurze fachlich relevante Historie. Die älteren Einträge sind aus lokalen Projektständen rekonstruiert und keine Behauptung bereits vorhandener Git-Tags. Release-Daten werden erst bei tatsächlicher Veröffentlichung ergänzt.

## Unveröffentlicht

- Parallele Bearbeitung mit getrennten Worktrees, Branches und Vorschau-Ports dokumentiert.
- Zeilenenden zweier historischer Prüfberichte an die Repository-Vorgaben angepasst, damit frische Checkouts sauber bleiben.

- Projektpflege: kurze AGENTS.md, CONTRIBUTING.md und aktueller Modellvertrag MODEL.md ergänzt.
- Automatische Node- und Python-Reproduktionsprüfungen; kein automatisches Deployment.
- Gezielte Original-Eingabedaten mit Prüfsummen sowie Generatoren für Mechanik, Strömungsgeometrie, Messkurven und Referenzantworten ergänzt.
- Hosting-Export mit frischen Paketprüfsummen, ZIP-Prüfung und Schutz vor Überschreiben.
- Historische SHA256.json archiviert; fehlende .gitignore/.nojekyll ergänzt.
- App und mechanische Baseline bleiben unverändert.

## 0.11.0

- Strömung: lokale mittlere Scala-Geschwindigkeiten und Phasen aus Volumenbilanz und Originalgeometrie.
- Darstellung: BM-Vorzeichen zur historischen Quellkonvention ausgerichtet.
- Prüfung: zusätzliche analytische und modellbasierte Strömungstests; insgesamt 17 Tests bestanden. Keine neue visuelle Browserprüfung dokumentiert.

## 0.10.8

- Wanderwelle nutzt mehr Scalenhöhe; physikalischer Bereich bleibt ±16 µm.

## 0.10.7

- Passive Vergleichssäule neben aktiver Säule; globales Diagramm verbreitert.

## 0.10.6

- Maximum-Anzeige mit eigener linearer Skala neben fest skaliertem Ortsverlauf.

## 0.10.5

- Ausschließlich direkte Steigbügelanregung, Start/Reset 10 nm.
- Nur ausgewählte Momentanwelle, dunkelgrau durchgezogen.

## 0.10.4

- Feste globale Obergrenze 16 µm; animierter Bereich ±16 µm.

## 0.10.3

- Strömungspfeile außerhalb der Scalen; damalige Obergrenze 10 µm.

## 0.10.2

- Logarithmische Amplitudenanzeige durch feste lineare Skala ersetzt, damals bis 3 µm.

## 0.10.1

- Zwischenstand mit logarithmischer Amplitudenanzeige; später verworfen.

## 0.10.0

- Prüfung absoluter Anregung, projizierte Steigbügelfläche 2,86 mm², stabile aktive UI-Einstellung 0,80.
- Menschliche Mittelohrmesskurve für damaligen Schalldruckmodus; heute nur in Kalibrierungsprüfungen verwendet.
