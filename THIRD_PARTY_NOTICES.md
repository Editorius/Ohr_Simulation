# Quellen und Rechte

- Mechanischer Kern und Geometrie: abgeleitet vom historischen MATLAB-Modell von R. Nobili und F. Mammano, Revision 1997 (lokale Vorlage Model_2_fixed). Im aktuellen Projekt nach JavaScript übertragen, am unteren Helicotrema-Beitrag korrigiert und auf 600 Abschnitte gebracht. Ausgangsarchiv: https://au.mathworks.com/matlabcentral/answers/uploaded_files/91907/Model_2.zip . Das Upload-Datum ist nicht das wissenschaftliche Entstehungsjahr.
- Wissenschaftlicher Hintergrund: Mammano & Nobili (1993), „Biophysics of the cochlea. Linear approximation“; Elliott et al., „An elemental approach to modelling the mechanics of the cochlea“, https://pmc.ncbi.nlm.nih.gov/articles/PMC5854296/ . Das Paket beansprucht keine vollständige Implementierung aller Ansätze dieser Arbeiten.
- Menschliche Mittelohrmessdaten in human-input-data.js: O’Connell-Rodwell et al. (2024), S2, https://doi.org/10.1371/journal.pone.0298535.s009 ; in den Quelldaten mit CC BY 4.0 gekennzeichnet. Abgeleitet: geometrisches Mittel von drei Präparaten, Auswahl/Export für Kalibrierungstests.
- Steigbügel-Projektionsfläche 2,86 mm²: Sim et al. (2013), https://pmc.ncbi.nlm.nih.gov/articles/PMC3660917/ .

Original-Paper, Präsentationen und fremder MATLAB-Quellcode werden nicht mitgeliefert. Für die Reproduktion sind jetzt die zwei historischen Geometriedateien unter data/historical, der Messdaten-CSV-Export unter data/ und die im Projekt erstellte Python-Übertragung unter scripts/historical_1997.py enthalten. data/SOURCES.json dokumentiert Quellen und Eingabeprüfsummen. Diese Quelldaten sind Teil des Entwicklungsrepositorys; das Exportskript nimmt sie nicht ins Hosting-Paket auf. Die daraus abgeleiteten mechanischen Arrays und Geometriewerte sind für die App enthalten. Eine ausdrückliche Weiterverbreitungslizenz des historischen Modells ist in diesem Paket nicht belegt. Daher wurde keine MIT- oder andere pauschale Lizenz hinzugefügt; vor öffentlicher Weiterverbreitung ist diese Herkunftsfrage zu klären. Die Zusammenstellung selbst veröffentlicht noch nichts.

- Anatomische Oberflächen: Sieber, Andersen, Sørensen und Mikkelsen (2021), OpenEar color example from Visible Ear Simulator anatomy Delta, https://doi.org/10.5281/zenodo.4362584, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Änderungen: Ausrichtung, Farbaufteilung, geschätzte Fensterflächen, rekonstruierte Ortsreferenz und Oberflächenkonturen. Keine anatomische Validierung der Ortszuordnung.

## Ohrübersicht: bereitgestellte SchuBu-Abbildungen
Die zwölf PNG-Ansichten unter assets/ear wurden vom Nutzer als Screenshots von https://de.schubu.org/p250/die-ohren bereitgestellt. Darstellung mittels Ausschnitt/Graustufenfilter; die Außenohransicht wurde zusätzlich wie unten beschrieben bearbeitet. Die Abbildungen sind nicht Teil einer behaupteten eigenen Bildlizenz; für eine öffentliche Weiterveröffentlichung sind die Nutzungsrechte separat zu klären.

## Abbildungen zur Schallortung
assets/ear/localization-horizontal.png und localization-vertical.png: vom Nutzer bereitgestellte Screenshots, Bildnachweis physiologie.cc; horizontale Darstellung nach Carlson/Birkett (2017), vertikale nach Boron/Boulpaep (2021). Originale unverändert, nur Bildbereiche im Interface dargestellt. Herkunftsangaben bleiben sichtbar; keine Übertragung der Projektlizenz auf diese Abbildungen.

### Gehörgangsresonanz
`assets/ear/canal-resonance.png`: KI-generierte didaktische Illustration nach gemeinsam abgestimmtem Konzept; keine Digitalisierung der Kollmeier-Abbildung und keine Messdaten. Beispielmaximum: Faktor 5,62 bei circa 3,5 kHz.

Inhaltliche Vorlage der schematisch adaptierten Gehörgangsresonanz (Quellenangabe vom Nutzer): B. Kollmeier u. a.: Medizinische Akustik und Audiologie: 21. Winterschule – Das periphere Hörorgan – Funktionsweise und Modellbildung. Version: 2009. https://d-nb.info/1019015241/04. Keine Übernahme der Messkurven.

`assets/ear/outer.png`: Außenohransicht aus der bereitgestellten SchuBu-Vorlage mit KI-gestützter zusätzlicher Kolorierung des Trommelfells (violett), passend zur didaktischen Zuordnung der App.
