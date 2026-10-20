## Ansichten anordnen

Über „Ansichten“ oben rechts lassen sich Wanderwelle, Auslenkung und Cochlea einzeln ein-/ausblenden. Am Griff neben der Überschrift ziehen, oder den Griff mit Tab fokussieren und Pfeil hoch/runter nutzen. Auch das Menü bietet Pfeilbuttons. Während des Ziehens sind die anderen Kacheln ausgegraut; Escape bricht ab. „Ansicht zurücksetzen“ stellt alle drei Kacheln wieder her. Speicherung gilt für diesen Browser und dieselbe Seitenadresse; die Berechnung läuft unverändert weiter.

# Lokaler Test: anatomische Ortsmarkierung

`index.html` öffnen oder `node serve.cjs` starten. Die 3D-Ansicht befindet sich unter dem Auslenkungsdiagramm. Frequenz ändern und Passiv/Aktiv wählen: Die rote Markierung folgt dem berechneten Maximalort. Drehen per Ziehen; Zoom per Mausrad. Dies ist ein unveröffentlichter Teststand auf Basis von 0.12.0.

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

Prüfung der Kachelbedienung: Ziehen von Auslenkung vor Wanderwelle, Menüsortierung, komplettes Ausblenden, Wiederherstellen und Laden gespeicherter Einstellungen im Browser geprüft. Die Anordnung verwendet CSS-Reihenfolge, damit die 3D-Ansicht beim Verschieben nicht neu geladen wird.


### Unterrichtskachel

„Schwingungsmodell der Basilarmembran“ zeigt einen einzelnen Feder-Masse-Schwinger und seine Resonanzkurve. Der Erklärmodus folgt automatisch dem Maximum der Wanderwelle. „Selbst untersuchen“ gibt Masse und Steifigkeit frei; Der Ausgangspunkt bleibt dabei fest; „Zum aktuellen BM-Abschnitt“ übernimmt wieder den aktuellen Maximalort. Die geringe Dämpfung ist fest; nur das Resonanzmaximum wird markiert. Türkis markiert den Lernabschnitt in der Wanderwelle und 3D-Ansicht. Die Kachel kann über „Ansichten“ ausgeblendet und per Griff verschoben werden. Die Schwingerkette ist eine mögliche spätere Erweiterung.


### Lokale Lerntour und Experimentierlabor

Oben im Bildbereich wechseln **Geführte Tour** und **Experimentierlabor** zwischen angeleiteten Aufgaben und freier Untersuchung. Die sechs Stationen behandeln Frequenz/Ort, Anatomie, lokales Ersatzmodell, Masse/Steifigkeit, räumliche Kopplung und optional aktive Verstärkung. Die Checkbox zur Vertiefung öffnet ab Station 4 Formel und Modelldaten. Zurück/Weiter und die nummerierten Stationen sind per Tastatur bedienbar; Erklärungen lassen sich aufdecken.

Die Tour beginnt passiv bei 1 000 Hz und 10 nm. Sie verwendet dieselben Rechenergebnisse wie das Labor. Dessen Anordnung und ausgeblendete Kacheln bleiben erhalten; Frequenz, Betriebsart, Anregungsstärke und lokale Modellparameter werden beim Rückwechsel wiederhergestellt. Ton und Wiedergabe starten dabei nicht automatisch. Ein Neuladen öffnet das Labor mit seiner gespeicherten Kachelanordnung.

In „Schwingungsmodell der Basilarmembran“ erklärt der aufklappbare Bereich „Vom Innenohr zum Schwingungsmodell“ die Modellbildung. Die Formel ist natives MathML mit LaTeX-Annotation, funktioniert offline und benötigt keine externe Bibliothek. Der Schwinger hat Dämpfung, obwohl sein Ersatzbild keinen Dämpfer zeigt. Die ungedämpfte Eigenfrequenz ist vom Maximum seiner erzwungenen Antwort zu unterscheiden. Die Spiralzeichnung ist schematisch, keine neue anatomische Kalibrierung.

Curriculare Grundlage: [KC Physik Niedersachsen 2022, S. 37](https://cuvo.nibis.de/cuvo.php?p=download&upload=363). Die aktive Verstärkung ergänzt die Physik als biologische Anwendung. Die Tour ersetzt kein reales Experiment.

Im Unterrichtsschwinger verhindern feste Wertebereiche unrealistische Parameter. Graue Reglerbereiche sperren Kombinationen mit einem Resonanzmaximum außerhalb von 50–20.000 Hz. Für 50 Hz ist die untere Steifigkeitsgrenze ausdrücklich didaktisch erweitert.

Die geführte Tour begleitet sechs Stationen mit kurzen Erklärungen statt Aufgabenblöcken. Tonvorgaben und Aktiv/Passiv-Vergleich sind direkt in den passenden Stationen verfügbar. Das Experimentierlabor bleibt frei bedienbar; beim Verlassen der Tour werden seine vorherigen Einstellungen wiederhergestellt. Die Signalweitergabe ans Gehirn wird ausschließlich erläutert.
