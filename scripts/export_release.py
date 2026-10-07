"""Export only the runnable website with a fresh manifest, without dev/source data."""
import hashlib,json,shutil,zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
APP_FILES=['index.html','style.css','numerics.js','cochlea-data.js','cochlea-model.js','solver-client.js','audio.js','response-view.js','fluid-geometry.js','fluid-view.js','app.js','.nojekyll','THIRD_PARTY_NOTICES.md']

def build(root,output):
    root=Path(root).resolve();output=Path(output).resolve()
    if output.exists():raise FileExistsError('Export already exists; choose a new version or archive it first: '+str(output))
    for name in APP_FILES:
        if not (root/name).is_file():raise FileNotFoundError(name)
    output.mkdir(parents=True)
    for name in APP_FILES:shutil.copyfile(root/name,output/name)
    (output/'README.md').write_text('# Innenohr – Hosting-Paket\n\nDen gesamten Inhalt ins Hosting-Hauptverzeichnis übernehmen. Kein Build erforderlich. Dieses Paket enthält nur die Website; Entwicklung und Tests erfolgen im Quellrepository. Siehe THIRD_PARTY_NOTICES.md zur Herkunft.\n',encoding='utf-8')
    manifest={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(output.iterdir()) if p.is_file()}
    (output/'SHA256.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    return manifest

def archive(folder):
    target=Path(str(folder)+'.zip')
    with zipfile.ZipFile(target,'x',zipfile.ZIP_DEFLATED) as z:
        for f in sorted(folder.iterdir()):z.write(f,f.name)
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
        manifest=json.loads(z.read('SHA256.json'))
        for name,digest in manifest.items():assert hashlib.sha256(z.read(name)).hexdigest()==digest
    return target

if __name__=='__main__':
    version=json.loads((ROOT/'package.json').read_text())['version']
    folder=ROOT/'dist'/('innenohr-'+version)
    if Path(str(folder)+'.zip').exists():raise FileExistsError('ZIP already exists')
    manifest=build(ROOT,folder);target=archive(folder)
    print(f'Export checked: {len(manifest)+1} files, {target}')
