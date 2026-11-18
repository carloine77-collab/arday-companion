(function(global){
 'use strict';
 function corners(item,x=item.group.position.x,z=item.group.position.z,angle=item.group.rotation.y){
  const co=Math.cos(angle),si=Math.sin(angle),hx=item.width/2,hz=item.depth/2;
  return [[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(([lx,lz])=>[x+lx*co+lz*si,z-lx*si+lz*co]);
 }
 function rectsOverlap(a,b){
  const axes=[];
  for(const poly of [a,b])for(let i=0;i<4;i++){
   const p=poly[i],q=poly[(i+1)%4],dx=q[0]-p[0],dz=q[1]-p[1],len=Math.hypot(dx,dz)||1;
   axes.push([-dz/len,dx/len]);
  }
  for(const [ax,az] of axes){
   const pa=a.map(p=>p[0]*ax+p[1]*az),pb=b.map(p=>p[0]*ax+p[1]*az);
   if(Math.max(...pa)<=Math.min(...pb)+.025||Math.max(...pb)<=Math.min(...pa)+.025)return false;
  }
  return true;
 }
 function canPlaceFurniture(item,x,z,angle,registry,bounds,canPlaceOnWall){
  if(item.wallAxis){
   const side=item.wallSide||'back',value=side==='back'||side==='front'?x:z;
   return canPlaceOnWall(item,side,value);
  }
  const poly=corners(item,x,z,angle);
  if(poly.some(([px,pz])=>px<bounds.minX||px>bounds.maxX||pz<bounds.minZ||pz>bounds.maxZ))return false;
  for(const other of registry){
   if(other===item||other.room!==item.room||other.wallAxis)continue;
   // Rugs are decorative floor coverings, not physical obstacles or support platforms.
   if(item.surfaceType==='rug'||other.surfaceType==='rug')continue;
   if(item.supportId===other.id||other.supportId===item.id)continue;
   if(rectsOverlap(poly,corners(other)))return false;
  }
  if(item.supportId){
   const support=registry.find(x=>x.id===item.supportId);
   if(!support)return false;
   const co=Math.cos(support.group.rotation.y),si=Math.sin(support.group.rotation.y);
   const localCorners=poly.map(([px,pz])=>{const wx=px-support.group.position.x,wz=pz-support.group.position.z;return [wx*co-wz*si,wx*si+wz*co]});
   const maxX=Math.max(...localCorners.map(v=>Math.abs(v[0]))),maxZ=Math.max(...localCorners.map(v=>Math.abs(v[1])));
   const supportMargin=item.surfaceType==='tabletop'?.018:.08;
   if(!item.allowSupportOverlap&&(maxX>support.width/2-supportMargin||maxZ>support.depth/2-supportMargin))return false;
  }
  return true;
 }
 function rugCandidates(rug){
  if(!rug)return [];
  const offsets=[[0,0],[0,-.95],[0,.95],[-1.05,0],[1.05,0],[-.9,-.72],[.9,-.72],[-.9,.72],[.9,.72],[0,-.55],[0,.55]];
  return offsets.map(([x,z])=>[rug.group.position.x+x,rug.group.position.z+z]);
 }
 global.ArdayFurniturePlacement={corners,rectsOverlap,canPlaceFurniture,rugCandidates};
})(window);
