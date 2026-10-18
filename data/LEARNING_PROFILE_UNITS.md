# Einheiten der Unterrichtsprofile

Nachgeprüft in der lokalen historischen MATLAB-Vorlage Model_2_fixed/Model_2_fixed (Quelle des Archivs in SOURCES.json).

- mass.m, Zeilen 2–11 und 26–50: effektive Corti-Organ-Masse pro Länge, kg/BETA; Dichte mal effektive Breite mal angenommene Höhe, anschließend lokale Mittelung.
- twave.m, Zeilen 46–55: örtliche Steifigkeit kg/(BETA s²), basal 2000, exponentielle Abnahme, Mittelung über die Rechenabschnitte.
- phyplots.m, Zeilen 17–29: BETA = 0,0335 m, Umrechnung auf Masse bzw. Steifigkeit pro Meter. Dessen abweichender Basalwert 1675 wird hier ausdrücklich nicht übernommen.

Für eine gemeinsame Bezugslänge ℓ = 0,001 m gilt:

m_1mm = m_historisch × ℓ/BETA [kg]

D_1mm = k_historisch × ℓ/BETA [kg/s² = N/m]

Die lokalen Koeffizienten werden auf diese Bezugslänge skaliert; es wird kein gleitendes 1-mm-Fenster integriert. Die Flüssigkeitskopplung ist nicht Teil der gezeigten Masse. Die Profile sind mechanische Modellannahmen mit dokumentierten Einheiten, keine direkt gemessene BM-Gewebemasse. Die mechanischen Solver-Arrays bleiben unverändert.

Die ältere relative Darstellung teilte beide Kurven zusätzlich durch ihren ersten basalen Wert. Nur diese Verhältnisse waren dimensionslos. Die frühere Aussage, die ursprünglichen Koeffizienten ließen keine Einheitenumrechnung zu, war zu pauschal.
