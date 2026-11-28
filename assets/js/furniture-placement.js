(function(global){
 'use strict';
 function corners(item,x=item.group.position.x,z=item.group.position.z,angle=item.group.rotation.y){
  const co=Math.cos(angle),si=Math.sin(angle),hx=item.width/2,hz=item.depth/2;
  return [[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(([lx,lz])=>[x+lx*co+lz*si,z-lx*si+lz*co]);
 }
 function footprintParts(item,x=item.group.position.x,z=item.group.position.z,angle=item.group.rotation.y){
  const scaleX=Math.abs(Number(item.group?.scale?.x)||1),scaleZ=Math.abs(Number(item.group?.scale?.z)||1),co=Math.cos(angle),si=Math.sin(angle);
  const source=Array.isArray(item.collisionParts)&&item.collisionParts.length?item.collisionParts:[[
   [-item.width/2,-item.depth/2],[item.width/2,-item.depth/2],[item.width/2,item.depth/2],[-item.width/2,item.depth/2]
  ]];
  return source.map(part=>part.map(([lx,lz])=>{lx*=scaleX;lz*=scaleZ;return [x+lx*co+lz*si,z-lx*si+lz*co]}));
 }
 function rectsOverlap(a,b,tolerance=.12){
  const axes=[];
  for(const polygon of [a,b])for(let i=0;i<polygon.length;i++){
   const p=polygon[i],q=polygon[(i+1)%polygon.length],dx=q[0]-p[0],dz=q[1]-p[1],len=Math.hypot(dx,dz)||1;
   axes.push([-dz/len,dx/len]);
  }
  for(const [ax,az] of axes){
   const pa=a.map(p=>p[0]*ax+p[1]*az),pb=b.map(p=>p[0]*ax+p[1]*az);
   if(Math.max(...pa)<=Math.min(...pb)+tolerance||Math.max(...pb)<=Math.min(...pa)+tolerance)return false;
  }
  return true;
 }
 function footprintsOverlap(partsA,partsB,tolerance=.12){
  return partsA.some(a=>partsB.some(b=>rectsOverlap(a,b,tolerance)));
 }
 function canPlaceFurniture(item,x,z,angle,registry,bounds,canPlaceOnWall){
  if(item.wallAxis){
   const side=item.wallSide||'back',value=side==='back'||side==='front'?x:z;
   return canPlaceOnWall(item,side,value);
  }
  const parts=footprintParts(item,x,z,angle);
  if(parts.some(polygon=>polygon.some(([px,pz])=>px<bounds.minX||px>bounds.maxX||pz<bounds.minZ||pz>bounds.maxZ)))return false;
  for(const other of registry){
   if(other===item||other.room!==item.room||other.wallAxis)continue;
   // A tabletop object is elevated above floor furniture. 2D footprint overlap
   // with chair legs, cabinet bases, or the table apron is not a collision.
   // Only other objects resting on a tabletop compete for the same surface area.
   if(item.surfaceType==='tabletop'&&other.surfaceType!=='tabletop')continue;
   if(other.surfaceType==='tabletop'&&item.surfaceType!=='tabletop')continue;
   // Rugs are decorative floor coverings, not physical obstacles or support platforms.
   if(item.surfaceType==='rug'||other.surfaceType==='rug')continue;
   if(item.supportId===other.id||other.supportId===item.id)continue;
   if(footprintsOverlap(parts,footprintParts(other)))return false;
  }
  if(item.supportId){
   const support=registry.find(x=>x.id===item.supportId);
   if(!support)return false;
   const co=Math.cos(support.group.rotation.y),si=Math.sin(support.group.rotation.y);
   const supportedVertices=parts.flatMap(part=>part);
   const localCorners=supportedVertices.map(([px,pz])=>{const wx=px-support.group.position.x,wz=pz-support.group.position.z;return [wx*co-wz*si,wx*si+wz*co]});
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
 function scanFloorPositions(item,registry,bounds,canPlace,preferredAngle=item.group.rotation.y){
  const angles=[preferredAngle,preferredAngle+Math.PI/2,preferredAngle+Math.PI,preferredAngle+Math.PI*1.5],step=Math.max(.22,Math.min(.42,Math.min(item.width,item.depth)*.42)),points=[];
  for(let z=bounds.minZ+item.depth/2;z<=bounds.maxZ-item.depth/2+.001;z+=step)for(let x=bounds.minX+item.width/2;x<=bounds.maxX-item.width/2+.001;x+=step)points.push([x,z]);
  points.sort((a,b)=>Math.hypot(a[0],a[1])-Math.hypot(b[0],b[1]));
  for(const angle of angles)for(const [x,z] of points)if(canPlace(item,x,z,angle))return {x,z,angle};
  return null;
 }
 function scanWallPositions(item,sides,canPlaceOnWall,step=.22){
  for(const side of sides){
   const limit=(side==='back'||side==='front'?5:3.65)-(Number(item.width)||.35)/2,offsets=[];
   for(let n=0;n<=Math.ceil(limit/step);n++){const v=n*step;if(v<=limit){offsets.push(v);if(v)offsets.push(-v)}}
   for(const offset of offsets)if(canPlaceOnWall(item,side,offset))return {side,offset};
  }return null;
 }
 global.ArdayFurniturePlacement={corners,footprintParts,rectsOverlap,footprintsOverlap,canPlaceFurniture,rugCandidates,scanFloorPositions,scanWallPositions};
})(window);
