const fmt=n=>Math.round(n*1000)/1000;
const point=p=>`${fmt(p[0])} ${fmt(p[1])}`;
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
export function segmentIntersection(a,b,c,d,includeEnds=false){
  const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],q=[c[0]-a[0],c[1]-a[1]],den=cross(r,s);
  if(Math.abs(den)<1e-9)return null;
  const t=cross(q,s)/den,u=cross(q,r)/den;
  if(includeEnds?(t< -1e-7||t>1+1e-7||u< -1e-7||u>1+1e-7):(t<=1e-7||t>=1-1e-7||u<=1e-7||u>=1-1e-7))return null;
  return {t,u,point:[a[0]+t*r[0],a[1]+t*r[1]]};
}
// Actual polyline segments, never endpoint chords; intersections do not alter connectivity.
export function createCrossingPainter(limit=100000){
  const previous=[];let checks=0,limited=false;
  return {get limited(){return limited;},path(points){
    if(!points?.length)return "";
    const distances=[0],segments=[];
    for(let i=1;i<points.length;i++){const length=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);segments.push({a:points[i-1],b:points[i],start:distances.at(-1),length});distances.push(distances.at(-1)+length);}
    const total=distances.at(-1),hits=[];
    for(const s of segments)for(const old of previous){
      if(++checks>limit){limited=true;break;}
      const hit=segmentIntersection(s.a,s.b,old.a,old.b,true);if(!hit)continue;
      const distance=s.start+hit.t*s.length,other=old.start+hit.u*old.length;
      if(distance>1e-7&&distance<total-1e-7&&other>1e-7&&other<old.total-1e-7)hits.push(distance);
    }
    const at=distance=>{const s=segments.find(s=>s.length&&distance<=s.start+s.length+1e-7);return s?s.a.map((v,i)=>v+(s.b[i]-v)*(distance-s.start)/s.length):points.at(-1);};
    let d=`M${point(points[0])}`,drawn=0,last=-Infinity;
    for(const distance of hits.sort((a,b)=>a-b)){
      const radius=Math.min(4,distance/2,(total-distance)/2);if(radius<.5||distance-last<radius*2+1)continue;
      for(let i=1;i<points.length;i++)if(distances[i]>drawn&&distances[i]<distance-radius)d+=` L${point(points[i])}`;
      d+=` L${point(at(distance-radius))} A${fmt(radius)} ${fmt(radius)} 0 0 1 ${point(at(distance+radius))}`;drawn=distance+radius;last=distance;
    }
    for(let i=1;i<points.length;i++)if(distances[i]>drawn)d+=` L${point(points[i])}`;
    previous.push(...segments.map(s=>({...s,total})));return d;
  }};
}
