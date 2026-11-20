(function(global){
 'use strict';
 function create(T,scene,M,box){
  const root=new T.Group();root.name='ArdayPublicHall';root.position.set(-5.18,0,0);scene.add(root);
  const mat=(color,metalness=.62,roughness=.32)=>new T.MeshStandardMaterial({color,metalness,roughness});
  const titanium=mat(0x9eabb4,.82,.25),silver=mat(0xd1dce1,.76,.22),graphite=mat(0x263440,.72,.34),dark=mat(0x111e2a,.6,.42),floorMat=mat(0x667783,.72,.3),floorDark=mat(0x344550,.72,.34),cyan=new T.MeshStandardMaterial({color:0x70ddeb,emissive:0x137d96,emissiveIntensity:.65,metalness:.4,roughness:.25}),whiteGlow=new T.MeshBasicMaterial({color:0xd9faff,toneMapped:false}),glass=new T.MeshPhysicalMaterial({color:0x9de6f0,metalness:.25,roughness:.13,transparent:true,opacity:.27,depthWrite:false,side:T.DoubleSide});
  const ambient=new T.HemisphereLight(0xc2e9f1,0x172737,.92);ambient.position.set(-20,28,0);root.add(ambient);
  const key=new T.DirectionalLight(0xe1f6ff,1.12);key.position.set(-8,30,12);key.castShadow=true;root.add(key);
  const fill=new T.PointLight(0x57d5e8,20,95,1.7);fill.position.set(-18,17,-4);root.add(fill);
  const floor=new T.Mesh(new T.PlaneGeometry(260,220),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(-20,-.18,0);floor.receiveShadow=true;floor.name='hall-walkable-ground';floor.userData.hallFloor=true;root.add(floor);
  // A broad, continuous architectural floor: irregular inlays replace the old circular arena.
  const inlays=new T.Group();root.add(inlays);
  for(let x=-145;x<=105;x+=10){const line=new T.Mesh(new T.PlaneGeometry(.035,210),floorDark);line.rotation.x=-Math.PI/2;line.position.set(x,-.165,0);inlays.add(line)}
  for(let z=-100;z<=100;z+=10){const line=new T.Mesh(new T.PlaneGeometry(250,.035),floorDark);line.rotation.x=-Math.PI/2;line.position.set(-20,-.164,z);inlays.add(line)}
  function polygon(parent,points,y,material){
   const shape=new T.Shape();shape.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)shape.lineTo(points[i][0],points[i][1]);shape.closePath();
   const mesh=new T.Mesh(new T.ShapeGeometry(shape),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function strip(x1,z1,x2,z2,width,material){
   const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);
   const mesh=new T.Mesh(new T.PlaneGeometry(width,len),material);mesh.rotation.set(-Math.PI/2,0,-angle);mesh.position.set((x1+x2)/2,-.105,(z1+z2)/2);root.add(mesh);return mesh;
  }
  // High, non-concentric megastructure ceiling with offset trusses and long suspended ribs.
  const ceiling=new T.Group();ceiling.position.set(-20,0,0);root.add(ceiling);
  for(let i=0;i<9;i++){
   const x=-112+i*23;
   const beam=box(ceiling,x,28,0,1.1,.8,190,i%2?silver:graphite);beam.rotation.z=(i%2?-.035:.035);
   const light=box(ceiling,x,27.55,0,.13,.08,176,whiteGlow);
  }
  for(let i=0;i<11;i++){
   const z=-92+i*18;
   box(ceiling,0,29,z,230,.7,.85,graphite);
   box(ceiling,0,29.42,z,210,.08,.12,cyan);
  }
  for(let i=0;i<18;i++){
   const x=-125+i*12.8,z=(i%2?1:-1)*78;
   const p=box(ceiling,x,13.8,z,2.2,28,2.2,graphite);
   box(ceiling,x,14,z,.18,27.5,.18,cyan);
  }
  // Distant starfield and abstract, non-readable silhouettes suggest the hall continuing beyond sight.
  const bg=document.createElement('canvas');bg.width=2048;bg.height=1024;const ctx=bg.getContext('2d'),grad=ctx.createLinearGradient(0,0,0,1024);
  grad.addColorStop(0,'#07111f');grad.addColorStop(.52,'#172c40');grad.addColorStop(1,'#263c4e');ctx.fillStyle=grad;ctx.fillRect(0,0,2048,1024);
  let seed=90317;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<2200;i++){ctx.fillStyle='rgba(180,225,245,'+(.1+rand()*.38)+')';ctx.beginPath();ctx.arc(rand()*2048,rand()*1024,.3+rand()*1.2,0,Math.PI*2);ctx.fill()}
  for(let i=0;i<70;i++){const x=i*30,w=8+rand()*35,h=80+rand()*380;ctx.fillStyle='rgba(75,125,155,.2)';ctx.fillRect(x,900-h,w,h)}
  const tex=new T.CanvasTexture(bg);tex.encoding=T.sRGBEncoding;const sky=new T.Mesh(new T.SphereGeometry(290,64,36),new T.MeshBasicMaterial({map:tex,side:T.BackSide,depthWrite:false}));sky.position.set(-20,20,0);sky.renderOrder=-8;root.add(sky);
  function labelTexture(title,sub){
   const c=document.createElement('canvas');c.width=768;c.height=224;const g=c.getContext('2d');g.fillStyle='rgba(8,23,37,.9)';g.fillRect(8,8,752,208);g.strokeStyle='#78d9e8';g.lineWidth=4;g.strokeRect(12,12,744,200);g.fillStyle='#effaff';g.textAlign='center';g.textBaseline='middle';g.font='bold 66px sans-serif';g.fillText(title,384,88);g.fillStyle='#82c9d9';g.font='25px sans-serif';g.fillText(sub,384,163);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;
  }
  const zones=[
   {id:'exchange',name:'兑换区',sub:'RMB EXCHANGE',x:-102,z:-18,w:34,d:30,color:0x75dce9,shape:[[-18,-12],[12,-15],[19,-3],[15,13],[-10,16],[-21,4]]},
   {id:'ranking',name:'排行区',sub:'RANKING MATRIX',x:-55,z:-66,w:32,d:28,color:0xa9c5db,shape:[[-17,-11],[8,-16],[19,-5],[13,14],[-13,13],[-20,1]]},
   {id:'recruitment',name:'招募区',sub:'RECRUITMENT',x:0,z:-75,w:38,d:32,color:0x91c9d8,shape:[[-19,-13],[12,-16],[22,-2],[14,16],[-12,14],[-22,0]]},
   {id:'commissions',name:'委托区',sub:'CONTRACT TERMINAL',x:70,z:-44,w:38,d:32,color:0x7bd9e5,shape:[[-21,-13],[13,-16],[22,-4],[17,14],[-12,17],[-23,2]]},
   {id:'teams',name:'组队区',sub:'SQUAD ASSEMBLY',x:78,z:30,w:40,d:34,color:0x8db7df,shape:[[-22,-14],[12,-17],[24,-2],[16,16],[-14,18],[-24,1]]},
   {id:'entertainment',name:'娱乐区',sub:'SIMULATION DECK',x:5,z:62,w:42,d:36,color:0x8e9ee6,shape:[[-23,-14],[13,-18],[24,-3],[17,18],[-14,18],[-25,1]]},
   {id:'food',name:'美食区',sub:'FOOD & SUPPLY',x:-65,z:48,w:38,d:32,color:0xe0b68c,shape:[[-20,-12],[11,-16],[22,-2],[16,16],[-12,16],[-23,2]]}
  ];
  const zoneObjects=[];
  zones.forEach((z,index)=>{
   const area=new T.Group();area.position.set(z.x,0,z.z);area.userData.hallAction=z.id;area.name='hall-district-'+z.id;root.add(area);
   // Each district is an irregular, walkable neighborhood with a wide footprint, not a round pedestal.
   polygon(area,z.shape,.012,index%2?floorMat:floorDark);
   const outlinePoints=z.shape.map(p=>new T.Vector3(p[0],.035,p[1]));
   const outline=new T.LineLoop(new T.BufferGeometry().setFromPoints(outlinePoints),new T.LineBasicMaterial({color:0x5fc8d8,transparent:true,opacity:.36}));area.add(outline);
   const centerPanel=new T.Mesh(new T.PlaneGeometry(z.w*.68,z.d*.58),mat(0x526572,.72,.38));centerPanel.rotation.x=-Math.PI/2;centerPanel.position.set(0,.026,0);area.add(centerPanel);
   for(let i=-2;i<=2;i++){const seam=new T.Mesh(new T.PlaneGeometry(.045,z.d*.52),cyan);seam.rotation.x=-Math.PI/2;seam.position.set(i*z.w*.115,.045,0);area.add(seam)}
   // Architectural service spine and canopy are offset to one side, leaving the plaza open.
   const spineX=-z.w*.24,spineZ=-z.d*.17;
   const spine=box(area,spineX,4.5,spineZ,z.w*.72,8.2,1.25,graphite);
   box(area,spineX,4.6,spineZ+.68,z.w*.67,7.4,.12,silver);
   const screen=new T.Mesh(new T.PlaneGeometry(z.w*.58,5.5),new T.MeshBasicMaterial({color:z.color,transparent:true,opacity:.2,side:T.DoubleSide,toneMapped:false}));screen.position.set(spineX,4.7,spineZ+.755);area.add(screen);
   box(area,spineX,8.85,spineZ,z.w*.78,.32,1.65,titanium);
   for(const side of [-1,1]){const px=spineX+side*z.w*.38;box(area,px,4.1,spineZ,.42,8.2,1.5,graphite);box(area,px,4.1,spineZ+.82,.09,7.8,.08,cyan)}
   const sign=new T.Mesh(new T.PlaneGeometry(z.w*.58,2.25),new T.MeshBasicMaterial({map:labelTexture(z.name,z.sub),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));sign.position.set(spineX,10.25,spineZ+.9);area.add(sign);
   // A small set of recognizable service objects anchors each broad district.
   if(z.id==='exchange'){
    for(let i=0;i<5;i++){const x=-8+i*4;box(area,x,1.05,5,.9,1.55,.72,silver);box(area,x,1.2,4.6,.7,.82,.04,cyan)}
   }else if(z.id==='ranking'){
    for(let i=0;i<3;i++){const x=(i-1)*3.2,h=[1.1,2.0,1.45][i];box(area,x,.4+h/2,4,.95,h,.8,i===1?silver:titanium)}
   }else if(z.id==='recruitment'){
    for(let i=0;i<4;i++){const x=-6+i*4;box(area,x,1.4,4,1.8,2.1,.8,graphite);box(area,x,1.55,3.55,1.5,1.15,.04,cyan)}
   }else if(z.id==='commissions'){
    for(let i=0;i<4;i++){const x=-7+i*4.6;box(area,x,1.8,4,.18,3.2,.5,silver);box(area,x,1.85,3.7,2.7,2.3,.04,cyan)}
   }else if(z.id==='teams'){
    for(let i=0;i<4;i++){const x=-7+i*4.7;box(area,x,.85,5,3.2,1.25,2.2,titanium);box(area,x,1.0,4.0,2.7,.45,.05,cyan)}
   }else if(z.id==='entertainment'){
    for(let i=0;i<4;i++){const x=-8+i*5.3;box(area,x,1.25,5,2.1,2.4,1.5,graphite);box(area,x,1.45,4.2,1.7,1.3,.05,cyan)}
   }else if(z.id==='food'){
    for(let i=0;i<4;i++){const x=-7+i*4.7;box(area,x,1.05,4,3.4,1.35,2.0,silver);box(area,x,1.8,4,3.4,.18,2.0,graphite)}
   }
   // Districts connect through broad, angled promenades with irregular junctions.
   const junction={x:-20,z:0};
   strip(junction.x,junction.z,z.x,z.z,9.5,floorDark);
   strip(junction.x,junction.z,z.x,z.z,1.15,cyan);
   zoneObjects.push(area);
  });
  // Additional cross-links form an open-ended network rather than seven spokes around a ring.
  [[-102,-18,-55,-66],[-55,-66,0,-75],[0,-75,70,-44],[70,-44,78,30],[78,30,5,62],[5,62,-65,48],[-65,48,-102,-18],[-55,-66,5,62],[0,-75,78,30]].forEach((p,i)=>strip(p[0],p[1],p[2],p[3],i%3===0?7:5,floorDark));
  // Residential gate is an architectural threshold placed at the arrival edge.
  const portal=new T.Group();portal.position.set(-20,0,0);portal.rotation.y=-Math.PI/2;portal.userData.roomTarget='living';portal.name='hall-home-portal';root.add(portal);
  box(portal,0,2.1,0,4.2,4.2,.65,graphite);box(portal,0,2.1,.36,3.45,3.65,.08,glass);
  for(const x of [-1.9,1.9])box(portal,x,2.1,.43,.075,3.7,.07,cyan);
  const gateText=new T.Mesh(new T.PlaneGeometry(2.9,.48),new T.MeshBasicMaterial({map:labelTexture('返回居所','RESIDENTIAL GATE'),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));gateText.position.set(0,4.55,.48);portal.add(gateText);
  // The playable floor continues far beyond the visible districts; no fence or circular boundary is shown.
  return {group:root,zones,zoneObjects,ground:floor,center:{x:-25.18,z:0},spawn:{x:-9.8,z:0},radius:108};
 }
 global.ArdayHallScene={create};
})(window);
