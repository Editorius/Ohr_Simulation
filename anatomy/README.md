# Eingebettete anatomische Ansicht

Snapshot des gemeinsam geprüften lokalen Prototyps vom 14.10.2026, einschließlich doppelter Markerbreite. location-data.json enthält die Originaloberflächen und abgeleiteten Referenzen/Schnittkonturen. Quellen und Bearbeitungen: ../THIRD_PARTY_NOTICES.md. Das Mesh wird nicht vom Rechenkern verwendet.

Bearbeiten: location-template.html, location-viewer.js, integration.js. HTML reproduzierbar erzeugen: `python anatomy/build.py` vom Repository-Stamm. Keine externe Laufzeitabhängigkeit. Der bisherige eigenständige Prototyp bleibt unverändert. Die Steuerung der Position übernimmt ausschließlich die App; die ursprünglichen manuellen Ortsregler sind ausgeblendet.

## Prüfung der Integration

22 automatisierte Tests bestanden, einschließlich unveränderter Mechanik, direktem Vergleich der übertragenen mm mit dem Solver, Grenzwerten, Passiv/Aktiv, Reset und Zurückweisen fremder Nachrichten. Browserprüfung über lokalen Server: 1000 Hz passiv 13,46 mm / aktiv 16,08 mm; aktiv 50 Hz 33,07 mm / 20000 Hz 0,29 mm. Der zuletzt genannte Wert wurde zusätzlich im eingebetteten Viewer kontrolliert. Aufsicht und Ausgangsansicht funktionieren. Reset: passiv, 1000 Hz, 10 nm. Sichtbare 3D-Markierung und WebGL-Darstellung geprüft; keine anatomische Validierung. Im Browserprotokoll erschien eine MutationObserver-Meldung ohne Quell-URL; diese API wird vom App-Code nicht verwendet, die Herkunft ist ungeklärt.
