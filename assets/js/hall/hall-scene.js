(function(global){
 'use strict';
 function create(T,scene,M,box){
  const root=new T.Group();root.name='ArdayPublicHall';root.position.set(-5.18,0,0);scene.add(root);
  const mat=(c,m=.68,r=.32)=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:r});
  const addCylinder=(parent,x,y,z,rt,rb,h,material,segments=16)=>{const o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,segments),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
  const addTorus=(parent,x,y,z,r,t,material)=>{const o=new T.Mesh(new T.TorusGeometry(r,t,10,56),material);o.position.set(x,y,z);parent.add(o);return o};
  const titanium=mat(0x9eabb4,.82,.25),silver=mat(0xd1dce1,.76,.22),graphite=mat(0x263440,.72,.34),dark=mat(0x111e2a,.6,.42),floorMat=mat(0x667783,.72,.3),floorDark=mat(0x344550,.72,.34),cyan=new T.MeshStandardMaterial({color:0x70ddeb,emissive:0x137d96,emissiveIntensity:.55,metalness:.4,roughness:.25}),whiteGlow=new T.MeshBasicMaterial({color:0xd9faff,toneMapped:false}),glass=new T.MeshPhysicalMaterial({color:0x9de6f0,metalness:.25,roughness:.13,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide});
  root.add(new T.HemisphereLight(0xc2e9f1,0x172737,.82));
  const key=new T.DirectionalLight(0xe1f6ff,.92);key.position.set(-30,75,35);key.castShadow=true;root.add(key);
  const fill=new T.PointLight(0x57d5e8,32,220,1.7);fill.position.set(-50,35,-20);root.add(fill);
  // A vast continuous floor; districts are embedded in its geography rather than isolated platforms.
  const floor=new T.Mesh(new T.PlaneGeometry(780,680),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(-20,-.18,0);floor.receiveShadow=true;floor.name='hall-walkable-ground';floor.userData.hallFloor=true;root.add(floor);
  // Sparse, low-contrast construction seams preserve scale without turning the plaza into a dense grid.
  for(let x=-380;x<=340;x+=30){const line=new T.Mesh(new T.PlaneGeometry(.035,660),floorDark);line.rotation.x=-Math.PI/2;line.position.set(x,-.165,0);root.add(line)}
  for(let z=-330;z<=330;z+=30){const line=new T.Mesh(new T.PlaneGeometry(760,.035),floorDark);line.rotation.x=-Math.PI/2;line.position.set(-20,-.164,z);root.add(line)}
  function polygon(parent,points,y,material){const s=new T.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();const o=new T.Mesh(new T.ShapeGeometry(s),material);o.rotation.x=-Math.PI/2;o.position.y=y;o.receiveShadow=true;parent.add(o);return o}
  function strip(x1,z1,x2,z2,width,material){const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),o=new T.Mesh(new T.PlaneGeometry(width,len),material);o.rotation.set(-Math.PI/2,0,-angle);o.position.set((x1+x2)/2,-.105,(z1+z2)/2);root.add(o);return o}
  // Open-air public forum: a monumental perimeter colonnade encloses the plaza.
  // There is deliberately no indoor ceiling or interior column grid; the sky remains visible.
  const perimeter=new T.Group();perimeter.name='hall-outdoor-perimeter-colonnade';perimeter.scale.set(1.25,1,1.25);root.add(perimeter);
  const columnMat=[silver,titanium,graphite],warmMetal=mat(0xb68a55,.78,.24),paleStone=mat(0xd9d0bd,.42,.42);
  const amber=new T.MeshStandardMaterial({color:0xffbd68,emissive:0x9b4d12,emissiveIntensity:.48,metalness:.36,roughness:.28});
  const violet=new T.MeshStandardMaterial({color:0x9b83d8,emissive:0x49318b,emissiveIntensity:.42,metalness:.42,roughness:.25});
  const coral=new T.MeshStandardMaterial({color:0xd97865,emissive:0x6f251c,emissiveIntensity:.25,metalness:.24,roughness:.38});
  const jade=new T.MeshStandardMaterial({color:0x78aa91,emissive:0x1b503c,emissiveIntensity:.2,metalness:.22,roughness:.38});
  const ivory=mat(0xe7dfcf,.36,.38),copper=mat(0x9d6548,.8,.28),plum=mat(0x51415f,.58,.32);
  const addColumn=(x,z,index)=>{
   const g=new T.Group();g.position.set(x,0,z);perimeter.add(g);
   const h=54+(index%4)*3.5,base=5.8,shaftR=index%3===0?2.45:2.05;
   const cyl=(rTop,rBottom,height,y,material,segments=12)=>{const o=new T.Mesh(new T.CylinderGeometry(rTop,rBottom,height,segments),material);o.position.y=y;o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
   cyl(3.8,4.6,2.1,1.05,graphite,8);cyl(3.1,3.8,1.2,2.7,warmMetal,8);
   cyl(shaftR,shaftR*1.3,h-7,base+(h-7)/2,index%4===0?paleStone:columnMat[index%3],10);
   cyl(shaftR+1.05,shaftR+1.05,1.4,h-5.5,titanium,8);
   cyl(3.0,3.0,2.0,h-2.8,graphite,8);
   // Four fluted ribs and a warm inset light make each support legible at a distance.
   for(let k=0;k<4;k++){const a=k*Math.PI/2,fin=new T.Mesh(new T.BoxGeometry(.34,h-10,.48),k%2?silver:warmMetal);fin.position.set(Math.cos(a)*(shaftR+.12),h/2,Math.sin(a)*(shaftR+.12));fin.rotation.y=-a;g.add(fin)}
   const light=new T.Mesh(new T.BoxGeometry(.18,h-13,.2),index%3===0?amber:index%3===1?cyan:violet);light.position.set(shaftR+.34,h/2,0);g.add(light);
   const cap=new T.Mesh(new T.TorusGeometry(3.2,.16,8,32),index%2?amber:cyan);cap.rotation.x=Math.PI/2;cap.position.y=h-1.4;g.add(cap);
   return h;
  };
  let pillarIndex=0;
  // Four long sides; corner spacing is tightened to create a continuous civic enclosure.
  for(let i=0;i<=15;i++){const x=-312+i*39;addColumn(x,-248,pillarIndex++);addColumn(x,248,pillarIndex++)}
  for(let i=1;i<13;i++){const z=-248+i*38.15;addColumn(-312,z,pillarIndex++);addColumn(273,z,pillarIndex++)}
  // The perimeter has a broken, elevated crown beam, not a roof: large openings remain to the sky.
  const beam=(x,y,z,w,h,d,material)=>box(perimeter,x,y,z,w,h,d,material);
  for(let i=0;i<15;i++){
   const x=-292+i*39;
   beam(x,59,-248,34,.9,1.8,i%2?graphite:titanium);
   beam(x,59,248,34,.9,1.8,i%2?titanium:graphite);
   beam(x,60,-248,29,.12,.16,i%2?amber:cyan);
   beam(x,60,248,29,.12,.16,i%2?cyan:amber);
  }
  for(let i=0;i<12;i++){
   const z=-229+i*38.15;
   beam(-312,59,z,1.8,.9,32,graphite);beam(273,59,z,1.8,.9,32,titanium);
  }
  // A second, intermittent structural tier gives the colonnade depth without roofing over the plaza.
  for(let i=0;i<15;i+=2){
   const x=-292+i*39;
   beam(x,36,-246,30,.72,1.25,i%4===0?warmMetal:graphite);
   beam(x,36,246,30,.72,1.25,i%4===0?graphite:titanium);
   // Suspended luminaires hang below the crown beams at selected bays.
   for(const z of [-246,246]){
    const stem=box(perimeter,x,53,z, .28,5.2,.28,warmMetal);
    const housing=box(perimeter,x,49.8,z,3.8,.72,2.8,graphite);
    const lens=box(perimeter,x,49.35,z,2.7,.12,1.8,i%4===0?amber:cyan);
   }
  }
  for(let i=0;i<12;i+=2){
   const z=-229+i*38.15;
   beam(-310,36,z,1.25,.72,27,i%4===0?warmMetal:graphite);
   beam(271,36,z,1.25,.72,27,i%4===0?graphite:titanium);
   for(const x of [-310,271]){
    box(perimeter,x,53,z,.28,5.2,.28,warmMetal);
    box(perimeter,x,49.8,z,2.8,.72,3.8,graphite);
    box(perimeter,x,49.35,z,1.8,.12,2.7,i%4===0?amber:cyan);
   }
  }
  // Short diagonal braces articulate selected bays; they remain outside the open central volume.
  for(let i=0;i<15;i+=3){
   const x=-292+i*39;
   const brace=box(perimeter,x+15,43,-248,18,.62,.9,silver);brace.rotation.z=-.34;
   const brace2=box(perimeter,x+15,43,248,18,.62,.9,warmMetal);brace2.rotation.z=.34;
  }
  // Four monumental gateways punctuate the colonnade and orient visitors toward the plaza.
  const gateway=(x,z,rot,accent)=>{
   const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;perimeter.add(g);
   box(g,-8,25,0,2.8,50,3.2,graphite);box(g,8,25,0,2.8,50,3.2,titanium);
   box(g,0,51,0,21,3.2,4.2,warmMetal);box(g,0,52.9,0,17,.22,4.35,accent);
   for(let i=-2;i<=2;i++){const fin=box(g,i*3.4,27,1.9,.42,43,.28,i%2?silver:accent);fin.rotation.z=(i%2)*.025}
   const disc=new T.Mesh(new T.TorusGeometry(5,.28,10,48),accent);disc.position.set(0,43,2.2);g.add(disc);
  };
  gateway(-20,-248,0,amber);gateway(-20,248,Math.PI,coral);gateway(-312,0,Math.PI/2,violet);gateway(273,0,-Math.PI/2,jade);
  // Low edge lights and occasional public benches soften the monumental perimeter.
  for(let i=0;i<28;i++){
   const a=i/28*Math.PI*2,x=-20+292*Math.cos(a),z=248*Math.sin(a);
   const lamp=new T.Mesh(new T.CylinderGeometry(.22,.42,2.2,8),warmMetal);lamp.position.set(x,1.1,z);perimeter.add(lamp);
   const glow=new T.Mesh(new T.SphereGeometry(.42,10,8),i%3===0?amber:i%3===1?violet:cyan);glow.position.set(x,2.35,z);perimeter.add(glow);
  }
  // Distant architectural backdrop, deliberately beyond the playable boundary.
  const bg=document.createElement('canvas');bg.width=2048;bg.height=1024;const ctx=bg.getContext('2d'),grad=ctx.createLinearGradient(0,0,0,1024);grad.addColorStop(0,'#07111f');grad.addColorStop(.52,'#172c40');grad.addColorStop(1,'#263c4e');ctx.fillStyle=grad;ctx.fillRect(0,0,2048,1024);
  let seed=90317;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<2600;i++){ctx.fillStyle='rgba(180,225,245,'+(.08+rand()*.32)+')';ctx.beginPath();ctx.arc(rand()*2048,rand()*1024,.3+rand()*1.2,0,Math.PI*2);ctx.fill()}
  for(let i=0;i<90;i++){const x=i*24,w=8+rand()*36,h=120+rand()*420;ctx.fillStyle='rgba(75,125,155,.24)';ctx.fillRect(x,930-h,w,h)}
  const tex=new T.CanvasTexture(bg);tex.encoding=T.sRGBEncoding;const sky=new T.Mesh(new T.SphereGeometry(920,64,36),new T.MeshBasicMaterial({map:tex,side:T.BackSide,depthWrite:false}));sky.position.set(-20,24,0);sky.renderOrder=-8;root.add(sky);
  // Central civic landmark: a navigational astrolabe, not another service district.
  // Its layered orbital frame is visible above the surrounding architecture and readable from the home portal.
  const core=new T.Group();core.name='hall-central-kinetic-core';core.position.set(18,0,0);root.add(core);
  const coreBase=new T.Mesh(new T.CylinderGeometry(25,28,1.5,16),graphite);coreBase.position.y=.45;coreBase.receiveShadow=true;core.add(coreBase);
  const baseRim=new T.Mesh(new T.TorusGeometry(25,.55,12,112),warmMetal);baseRim.rotation.x=Math.PI/2;baseRim.position.y=1.25;core.add(baseRim);
  // Removed the nested inner ring: the landmark reads as one broad civic plinth, not a stack of circles.
  const coreInset=new T.Mesh(new T.CylinderGeometry(18,18,.28,16),silver);coreInset.position.y=1.25;core.add(coreInset);
  // Eight separated pylons support a floating orbital instrument; the open gaps keep the plaza visually permeable.
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,x=Math.cos(a)*15,z=Math.sin(a)*15;
   const foot=new T.Mesh(new T.CylinderGeometry(1.7,2.6,1.1,8),graphite);foot.position.set(x,2,z);core.add(foot);
   const p=new T.Mesh(new T.CylinderGeometry(.62,1.25,13,8),i%2?copper:titanium);p.position.set(x,8.5,z);p.rotation.z=Math.cos(a)*-.12;p.rotation.x=Math.sin(a)*.12;core.add(p);
   const collar=new T.Mesh(new T.TorusGeometry(1.25,.16,8,32),i%2?amber:cyan);collar.position.set(x,14.5,z);core.add(collar);
  }
  const coreSpire=new T.Mesh(new T.CylinderGeometry(1.8,4.8,30,12),silver);coreSpire.position.y=17;coreSpire.castShadow=true;core.add(coreSpire);
  const coreDark=new T.Mesh(new T.CylinderGeometry(2.05,2.05,17,12),graphite);coreDark.position.y=17;core.add(coreDark);
  const coreOrb=new T.Mesh(new T.IcosahedronGeometry(5.4,2),new T.MeshPhysicalMaterial({color:0xc4edf0,metalness:.48,roughness:.12,emissive:0x286b7c,emissiveIntensity:.72,transparent:true,opacity:.94}));coreOrb.position.y=33;coreOrb.castShadow=true;core.add(coreOrb);
  // Three differently inclined orbital bands make the landmark legible in silhouette from every approach.
  for(let i=0;i<3;i++){
   const ring=new T.Mesh(new T.TorusGeometry(12+i*5,.34-i*.045,12,112),i===1?warmMetal:i===2?violet:cyan);
   ring.position.y=31+i*4.2;ring.rotation.set(Math.PI/2+(i-1)*.42,0,(i-1)*.58);core.add(ring);
  }
  // The orbital silhouette is kept to the three principal inclined bands; redundant rings removed.
  // Seven luminous constellation nodes form a floating wayfinding halo above the core.
  const constellation=[];
  for(let i=0;i<7;i++){
   const a=-Math.PI/2+i*Math.PI*2/7,x=Math.cos(a)*34,z=Math.sin(a)*34,y=39+(i%2)*4;
   const node=new T.Mesh(new T.OctahedronGeometry(1.8,1),[amber,coral,jade,violet,cyan,warmMetal,silver][i]);node.position.set(x,y,z);core.add(node);const stem=new T.Mesh(new T.CylinderGeometry(.08,.08,9,6),whiteGlow);stem.position.set(x,y-5,z);core.add(stem);
   constellation.push(new T.Vector3(x,y,z));
  }
  for(let i=0;i<7;i++){
   const pts=[constellation[i],constellation[(i+1)%7],new T.Vector3(0,30,0),constellation[(i+3)%7]];
   const geo=new T.BufferGeometry().setFromPoints(pts);
   core.add(new T.Line(geo,new T.LineBasicMaterial({color:i%2?0x8bcbd8:0xd8b78b,transparent:true,opacity:.62})));
  }
  for(let i=0;i<7;i++){
   const a=-Math.PI/2+i*Math.PI*2/7;
   const ray=new T.Mesh(new T.BoxGeometry(.22,13,.22),i%2?cyan:amber);ray.position.set(Math.cos(a)*9,23,Math.sin(a)*9);ray.rotation.z=.22*Math.cos(a);ray.rotation.x=.22*Math.sin(a);core.add(ray);
  }
  const coreLight=new T.PointLight(0x7bd9e8,25,110,1.8);coreLight.position.set(18,29,0);root.add(coreLight);
  function labelTexture(title,sub){const c=document.createElement('canvas');c.width=768;c.height=224;const g=c.getContext('2d');g.fillStyle='rgba(8,23,37,.88)';g.fillRect(8,8,752,208);g.strokeStyle='#78d9e8';g.lineWidth=4;g.strokeRect(12,12,744,200);g.fillStyle='#effaff';g.textAlign='center';g.textBaseline='middle';g.font='bold 66px sans-serif';g.fillText(title,384,88);g.fillStyle='#82c9d9';g.font='25px sans-serif';g.fillText(sub,384,163);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
  const zones=[

   {id:'exchange',name:'兑换区',sub:'RMB EXCHANGE',x:-118,z:-48,w:118,d:100,shape:[[-60,-40],[28,-54],[69,-18],[62,34],[8,55],[-53,38],[-73,-3]]},
   {id:'ranking',name:'排行区',sub:'RANKING MATRIX',x:-55,z:-125,w:108,d:96,shape:[[-52,-38],[31,-50],[63,-14],[53,42],[-10,52],[-62,20]]},
   {id:'recruitment',name:'招募区',sub:'RECRUITMENT',x:65,z:-126,w:122,d:102,shape:[[-60,-42],[36,-54],[72,-6],[56,46],[-20,56],[-72,12]]},
   {id:'commissions',name:'委托区',sub:'CONTRACT TERMINAL',x:145,z:-32,w:126,d:106,shape:[[-64,-42],[37,-56],[75,-8],[58,48],[-26,57],[-76,10]]},
   {id:'teams',name:'组队区',sub:'SQUAD ASSEMBLY',x:130,z:92,w:132,d:110,shape:[[-68,-44],[35,-58],[78,-5],[55,53],[-30,59],[-80,7]]},
   {id:'entertainment',name:'娱乐区',sub:'SIMULATION DECK',x:5,z:137,w:138,d:114,shape:[[-70,-46],[38,-60],[82,-8],[59,56],[-28,62],[-84,9]]},
   {id:'food',name:'美食区',sub:'FOOD & SUPPLY',x:-112,z:105,w:124,d:104,shape:[[-63,-42],[34,-54],[73,-5],[54,48],[-24,56],[-76,8]]}
  ];
  // Expand each district's geography around the central landmark while preserving the relative layout.
  zones.forEach(z=>{z.x=18+(z.x-18)*1.22;z.z*=1.22});
  // Clear pedestrian spokes connect the home arrival, central astrolabe and each district forecourt.
  const routeAccent={exchange:amber,ranking:coral,recruitment:jade,commissions:amber,teams:violet,entertainment:violet,food:coral};
  const hub={x:18,z:0};
  // A broad, restrained arrival axis leads from the residential portal to the central landmark.
  strip(-20,0,-10,0,13,floorDark);strip(-20,0,-10,0,1.1,cyan);
  zones.forEach((z,i)=>{
   const dx=z.x-hub.x,dz=z.z-hub.z,len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
   const sx=hub.x+ux*34,sz=hub.z+uz*34,ex=z.x-ux*70,ez=z.z-uz*70;
   const accent=routeAccent[z.id];
   strip(sx,sz,ex,ez,15,floorDark);
   strip(sx,sz,ex,ez,1.25,accent);
   const px=-uz*5.2,pz=ux*5.2;
   strip(sx+px,sz+pz,ex+px,ez+pz,.22,silver);
   strip(sx-px,sz-pz,ex-px,ez-pz,.22,silver);
   // Continuous flush inlay marks the route end without circular pads, rings or repeated chevrons.
   const terminal=new T.Mesh(new T.PlaneGeometry(10,.8),accent);terminal.rotation.x=-Math.PI/2;terminal.rotation.z=-Math.atan2(ux,uz);terminal.position.set(ex,.028,ez);root.add(terminal);
  });
  const zoneObjects=[];
  zones.forEach((z,index)=>{
   const area=new T.Group();
   area.position.set(z.x,0,z.z);area.scale.set(1.2,1,1.2);
   // Each district turns its main frontage toward the central arrival concourse.
   // Local -Z is the frontage axis; the rotation therefore differs by district location.
   const hallCenter={x:-20,z:0};
   area.rotation.y=Math.atan2(-(hallCenter.x-z.x),-(hallCenter.z-z.z));
   area.userData.hallAction=z.id;area.name='hall-district-'+z.id;root.add(area);
   polygon(area,z.shape,.012,index%2?floorMat:floorDark);
   // Subtle embedded boundary seams, not raised circular platforms or fenced lots.
   const pts=z.shape.map(p=>new T.Vector3(p[0],.025,p[1]));area.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0x78c9d8,transparent:true,opacity:.16})));
   // Low architectural inlays define the district's internal circulation.
   for(let i=-2;i<=2;i++){const seam=new T.Mesh(new T.PlaneGeometry(.06,z.d*.66),cyan);seam.rotation.x=-Math.PI/2;seam.position.set(i*z.w*.13,.035,0);area.add(seam)}
   // Varied landmarks replace the repetitive notice-board wall: each district has a different spatial identity.
   const title=new T.Mesh(new T.PlaneGeometry(24,6),new T.MeshBasicMaterial({map:labelTexture(z.name,z.sub),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));
   title.position.set(0,15,-z.d*.34);
   // Keep the plaque upright while continuously turning its face toward the active camera.
   // The callback uses world coordinates so the district group's own rotation cannot skew it.
   const plaqueWorld=new T.Vector3(),cameraWorld=new T.Vector3();
   title.onBeforeRender=(renderer,activeScene,camera)=>{
    title.getWorldPosition(plaqueWorld);
    camera.getWorldPosition(cameraWorld);
    // PlaneGeometry's front normal is local +Z, matching Object3D.lookAt() for meshes.
    title.lookAt(cameraWorld.x,plaqueWorld.y,cameraWorld.z);
   };
   area.add(title);
   const addBox=(x,y,zz,w,h,d,m)=>box(area,x,y,zz,w,h,d,m);
   if(z.id==='exchange'){
    // A broad banking counter, suspended currency halo and several recessed service kiosks.
    addBox(0,2,-17,48,4,8,graphite);addBox(0,4.2,-17,46,.35,7,silver);
    for(let i=-3;i<=3;i++){addBox(i*5,2.2,-11,2.4,4.4,1.2,titanium);addBox(i*5,2.6,-10.3,2.0,2.1,.08,cyan)}
    const halo=new T.Mesh(new T.TorusGeometry(15,.42,12,96),silver);halo.position.set(0,13,-25);halo.rotation.x=Math.PI/2;area.add(halo);
    const inner=new T.Mesh(new T.TorusGeometry(12,.12,8,96),cyan);inner.position.copy(halo.position);inner.rotation.copy(halo.rotation);area.add(inner);
   }else if(z.id==='ranking'){
    // A tall stepped holographic leaderboard wall and three monumental rank plinths.
    addBox(0,10,-25,54,20,2,graphite);addBox(0,10,-23.8,48,16,.12,cyan);
    for(let i=0;i<3;i++){const x=(i-1)*12,h=[3.5,6.5,4.5][i];addBox(x,h/2,5,7,h,7,i===1?silver:titanium);addBox(x,h+.2,5,5,.12,5,cyan)}
   }else if(z.id==='recruitment'){
    // Open recruitment lounge with clusters of seats and floating identity panels.
    for(let i=0;i<4;i++){const x=(i%2?1:-1)*18,zz=(i<2?-2:17);addBox(x,1.3,zz,12,1.4,7,graphite);addBox(x,2.1,zz,10,.16,5,silver)}
    for(let i=-1;i<=1;i++){const p=addBox(i*13,7,-25,7,10,.55,glass);addBox(i*13,7,-24.6,6,8,.06,cyan)}
   }else if(z.id==='commissions'){
    // Contract dispatch: a wide mission table surrounded by vertical data monoliths.
    addBox(0,1.5,4,40,2.6,22,graphite);addBox(0,3,4,37,.16,19,cyan);
    for(let i=0;i<5;i++){const x=-32+i*16;addBox(x,7,-22,2.2,14,2.2,titanium);addBox(x,7,-20.8,.12,10,.08,cyan)}
    addBox(0,9,-32,56,.45,1.2,silver);
   }else if(z.id==='teams'){
    // A large open assembly plaza with a central holographic tactical table and seating arcs.
    addBox(0,1.2,0,28,2.2,20,graphite);addBox(0,2.5,0,25,.12,17,cyan);
    for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*25,zz=Math.sin(a)*25;const seat=addBox(x,.9,zz,8,1.4,4,titanium);seat.rotation.y=-a}
    const ring=new T.Mesh(new T.TorusGeometry(10,.22,8,64),cyan);ring.position.set(0,5,0);area.add(ring);
   }else if(z.id==='entertainment'){
    // Simulation deck: scattered pods, interactive stages and a wide open play floor.
    for(let i=0;i<4;i++){const x=(i%2?1:-1)*22,zz=(i<2?-18:18);addBox(x,2.2,zz,12,4.4,10,graphite);addBox(x,3,zz-5.1,9,2.4,.12,cyan)}
    addBox(0,.55,0,35,1.1,24,silver);addBox(0,1.15,0,31,.08,20,cyan);
    for(let i=-2;i<=2;i++){const p=addBox(i*8,6,-34,5,12,.8,glass);addBox(i*8,6,-33.5,4,10,.05,cyan)}
   }else if(z.id==='food'){
    // A food court with separate counters, seating islands and overhead light frames.
    for(let i=0;i<3;i++){const x=(i-1)*23;addBox(x,2,-20,17,3.6,9,silver);addBox(x,4,-20,18,.3,10,graphite);addBox(x,2.7,-15,14,.12,.08,cyan)}
    for(let i=0;i<4;i++){const x=(i%2?1:-1)*18,zz=i<2?7:24;addBox(x,.9,zz,9,1.2,7,graphite);addBox(x,1.55,zz,8,.12,6,silver)}
    for(let i=0;i<3;i++){const frame=addBox((i-1)*22,8,-20,1,8,12,graphite);addBox((i-1)*22,12,-20,.12,.12,12,cyan)}
   }
   // District-specific furnishing pass: warmer materials, layered silhouettes and usable public-space details.
   const accentSet={exchange:amber,ranking:coral,recruitment:jade,commissions:amber,teams:violet,entertainment:violet,food:coral};
   const accent=accentSet[z.id],warmSeat=z.id==='recruitment'?jade:z.id==='teams'?plum:z.id==='food'?copper:graphite;
   const addCylinder=(x,y,zz,rt,rb,h,m,seg=16)=>{const o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg),m);o.position.set(x,y,zz);o.castShadow=true;o.receiveShadow=true;area.add(o);return o};
   const addTorus=(x,y,zz,r,t,m)=>{const o=new T.Mesh(new T.TorusGeometry(r,t,10,48),m);o.position.set(x,y,zz);area.add(o);return o};
   const addSphere=(x,y,zz,r,m)=>{const o=new T.Mesh(new T.SphereGeometry(r,16,12),m);o.position.set(x,y,zz);area.add(o);return o};
   // Low benches, planters and lighting islands give the districts scale between the large machines.
   for(let i=0;i<4;i++){
    const a=i*Math.PI/2+.35,px=Math.cos(a)*z.w*.31,pz=Math.sin(a)*z.d*.3;
    addBox(px,.7,pz,8,1.05,2.2,warmSeat);addBox(px,1.28,pz,7.6,.16,2,ivory);
    const planterX=px+Math.cos(a+1.1)*7,planterZ=pz+Math.sin(a+1.1)*7;
    addCylinder(planterX,.48,planterZ,1.7,2.1,.9,plum,8);
    addCylinder(planterX,1.0,planterZ,1.55,1.55,.16,jade,12);
    for(let k=0;k<3;k++)addSphere(planterX+(k-1)*.65,1.65+(k%2)*.35,planterZ+(k%2)*.4,.62,k%2?jade:ivory);
    addCylinder(px,2.1,pz, .18,.3,1.7,accent,10);
   }
   if(z.id==='exchange'){
    for(let i=0;i<5;i++){const x=-25+i*12;addBox(x,6,18,8,9,1.3,i%2?warmMetal:ivory);addBox(x,6.2,18.75,6,6,.08,amber);addBox(x,2,18.9,5,.2,.1,graphite)}
    addTorus(0,17,0,19,.32,warmMetal);addTorus(0,17,0,16,.12,amber);
    for(let i=0;i<7;i++){const coin=addCylinder(-27+i*9,1.1,31,.95,.95,.24,i%2?warmMetal:ivory,24);coin.rotation.x=Math.PI/2}
   }else if(z.id==='ranking'){
    for(let i=0;i<5;i++){const x=-27+i*13,h=2.5+(i%3)*1.3;addBox(x,h/2,23,7,h,7,i===2?warmMetal:plum);addBox(x,h+.18,23,5,.12,5,i===2?amber:coral)}
    for(let i=0;i<3;i++){addCylinder(-22+i*22,10, -35,1.3,1.3,20,i===1?amber:coral,10);addSphere(-22+i*22,21,-35,1.8,i===1?amber:ivory)}
    addBox(0,1.3,38,42,2.2,5,ivory);addBox(0,2.5,38,39,.12,4,coral);
   }else if(z.id==='recruitment'){
    for(let i=0;i<6;i++){const x=-30+(i%3)*30,zz=i<3?30:43;addBox(x,.95,zz,11,1.5,6,i%2?plum:jade);addBox(x,1.8,zz,10,.18,5,ivory);addBox(x,2.9,zz-2.5,10,2.2,.35,warmMetal)}
    for(let i=0;i<4;i++){const x=-30+i*20;addBox(x,8,-38,1,15,.8,ivory);addBox(x,8,-37.5,.16,12,.08,i%2?jade:amber)}
    addTorus(0,4,-5,13,.25,jade);
   }else if(z.id==='commissions'){
    for(let i=0;i<4;i++){const x=-36+i*24;addBox(x,8,31,13,15,2,plum);addBox(x,8,32.1,10,10,.08,i%2?amber:coral);addBox(x,1.1,31,14,1.8,5,ivory)}
    for(let i=0;i<6;i++){const x=-32+i*12;addCylinder(x,2, -39,1.3,1.3,3,i%2?copper:warmMetal,8);addCylinder(x,4,-39,.5,.5,1.2,accent,8)}
    addBox(0,1.1,42,54,1.8,8,graphite);addBox(0,2.1,42,50,.12,7,amber);
   }else if(z.id==='teams'){
    for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*34,zz=Math.sin(a)*34;const seat=addBox(x,1.05,zz,10,1.6,5,i%2?plum:ivory);seat.rotation.y=-a;addBox(x,2,zz,9,.16,4,i%2?violet:warmMetal)}
    addCylinder(0,3,0,5,6,5,graphite,12);addCylinder(0,5.8,0,4.1,4.1,.22,ivory,24);addTorus(0,6.1,0,8,.3,violet);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;addCylinder(Math.cos(a)*18,6,Math.sin(a)*18,.45,.45,9,amber,8)}
   }else if(z.id==='entertainment'){
    for(let i=0;i<5;i++){const x=-32+i*16;addCylinder(x,2,-38,3.4,4.4,4,plum,12);addTorus(x,4.3,-38,3.6,.22,i%2?violet:coral);addSphere(x,7,-38,1.3,i%2?violet:amber)}
    for(let i=0;i<3;i++){const x=-28+i*28;addBox(x,5,34,18,10,1.4,plum);addBox(x,5,34.8,15,7,.08,i%2?violet:coral)}
    addCylinder(0,.8,0,18,18,1.3,plum,48);addTorus(0,1.6,0,16,.28,violet);addTorus(0,1.65,0,11,.16,coral);
   }else if(z.id==='food'){
    const stallColors=[coral,amber,jade];
    for(let i=0;i<3;i++){const x=-25+i*25;addBox(x,6,-35,19,.7,13,stallColors[i]);addBox(x,3.2,-35,16,5.5,9,ivory);addBox(x,6.4,-35,17,.22,10,warmMetal);addBox(x,4.6,-29.9,14,.25,.12,graphite);addCylinder(x,8,-35,1.4,1.4,1.2,stallColors[i],12)}
    for(let i=0;i<5;i++){const x=-34+i*17;addCylinder(x,1.4,31,3.3,3.3,2.4,i%2?ivory:coral,20);addCylinder(x,2.7,31,1.1,1.1,.22,warmMetal,20);for(let j=0;j<3;j++){const a=j*Math.PI*2/3;const seat=addBox(x+Math.cos(a)*5,.85,31+Math.sin(a)*5,3.8,1.4,3.8,j%2?jade:copper);seat.rotation.y=-a}}
    for(let i=0;i<4;i++){const x=-34+i*22;addBox(x,10,-18,1,12,1,warmMetal);addBox(x,16,-18,13,.45,1.2,stallColors[i%3]);addSphere(x,17,-18,.9,amber)}
   }
   // District architecture pass: each area receives a distinct structural silhouette,
   // while its central floor remains open for navigation and the existing service furniture.
   if(z.id==='exchange'){
    for(const x of [-48,48]){addBox(x,11,-5,3.2,22,3.2,graphite);addBox(x,11,-3.15,.22,17,.12,amber);addBox(x,22,-5,5,1.5,5,warmMetal)}
    addBox(0,22,-5,101,2.2,4.2,silver);addBox(0,23.25,-5,84,.18,4.35,amber);
    for(let i=-3;i<=3;i++){const fin=addBox(i*13,15,-5,.48,12,.65,i%2?ivory:warmMetal);fin.rotation.z=(i%2?1:-1)*.08}
   }else if(z.id==='ranking'){
    // Tiered monumental fins create a recognizable ranking facade rather than a flat screen wall.
    for(let i=0;i<9;i++){const x=-48+i*12,h=17+(i%3)*5;addBox(x,h/2,43,2.4,h,2.4,i%2?graphite:plum);addBox(x,h/2,41.65,.16,h*.78,.12,i%2?coral:amber)}
    addBox(0,26,43,104,1.8,3.2,silver);addBox(0,27.1,43,94,.16,3.3,coral);
   }else if(z.id==='recruitment'){
    // Three open recruitment portals with layered jambs and illuminated lintels.
    for(let i=-1;i<=1;i++){
     const x=i*37;
     for(const side of [-1,1]){addBox(x+side*12,9,-42,2.6,18,2.8,graphite);addBox(x+side*12,9,-40.45,.18,14,.12,jade)}
     addBox(x,18,-42,26,2,3.4,warmMetal);addBox(x,19.2,-42,21,.16,3.5,ivory);
     addBox(x,5,-42,17,.22,2.2,jade);
    }
   }else if(z.id==='commissions'){
    // A cantilevered dispatch gantry frames the task terminals and makes the area legible at distance.
    for(const x of [-48,48]){addBox(x,12,-34,2.8,24,3.2,graphite);addBox(x,12,-32.3,.18,19,.12,amber)}
    addBox(0,24,-34,101,2.2,4.2,silver);addBox(0,25.35,-34,88,.18,4.35,amber);
    for(let i=-3;i<=3;i++){const rib=addBox(i*13,19,-34,.45,8,.65,i%2?copper:ivory);rib.rotation.z=(i%2?1:-1)*.12}
   }else if(z.id==='teams'){
    // An open overhead assembly ring, held by four sculptural supports; no roof closes the space.
    for(let i=0;i<4;i++){const a=i*Math.PI/2,x=Math.cos(a)*43,zz=Math.sin(a)*39;addBox(x,10,zz,2.8,20,2.8,graphite);addBox(x,10,zz+1.55,.18,16,.12,violet)}
    const canopy=new T.Mesh(new T.TorusGeometry(43,.8,10,96),silver);canopy.position.y=21;canopy.scale.set(1,1,.9);area.add(canopy);
    const innerCanopy=new T.Mesh(new T.TorusGeometry(36,.2,8,96),violet);innerCanopy.position.y=20.4;innerCanopy.scale.set(1,1,.9);area.add(innerCanopy);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const rib=addBox(Math.cos(a)*40,20,Math.sin(a)*36,1,.45,8,i%2?violet:warmMetal);rib.rotation.y=-a}
   }else if(z.id==='entertainment'){
    // Asymmetric truss frames suggest a simulation pavilion while preserving the open-air character.
    for(let i=-1;i<=1;i++){
     const x=i*39,h=i===0?23:18;
     addBox(x-15,h/2,43,2.2,h,2.2,plum);addBox(x+15,h/2,43,2.2,h,2.2,graphite);
     addBox(x,h,43,33,1.6,2.8,i===0?violet:warmMetal);
     for(let k=-1;k<=1;k++){const brace=addBox(x+k*9,h*.72,41.4,.42,7,.35,coral);brace.rotation.z=k*.22}
    }
   }else if(z.id==='food'){
    // A sequence of smaller stall canopies establishes a food-market street rhythm.
    for(let i=-1;i<=1;i++){
     const x=i*34;
     addBox(x,12,-37,25,1.2,15,i===0?warmMetal:ivory);
     addBox(x,12.8,-37,22,.16,13,i===0?amber:jade);
     for(const side of [-1,1]){addBox(x+side*11,6,-37,1.5,12,1.5,graphite);addBox(x+side*11,6,-36.1,.14,9,.12,i===0?amber:coral)}
     addBox(x,8,-29.3,20,.35,.45,i===0?coral:jade);
    }
   }
   // Secondary sculptural pass: make the service buildings read as inhabited architecture,
   // with distinct entrances, structural depth and recognizable interior spatial rhythms.
   const front=-z.d*.53,gateAccent=accent;
   const gateRadius=z.id==='ranking'?13:z.id==='entertainment'?14:z.id==='teams'?12:z.id==='food'?10:11;
   const gateRing=new T.Mesh(new T.TorusGeometry(gateRadius,.72,14,88),z.id==='teams'?silver:gateAccent);
   gateRing.position.set(0,gateRadius,front);gateRing.scale.set(z.id==='food'?1.35:1.0,1,1);area.add(gateRing);
   const gateInner=new T.Mesh(new T.TorusGeometry(gateRadius-1.45,.16,8,88),z.id==='teams'?violet:ivory);
   gateInner.position.set(0,gateRadius,front-.18);gateInner.scale.copy(gateRing.scale);area.add(gateInner);
   for(const side of [-1,1]){
    const pier=addCylinder(side*(gateRadius+.4),gateRadius*.48,front,.95,1.65,gateRadius*.96,graphite,10);
    const collar=addCylinder(side*(gateRadius+.4),gateRadius*.86,front,1.45,1.45,.62,warmMetal,10);
    const inlay=addCylinder(side*(gateRadius+.4),gateRadius*.5,front-.98,.16,.16,gateRadius*.72,gateAccent,8);
   }
   const lintel=new T.Mesh(new T.BoxGeometry(gateRadius*1.55,.55,1.1),z.id==='food'?ivory:silver);lintel.position.set(0,gateRadius*1.92,front);area.add(lintel);
   const crest=new T.Mesh(new T.OctahedronGeometry(1.7,1),gateAccent);crest.position.set(0,gateRadius*2.18,front);area.add(crest);
   // A shallow forecourt apron visually joins each building entrance to the district avenue.
   const apron=new T.Mesh(new T.CylinderGeometry(gateRadius*1.18,gateRadius*1.28,.24,12),z.id==='food'?paleStone:floorDark);
   apron.position.set(0,.08,front+4.8);area.add(apron);
   const apronRim=new T.Mesh(new T.TorusGeometry(gateRadius*1.16,.18,8,72),gateAccent);apronRim.rotation.x=Math.PI/2;apronRim.position.set(0,.22,front+4.8);area.add(apronRim);
   if(z.id==='exchange'){
    // Three transaction bays with suspended coin-like medallions and recessed waiting benches.
    for(let i=-1;i<=1;i++){
     const x=i*29;
     addCylinder(x,.32,-20,7.2,7.2,.55,warmMetal,32);
     const canopy=new T.Mesh(new T.TorusGeometry(7,.34,10,64),amber);canopy.position.set(x,14,-20);area.add(canopy);
     addBox(x,9,-20,11,1.1,7,graphite);addBox(x,10,-16.2,8,.16,.12,ivory);
     const coin=new T.Mesh(new T.CylinderGeometry(2.8,2.8,.48,32),warmMetal);coin.rotation.z=Math.PI/2;coin.position.set(x,19,-20);area.add(coin);
     const coinFace=new T.Mesh(new T.TorusGeometry(1.7,.14,8,48),amber);coinFace.position.set(x,19.28,-20);area.add(coinFace);
    }
    for(let i=0;i<4;i++){const x=(i-1.5)*15;addBox(x,.8,42,11,1.2,4,ivory);addBox(x,1.48,42,10,.16,3.7,warmMetal)}
    addTorus(0,25,-20,28,.28,amber);
   }else if(z.id==='ranking'){
    // A stepped public amphitheatre faces the ranking wall, with a central ceremonial podium.
    for(let row=0;row<4;row++){
     const depth=5.5+row*4.2,y=.65+row*.72,zp=20+row*5.1;
     addBox(0,y,zp,88-row*9,1.15,4.8, row%2?plum:graphite);
     addBox(0,y+.62,zp,84-row*9,.12,4.4,row%2?coral:warmMetal);
    }
    const podium=new T.Mesh(new T.CylinderGeometry(7,9,2.2,10),warmMetal);podium.position.set(0,1.1,-2);area.add(podium);
    const podiumTop=new T.Mesh(new T.CylinderGeometry(6.2,6.2,.22,10),ivory);podiumTop.position.set(0,2.3,-2);area.add(podiumTop);
    for(let i=-3;i<=3;i++){const fin=addBox(i*7,14,-45,.65,28,.8,i%2?coral:graphite);fin.rotation.z=(i%2?1:-1)*.055}
   }else if(z.id==='recruitment'){
    // Six semi-private interview pods, each framed by a circular identity halo.
    for(let i=0;i<6;i++){
     const x=(i%3-1)*31,zp=i<3?17:42;
     const pod=new T.Mesh(new T.CylinderGeometry(7.5,8.2,1.2,12),plum);pod.position.set(x,.65,zp);area.add(pod);
     const halo=new T.Mesh(new T.TorusGeometry(6.2,.3,10,64),i%2?jade:amber);halo.position.set(x,7,zp-3);area.add(halo);
     for(const side of [-1,1]){addBox(x+side*6.5,4,zp-3,1,8,1,graphite);addBox(x+side*6.5,4,zp-2.35,.12,6,.08,i%2?jade:amber)}
     const identity=new T.Mesh(new T.OctahedronGeometry(1.6,1),i%2?jade:ivory);identity.position.set(x,10,zp-3);area.add(identity);
    }
   }else if(z.id==='commissions'){
    // Tiered dispatch consoles and a high-level command dais distinguish contract classes.
    for(let tier=0;tier<3;tier++){
     const x=-36+tier*36,zp=15+tier*7;
     const plinth=new T.Mesh(new T.CylinderGeometry(8,9,1.4,8),tier===1?warmMetal:graphite);plinth.position.set(x,.7,zp);area.add(plinth);
     const terminal=new T.Mesh(new T.BoxGeometry(10,7,2),tier===1?ivory:plum);terminal.position.set(x,5,zp);area.add(terminal);
     const screen=new T.Mesh(new T.PlaneGeometry(8,4.8),new T.MeshBasicMaterial({color:tier===1?0xffc77e:0x80d8e5,transparent:true,opacity:.78,side:T.DoubleSide}));screen.position.set(x,5.2,zp-1.08);area.add(screen);
     for(let j=0;j<3;j++){const node=new T.Mesh(new T.OctahedronGeometry(.72,0),tier===1?amber:cyan);node.position.set(x+(j-1)*2.3,9.3,zp);area.add(node)}
    }
    const commandRing=new T.Mesh(new T.TorusGeometry(24,.48,10,80),warmMetal);commandRing.rotation.x=Math.PI/2;commandRing.position.set(0,17,3);area.add(commandRing);
   }else if(z.id==='teams'){
    // Four team cells branch from the central gathering table; each has its own seat arc and beacon.
    for(let cell=0;cell<4;cell++){
     const a=cell*Math.PI/2,x=Math.cos(a)*27,zp=Math.sin(a)*27;
     const pad=new T.Mesh(new T.CylinderGeometry(10,11,1,12),cell%2?plum:graphite);pad.position.set(x,.5,zp);area.add(pad);
     const ring=new T.Mesh(new T.TorusGeometry(9,.22,8,56),violet);ring.rotation.x=Math.PI/2;ring.position.set(x,1.1,zp);area.add(ring);
     for(let j=0;j<3;j++){const sa=a+(j-1)*.48,sx=x+Math.cos(sa)*7,sz=zp+Math.sin(sa)*7;const seat=addBox(sx,1.2,sz,4.8,1.5,3.2,j%2?ivory:plum);seat.rotation.y=-sa}
     const beacon=new T.Mesh(new T.OctahedronGeometry(2.1,1),cell%2?violet:amber);beacon.position.set(x,9,zp);area.add(beacon);
    }
    const centralMap=new T.Mesh(new T.IcosahedronGeometry(4.2,1),new T.MeshPhysicalMaterial({color:0x9fe5ed,metalness:.5,roughness:.16,transparent:true,opacity:.82,emissive:0x1b6573,emissiveIntensity:.55}));centralMap.position.set(0,9,0);area.add(centralMap);
   }else if(z.id==='entertainment'){
    // Five distinct simulation bays: circular launch pads, overhead rings and angled entry fins.
    for(let i=0;i<5;i++){
     const x=-40+i*20,zp=18+(i%2)*14;
     const pad=new T.Mesh(new T.CylinderGeometry(7.2,8.5,.9,12),plum);pad.position.set(x,.5,zp);area.add(pad);
     const ring=new T.Mesh(new T.TorusGeometry(6.6,.34,10,64),i%2?violet:coral);ring.rotation.x=Math.PI/2;ring.position.set(x,1,zp);area.add(ring);
     const arch=new T.Mesh(new T.TorusGeometry(5.2,.38,10,64),i%2?violet:amber);arch.position.set(x,6,zp-3);area.add(arch);
     for(const side of [-1,1]){const fin=addBox(x+side*5,4,zp-3,.65,8,.85,graphite);fin.rotation.z=side*.12}
     const orb=new T.Mesh(new T.IcosahedronGeometry(1.6,1),i%2?violet:amber);orb.position.set(x,10,zp-3);area.add(orb);
    }
    const canopyRing=new T.Mesh(new T.TorusGeometry(47,.52,10,96),violet);canopyRing.position.set(0,24,22);area.add(canopyRing);
   }else if(z.id==='food'){
    // Three individually framed food stalls and a shared circular dining commons.
    for(let i=0;i<3;i++){
     const x=(i-1)*34,zp=-15;
     const roof=new T.Mesh(new T.CylinderGeometry(10,10,.75,6),i===1?warmMetal:ivory);roof.position.set(x,11,zp);roof.rotation.y=Math.PI/6;area.add(roof);
     const roofRim=new T.Mesh(new T.TorusGeometry(9,.22,8,64),i===1?amber:jade);roofRim.position.set(x,11.45,zp);area.add(roofRim);
     for(let j=0;j<3;j++){const a=j*Math.PI*2/3;const sx=x+Math.cos(a)*7.5,sz=zp+Math.sin(a)*7.5;addCylinder(sx,5.4,sz,.34,.72,10,graphite,8);addCylinder(sx,10.4,sz,.7,.7,.38,i===1?amber:jade,10)}
    }
    const dining=new T.Mesh(new T.CylinderGeometry(17,18,1.1,12),paleStone);dining.position.set(0,.55,26);area.add(dining);
    const diningRim=new T.Mesh(new T.TorusGeometry(17,.28,8,88),coral);diningRim.rotation.x=Math.PI/2;diningRim.position.set(0,1.15,26);area.add(diningRim);
    for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*22,zp=26+Math.sin(a)*22;const table=new T.Mesh(new T.CylinderGeometry(2.5,2.8,1.1,10),copper);table.position.set(x,1.2,zp);area.add(table);for(let j=0;j<3;j++){const sa=a+j*Math.PI*2/3,sx=x+Math.cos(sa)*4.2,sz=zp+Math.sin(sa)*4.2;addBox(sx,.85,sz,2.8,1.3,2.8,j%2?jade:ivory)}}
   }
   zoneObjects.push(area);
  });
  // Arrival portal is placed inside the immense hall, facing into the open central concourse.
  const portal=new T.Group();portal.position.set(-20,0,0);portal.rotation.y=Math.PI/2;portal.userData.roomTarget='living';portal.name='hall-home-portal';root.add(portal);
  box(portal,0,3.1,0,5.4,6.2,.8,graphite);box(portal,0,3.1,.45,4.4,5.3,.08,glass);
  for(const x of [-2.45,2.45])box(portal,x,3.1,.53,.1,5.8,.08,cyan);
  const gateText=new T.Mesh(new T.PlaneGeometry(3.7,.62),new T.MeshBasicMaterial({map:labelTexture('返回居所','RESIDENTIAL GATE'),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));gateText.position.set(0,6.65,.55);portal.add(gateText);
  return {group:root,zones,zoneObjects,ground:floor,center:{x:-25.18,z:0},spawn:{x:-9.8,z:0},radius:285};
 }
 global.ArdayHallScene={create};
})(window);
