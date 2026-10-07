# Innenohr · Wanderwelle

Version 0.11.0. Deutschsprachige, statische Browser-App für den Unterricht: passive und aktive Basilarmembranbewegung, Frequenz-Ort-Darstellung, Hüllkurven, lokale mittlere Strömungsgeschwindigkeiten und zuschaltbarer Ton.

## Starten

Node.js ab Version 20 installieren. Im Repository-Ordner `npm start` ausführen und http://127.0.0.1:8766/ öffnen. Keine Paketinstallation, kein Build und keine externen Laufzeitbibliotheken erforderlich. Die Website benötigt HTTP/HTTPS; `index.html` nicht per Doppelklick starten. Ton muss durch einen Klick aktiviert werden.

## GitHub Pages

Den **gesamten Inhalt dieses Ordners** einschließlich Unterordnern in das Repository übernehmen. `index.html` muss direkt im Repository-Hauptverzeichnis liegen. Nicht den umschließenden Ordner und nicht nur die ZIP-Datei hochladen. In den Repository-Einstellungen unter Pages die Veröffentlichung aus dem Branch `main`, Ordner `/ (root)`, auswählen. Alle App-Verweise sind relativ und funktionieren auch unter einem Repository-Unterpfad. Bei späteren Aktualisierungen ersetzen Uploads am gleichen Pfad die vorhandenen Dateien; vorheriges Löschen ist nicht nötig.

## Bedienung

Start bei 1000 Hz, passiv, 10 nm Steigbügel-Scheitelamplitude. Frequenzbereich 50–20000 Hz. Aktive Amplitude 30–100 % ist eine didaktische Skalierung. Die globale Amplitudenachse bleibt linear von 1 pm bis 16 µm, die Animation bei ±16 µm. Rechts zeigen Säulen die Maxima auf einer gemeinsamen eigenen Skala. Strömungspfeile bilden lokale mittlere Geschwindigkeiten mit Phase ab; ihre Länge ist vergrößert.

## Modell und Grenzen

Korrigierter historischer menschlicher Cochlea-Kern mit 600 Abschnitten auf 33,5 mm; kein virtueller Auslauf. Aktive Rechnung mit λ=0,80. Lineares Kleinsignalmodell ohne pegelabhängige Kompression. Absolute BM-Auslenkungen sind Modellwerte und nicht unabhängig am Menschen validiert. Pfeile zeigen querschnittsgemittelte Rekonstruktion aus Volumenerhaltung, keine Wirbel oder vollständigen 3D-Strömungsfelder. Für den fachlichen Aktivvergleich 100 % verwenden; andere Prozentwerte sind didaktisch verändert.

Die Bibliotheken `human-input-data.js` und `input-calibration.js` bleiben für die Kalibrierungs-Regressionsprüfungen enthalten; die Oberfläche verwendet ausschließlich direkte Steigbügelanregung.

Details: [Strömungsanzeige](STROEMUNGSANZEIGE_0.11.0.md), [Kalibrierung](KALIBRIERUNG_0.10.0.md). Der Kalibrierungsbericht dokumentiert einen älteren Entwicklungsschritt; darin erwähnte frühere UI-Modi gelten nicht für die aktuelle Oberfläche. Die Berichte können Verweise auf lokale Forschungsunterlagen enthalten, die nicht Teil dieses Pakets sind.

## Tests

`npm test` startet 17 Prüfungen: numerische Referenzlösungen, Worker/Fallback, Bedienlogik, Amplitudenskalierung, Volumenbilanz und Strömungsphase. Referenzdatensätze sind enthalten. Der historische Matrixvergleich nutzt SHA-256-Prüfsummen statt lokaler Sicherungsordner. Diese Tests ersetzen keine visuelle Browserprüfung oder physiologische Validierung.

## Dateien und Herkunft

`index.html`, `style.css`, `app.js`: Oberfläche. `cochlea-model.js`, `cochlea-data.js`, `numerics.js`: Rechenkern. `solver-client.js`: Hintergrundberechnung. `response-view.js`: Anzeigeskalen. `fluid-geometry.js`, `fluid-view.js`: Strömungsrekonstruktion. `audio.js`: Ton. `serve.cjs`: lokaler Server. `tests/`, `research/`: Prüfungen und Referenzwerte.

Siehe [Quellen und Rechte](THIRD_PARTY_NOTICES.md). Dieses Paket legt keine pauschale Open-Source-Lizenz für fremde Modell- und Datenbestandteile fest.

## Weiterentwicklung und Reproduktion

- [AGENTS.md](AGENTS.md): kurze KI-Arbeitsregeln.
- [CONTRIBUTING.md](CONTRIBUTING.md): Änderungs- und Prüfablauf.
- [MODEL.md](MODEL.md): maßgeblicher aktueller Modellvertrag.
- [CHANGELOG.md](CHANGELOG.md): Änderungshistorie.
- [scripts/README.md](scripts/README.md): reproduzierbare Daten und Hosting-Export.

Das Repository enthält jetzt gezielt benötigte Entwicklungsdaten und Generatoren. Für Hosting-Uploads kann ein separates Paket mit `python scripts/export_release.py` erzeugt werden. Es liegt unter `dist/` und enthält nur Website-Dateien sowie aktuelle Prüfsummen. Der historische Prüfsummenstand liegt unter `research/releases/0.11.0/`; er beschreibt nicht den laufenden Git-Stand.

Automatische Prüfungen stehen in `.github/workflows/tests.yml`. Der Workflow veröffentlicht nichts. Bei branchbasiertem GitHub Pages begrenzt der Testworkflow nicht automatisch, welche Dateien GitHub bereitstellt; vor einer Umstellung auf einen gezielten Deployment-Export die Pages-Konfiguration separat ändern.
