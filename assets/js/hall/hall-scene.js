(function(global){
 'use strict';
 function create(T,scene,M,box){
  const root=new T.Group();root.name='ArdayPublicHall';root.position.set(-5.18,0,0);scene.add(root);
  const standard=(color,metalness=.55,roughness=.3)=>new T.MeshStandardMaterial({color,metalness,roughness});
  const titanium=standard(0x9baab5,.78,.27),silver=standard(0xd4dce0,.72,.22),graphite=standard(0x27323d,.68,.34),dark=standard(0x101b28,.55,.42),floorMat=standard(0x758591,.7,.24),floorInset=standard(0x344451,.72,.3);
  const cyan=new T.MeshStandardMaterial({color:0x6bd9e8,emissive:0x168ba4,emissiveIntensity:.8,metalness:.35,roughness:.24});
  const paleGlow=new T.MeshBasicMaterial({color:0xd7fbff,toneMapped:false});
  const glass=new T.MeshPhysicalMaterial({color:0x9de6f0,metalness:.25,roughness:.12,transparent:true,opacity:.32,depthWrite:false,side:T.DoubleSide});
  const matteWhite=standard(0xc5d0d7,.35,.52);
  const hallAmbient=new T.HemisphereLight(0xbde8f1,0x182737,1.05);hallAmbient.position.set(-20,24,0);root.add(hallAmbient);
  const hallKey=new T.DirectionalLight(0xd9f5ff,1.35);hallKey.position.set(-8,26,12);hallKey.castShadow=true;root.add(hallKey);
  const cyanFill=new T.PointLight(0x57d5e8,18,52,1.8);cyanFill.position.set(-20,17,0);root.add(cyanFill);
  const whiteFill=new T.PointLight(0xd9f1ff,12,38,1.7);whiteFill.position.set(-20,8,-12);root.add(whiteFill);
  const floor=new T.Mesh(new T.PlaneGeometry(108,108),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(-20,-.18,0);floor.receiveShadow=true;floor.name='hall-walkable-ground';floor.userData.hallFloor=true;root.add(floor);
  const floorGrid=new T.Group();floorGrid.position.set(-20,-.165,0);root.add(floorGrid);
  for(let i=-50;i<=50;i+=5){
   const a=new T.Mesh(new T.PlaneGeometry(.025,100),floorInset);a.rotation.x=-Math.PI/2;a.position.set(i,.005,0);floorGrid.add(a);
   const b=new T.Mesh(new T.PlaneGeometry(100,.025),floorInset);b.rotation.x=-Math.PI/2;b.position.set(0,.005,i);floorGrid.add(b);
  }
  function ring(parent,radius,tube,y,material){const mesh=new T.Mesh(new T.TorusGeometry(radius,tube,8,144),material);mesh.rotation.x=Math.PI/2;mesh.position.y=y;parent.add(mesh);return mesh}
  [-.12,-.105,-.09].forEach((y,i)=>ring(root,8.8+i*.22,.025,y,i===1?cyan:silver));
  [-.1,-.1].forEach((y,i)=>ring(root,19.5+i*1.15,.045,y,i?cyan:titanium));
  const background=document.createElement('canvas');background.width=2048;background.height=1024;
  const bctx=background.getContext('2d'),gradient=bctx.createLinearGradient(0,0,0,1024);
  gradient.addColorStop(0,'#07111f');gradient.addColorStop(.48,'#172c40');gradient.addColorStop(.78,'#31485b');gradient.addColorStop(1,'#101e2d');bctx.fillStyle=gradient;bctx.fillRect(0,0,2048,1024);
  let seed=90317;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<1800;i++){const x=rand()*2048,y=rand()*1024,r=.35+rand()*1.2;bctx.fillStyle='rgba(180,225,245,'+(.12+rand()*.45)+')';bctx.beginPath();bctx.arc(x,y,r,0,Math.PI*2);bctx.fill()}
  for(let i=0;i<90;i++){const x=i*24+(i%3)*8,w=8+rand()*22,h=60+rand()*280;bctx.fillStyle=i%4?'rgba(66,110,140,.24)':'rgba(105,164,190,.2)';bctx.fillRect(x,850-h,w,h)}
  const bgTex=new T.CanvasTexture(background);bgTex.encoding=T.sRGBEncoding;
  const sky=new T.Mesh(new T.SphereGeometry(145,48,28),new T.MeshBasicMaterial({map:bgTex,side:T.BackSide,depthWrite:false}));sky.position.set(-20,18,0);sky.renderOrder=-8;root.add(sky);
  const ceiling=new T.Group();ceiling.position.set(-20,0,0);root.add(ceiling);
  // Two elevated observation decks create the scale of a multi-storey transit concourse.
  [8,14].forEach((height,index)=>{
   const deck=new T.Mesh(new T.RingGeometry(29,34,128),index===0?titanium:graphite);deck.rotation.x=-Math.PI/2;deck.position.set(-20,height,0);deck.receiveShadow=true;root.add(deck);
   ring(root,29,.11,height+.28,silver);ring(root,34,.09,height+.28,cyan);
   const rail=new T.Mesh(new T.TorusGeometry(31.5,.055,8,128),glass);rail.rotation.x=Math.PI/2;rail.position.set(-20,height+1.15,0);root.add(rail);
   for(let i=0;i<32;i++){const a=i*Math.PI/16,x=Math.cos(a),z=Math.sin(a);const post=box(root,-20+x*31.5,height+.65,z*31.5,.07,1.3,.07,silver);post.rotation.y=-a}
  });
  [14,20,28,39].forEach((r,i)=>ring(ceiling,r,i===3?.34:.16,24-i*.25,i%2?graphite:silver));
  for(let i=0;i<24;i++){
   const a=i*Math.PI/12,x=Math.cos(a),z=Math.sin(a);
   const pillar=box(ceiling,x*45,12,z*45,1.15,24,1.15,graphite);pillar.rotation.y=-a;
   const spine=box(ceiling,x*45,12,z*45,.12,23.5,.12,cyan);spine.rotation.y=-a;
   const brace=box(ceiling,x*31,23.2,z*31,1.1,.42,14,titanium);brace.rotation.y=-a;
   const strip=box(ceiling,x*31,23.48,z*31,.09,.045,13.2,paleGlow);strip.rotation.y=-a;
  }
  for(let i=0;i<48;i++){
   const a=i*Math.PI/24,x=Math.cos(a),z=Math.sin(a);
   const panel=box(ceiling,x*24,25.2,z*24,5.8,.22,1.6,i%3===0?silver:graphite);panel.rotation.y=-a;
   const light=box(ceiling,x*24,25.34,z*24,4.5,.035,.11,paleGlow);light.rotation.y=-a;
  }
  const core=new T.Group();core.position.set(-20,0,0);root.add(core);
  const coreBase=new T.Mesh(new T.CylinderGeometry(8.8,9.8,.34,96),graphite);coreBase.position.y=.03;core.add(coreBase);
  const coreInset=new T.Mesh(new T.CylinderGeometry(7.9,7.9,.035,96),silver);coreInset.position.y=.22;core.add(coreInset);
  const coreRing=ring(core,6.9,.055,.27,cyan);
  const beacon=new T.Mesh(new T.CylinderGeometry(.16,.28,5.5,24),new T.MeshStandardMaterial({color:0x7be5f2,emissive:0x1b91ac,emissiveIntensity:1.2,transparent:true,opacity:.52,metalness:.4,roughness:.2}));beacon.position.y=3.0;core.add(beacon);
  const beaconCap=new T.Mesh(new T.SphereGeometry(.48,24,16),paleGlow);beaconCap.position.y=5.85;core.add(beaconCap);
  const centralHalo=ring(core,2.4,.055,5.2,cyan);
  const pathMat=standard(0x8295a4,.62,.3);
  function pathBetween(x1,z1,x2,z2,width=2.5){const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),mesh=new T.Mesh(new T.PlaneGeometry(width,len),pathMat);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=-Math.atan2(dx,dz);mesh.position.set((x1+x2)/2,-.085,(z1+z2)/2);root.add(mesh);return mesh}
  const zones=[
   {id:'exchange',name:'兑换区',sub:'RMB EXCHANGE',x:-39,z:-7,color:0x75dce9},
   {id:'ranking',name:'排行区',sub:'RANKING MATRIX',x:-20,z:-29,color:0xa9c5db},
   {id:'recruitment',name:'招募区',sub:'RECRUITMENT',x:-1,z:-16,color:0x91c9d8},
   {id:'commissions',name:'委托区',sub:'CONTRACT TERMINAL',x:1,z:1,color:0x7bd9e5},
   {id:'teams',name:'组队区',sub:'SQUAD ASSEMBLY',x:-1,z:18,color:0x8db7df},
   {id:'entertainment',name:'娱乐区',sub:'SIMULATION DECK',x:-20,z:29,color:0x8e9ee6},
   {id:'food',name:'美食区',sub:'FOOD & SUPPLY',x:-39,z:15,color:0xe0b68c}
  ];
  function labelTexture(title,sub){
   const canvas=document.createElement('canvas');canvas.width=768;canvas.height=224;const c=canvas.getContext('2d');
   c.clearRect(0,0,768,224);c.fillStyle='rgba(8,23,37,.88)';c.fillRect(8,8,752,208);c.strokeStyle='#78d9e8';c.lineWidth=5;c.strokeRect(12,12,744,200);
   c.fillStyle='#effaff';c.textAlign='center';c.textBaseline='middle';c.font='bold 68px sans-serif';c.fillText(title,384,92);
   c.fillStyle='#82c9d9';c.font='26px sans-serif';c.fillText(sub,384,165);
   const tex=new T.CanvasTexture(canvas);tex.encoding=T.sRGBEncoding;return tex;
  }
  const zoneObjects=[];
  zones.forEach((z,index)=>{
   pathBetween(-20,0,z.x,z.z,2.4);
   const station=new T.Group();station.position.set(z.x,0,z.z);station.rotation.y=Math.atan2(-20-z.x,-z.z);station.userData.hallAction=z.id;station.name='hall-zone-'+z.id;root.add(station);
   const platform=new T.Mesh(new T.CylinderGeometry(3.35,3.6,.34,48),graphite);platform.position.y=.08;station.add(platform);
   const platformTop=new T.Mesh(new T.CylinderGeometry(3.12,3.12,.045,48),silver);platformTop.position.y=.27;station.add(platformTop);
   ring(station,2.8,.045,.31,cyan);
   const spine=box(station,0,2.0,-1.25,3.8,3.25,.48,graphite);spine.rotation.x=-.08;
   box(station,0,2.08,-1.52,3.35,2.75,.09,silver);
   const display=new T.Mesh(new T.PlaneGeometry(2.8,1.8),new T.MeshBasicMaterial({color:z.color,transparent:true,opacity:.22,side:T.DoubleSide,toneMapped:false}));display.position.set(0,2.18,-1.45);station.add(display);
   const frame=box(station,0,3.72,-1.5,3.9,.13,.6,silver);
   for(const x of [-1.95,1.95]){
    box(station,x,2.1,-1.48,.14,3.65,.72,graphite);
    box(station,x,2.1,-1.1,.055,3.35,.055,cyan);
    const cap=new T.Mesh(new T.SphereGeometry(.13,12,10),paleGlow);cap.position.set(x,4.0,-1.5);station.add(cap);
   }
   const sign=new T.Mesh(new T.PlaneGeometry(3.55,1.03),new T.MeshBasicMaterial({map:labelTexture(z.name,z.sub),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));sign.position.set(0,4.45,-1.12);station.add(sign);
   box(station,0,.66,.95,2.9,.12,.78,graphite);
   if(z.id==='exchange'){
    for(const x of [-.82,0,.82]){const terminal=box(station,x,1.2,.82,.58,.88,.42,silver);terminal.rotation.z=-.08;box(station,x,1.35,.59,.46,.48,.035,cyan)}
    box(station,0,2.0,.95,2.65,.07,.08,paleGlow);
   }else if(z.id==='ranking'){
    for(let i=0;i<3;i++){const x=(i-1)*.72,h=[.85,1.45,1.05][i];box(station,x,.32+h/2,.94,.55,h,.52,i===1?silver:titanium);box(station,x,.34+h,.94,.38,.045,.36,cyan)}
   }else if(z.id==='recruitment'){
    const ringMesh=new T.Mesh(new T.TorusGeometry(.92,.07,12,48),cyan);ringMesh.position.set(0,2.0,.8);station.add(ringMesh);
    const console=box(station,0,1.1,.8,1.9,.68,.55,silver);box(station,0,1.28,.49,1.62,.34,.035,cyan);
   }else if(z.id==='commissions'){
    for(let i=0;i<3;i++){const panel=box(station,-.82+i*.82,1.55,.8,.68,1.15,.12,i===1?silver:titanium);box(station,-.82+i*.82,1.7,.72,.48,.72,.035,cyan)}
   }else if(z.id==='teams'){
    for(let i=0;i<4;i++){const a=i*Math.PI/2;const pod=box(station,Math.cos(a)*1.25,.82,Math.sin(a)*1.25,.78,.9,.78,titanium);pod.rotation.y=-a}
    const table=new T.Mesh(new T.CylinderGeometry(.82,.82,.12,32),silver);table.position.y=1.35;station.add(table);ring(station,.72,.035,1.44,cyan);
   }else if(z.id==='entertainment'){
    for(const x of [-1.15,0,1.15]){box(station,x,1.25,.84,.72,1.55,.5,graphite);box(station,x,1.42,.56,.58,.82,.04,cyan);box(station,x,.52,.55,.55,.12,.05,silver)}
   }else if(z.id==='food'){
    const counter=box(station,0,1.0,.8,2.55,.78,.72,silver);box(station,0,1.43,.43,2.45,.055,.12,cyan);
    for(const x of [-.82,0,.82]){const tray=new T.Mesh(new T.CylinderGeometry(.24,.24,.12,20),titanium);tray.position.set(x,1.49,.82);station.add(tray)}
   }
   zoneObjects.push(station);
  });
  // Apartment transit portal: a clean architectural threshold, not a wooden doorway.
  const portal=new T.Group();portal.position.set(0,0,0);portal.rotation.y=-Math.PI/2;portal.userData.roomTarget='living';portal.name='hall-home-portal';root.add(portal);
  const portalFrame=box(portal,0,1.85,0,3.25,3.7,.5,graphite);
  box(portal,0,1.85,.27,2.75,3.25,.08,glass);
  for(const x of [-1.48,1.48])box(portal,x,1.85,.34,.055,3.25,.06,cyan);
  const portalText=new T.Mesh(new T.PlaneGeometry(2.2,.42),new T.MeshBasicMaterial({map:labelTexture('返回居所','RESIDENTIAL GATE'),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));portalText.position.set(0,4.05,.38);portal.add(portalText);
  const boundary=new T.Group();boundary.position.set(-20,0,0);root.add(boundary);
  for(let i=0;i<48;i++){const a=i*Math.PI/24,x=Math.cos(a),z=Math.sin(a);const p=box(boundary,x*49,10,z*49,1.2,20,1.2,graphite);p.rotation.y=-a;const line=box(boundary,x*49,10.2,z*49,.09,19,.09,cyan);line.rotation.y=-a}
  return {group:root,zones,zoneObjects,ground:floor,center:{x:-25.18,z:0},spawn:{x:-6.4,z:0},radius:42};
 }
 global.ArdayHallScene={create};
})(window);
