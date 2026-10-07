# Änderungen am Projekt

## Arbeitsgrundlage

Das GitHub-Repository ist die Grundlage für veröffentlichte Änderungen. Lokal existiert zusätzlich ein vollständiger Forschungsordner; `_GitHub Repository` ist die vorbereitete Veröffentlichung. Vor Änderungen den aktuellen Repository-Stand abgleichen. Dateien nicht blind zwischen diesen Arbeitsständen kopieren.

Im Repository liegen AGENTS.md, CONTRIBUTING.md, MODEL.md und CHANGELOG.md direkt neben index.html; der Workflow liegt unter `.github/workflows/tests.yml`.

## Start und Prüfung

Node.js ab 20; für die automatisierte GitHub-Prüfung wird Node 24 verwendet. `npm start` startet den lokalen Server auf http://127.0.0.1:8766/. `npm test` führt die Tests aus. Keine Installation und kein Build erforderlich. Wenn npm lokal nicht verfügbar ist, lässt sich der Testbefehl aus package.json direkt mit Node ausführen.

Die Tests benötigen `tests/`, `research/` und die in package.json benannten Dateien. Auch die nur noch in Tests verwendete Kalibrierungsbibliothek gehört zum vollständigen Repository. Ein verkleinertes Hosting-Paket ohne diese Dateien kann den Workflow nicht ausführen.

## Vorgehen

1. Änderung anhand eines konkreten Beispiels beschreiben: Frequenz, Steigbügelamplitude, Betriebsart, aktive Amplitude und erwartetes Verhalten.
2. In einem eigenen Branch arbeiten. Änderungen auf das konkrete Problem begrenzen.
3. Anzeigeänderungen von Modelländerungen trennen. Bei Modelländerungen MODEL.md mit Herleitung/Quelle, Einheiten und Grenzen aktualisieren; Referenzdaten unabhängig erzeugen und ihren Erzeugungsweg dokumentieren.
4. Bei Code-/Datenänderungen `npm test` ausführen; bei Modell-/Datenänderungen zusätzlich `python scripts/reproduce.py --stability`. Bei Exportänderungen `python scripts/test_export.py`. Im Browser zusätzlich Start/Reset, Passiv/Aktiv, 50/1000/20000 Hz, Anregung und aktive Amplitude sowie Animation, Ton und schmale Fensterbreite prüfen, soweit betroffen. Kleine passive Werte dürfen auf der festen globalen Skala unsichtbar sein.
5. Pull Request mit Problem, Änderung, Prüfungen und verbleibenden Grenzen erstellen. Fehlende Browserprüfung ausdrücklich benennen.
6. Nach Prüfung zusammenführen und veröffentlichte Seite neu laden. Version und Bedienung kurz kontrollieren.

## Automatische Prüfung und Veröffentlichung

`.github/workflows/tests.yml` prüft Pushes und Pull Requests und lässt sich manuell starten. Er veröffentlicht nichts und benötigt keine zusätzlichen Secrets. Er verwendet GitHubs normale read-only Repository-Berechtigung.

Bei Veröffentlichung direkt aus dem Pages-Branch kann eine Änderung unabhängig vom Testergebnis veröffentlicht werden. Der Testworkflow allein sperrt das Deployment nicht. Für verbindliche Freigaben den Statuschecks `Node tests` und `Reproduce model and export` in einer passenden Branchregel als erforderlich konfigurieren und Änderungen über Pull Requests zusammenführen. Alternativ später einen ausdrücklich testabhängigen Pages-Workflow einrichten.

## Versionen, Daten und Quellen

- CHANGELOG.md erhält kurze Einträge zu Modell, Darstellung und Fehlerkorrekturen; keine vollständigen Chatprotokolle.
- Dokumentationsänderungen zunächst unter Unveröffentlicht sammeln. Bei App-Releases Versionsanzeige und package.json gemeinsam aktualisieren.
- research/releases/0.11.0/SHA256.json und PRUEFUNG.md dokumentieren den historischen Export. Neue Hosting-Pakete mit python scripts/export_release.py erzeugen; jede Ausgabe hat eine frische SHA256.json.
- Historische Referenz-Hashes unter tests/ sind davon unabhängig. Nur bei beabsichtigter und belegter Änderung der mechanischen Grundlage erneuern.
- Rechte an historischen Modellbestandteilen bleiben entsprechend THIRD_PARTY_NOTICES.md zu klären; keine pauschale Lizenz ergänzen.

## Fehlermeldungen

Bitte App-Version, Browser, Eingabewerte, Reproduktionsschritte, beobachtetes und erwartetes Verhalten angeben. Bei Darstellungsfehlern hilft ein Screenshot. Keine personenbezogenen Schülerdaten einreichen.
