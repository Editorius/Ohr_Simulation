"""Export dimensional BM parameters from the verified historical model (not raw measurements)."""
import base64, json
from pathlib import Path
import numpy as np
import historical_1997 as H
ROOT=Path(__file__).resolve().parents[1]
g=H.prepare(600, True)
s=(ROOT/'cochlea-data.js').read_text(encoding='utf-8')
d=json.loads(s.split('const d=',1)[1].split(';if(typeof module',1)[0])
for key,value in [('M',g['G'].T+np.diag(g['mass'])),('k',g['k']),('x',g['x']*.0335)]:
    expected=np.frombuffer(base64.b64decode(d[key]),dtype='<f8')
    assert np.max(np.abs(value.ravel()-expected))/np.max(np.abs(expected))<1e-10,key
profiles={'source':'Nobili/Mammano 1997, corrected human model; scripts/historical_1997.py',
          'referenceLengthMm':1,
          'units':{'massKgPer1mm':'kg','stiffnessNPerMPer1mm':'N/m'},
          'massKgPer1mm':(g['mass']*.001/.0335).tolist(),
          'stiffnessNPerMPer1mm':(g['k']*.001/.0335).tolist(),
          'xMm':(g['x']*33.5).tolist(), 'massRelative':(g['mass']/g['mass'][0]).tolist(),
          'stiffnessRelative':(g['k']/g['k'][0]).tolist()}
text='(function(r){const d='+json.dumps(profiles,separators=(',',':'))+';if(typeof module!=="undefined"&&module.exports)module.exports=d;r.LearningProfiles=d;})(globalThis);'
(ROOT/'learning-profiles.js').write_text(text,encoding='utf-8')
print('600 profiles exported; original mass matrix, stiffness and positions verified.')
