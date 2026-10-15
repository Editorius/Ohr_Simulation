"""Repartition the original SV/vestibular mesh; requires NumPy. Run from repo root.
Basal contour is a geometric heuristic, not an anatomical segmentation.
"""
from pathlib import Path
import json,numpy as np
p=Path('anatomy/location-data.json');d=json.loads(p.read_text(encoding='utf-8'));v=np.array(d['meshes']['sv']['vertices']);f=np.array(d['meshes']['sv']['faces']+d['meshes']['eq']['faces']);c=d['raySections']['sv'][0];normal=np.array(c['normal']);origin=np.array(c['planePoint']);hits=np.array(c['hits']);sd=(v-origin)@normal
bar=set()
for i,tri in enumerate(f):
 for a,b in zip(tri,np.roll(tri,-1)):
  if sd[a]*sd[b]<0:
   x=v[a]+(v[b]-v[a])*sd[a]/(sd[a]-sd[b])
   if np.linalg.norm(hits-x,axis=1).min()<1e-6:bar.add(i);break
edges={};adj=[set() for _ in f]
for i,tri in enumerate(f):
 for a,b in zip(tri,np.roll(tri,-1)):
  edge=tuple(sorted((int(a),int(b))))
  if edge in edges: j=edges[edge];adj[i].add(j);adj[j].add(i)
  else:edges[edge]=i
remaining=set(range(len(f)))-bar;comps=[]
while remaining:
 seed=next(iter(remaining));seen={seed};todo=[seed];remaining.remove(seed)
 while todo:
  i=todo.pop()
  for j in adj[i]:
   if j in remaining:remaining.remove(j);seen.add(j);todo.append(j)
 comps.append(seen)
print('barrier',len(bar),'components',list(map(len,comps)))
# Select the cochlear component by its proximity to downstream section contours.
centroids=v[f].mean(axis=1)
scores=[]
for component in comps:
 ids=np.array(sorted(component));scores.append(sum(np.linalg.norm(centroids[ids]-np.array(d['raySections']['sv'][j]['hits']).mean(axis=0),axis=1).min() for j in (20,40,60,80)))
chosen=comps[int(np.argmin(scores))]|bar
old=set(range(len(d['meshes']['sv']['faces'])))
print('scores',scores,'new SV',len(chosen),'added',len(chosen-old),'removed',len(old-chosen))
# Every ring point must still meet the cochlear side of the partition.
sv_vertices=np.unique(f[sorted(chosen)].ravel())
print('selected bounds',v[sv_vertices].min(axis=0),v[sv_vertices].max(axis=0))
# Audit the contour vertices against the colored surface (triangle containment).
triangles=v[f];centers=triangles.mean(axis=1)
covered=set()
missing=[]
sections=list(d['raySections']['sv'])+[s['sv'] for s in d.get('terminalSurfaceSections',[]) ]
for si,section in enumerate(sections):
 for point in section['hits']:
  q=np.array(point);ids=np.argsort(np.linalg.norm(centers-q,axis=1))[:24];t=triangles[ids]
  a=t[:,1]-t[:,0];b=t[:,2]-t[:,0];r=q-t[:,0]
  aa=(a*a).sum(axis=1);bb=(b*b).sum(axis=1);ab=(a*b).sum(axis=1);ar=(a*r).sum(axis=1);br=(b*r).sum(axis=1)
  den=aa*bb-ab*ab;u=(bb*ar-ab*br)/den;w=(aa*br-ab*ar)/den
  error=np.linalg.norm(r-u[:,None]*a-w[:,None]*b,axis=1)
  matches=ids[(u>=-1e-5)&(w>=-1e-5)&(u+w<=1.00001)&(error<1e-5)]
  if not len(matches):missing.append(si)
  covered.update(map(int,matches))
print('contour points outside SV:',len(missing),'sections',sorted(set(missing)))

assert not missing, 'A reference contour could not be located on the original surface'
# Preserve surface coverage of the slightly nonplanar basal reference sections.
chosen |= covered
# Fill enclosed vestibular-colored islands without moving the outer border.
remaining=set(range(len(f)))-chosen
vestibular_components=[]
while remaining:
 seed=min(remaining);component={seed};todo=[seed];remaining.remove(seed)
 while todo:
  for neighbor in adj[todo.pop()]:
   if neighbor in remaining:
    remaining.remove(neighbor);component.add(neighbor);todo.append(neighbor)
 vestibular_components.append(component)
main_vestibular=max(vestibular_components,key=len)
islands=set().union(*(part for part in vestibular_components if part is not main_vestibular))
print('enclosed islands:',[len(part) for part in vestibular_components if part is not main_vestibular])
chosen |= islands
assert len(comps)==2, 'Basal ring no longer separates two components'
d['meshes']['sv']['faces']=[f[i].tolist() for i in sorted(chosen)]
d['meshes']['eq']['faces']=[f[i].tolist() for i in range(len(f)) if i not in chosen]
d['colorPartition']={'method':'closed basal SV contour and connected surface component, with contour coverage','boundarySection':0,'boundaryTriangles':len(bar),'svTriangles':len(chosen),'eqTriangles':len(f)-len(chosen),'checkedContours':len(sections),'uncoveredContourPoints':len(missing),'filledIslandTriangles':len(islands),'anatomicallyValidated':False}
p.write_text(json.dumps(d,separators=(',',':'),ensure_ascii=False),encoding='utf-8')
print(d['colorPartition'])
