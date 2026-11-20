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
  const tex=new T.CanvasTexture(bg);tex.encoding=T.sRGBEncoding;const sky=new T.Mesh(new T.SphereGeometry(780,96,64),new T.MeshBasicMaterial({map:tex,side:T.BackSide,depthWrite:false}));sky.position.set(-20,24,0);sky.renderOrder=-100;sky.frustumCulled=false;root.add(sky);
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
   area.rotation.y=Math.atan2(hallCenter.x-z.x,hallCenter.z-z.z);
   area.userData.hallAction=z.id;area.name='hall-district-'+z.id;root.add(area);
   // The seven districts are built as inhabited architectural spaces, not collections of floating props.
   // Each frontage faces the central concourse; structural frames, wall depth and equipment share one scale.
   const title=new T.Mesh(new T.PlaneGeometry(24,6),new T.MeshBasicMaterial({map:labelTexture(z.name,z.sub),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));
   title.position.set(0,17,z.d*.34);
   const plaqueWorld=new T.Vector3(),cameraWorld=new T.Vector3();
   title.onBeforeRender=(renderer,activeScene,camera)=>{
    title.getWorldPosition(plaqueWorld);camera.getWorldPosition(cameraWorld);
    title.lookAt(cameraWorld.x,plaqueWorld.y,cameraWorld.z);
   };
   area.add(title);
   const addBox=(x,y,zz,w,h,d,m)=>box(area,x,y,zz,w,h,d,m);
   const addPanel=(x,y,zz,w,h,m)=>{const o=new T.Mesh(new T.PlaneGeometry(w,h),m);o.position.set(x,y,zz);area.add(o);return o};
   const addColumn=(x,zz,h=18,width=2.2,m=graphite)=>addBox(x,h/2,zz,width,h,width,m);
   const addBeam=(x,y,zz,w,h,d,m=graphite,rz=0)=>{const o=addBox(x,y,zz,w,h,d,m);o.rotation.z=rz;return o};
   const addFacadeBay=(x,zz,w,h,accentMat=accent)=>{
    addColumn(x-w/2,zz,h,1.8,graphite);addColumn(x+w/2,zz,h,1.8,graphite);
    addBeam(x,h,zz,w+1.8,1.5,2.2,silver);
    addBeam(x,h+.92,zz,w*.72,.18,2.35,accentMat);
    addBeam(x,1.0,zz,w,.5,2.0,warmMetal);
   };
   const addScreen=(x,y,zz,w,h,accentMat=cyan)=>{
    addBox(x,y,zz,w+.9,h+.9,.72,graphite);
    addBox(x,y,zz+.39,w,h,.08,plum);
    addPanel(x,y,zz+.46,w*.91,h*.88,new T.MeshBasicMaterial({color:accentMat.color||0x70ddeb,emissive:accentMat.color||0x70ddeb,emissiveIntensity:.32,toneMapped:false}));
    for(const sx of [-1,1])addBox(x+sx*(w/2+.28),y,zz+.43,.16,h+.25,.16,silver);
   };
   const addCounter=(x,y,zz,w,d,top=ivory,front=graphite)=>{
    addBox(x,y,zz,w,1.8,d,front);addBox(x,y+1.02,zz-.08,w+.5,.34,d+.32,top);
    addBox(x,y+1.94,zz+d*.34,w*.82,.16,.12,warmMetal);
   };
   const addStair=(x,zz,w,steps,depth,material=graphite)=>{
    for(let n=0;n<steps;n++){const h=.55+n*.48;addBox(x,h/2,zz+n*depth,w,h,depth+.08,material);addBox(x,h+.06,zz+n*depth,w,.12,depth+.08,n%2?silver:warmMetal)}
   };
   const addTrussBay=(x,zz,w,h,accentMat=accent)=>{
    for(const side of [-1,1]){
     addColumn(x+side*w/2,zz,h,2.2,graphite);
     addBeam(x+side*w/2,h*.58,zz+1.18,.42,h*.78,.3,accentMat,side*.13);
    }
    addBeam(x,h,zz,w+2.2,2.1,3.2,silver);
    addBeam(x,h+1.18,zz,w*.82,.2,3.3,accentMat);
    for(let n=-2;n<=2;n++)addBeam(x+n*w*.15,h*.78,zz-.95,.34,3.2,.3,n%2?warmMetal:graphite,n*.045);
   };
   const accentSet={exchange:amber,ranking:coral,recruitment:jade,commissions:amber,teams:violet,entertainment:violet,food:coral};
   const accentMat=accentSet[z.id];
   // A continuous rear service wall and two structural returns establish a real room volume.
   // The front stays open so the district remains visible and connected to the public concourse.
   if(z.id==='exchange'){
    // Exchange hall: a deep banking concourse with a vaulted service frontage and seven teller bays.
    addBox(0,10,-43,100,20,2.4,graphite);
    addBox(0,19.2,-41.55,94,1.0,.22,warmMetal);
    for(let i=-3;i<=3;i++){
     const x=i*13.1;
     addFacadeBay(x,-40,11.2,17,amber);
     addScreen(x,11,-41.12,8.8,6.2,amber);
     addCounter(x,2.0,-24,10.4,5,ivory,graphite);
     addBox(x,4.4,-23.7,8.4,.22,4.1,warmMetal);
     addBox(x,5.3,-22.1,7.4,.16,.12,cyan);
    }
    for(const side of [-1,1]){
     addBox(side*49,9,-13,2.4,18,60,graphite);
     addBox(side*47.65,9,-13,.16,13,52,amber);
     addBox(side*47.4,18,-13,3.4,1.2,60,silver);
     addTrussBay(side*34,-12,24,20,amber);
    }
    addBox(0,21,-13,101,1.6,58,silver);
    for(let i=-4;i<=4;i++)addBeam(i*11,20.05,-13,.34,1.1,56,i%2?warmMetal:graphite);
    addBox(0,22,-13,82,.22,1.2,amber);
    // A waiting gallery sits behind the teller line, with real seating and service dividers.
    for(let i=0;i<4;i++){const x=-30+i*20;addBox(x,1.3,12,14,1.2,4,plum);addBox(x,2.15,12,13,.18,3.7,ivory);addBox(x,4.5,10,1.1,5,.8,silver)}
    for(let i=-3;i<=3;i++){addBox(i*13,7,-31,1.4,5,1.2,silver);addBox(i*13,9.8,-31,5,.18,1.5,amber)}
   }else if(z.id==='ranking'){
    // Ranking forum: a monumental stepped display wall, flanked by deep buttresses and public tiers.
    addBox(0,15,-45,102,30,3.2,graphite);
    addBox(0,29,-43.18,94,1.0,.45,silver);
    for(let i=-5;i<=5;i++){
     const x=i*8.4,h=20+(Math.abs(i)%3)*3;
     addBox(x,h/2,-42.9,1.25,h,1.0,i%2?plum:graphite);
     addBox(x,h/2,-42.25,.18,h*.78,.12,i%2?coral:amber);
    }
    for(let i=-1;i<=1;i++){
     const x=i*29;addBox(x,15,-42.9,25,15,.32,plum);addScreen(x,16,-42.55,20,11,i===0?amber:coral);
     addBox(x,5.5,-38,23,1.2,5,warmMetal);
    }
    for(const side of [-1,1]){
     addBox(side*51,14,-15,3,28,62,graphite);
     addBox(side*48.9,14,-15,.18,22,54,coral);
     addBeam(side*39,29,-14,26,1.6,58,silver);
    }
    addStair(0,2,82,5,7,plum);
    addBox(0,1.4,-8,18,2.8,12,warmMetal);addBox(0,2.95,-8,15,.24,9,ivory);
    for(let i=-4;i<=4;i++)addBox(i*9,3.5,35,1.1,6,1.2,i%2?coral:silver);
   }else if(z.id==='recruitment'){
    // Recruitment pavilion: three private interview suites with glazed partitions and shared circulation.
    addBox(0,10,-43,100,20,2.2,graphite);
    addBox(0,20,-40.9,103,1.5,6,silver);
    for(let bay=-1;bay<=1;bay++){
     const x=bay*32;
     addFacadeBay(x,-40,25,17,jade);
     addBox(x,8,-30,23,16,1.2,graphite);
     addBox(x,8,-29.32,19,12,.08,glass);
     addBox(x,8,-28.95,18,11,.08,jade);
     addBox(x,1.5,-19,19,2.1,6,plum);
     addCounter(x,2.0,-37,12,3,ivory,graphite);
     addBox(x,5.3,-35.1,10,.18,.12,jade);
     for(const side of [-1,1]){
      addColumn(x+side*11,-13,14,1.25,graphite);
      addBeam(x+side*11,14,-13,1.4,1.0,54,silver);
      addBox(x+side*11,8,-13,.12,11,48,jade);
     }
     addBeam(x,17,-13,23,1.1,50,warmMetal);
     addBox(x,18,-13,17,.16,50,jade);
     // Privacy fins and acoustic ceiling baffles define each interview room without closing it off.
     for(let j=-2;j<=2;j++)addBox(x+j*3.2,14,-12,.18,5,31,j%2?plum:graphite);
     for(let j=-2;j<=2;j++)addBox(x+j*3.2,16,-5,2.4,.22,18,ivory);
    }
    addBox(0,2,24,78,1.4,8,graphite);
    for(let i=-3;i<=3;i++){const x=i*11;addBox(x,3.2,24,7,.16,7,jade);addBox(x,4.1,21,1.1,2.2,.8,silver)}
   }else if(z.id==='commissions'){
    // Dispatch center: a two-level mission control wall with cantilevered terminal gantries.
    addBox(0,13,-45,104,26,3.2,graphite);
    addBox(0,27,-43.1,108,1.6,4.2,silver);
    for(let i=0;i<5;i++){
     const x=-40+i*20;
     addBox(x,11,-42.95,17,18,.3,plum);
     addScreen(x,15,-42.7,13,9,i%2?cyan:amber);
     addBox(x,3,-39,16,1.2,5,graphite);
     addBox(x,4,-37,14,.18,3,ivory);
     for(let j=-1;j<=1;j++)addBox(x+j*4,6,-37,.55,4,.6,i%2?amber:jade);
    }
    for(const side of [-1,1]){
     addBox(side*52,13,-12,3,26,66,graphite);
     addBox(side*49.8,13,-12,.18,21,58,amber);
     addTrussBay(side*37,-12,27,23,amber);
    }
    addBox(0,24,-13,105,1.8,62,silver);
    for(let i=-4;i<=4;i++)addBeam(i*12,22.9,-13,.4,1.3,60,i%2?amber:graphite);
    // Separate task-class consoles have different housings and approach clearances.
    for(let tier=0;tier<3;tier++){
     const x=(tier-1)*31,zp=10+tier*7;
     addBox(x,1.2,zp,24,2.4,13,tier===1?warmMetal:graphite);
     addBox(x,2.55,zp-1,21,.18,10,ivory);
     for(let j=-1;j<=1;j++){addBox(x+j*6,5,zp-4,4,5,1.2,plum);addScreen(x+j*6,6,zp-3.3,3,2.8,tier===1?amber:cyan)}
    }
    addBox(0,1.1,39,78,2.0,8,graphite);addBox(0,2.2,39,74,.16,7,amber);
   }else if(z.id==='teams'){
    // Team assembly hall: four rectangular meeting cells around a shared tactical operations table.
    addBox(0,1.1,-5,30,2.2,20,graphite);addBox(0,2.35,-5,27,.18,17,ivory);
    addScreen(0,9,-44,28,13,violet);
    for(let cell=0;cell<4;cell++){
     const sx=(cell%2?1:-1)*31,sz=cell<2?-28:27;
     addBox(sx,7,sz,30,14,1.2,graphite);
     addBox(sx,7,sz+.68,26,10,.08,glass);
     addBox(sx,1.2,sz+7,26,2.4,12,plum);
     addBox(sx,2.55,sz+7,23,.18,10,ivory);
     for(let j=-1;j<=1;j++){addBox(sx+j*8,4,sz+13,1.2,4,1.4,violet);addBox(sx+j*8,6.3,sz+13,4,.18,1.6,warmMetal)}
     addBeam(sx,16,sz,30,1.3,4,silver);
     for(let j=-1;j<=1;j++)addBeam(sx+j*8,13,sz-2,.22,5,.25,violet,j*.12);
    }
    for(const side of [-1,1]){
     addColumn(side*49,-7,23,2.4,graphite);
     addBeam(side*49,23,-7,2.6,1.4,90,silver);
    }
    addBeam(0,24,-7,100,1.8,3.5,warmMetal);
    for(let i=-4;i<=4;i++)addBeam(i*12,22.8,-7,.36,2,86,i%2?violet:graphite);
    for(let i=-2;i<=2;i++){addBox(i*8,1.1,7,7,2.2,6,graphite);addBox(i*8,2.35,7,6.4,.18,5.4,cyan)}
    for(let i=-3;i<=3;i++){const x=i*11;addBox(x,.85,43,9,1.5,4,plum);addBox(x,1.75,43,8,.16,3.8,violet)}
   }else if(z.id==='entertainment'){
    // Simulation pavilion: three large hangar bays with deep portal frames and enclosed equipment shells.
    addBox(0,10,-44,104,20,2.8,graphite);
    for(let bay=-1;bay<=1;bay++){
     const x=bay*34;
     addTrussBay(x,-20,28,bay===0?25:21,violet);
     addBox(x,8,-18,24,16,1.5,plum);
     addBox(x,8,-17.1,20,12,.12,glass);
     addBox(x,8,-16.85,18,10,.1,violet);
     addBox(x,2,-5,20,2.2,8,graphite);
     addBox(x,3.25,-5,17,.18,7,ivory);
     for(let side=-1;side<=1;side+=2){
      const fin=addBox(x+side*13,10,-5,1.1,18,28,graphite);fin.rotation.z=side*.1;
      addBox(x+side*11.9,10,-4,.18,14,24,violet);
     }
     // Service hatch, ventilation louvres and reinforced lower casing.
     addBox(x,3,-14,15,5,1.2,silver);
     for(let j=-3;j<=3;j++)addBox(x+j*2,3,-13.25,.22,3.8,.12,graphite);
     addBox(x,17,-7,21,1.2,18,warmMetal);
    }
    addBox(0,1.2,27,82,2.4,14,plum);addBox(0,2.55,27,78,.18,12,violet);
    for(let i=-2;i<=2;i++){const x=i*16;addBox(x,6,38,8,8,1.2,graphite);addScreen(x,7,38.68,6,5,violet)}
   }else if(z.id==='food'){
    // Food hall: a covered market street with three service fronts and a shared dining room.
    addBox(0,9,-44,104,18,2.8,graphite);
    addBox(0,18.5,-41.8,108,1.3,5.2,warmMetal);
    for(let bay=0;bay<3;bay++){
     const x=(bay-1)*34,stallAccent=bay===0?coral:bay===1?amber:jade;
     addFacadeBay(x,-40,28,15,stallAccent);
     addBox(x,5,-36,25,10,1.0,ivory);
     addBox(x,6,-35.35,21,6,.08,stallAccent);
     addCounter(x,2.1,-28,23,5,ivory,graphite);
     addBox(x,8,-27.4,19,.35,.22,warmMetal);
     addBox(x,10,-27.2,1.1,3.4,.8,stallAccent);
     for(let j=-2;j<=2;j++){addBox(x+j*4.1,3.3,-27.3,.22,2.6,.22,copper);addBox(x+j*4.1,4.8,-27.3,3.2,.16,.3,ivory)}
     // Each stall gets a service hatch and a recessed prep counter behind the public counter.
     addCounter(x,1.8,-41,20,3,plum,graphite);
     for(let j=-1;j<=1;j++){addBox(x+j*6,4,-43,.35,5,.35,silver);addBox(x+j*6,6.6,-43,4,.22,.5,stallAccent)}
    }
    for(const side of [-1,1]){
     addColumn(side*51,-12,18,2.4,graphite);
     addBeam(side*51,18,-12,2.5,1.2,62,silver);
     addBox(side*49.3,9,-12,.16,14,58,accentMat);
    }
    addBeam(0,19,-12,104,1.6,62,ivory);
    for(let i=-4;i<=4;i++)addBeam(i*12,18,-12,.34,1.2,58,i%2?jade:coral);
    // Shared dining room: rectangular tables, benches, lighting rails and a clear central aisle.
    for(let row=0;row<3;row++)for(let col=-2;col<=2;col++){
     const x=col*15,zz=13+row*13;
     addBox(x,1.6,zz,9,1.2,5,ivory);
     addBox(x,2.28,zz,8.7,.16,4.7,copper);
     for(const side of [-1,1]){addBox(x+side*6,1,zz,3.2,1.5,4,plum);addBox(x+side*6,.3,zz,2.8,.18,3.7,warmMetal)}
    }
    for(let i=-3;i<=3;i++){const x=i*14;addColumn(x,-2,9,1.0,warmMetal);addBox(x,13,-2,9,.45,1.4,ivory)}
   }
   // Interior reveals, door jambs and recessed lighting complete each building envelope.
   for(let side=-1;side<=1;side+=2){
    addBox(side*49,8,-13,1.2,16,60,graphite);
    addBox(side*48.25,8,-13,.12,11,52,accentMat);
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
