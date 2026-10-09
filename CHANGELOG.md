# Ã„nderungen

Kurze fachlich relevante Historie. Die Ã¤lteren EintrÃ¤ge sind aus lokalen ProjektstÃ¤nden rekonstruiert und keine Behauptung bereits vorhandener Git-Tags. Release-Daten werden erst bei tatsÃ¤chlicher VerÃ¶ffentlichung ergÃ¤nzt.

## UnverÃ¶ffentlicht

- 0.11.2: Freigegebene SVG-AuÃŸenkontur Ã¼bernommen; gegenlÃ¤ufige Fensterbewegung mit verbundenen AnschlÃ¼ssen, berechnete BM-Wanderwelle und zeitlich feste auÃŸenliegende StrÃ¶mungspfeile integriert. Beschriftungen der Fenster liegen auÃŸerhalb. Rechenkern und globaler AuslenkungsmaÃŸstab unverÃ¤ndert.

- Unterrichtsansicht vereinfacht: Hinweise aus VerstÃ¤rkungs- und Auslenkungskachel entfernt, kompakte Zeitleiste mit Zeitpunkt t, verstÃ¤ndliche AnimationsknÃ¶pfe; Greenwood-Anzeige und technische Diagnostik durch kurzen Modellhinweis ersetzt.

- Cochlea-Kontur aus den vorhandenen ScalenflÃ¤chen abgeleitet; geglÃ¤ttete, Ã¼berhÃ¶hte Darstellung mit basaler Erweiterung und schmalerem Apex.
- Offene SteigbÃ¼gelform, zugeordnete Beschriftungen und StrÃ¶mungspfeile auÃŸerhalb der neuen Kontur. Rechenkern und AmplitudenmaÃŸstab unverÃ¤ndert.


- Parallele Bearbeitung mit getrennten Worktrees, Branches und Vorschau-Ports dokumentiert.
- Zeilenenden zweier historischer PrÃ¼fberichte an die Repository-Vorgaben angepasst, damit frische Checkouts sauber bleiben.

- Projektpflege: kurze AGENTS.md, CONTRIBUTING.md und aktueller Modellvertrag MODEL.md ergÃ¤nzt.
- Automatische Node- und Python-ReproduktionsprÃ¼fungen; kein automatisches Deployment.
- Gezielte Original-Eingabedaten mit PrÃ¼fsummen sowie Generatoren fÃ¼r Mechanik, StrÃ¶mungsgeometrie, Messkurven und Referenzantworten ergÃ¤nzt.
- Hosting-Export mit frischen PaketprÃ¼fsummen, ZIP-PrÃ¼fung und Schutz vor Ãœberschreiben.
- Historische SHA256.json archiviert; fehlende .gitignore/.nojekyll ergÃ¤nzt.
- App und mechanische Baseline bleiben unverÃ¤ndert.

## 0.11.0

- StrÃ¶mung: lokale mittlere Scala-Geschwindigkeiten und Phasen aus Volumenbilanz und Originalgeometrie.
- Darstellung: BM-Vorzeichen zur historischen Quellkonvention ausgerichtet.
- PrÃ¼fung: zusÃ¤tzliche analytische und modellbasierte StrÃ¶mungstests; insgesamt 17 Tests bestanden. Keine neue visuelle BrowserprÃ¼fung dokumentiert.

## 0.10.8

- Wanderwelle nutzt mehr ScalenhÃ¶he; physikalischer Bereich bleibt Â±16 Âµm.

## 0.10.7

- Passive VergleichssÃ¤ule neben aktiver SÃ¤ule; globales Diagramm verbreitert.

## 0.10.6

- Maximum-Anzeige mit eigener linearer Skala neben fest skaliertem Ortsverlauf.

## 0.10.5

- AusschlieÃŸlich direkte SteigbÃ¼gelanregung, Start/Reset 10 nm.
- Nur ausgewÃ¤hlte Momentanwelle, dunkelgrau durchgezogen.

## 0.10.4

- Feste globale Obergrenze 16 Âµm; animierter Bereich Â±16 Âµm.

## 0.10.3

- StrÃ¶mungspfeile auÃŸerhalb der Scalen; damalige Obergrenze 10 Âµm.

## 0.10.2

- Logarithmische Amplitudenanzeige durch feste lineare Skala ersetzt, damals bis 3 Âµm.

## 0.10.1

- Zwischenstand mit logarithmischer Amplitudenanzeige; spÃ¤ter verworfen.

## 0.10.0

- PrÃ¼fung absoluter Anregung, projizierte SteigbÃ¼gelflÃ¤che 2,86 mmÂ², stabile aktive UI-Einstellung 0,80.
- Menschliche Mittelohrmesskurve fÃ¼r damaligen Schalldruckmodus; heute nur in KalibrierungsprÃ¼fungen verwendet.
