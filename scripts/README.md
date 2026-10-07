# Daten reproduzieren und Website exportieren

## Installation

Python 3.12 und `python -m pip install -r scripts/requirements.txt` (NumPy 2.3.5). Node.js wird für die App-Tests benötigt. Keine Python-Abhängigkeit beim Hosting.

## Reproduktion

Vom Repository-Hauptverzeichnis:

```text
python scripts/reproduce.py
python scripts/reproduce.py --stability
```

Beide Befehle prüfen zuerst die Eingabeprüfsummen aus data/SOURCES.json und schreiben ausschließlich in `.generated/`. Veröffentlichten Code und Referenzwerte überschreiben sie nicht. NumPy-BLAS wird für nachvollziehbare Läufe auf einen Thread begrenzt. Der vollständige Lauf kann deutlich länger dauern, weil vier Eigenwertprobleme mit 2400 Zustandsgrößen gelöst werden.

| Eingaben | Ausgabe unter .generated/ |
| --- | --- |
| data/historical/man_data.mat und bmw_man.mat | cochlea-data.js, fluid-geometry.js |
| data/human-middle-ear-source.csv | human-input-data.js |
| Neu berechnete Mechanik | research/school-b-restored/fixtures.json (18 Fälle), research/absolute-amplitudes-2026-10-06/calibrated-fixtures.json (14 Fälle) |

Der Generator vergleicht mit den versionierten Dateien: Arrays relativ 1e-10, komplexe Antworten 1e-8, Gleichungsrest <1e-12. Der vollständige Lauf prüft außerdem Polrealteile (Toleranz 1e-4 relativ, mindestens absolut 1e-4) und Anzahl instabiler Pole. Dies ist ein unabhängiger Python-/JavaScript-Rechenabgleich, keine unabhängige wissenschaftliche Modellvalidierung. Eingabedaten und historische Theorie bleiben dieselben.

Ohne --stability werden die vorhandenen Stabilitätsmetadaten ausdrücklich übernommen, nicht neu validiert. Der JSON-Prüfbericht kennzeichnet das. Im vollständigen Lauf werden auch diese Metadaten neu berechnet. JSON-Formatierung, Zeilenenden und BLAS-Rundung können trotz numerischer Übereinstimmung unterschiedliche Dateihashes ergeben. Bei absichtlichen Modelländerungen erst Generator/Herleitung prüfen; veröffentlichte Dateien und Referenzwerte nur mit dokumentiertem Vergleich gemeinsam aktualisieren. tests/mechanical-baseline.json wird nie automatisch überschrieben.

Die Geometriequellen verwenden normierte Längen (1 Einheit = 33,5 mm), die Fluid-Ausgabe SI-Einheiten. Die Python-Referenz ist die projektinterne Übertragung des historischen Modells; die Verteilungslizenz der historischen Eingabedaten ist weiterhin nicht belegt (THIRD_PARTY_NOTICES.md). Die menschlichen CSV-Messdaten sind mit CC BY 4.0 referenziert.

## Hosting-Paket

```text
python scripts/test_export.py
python scripts/export_release.py
```

Ausgabe: `dist/innenohr-<Version>/` und die gleichnamige `.zip`. Die Version stammt aus package.json. Bereits vorhandene Ausgaben werden nicht überschrieben. Vor einer erneuten Ausgabe den alten Export bewusst archivieren oder eine neue Releaseversion setzen.

Der Export nutzt eine explizite Dateiliste. Keine lokalen Paper, Rohdaten, Testfixtures, Entwicklungsdokumente oder Backups werden kopiert. Eine neue SHA256.json umfasst alle Paketdateien außer sich selbst. Das ZIP wird anschließend entpackungsfrei gegen die Prüfsummen geprüft. Für neue Laufzeitdateien APP_FILES aktualisieren und den Exporttest erweitern.

GitHub Pages kann weiterhin aus dem bisherigen Branch veröffentlichen. Das Exportskript ändert diese Konfiguration nicht und veröffentlicht nichts. Wer ausschließlich den reduzierten Paketinhalt auf Pages bereitstellen möchte, muss später einen darauf ausgerichteten Deployment-Workflow konfigurieren.
