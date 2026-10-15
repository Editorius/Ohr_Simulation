from pathlib import Path
r=Path(__file__).resolve().parent
h=(r/'location-template.html').read_text(encoding='utf8').replace('__DATA__',(r/'location-data.json').read_text(encoding='utf8')).replace('__JS__',(r/'location-viewer.js').read_text(encoding='utf8'))
(r/'index.html').write_text(h,encoding='utf8')
