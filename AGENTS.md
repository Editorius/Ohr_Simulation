# Arbeitsanweisungen

## Projekt und Orientierung
- Deutschsprachige Unterrichts-App zur menschlichen Cochlea; fachliche Genauigkeit und verständliche Darstellung verbinden.
- README.md beschreibt Start/Bedienung, MODEL.md den aktuellen Modellvertrag, CONTRIBUTING.md den Änderungsablauf.
- Dieses Repository enthält die lauffähige Veröffentlichung samt Tests. Der vollständige lokale Forschungsordner ist keine verfügbare Repository-Abhängigkeit.
- Statisches HTML/CSS/JavaScript ohne Build und externe Laufzeitbibliotheken. Relative URLs für GitHub Pages erhalten.

## Änderungen
- Oberfläche: index.html, style.css, app.js. Anzeigeaufbereitung: response-view.js.
- Mechanik: cochlea-model.js, numerics.js, cochlea-data.js. Strömung: fluid-view.js, fluid-geometry.js.
- Rechenwerte und Darstellung trennen. Bei Layoutaufträgen Mechanik, Einheiten, Anregung und Randbedingungen unverändert lassen.
- Modelländerungen mit Quelle/Herleitung, Einheiten, Vorzeichen und unabhängigem Vergleich dokumentieren.
- Generierte Daten und Referenzwerte nicht zur bloßen Beseitigung fehlgeschlagener Tests überschreiben. Änderungen mit Erzeugungsweg und Herkunft belegen.
- Ohne ausdrücklichen Änderungsauftrag den Modellvertrag in MODEL.md erhalten; begründete Änderungen dort nachführen.
- Keine stillen Peakverschiebungen, künstlichen Ausläufe oder Amplitudenkorrekturen einführen.
- Didaktische Skalierung nicht als physiologische Verstärkung oder Hörschaden ausgeben.
- Bestehende Arbeitsstände und nicht zum Auftrag gehörende Änderungen bewahren.

## Prüfung und Abschluss
- Lokal starten: npm start. Gesamte automatisierte Prüfung: npm test.
- Keine npm-Installation nötig. Datengenerator: Python 3.12 und scripts/requirements.txt.
- Modell-/Datenänderungen: python scripts/reproduce.py --stability. Exportänderungen: python scripts/test_export.py.
- Bei Code-/Datenänderungen die Tests ausführen; für reine Textkorrekturen Links und Angaben prüfen.
- UI-Änderungen zusätzlich bei Passiv/Aktiv, Frequenzrändern, 10 nm und Reset im Browser prüfen, soweit verfügbar.
- Tests, Browserprüfung und wissenschaftliche Validierung getrennt berichten; ausgefallene Prüfungen nicht als bestanden ausgeben.
- Relevante Änderungen kurz in CHANGELOG.md eintragen. Releaseversion in package.json und index.html gemeinsam pflegen.
- Keine lokalen PDFs, Backups, Zugangsdaten oder kompletten Forschungsordner ungeprüft veröffentlichen.
- Lizenz-/Quellenangaben erhalten; THIRD_PARTY_NOTICES.md beachten.
