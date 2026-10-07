import hashlib,json,tempfile,unittest,zipfile
from pathlib import Path
from export_release import ROOT,APP_FILES,build,archive

class ReleaseTest(unittest.TestCase):
    def test_real_release_is_complete_and_excludes_development_inputs(self):
        (ROOT/'.generated').mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=ROOT/'.generated') as temporary:
            out=Path(temporary)/'release'
            manifest=build(ROOT,out)
            self.assertEqual(set(manifest),set(APP_FILES)|{'README.md'})
            self.assertFalse((out/'data').exists())
            for name,digest in manifest.items():
                self.assertEqual(hashlib.sha256((out/name).read_bytes()).hexdigest(),digest)
            z=archive(out)
            with zipfile.ZipFile(z) as f:self.assertEqual(set(f.namelist()),set(manifest)|{'SHA256.json'})
            with self.assertRaises(FileExistsError):build(ROOT,out)
            with self.assertRaises(FileExistsError):archive(out)

if __name__=='__main__':unittest.main()
