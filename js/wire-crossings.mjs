const fmt=n=>Math.round(n*1000)/1000;
const point=p=>`${fmt(p[0])} ${fmt(p[1])}`;
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
export function segmentIntersection(a,b,c,d){
  const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],q=[c[0]-a[0],c[1]-a[1]],den=cross(r,s);
  if(Math.abs(den)<1e-9)return null;
  const t=cross(q,s)/den,u=cross(q,r)/den;
  if(t<=1e-7||t>=1-1e-7||u<=1e-7||u>=1-1e-7)return null;
  return {t,u,point:[a[0]+t*r[0],a[1]+t*r[1]]};
}
// Actual polyline segments, never endpoint chords; intersections do not alter connectivity.
export function createCrossingPainter(limit=100000){
  const previous=[];let checks=0,limited=false;
  return {get limited(){return limited;},path(points){
    if(!points?.length)return "";
    let d=`M${point(points[0])}`;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),hits=[];
      if(length>0)for(const [c,e] of previous){if(++checks>limit){limited=true;break;}const hit=segmentIntersection(a,b,c,e);if(hit)hits.push(hit.t*length);}
      let last=-Infinity;
      for(const distance of hits.sort((a,b)=>a-b)){
        const radius=Math.min(4,distance/2,(length-distance)/2);
        if(radius<.5||distance-last<radius*2+1)continue;
        const at=s=>[a[0]+(b[0]-a[0])*s/length,a[1]+(b[1]-a[1])*s/length];
        d+=` L${point(at(distance-radius))} A${fmt(radius)} ${fmt(radius)} 0 0 1 ${point(at(distance+radius))}`;last=distance;
      }
      d+=` L${point(b)}`;
    }
    previous.push(...points.slice(1).map((p,i)=>[points[i],p]));return d;
  }};
}
