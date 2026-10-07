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

## Mehrere Terminals und parallele Aufträge

Für unabhängige Änderungen braucht jeder Auftrag einen eigenen Branch **und einen eigenen Git-Worktree**. Zwei Terminals im selben Verzeichnis teilen Dateien, Index und aktiven Branch; ein Branchwechsel wirkt deshalb auf beide.

Aus einem bestehenden Repository einen Arbeitsstand auf Basis des aktuellen Hauptbranches anlegen (Namen je Auftrag anpassen):

```powershell
git fetch origin
git worktree add -b arbeit/layout ../Ohr_Simulation_layout origin/main
cd ../Ohr_Simulation_layout
git status --short --branch
```

Für einen zweiten Auftrag einen anderen Branch und Ordner wählen, zum Beispiel `arbeit/modell` und `../Ohr_Simulation_modell`. Nicht gleichzeitig dieselben Dateien in einem gemeinsamen Worktree bearbeiten. Änderungen anderer Aufträge weder zurücksetzen noch durch Kopieren ersetzen.

Jede gleichzeitig laufende Vorschau braucht einen eigenen Port. Im jeweiligen PowerShell-Terminal beispielsweise:

```powershell
$env:PORT = '8767'
npm start
```

Die Vorschau dieses Worktrees ist dann unter http://127.0.0.1:8767/ erreichbar. Für den nächsten Worktree etwa 8768 verwenden. Der Standard bleibt 8766. Beim Vergleichen stets URL und zugehörigen Arbeitsstand beachten.

Generatoren schreiben nach `.generated/`, Exporte nach `dist/`. Diese Verzeichnisse sind je Worktree getrennt. Dieselbe Datenerzeugung oder denselben Export nicht gleichzeitig mehrfach im gleichen Worktree starten.

Vor einem Pull Request die vorgesehenen Prüfungen im eigenen Worktree ausführen und nur auftragsbezogene Änderungen committen. Nach dem Zusammenführen `git fetch origin` ausführen; neue Aufträge wieder von `origin/main` starten. Bei bereits laufenden Aufträgen den neuen Hauptbranch bewusst integrieren, Konflikte prüfen und betroffene Tests wiederholen. Einen Worktree erst nach Sicherung seiner Arbeit und Beenden der zugehörigen Vorschau entfernen.

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
