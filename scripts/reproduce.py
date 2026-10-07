"""Rebuild model data in .generated; never overwrite the app or its references."""
import os
for key in ('OPENBLAS_NUM_THREADS', 'OMP_NUM_THREADS', 'MKL_NUM_THREADS'):
    os.environ[key] = '1'
import argparse, base64, csv, hashlib, json
from pathlib import Path
import numpy as np
import historical_1997 as H

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.generated'

def read_js(path):
    s = path.read_text(encoding='utf-8')
    start = s.index('const d=') + 8
    return json.loads(s[start:s.index(';if(typeof module', start)])

def write_js(name, data, global_name):
    text = '(function(r){const d=' + json.dumps(data, separators=(',', ':'))
    text += ';if(typeof module!=="undefined"&&module.exports)module.exports=d;r.' + global_name + '=d;})(globalThis);'
    (OUT / name).write_text(text, encoding='utf-8')

def check_array(actual, expected, label, tolerance=1e-10):
    a, b = np.asarray(actual), np.asarray(expected)
    if a.shape != b.shape:
        raise AssertionError(label + ': shape differs')
    scale = max(float(np.max(np.abs(b))), 1e-300)
    error = float(np.max(np.abs(a-b))) / scale
    if not np.isfinite(error) or error > tolerance:
        raise AssertionError(f'{label}: relative error {error}')
    return error

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stability', action='store_true', help='Recompute all 2400-state eigenvalue spectra; slower')
    args = parser.parse_args()
    OUT.mkdir(exist_ok=True)
    manifest = json.loads((ROOT/'data/SOURCES.json').read_text())
    for name, digest in manifest['inputs'].items():
        assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest() == digest, name
    print('Inputs verified; rebuilding 600-cell mechanics', flush=True)
    g = H.prepare(600, True)
    old = read_js(ROOT/'cochlea-data.js')
    arrays = dict(M=g['G'].T+np.diag(g['mass']), C=25*g['Sh'].T+np.diag(g['h']),
                  x=g['x']*.0335, k=g['k'], h=g['h']*g['lam'], ws2=g['wm']**2,
                  gamma=g['gamma'], source=g['Gs'])
    errors = {}
    generated = dict(n=600, length=.0335, computationalLength=.0335, visible=600, gains=[0,.56,1.12,.8])
    for key, a in arrays.items():
        expected = np.frombuffer(base64.b64decode(old[key]), dtype='<f8')
        errors[key] = check_array(a.ravel(), expected, key)
        generated[key] = base64.b64encode(np.asarray(a, dtype='<f8').tobytes()).decode()
    # Default verifies mechanics without pretending to independently validate poles.
    generated['stability'] = old['stability']
    if args.stability:
        generated['stability'] = []
        for gain in generated['gains']:
            print(f'Recomputing eigenvalues at activity {gain}', flush=True)
            pole = H.stability(g, gain)
            expected = next(p for p in old['stability'] if p['activity'] == gain)
            assert pole['unstable'] == expected['unstable']
            assert abs(pole['maxReal']-expected['maxReal']) < 1e-4*max(1,abs(expected['maxReal']))
            generated['stability'].append(dict(activity=gain, **pole))
    write_js('cochlea-data.js', generated, 'CochleaData')
    x = arrays['x']; L = .0335; edges = np.r_[0,x]
    bw = np.loadtxt(H.BASE/'bmw_man.mat'); width = H.spline(bw[:,0],bw[:,1],x/L)/2*L
    m = H.mat4(H.BASE/'man_data.mat')
    def area(side):
        xp, yp = m['x'+side],m['y'+side]
        idx = np.clip(np.searchsorted(xp,edges/L,side='right')-1,0,len(xp)-2)
        return (np.pi/2*((yp[:-1]+yp[1:])/2)**2*L**2)[idx]
    fluid = dict(x=edges.tolist(),sweptArea=(width*np.diff(edges)).tolist(),svArea=area('p').tolist(),stArea=area('m').tolist())
    old_fluid = read_js(ROOT/'fluid-geometry.js')
    for k,v in fluid.items(): errors['fluid.'+k] = check_array(v,old_fluid[k],k)
    write_js('fluid-geometry.js', fluid, 'CochleaFluidGeometry')
    source = ROOT/'data/human-middle-ear-source.csv'
    with source.open(newline='',encoding='utf-8-sig') as f:
        rows = [r for r in csv.DictReader(f) if r['Group']=='Human' and r['Ossicle']=='Stapes']
    specimens = sorted({r['Specimen'] for r in rows})
    assert specimens == ['TB18','TB19','TB20'] and len(rows)==144
    curves = [np.array(sorted((float(r['Freq_x']),float(r['Mag_y']),float(r['Phase_y'])) for r in rows if r['Specimen']==sp)) for sp in specimens]
    assert all(np.array_equal(a[:,0],curves[0][:,0]) for a in curves)
    mag = np.array([a[:,1] for a in curves])*1e-3
    assert np.all(mag>0)
    phase = np.array([np.unwrap(a[:,2]*2*np.pi)/(2*np.pi) for a in curves])
    human = dict(source='https://doi.org/10.1371/journal.pone.0298535.s009',license='CC BY 4.0',
        citation="O'Connell-Rodwell et al. (2024), PLOS ONE 19(4): e0298535; S2 Data; human stapes only",
        sha256=hashlib.sha256(source.read_bytes()).hexdigest(), specimens=specimens,
        aggregation='geometric mean magnitude; arithmetic mean unwrapped phase; equal specimen weight',
        frequencyHz=curves[0][:,0].tolist(),velocityMPerSPa=np.exp(np.mean(np.log(mag),axis=0)).tolist(),
        phaseCycles=np.mean(phase,axis=0).tolist(),minVelocityMPerSPa=mag.min(axis=0).tolist(),maxVelocityMPerSPa=mag.max(axis=0).tolist())
    old_human = read_js(ROOT/'human-input-data.js')
    for k in ['frequencyHz','velocityMPerSPa','phaseCycles','minVelocityMPerSPa','maxVelocityMPerSPa']:
        errors['human.'+k] = check_array(human[k],old_human[k],k)
    assert human['sha256']==old_human['sha256']
    write_js('human-input-data.js',human,'HumanInputData')
    specs = [('research/school-b-restored/fixtures.json',[0,.56,1.12],[50,61,100,1000,16000,20000],1),
             ('research/absolute-amplitudes-2026-10-06/calibrated-fixtures.json',[0,.8],[50,100,1000,5000,10998.047,16000,20000],2.86/(4*np.pi))]
    for name,gains,freqs,ratio in specs:
        print('Recomputing '+name,flush=True)
        baseline = json.loads((ROOT/name).read_text()); output=[]
        assert len(baseline)==len(gains)*len(freqs)
        for gain in gains:
            for freq in freqs:
                q,residual = H.solve({**g,'Gs':g['Gs']*ratio},freq,gain)
                expected = next(c for c in baseline if c['frequency']==freq and c['activity']==gain)
                errors[f'{name}:{freq}:{gain}'] = check_array(q,np.array(expected['real'])+1j*np.array(expected['imag']),'complex response',1e-8)
                assert residual<1e-12
                output.append(dict(frequency=freq,activity=gain,real=q.real.tolist(),imag=q.imag.tolist(),residual=residual))
        dest=OUT/name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(output),encoding='utf-8')
    report=dict(numpy=np.__version__,maxRelativeError=max(errors.values()),checks=errors,
                stability='independently recomputed' if args.stability else 'copied baseline metadata; NOT independently checked')
    (OUT/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({k:report[k] for k in ['numpy','maxRelativeError','stability']}),flush=True)

if __name__=='__main__': main()
