"""Read-only NumPy translation of Nobili/Mammano human MATLAB revision 1997.
A preserves equations including g0 typo; B repairs ONLY lower helicotrema term.
Fresh matrices; no PROP cache. No MATLAB execution equivalence claimed.
"""
from pathlib import Path
import struct
import numpy as np
BASE=Path(__file__).resolve().parents[1]/'data/historical'
def mat4(path):
 data=path.read_bytes();out={};pos=0
 while pos<len(data):
  typ,nr,nc,imag,nlen=struct.unpack_from('<5i',data,pos);pos+=20
  if typ!=0 or imag:raise ValueError('unsupported MAT4 record')
  name=data[pos:pos+nlen].rstrip(b'\0').decode();pos+=nlen
  out[name]=np.frombuffer(data,dtype='<f8',count=nr*nc,offset=pos).copy().reshape((nr,nc),order='F').ravel();pos+=nr*nc*8
 return out

def spline(x,y,X):
 # MATLAB spline: not-a-knot cubic, with source's endpoint extensions.
 x=np.asarray(x);y=np.asarray(y);X=np.asarray(X);order=np.argsort(x);x=x[order];y=y[order]
 if X[0]<x[0]:y=np.r_[y[0]+(X[0]-x[0])*(y[1]-y[0])/(x[1]-x[0]),y];x=np.r_[X[0],x]
 if X[-1]>x[-1]:y=np.r_[y,y[-1]+(X[-1]-x[-1])*(y[-1]-y[-2])/(x[-1]-x[-2])];x=np.r_[x,X[-1]]
 n=len(x);h=np.diff(x);a=np.zeros((n,n));r=np.zeros(n)
 a[0,:3]=[-h[1],h[0]+h[1],-h[0]];a[-1,-3:]=[-h[-1],h[-2]+h[-1],-h[-2]]
 for j in range(1,n-1):a[j,j-1:j+2]=[h[j-1],2*(h[j-1]+h[j]),h[j]];r[j]=6*((y[j+1]-y[j])/h[j]-(y[j]-y[j-1])/h[j-1])
 m=np.linalg.solve(a,r);i=np.clip(np.searchsorted(x,X)-1,0,n-2);t=(X-x[i])/h[i];s=1-t
 return s*y[i]+t*y[i+1]+h[i]**2/6*((s**3-s)*m[i]+(t**3-t)*m[i+1])

def psigma(x,b,r):
 xb=x/b;xr=x/r;sb=np.sqrt(1+xb**2);sr=np.sqrt(1+xr**2)
 # Evaluate source expression at nonzero quadrature boundaries.
 return ((xr*xr+xb*xb+np.log((abs(xb)+sb)/(abs(xr)+sr)))*np.sign(x)-xr*sr-xb*(sb+np.log((sb-1)/(sb+1))))/(2*np.pi)

def prepare(n=300,corrected=False):
 dx=np.exp(1.5*np.arange(1,n+1)/n);dx/=dx.sum();x=np.cumsum(dx);x[-1]=min(x[-1],1.);dx=np.diff(np.r_[0,x]);c=(x+np.r_[0,x[:-1]])/2
 data=mat4(BASE/'man_data.mat');bw=np.loadtxt(BASE/'bmw_man.mat');b=spline(bw[:,0],bw[:,1],x)/2
 xp,yp,xm,ym=[data[k] for k in ('xp','yp','xm','ym')];sp=np.pi/2*((yp[:-1]+yp[1:])/2)**2;sm=np.pi/2*((ym[:-1]+ym[1:])/2)**2
 ip=np.zeros(len(xp));im=np.zeros(len(xm));ip[-1]=np.pi/2*yp[-1]/sp[-1]
 if corrected:im[-1]=np.pi/2*ym[-1]/sm[-1]
 else:ip[len(xm)-1]=np.pi/2*ym[-1]/sm[-1]
 for j in range(len(xp)-2,-1,-1):ip[j]=ip[j+1]+(xp[j+1]-xp[j])/sp[j]
 for j in range(len(xm)-2,-1,-1):im[j]=im[j+1]+(xm[j+1]-xm[j])/sm[j]
 gs=spline(xp,ip,x)+spline(xm,im,x);coarse=gs[np.maximum.outer(np.arange(n),np.arange(n))]
 radius=(spline(xp,yp,c)+spline(xm,ym,c))/2
 P=np.column_stack([psigma(x-c[j],b[j],radius[j])-psigma(np.r_[0,x[:-1]]-c[j],b[j],radius[j]) for j in range(n)])
 G=(coarse*dx[:,None]+P)*(.0376*b[:,None]*b[None,:]);Gs=.0376*np.pi*(2/33.5)**2*b*gs
 inv=1/dx;D=np.diag(inv);dl=np.diag(inv[:-1],1)-D;dr=np.diag(inv[1:],-1)-D
 micron=29.85e-6;height=40*micron*4**x;width=50*micron*4**x;s=1e-3/29.85*width*height;Sh=dl@np.diag(s)@dr
 mass=.0376*height*b;mass=(mass+np.r_[mass[0],mass[:-1]])/2
 exponent=-3.6*np.log(10);k=2000*np.exp(exponent*x);k=np.diff(np.r_[2000,k])/(exponent*dx)
 h=.01*4**(-x);h=(h+np.r_[h[0],h[:-1]])/2
 tm_mass=.0376*(15*micron*4**x)*(70*micron*4**x);gamma=.004*4**x/tm_mass;wm=2*np.pi*18000*(60/18000)**x
 return dict(x=x,dx=dx,G=G,Gs=Gs,Sh=Sh,mass=mass,k=k,h=h,gamma=gamma,wm=wm,lam=np.exp(.025*x+.15*(x-.35)**2))

def solve(g,f,activity=0.):
 w=2*np.pi*f;res=-1j*w*g['gamma']/(g['wm']**2-w*w+1j*w*g['gamma'])
 K=g['G']+25/(1j*w)*g['Sh']+np.diag(g['mass']-g['k']/w**2-1j*g['h']/w-activity*1j*g['h']/w*g['lam']*res)
 # MATLAB row right-division: transpose, NOT conjugate transpose.
 rhs=-g['Gs'];q=np.linalg.solve(K.T,rhs)
 residual=np.linalg.norm(K.T@q-rhs)/max(np.linalg.norm(K)*np.linalg.norm(q)+np.linalg.norm(rhs),1e-300)
 return q,float(residual) # divided by source Ampl=1e-3: true displacement ratio

def state_system(g,activity):
 n=len(g['x']);I=np.eye(n);M=g['G'].T+np.diag(g['mass']);C=25*g['Sh'].T+np.diag(g['h']);a=np.zeros((4*n,4*n));a[:n,n:2*n]=I;a[2*n:3*n,3*n:]=I
 acc=np.zeros((n,4*n));acc[:,:n]=-np.linalg.solve(M,np.diag(g['k']));acc[:,n:2*n]=-np.linalg.solve(M,C);acc[:,2*n:3*n]=-np.linalg.solve(M,np.diag(activity*g['h']*g['lam']*g['gamma']))
 a[n:2*n]=acc;a[3*n:]=-acc;a[3*n:,2*n:3*n]-=np.diag(g['wm']**2);a[3*n:,3*n:]-=np.diag(g['gamma'])
 scales=np.r_[g['wm'],np.ones(n),g['wm'],np.ones(n)];a=scales[:,None]*a/scales[None,:]
 source=np.linalg.solve(M,g['Gs']);forcing=np.r_[np.zeros(n),source,np.zeros(n),-source]*scales
 return a,forcing,scales

def stability(g,activity):
 a,_,_=state_system(g,activity);p=np.linalg.eigvals(a)
 return dict(maxReal=float(p.real.max()),unstable=int(sum(p.real>=0)))
