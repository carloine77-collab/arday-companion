(function(global){
 'use strict';
 function create(T,scene,M,box){
  const root=new T.Group();root.name='ArdayPublicHall';root.position.set(-5.18,0,0);scene.add(root);
  const mat=(c,m=.42,r=.58)=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:r,envMapIntensity:.72});
  // Organic surface library: procedural bark, leaf and soil maps keep plants out of the metallic material family.
  const makeOrganicMap=(base,low,high,kind)=>{
   const c=document.createElement('canvas');c.width=256;c.height=256;const q=c.getContext('2d');
   q.fillStyle=base;q.fillRect(0,0,256,256);let seed=kind==='bark'?3817:kind==='leaf'?9281:6113;
   const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
   if(kind==='bark'){for(let i=0;i<95;i++){const x=rnd()*256,w=1+rnd()*5;q.strokeStyle=i%2?low:high;q.globalAlpha=.12+rnd()*.24;q.lineWidth=w;q.beginPath();q.moveTo(x,0);q.bezierCurveTo(x+(rnd()-.5)*18,85,x+(rnd()-.5)*18,170,x+(rnd()-.5)*12,256);q.stroke()}for(let i=0;i<420;i++){q.fillStyle=i%2?low:high;q.globalAlpha=.12;q.fillRect(rnd()*256,rnd()*256,1+rnd()*3,2+rnd()*8)}}
   else if(kind==='leaf'){for(let i=0;i<125;i++){const x=rnd()*256,y=rnd()*256;q.strokeStyle=i%3?low:high;q.globalAlpha=.12+rnd()*.2;q.lineWidth=.7+rnd()*1.2;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+(rnd()-.5)*18,y+5+rnd()*12,x+(rnd()-.5)*26,y+12+rnd()*26);q.stroke()}}
   else{for(let i=0;i<2400;i++){q.fillStyle=i%2?low:high;q.globalAlpha=.08+rnd()*.12;q.fillRect(rnd()*256,rnd()*256,1+rnd()*3,1+rnd()*3)}}
   q.globalAlpha=1;const t=new T.CanvasTexture(c);if(T.sRGBEncoding!==undefined)t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.anisotropy=4;return t;
  };
  const barkMap=makeOrganicMap('#514d49','#34383a','#797267','bark'),leafMap=makeOrganicMap('#5b665f','#3e4a47','#8c9184','leaf'),soilMap=makeOrganicMap('#464641','#292f31','#68665e','soil');
  const barkMat=new T.MeshStandardMaterial({map:barkMap,bumpMap:barkMap,bumpScale:.16,color:0xffffff,roughness:.94,metalness:0});
  // Three.js r128 does not implement the later MeshPhysicalMaterial sheen pipeline.
  // Keep foliage on the stable Standard shader path; variation comes from texture and per-leaf palette.
  const leafPalette=[
   new T.MeshStandardMaterial({color:0x4c5b58,map:leafMap,roughness:.96,metalness:0,side:T.DoubleSide}),
   new T.MeshStandardMaterial({color:0x65716b,map:leafMap,roughness:.94,metalness:0,side:T.DoubleSide}),
   new T.MeshStandardMaterial({color:0x77796d,map:leafMap,roughness:.97,metalness:0,side:T.DoubleSide}),
   new T.MeshStandardMaterial({color:0x515e5b,map:leafMap,roughness:.96,metalness:0,side:T.DoubleSide}),
   new T.MeshStandardMaterial({color:0x596b6b,map:leafMap,roughness:.95,metalness:0,side:T.DoubleSide})
  ];
  const soilMat=new T.MeshStandardMaterial({map:soilMap,bumpMap:soilMap,bumpScale:.12,color:0xffffff,roughness:1,metalness:0});
  const makeLeafGeometry=kind=>{const sh=new T.Shape();if(kind===0){sh.moveTo(0,0);sh.quadraticCurveTo(.16,.28,.015,1.05);sh.quadraticCurveTo(-.16,.28,0,0)}else if(kind===1){sh.moveTo(0,0);sh.bezierCurveTo(.34,.22,.27,.78,0,.92);sh.bezierCurveTo(-.27,.78,-.34,.22,0,0)}else{sh.moveTo(0,0);sh.quadraticCurveTo(.12,.18,.04,.34);sh.quadraticCurveTo(.24,.42,.12,.58);sh.quadraticCurveTo(.19,.8,0,1.02);sh.quadraticCurveTo(-.19,.8,-.12,.58);sh.quadraticCurveTo(-.24,.42,-.04,.34);sh.quadraticCurveTo(-.12,.18,0,0)}const g=new T.ExtrudeGeometry(sh,{depth:.022,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.009,curveSegments:12});g.computeVertexNormals();return g};const leafGeometries=[makeLeafGeometry(0),makeLeafGeometry(1),makeLeafGeometry(2)];

  const addCylinder=(parent,x,y,z,rt,rb,h,material,segments=16)=>{const o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,segments),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
  const addTorus=(parent,x,y,z,r,t,material)=>{const o=new T.Mesh(new T.TorusGeometry(r,t,10,56),material);o.position.set(x,y,z);parent.add(o);return o};
  const titanium=mat(0x77838d,.62,.48),silver=mat(0x9aa5ab,.66,.42),graphite=mat(0x1d2934,.48,.62),dark=mat(0x0d1721,.38,.68),floorMat=mat(0x414c58,.18,.82),floorDark=mat(0x26333f,.34,.72),cyan=new T.MeshStandardMaterial({color:0x789da6,emissive:0x183b45,emissiveIntensity:.16,metalness:.22,roughness:.52,envMapIntensity:.76}),whiteGlow=new T.MeshBasicMaterial({color:0xa9c1c4,toneMapped:false}),glass=new T.MeshPhysicalMaterial({color:0x8faeb5,metalness:.08,roughness:.34,transparent:false,opacity:1,depthWrite:true,transmission:.1,thickness:.16,clearcoat:.24,clearcoatRoughness:.34,envMapIntensity:.82,side:T.DoubleSide});
  // Layered cool-neutral lighting: broad ambient fill, a directional key, a soft blue bounce and a restrained warm rim.
  root.add(new T.HemisphereLight(0x9baeb8,0x111a24,.48));
  const key=new T.DirectionalLight(0xb9c8d0,.68);key.position.set(-42,92,54);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-360;key.shadow.camera.right=360;key.shadow.camera.top=310;key.shadow.camera.bottom=-310;key.shadow.camera.near=1;key.shadow.camera.far=520;key.shadow.bias=-.00022;key.shadow.normalBias=.045;key.shadow.radius=5;key.shadow.camera.updateProjectionMatrix();root.add(key);
  const fillLight=new T.DirectionalLight(0x718a9a,.19);fillLight.position.set(58,52,-72);root.add(fillLight);
  const rimLight=new T.DirectionalLight(0xb6a18a,.075);rimLight.position.set(12,34,76);root.add(rimLight);
  const fill=new T.PointLight(0x5e8994,7,260,1.8);fill.position.set(-54,38,-26);root.add(fill);
  // A vast continuous floor; districts are embedded in its geography rather than isolated platforms.
  const floor=new T.Mesh(new T.PlaneGeometry(780,680),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(-20,-.18,0);floor.receiveShadow=false;floor.castShadow=false;floor.name='hall-walkable-ground';floor.userData.hallFloor=true;root.add(floor);
  // Continuous floor without intersecting coplanar grid planes.
  function polygon(parent,points,y,material){const s=new T.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();const o=new T.Mesh(new T.ShapeGeometry(s),material);o.rotation.x=-Math.PI/2;o.position.y=y;o.receiveShadow=true;parent.add(o);return o}
  function strip(x1,z1,x2,z2,width,material,y=-.105){const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),o=new T.Mesh(new T.BoxGeometry(width,.035,len),material);o.rotation.y=angle;o.position.set((x1+x2)/2,y,(z1+z2)/2);o.castShadow=false;o.receiveShadow=false;root.add(o);return o}
  // Open-air public forum: a monumental perimeter colonnade encloses the plaza.
  // There is deliberately no indoor ceiling or interior column grid; the sky remains visible.
  const perimeter=new T.Group();perimeter.name='hall-outdoor-perimeter-colonnade';perimeter.scale.set(1.25,1,1.25);root.add(perimeter);
  const columnMat=[silver,titanium,graphite],warmMetal=mat(0x756858,.56,.54),paleStone=mat(0x929894,.08,.94);
  const amber=new T.MeshStandardMaterial({color:0x9b8060,emissive:0x49311e,emissiveIntensity:.1,metalness:.2,roughness:.62,envMapIntensity:.76});
  const violet=new T.MeshStandardMaterial({color:0x656577,emissive:0x29283e,emissiveIntensity:.09,metalness:.18,roughness:.66,envMapIntensity:.72});
  const coral=new T.MeshStandardMaterial({color:0x936b68,emissive:0x3e2425,emissiveIntensity:.06,metalness:.1,roughness:.72,envMapIntensity:.7});
  const jade=new T.MeshStandardMaterial({color:0x65786f,emissive:0x24352f,emissiveIntensity:.055,metalness:.08,roughness:.76,envMapIntensity:.68});
  const ivory=mat(0x96958c,.06,.94),copper=mat(0x69584c,.48,.58),plum=mat(0x393d48,.28,.72);
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
  const bg=document.createElement('canvas');bg.width=2048;bg.height=1024;const ctx=bg.getContext('2d'),grad=ctx.createLinearGradient(0,0,0,1024);grad.addColorStop(0,'#050a12');grad.addColorStop(.52,'#101d2a');grad.addColorStop(1,'#1a2935');ctx.fillStyle=grad;ctx.fillRect(0,0,2048,1024);
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
  const coreOrb=new T.Mesh(new T.IcosahedronGeometry(5.4,2),new T.MeshPhysicalMaterial({color:0x83999d,metalness:.28,roughness:.36,emissive:0x1a3338,emissiveIntensity:.18,transparent:true,opacity:.94,envMapIntensity:.82}));coreOrb.position.y=33;coreOrb.castShadow=true;core.add(coreOrb);
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
  const coreLight=new T.PointLight(0x789da6,6,120,1.9);coreLight.position.set(18,29,0);root.add(coreLight);
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
   const routeY=-.105+i*.003; // Keep route inlays clearly above the continuous floor to prevent depth-buffer fighting.
   strip(sx,sz,ex,ez,15,floorDark,routeY);
   strip(sx,sz,ex,ez,1.25,accent,routeY+.028);
   const px=-uz*5.2,pz=ux*5.2;
   strip(sx+px,sz+pz,ex+px,ez+pz,.22,silver,routeY+.034);
   strip(sx-px,sz-pz,ex-px,ez-pz,.22,silver,routeY+.034);
   // Continuous flush inlay marks the route end without circular pads, rings or repeated chevrons.
   const terminal=new T.Mesh(new T.BoxGeometry(10,.035,.8),accent);terminal.rotation.y=Math.atan2(ux,uz);terminal.position.set(ex,routeY,ez);terminal.castShadow=false;terminal.receiveShadow=false;root.add(terminal);
  });
  const zoneObjects=[];
  zones.forEach((z,index)=>{
   const area=new T.Group();
   area.position.set(z.x,0,z.z);
   // One shared vertical proportion rule keeps every ceiling-related element in the same architectural scale:
   // walls, piers, capitals, roof trusses, fascia, suspended lights, signs and interior equipment all rise together.
   // The base remains at floor level because the scale is applied around the district origin.
   area.scale.set(1.2,1.16,1.2);
   // Each district turns its main frontage toward the central arrival concourse.
   // Local -Z is the frontage axis; the rotation therefore differs by district location.
   const hallCenter={x:-20,z:0};
   area.rotation.y=Math.atan2(hallCenter.x-z.x,hallCenter.z-z.z);
   area.userData.hallAction=z.id;area.name='hall-district-'+z.id;root.add(area);
   // Unified architectural language: consistent vertical proportions, structural depth and material hierarchy.
   // The seven districts are built as inhabited architectural spaces, not collections of floating props.
   // Each frontage faces the central concourse; structural frames, wall depth and equipment share one scale.
   // District identity sign: a framed, supported architectural gateway plaque.
   // Its elevation is matched to each hall's roofline instead of using one low, shared height.
   const signAccent={exchange:amber,ranking:coral,recruitment:jade,commissions:amber,teams:violet,entertainment:violet,food:coral};
   const signHeights={exchange:35,ranking:42,recruitment:35,commissions:42,teams:39,entertainment:40,food:33};
   const roofHeights={exchange:29,ranking:35,recruitment:28,commissions:35,teams:32,entertainment:33,food:27};
   const signY=signHeights[z.id],signZ=z.d*.34,signMountY=roofHeights[z.id]+1.5;
   for(const sx of [-17,17]){
    const support=new T.Mesh(new T.BoxGeometry(1.05,Math.max(2,signY-signMountY-3),1.2),graphite);
    support.position.set(sx,(signY+signMountY)/2-1.5,signZ);area.add(support);
    const reveal=new T.Mesh(new T.BoxGeometry(.12,Math.max(1,signY-signMountY-3.5),1.28),signAccent[z.id]||cyan);
    reveal.position.set(sx-.59,(signY+signMountY)/2-1.5,signZ);area.add(reveal);
    const foot=new T.Mesh(new T.BoxGeometry(2.2,.65,2.4),warmMetal);foot.position.set(sx,signMountY,signZ);area.add(foot);
   }
   const signRoot=new T.Group();signRoot.position.set(0,signY,signZ);area.add(signRoot);
   const signBack=new T.Mesh(new T.BoxGeometry(34,9.2,1.15),graphite);signRoot.add(signBack);
   const signFace=new T.Mesh(new T.BoxGeometry(32.8,8.0,.18),titanium);signFace.position.z=.62;signRoot.add(signFace);
   const signInset=new T.Mesh(new T.BoxGeometry(31.8,7.05,.12),plum);signInset.position.z=.73;signRoot.add(signInset);
   for(const sy of [-4.25,4.25]){
    const trim=new T.Mesh(new T.BoxGeometry(34.4,.22,1.35),warmMetal);trim.position.y=sy;signRoot.add(trim);
   }
   for(const sx of [-16.8,16.8]){
    const trim=new T.Mesh(new T.BoxGeometry(.22,8.5,1.35),signAccent[z.id]||cyan);trim.position.x=sx;signRoot.add(trim);
   }
   const title=new T.Mesh(new T.PlaneGeometry(29,6.4),new T.MeshBasicMaterial({map:labelTexture(z.name,z.sub),transparent:true,side:T.FrontSide,depthWrite:false,toneMapped:false}));
   title.position.set(0,0,.82);signRoot.add(title);
   const plaqueWorld=new T.Vector3(),cameraWorld=new T.Vector3();
   signRoot.onBeforeRender=(renderer,activeScene,camera)=>{
    signRoot.getWorldPosition(plaqueWorld);camera.getWorldPosition(cameraWorld);
    signRoot.lookAt(cameraWorld.x,plaqueWorld.y,cameraWorld.z);
   };
   const addBox=(x,y,zz,w,h,d,m)=>addRoundedShell(x,y,zz,w,h,d,m,Math.min(.34,w*.16,h*.2,d*.2),Math.min(.085,w*.1,h*.12,d*.12));
   // Higher-fidelity architectural primitives: bevelled extrusions, lathed metal profiles and curved display skins.
   const addRoundedShell=(x,y,z,w,h,d,material,radius=0.7,bevel=0.12)=>{
    const s=new T.Shape(),r=Math.min(radius,w*.22,h*.22);
    s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
    s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
    s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    bevel=Math.min(bevel,d*.22,h*.22,w*.22);const g=new T.ExtrudeGeometry(s,{depth:Math.max(.04,d-2*bevel),bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:8});
    g.computeVertexNormals();const o=new T.Mesh(g,material);o.position.set(x,y,z-d/2+bevel);o.castShadow=true;o.receiveShadow=true;area.add(o);return o;
   };
   const addCurvedVolume=(x,y,z,w,h,d,material,bulge=1.1)=>{
    // Closed, curved architectural volume: front and rear skins plus sealed side walls.
    const nx=28,ny=8,verts=[],indices=[];
    const front=(u,v)=>[x+(u-.5)*w,y+(v-.5)*h,z-d/2-bulge*(1-4*(u-.5)*(u-.5))];
    const back=(u,v)=>[x+(u-.5)*w,y+(v-.5)*h,z+d/2];
    const pushGrid=(fn)=>{
     const base=verts.length/3;
     for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)verts.push(...fn(i/nx,j/ny));
     for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
      const a=base+j*(nx+1)+i,b=a+1,c0=a+nx+1,d0=c0+1;
      indices.push(a,b,c0,b,d0,c0);
     }
    };
    pushGrid(front);pushGrid(back);
    const frontCount=(nx+1)*(ny+1),backBase=frontCount;
    // Close the four perimeter edges with triangulated strips.
    const edge=(a,b,c0,d0)=>indices.push(a,b,c0,b,d0,c0);
    for(let i=0;i<nx;i++){
     edge(i,i+1,backBase+i,backBase+i+1);
     const f=(ny*(nx+1))+i,b=backBase+f;
     edge(f+1,f,b+1,b);
    }
    for(let j=0;j<ny;j++){
     const f0=j*(nx+1),f1=(j+1)*(nx+1);
     edge(f0,f1,backBase+f0,backBase+f1);
     const r0=f0+nx,r1=f1+nx;
     edge(r1,r0,backBase+r1,backBase+r0);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();
    const volumeMaterial=material.clone();volumeMaterial.side=T.DoubleSide;const mesh=new T.Mesh(g,volumeMaterial);mesh.castShadow=true;mesh.receiveShadow=true;area.add(mesh);return mesh;
   };
   const addCurvedGlazing=(x,y,z,w,h,d,material,bulge=.8)=>{
    const pane=addCurvedVolume(x,y,z,w,h,d,material,bulge);
    // Slim extruded mullions sit proud of the glazing and are spaced away from its surface.
    for(let i=-2;i<=2;i++){
     const u=i/4,zz=z-d/2-bulge*(1-4*u*u)-.09;
     const mullion=addRoundedShell(x+u*w,y,zz,.13,h+.18,.18,warmMetal,.05,.035);
     mullion.rotation.z=0;
    }
    return pane;
   };
   const addSculptedFacade=(x,y,z,w,h,depth,material,bulge=1.2)=>{
    // Use a closed curved volume, not a single two-sided sheet: the facade has real thickness.
    const skin=addCurvedVolume(x,y,z,w,h,depth,material,bulge);
    const profileCurve=(u)=>z-depth/2-bulge*(1-4*u*u)-.12;
    for(const u of [-.48,-.24,0,.24,.48]){
     const xx=x+u*w,zz=profileCurve(u);
     const path=new T.CatmullRomCurve3([new T.Vector3(xx,y-h/2,zz),new T.Vector3(xx,y,zz-.04),new T.Vector3(xx,y+h/2,zz)]);
     area.add(new T.Mesh(new T.TubeGeometry(path,16,.065,7,false),u===0?warmMetal:silver));
    }
    for(const yy of [-h/2,h/2]){
     const pts=[];for(let k=0;k<=32;k++){const u=k/32-.5;pts.push(new T.Vector3(x+u*w,y+yy,z-depth/2-bulge*(1-4*u*u)-.1))}
     area.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),48,.11,8,false),warmMetal));
    }
    return skin;
   };
   const addBotanicalTree=(x,z,height=8,foliage=leafPalette[1],form=0)=>{
     const species=((form%4)+4)%4,trunkProfile=[[.06,0],[.2,.16],[.17,.48],[.145,height*.42],[.115,height*.68],[.075,height*.88],[.035,height],[0,height]];
     addLathedProfile(x,0,z,trunkProfile,barkMat,18);
     const addLeaf=(px,py,pz,angle,tilt,scale,mi)=>{const leaf=new T.Mesh(leafGeometries[(mi+species)%3],leafPalette[(mi+species)%leafPalette.length]);leaf.position.set(px,py,pz);leaf.rotation.set(tilt,angle,Math.sin(angle+form)*.24);leaf.scale.set(scale,scale*(.78+(mi%3)*.1),scale);leaf.castShadow=true;area.add(leaf)};
     const branches=species===1?9:species===2?6:7;
     for(let b=0;b<branches;b++){const a=b*Math.PI*2/branches+form*.29,reach=height*(species===1?.14:species===2?.28:.19+(b%3)*.025),base=height*(species===2?.28:.38+(b%3)*.075),start=new T.Vector3(x,base,z),end=new T.Vector3(x+Math.cos(a)*reach,Math.min(height*.91,base+height*(.23+(b%2)*.04)),z+Math.sin(a)*reach),mid=start.clone().lerp(end,.58);mid.y+=height*.035;area.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([start,mid,end]),16,.085-(b%3)*.012,7,false),barkMat));
      for(let l=0;l<(species===1?6:5);l++){const t=.22+l*.14,p=start.clone().lerp(end,t),side=(l%2?1:-1)*(.24+(species===2?.18:0));addLeaf(p.x+Math.cos(a+Math.PI/2)*side,p.y+.12+(l%3)*.08,p.z+Math.sin(a+Math.PI/2)*side,a+(l%2?-.55:.55),-.28+(l%3)*.18,.72+(l%2)*.16,b+l);if(l%2===0)addLeaf(p.x,p.y+.18,p.z,a+.8,-.42,.58,b+l+2)}
     }
     const crowns=species===1?13:species===2?9:species===3?15:11;
     for(let c=0;c<crowns;c++){const a=c*Math.PI*2/crowns+form*.21,r=height*(species===1?.075:species===2?.19:species===3?.2:.12+(c%3)*.025),cy=height*(species===1?.82:species===2?.62:species===3?.73:.72+(c%4)*.045),cx=x+Math.cos(a)*r,cz=z+Math.sin(a)*r;for(let j=0;j<4;j++){const aa=a+(j-1.5)*.36,rr=height*(.04+(j%2)*.014);addLeaf(cx+Math.cos(aa)*rr,cy+(j%3)*.2,cz+Math.sin(aa)*rr,aa,species===3?-.12:-.38+(j%2)*.24,.72+(j%2)*.16,c+j)}}
    };
    const addShrubMass=(x,z,width=2.4,height=1.35,variant=0)=>{const clumps=variant%2?7:5;for(let i=0;i<clumps;i++){const a=i/clumps*Math.PI*2+variant*.31,r=width*(.12+(i%3)*.12),px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,py=height*(.48+(i%3)*.1);for(let j=0;j<7;j++){const aa=a+j*2.399,rr=.16+(j%3)*.09,leaf=new T.Mesh(leafGeometries[(i+j+variant)%3],leafPalette[(i+j+variant)%leafPalette.length]);leaf.position.set(px+Math.cos(aa)*rr,py+(j%3)*.12,pz+Math.sin(aa)*rr);leaf.rotation.set(-.25+(j%3)*.18,aa,Math.sin(aa)*.22);leaf.scale.set(.34+(j%2)*.1,.42+(j%3)*.08,.34);area.add(leaf)}}};
    const addGrassTuft=(x,z,scale=1,variant=0)=>{const count=7+variant%4;for(let i=0;i<count;i++){const a=i/count*Math.PI*2+variant*.37,len=scale*(.65+(i%3)*.18),bend=scale*(.16+(i%2)*.1),pts=[new T.Vector3(x,1.28,z),new T.Vector3(x+Math.cos(a)*bend*.45,1.28+len*.58,z+Math.sin(a)*bend*.45),new T.Vector3(x+Math.cos(a)*bend,1.28+len,z+Math.sin(a)*bend)];area.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),8,.035*scale,5,false),leafPalette[(i+variant)%leafPalette.length]))}};
    const addFlowerSpray=(x,z,scale=1,variant=0)=>{const stemH=scale*(.8+(variant%3)*.16),stem=new T.Vector3(x,1.28,z),top=new T.Vector3(x+Math.sin(variant*1.7)*.18*scale,1.28+stemH,z+Math.cos(variant*1.3)*.14*scale);area.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([stem,stem.clone().lerp(top,.55),top]),12,.035*scale,6,false),barkMat));for(let k=0;k<3;k++){const a=k*Math.PI*2/3+variant*.8,petal=new T.Mesh(leafGeometries[1],k%2?coral:amber);petal.position.set(top.x+Math.cos(a)*.18*scale,top.y,top.z+Math.sin(a)*.18*scale);petal.rotation.set(-.2,a,Math.PI/2);petal.scale.set(.22*scale,.25*scale,.22*scale);area.add(petal)}const center=new T.Mesh(new T.SphereGeometry(.09*scale,8,6),warmMetal);center.position.copy(top);area.add(center)};
    const addLathedProfile=(x,y,z,profile,material,segments=24)=>{
    const pts=profile.map(p=>new T.Vector2(p[0],p[1]));
    const g=new T.LatheGeometry(pts,segments);g.computeVertexNormals();
    const o=new T.Mesh(g,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;area.add(o);return o;
   };
   const addCurvedScreen=(x,y,z,w,h,material)=>{
    const verts=[],uv=[],indices=[],nx=20,ny=8,curve=Math.min(1.8,w*.045);
    for(let iy=0;iy<=ny;iy++)for(let ix=0;ix<=nx;ix++){
     const u=ix/nx-.5,v=iy/ny-.5;
     verts.push(x+u*w,y+v*h,z+curve*(1-4*u*u));
     uv.push(ix/nx,iy/ny);
    }
    for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){
     const a=iy*(nx+1)+ix,b=a+1,c0=a+nx+1,d0=c0+1;
     indices.push(a,b,c0,b,d0,c0);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
    const m=material.clone();m.side=T.DoubleSide;const o=new T.Mesh(g,m);area.add(o);return o;
   };
   const addVaultCanopy=(x,y,z,w,depth,material)=>{
    const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.quadraticCurveTo(w*.34,depth*.42,0,depth*.5);s.quadraticCurveTo(-w*.34,depth*.42,-w/2,0);
    const g=new T.ExtrudeGeometry(s,{depth:Math.max(.2,depth*.08),bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.16,bevelThickness:.12,curveSegments:24});
    g.computeVertexNormals();const o=new T.Mesh(g,material);o.rotation.x=Math.PI/2;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;area.add(o);return o;
   };

   const localCylinder=(x,y,zz,rt,rb,h,m,segments=12)=>{const o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,segments),m);o.position.set(x,y,zz);area.add(o);return o};
   const addPlanter=(x,zz,w=8,d=5,foliage=jade,variant=0)=>{
    addRoundedShell(x,.52,zz,w,1.04,d,graphite,.42,.12);
    addRoundedShell(x,1.08,zz,w-.48,.2,d-.48,ivory,.36,.06);
    addRoundedShell(x,1.2,zz,w-1,.1,d-1,paleStone,.3,.04);
    const planterSoil=new T.Mesh(new T.PlaneGeometry(w-1.35,d-1.35),soilMat);planterSoil.rotation.x=-Math.PI/2;planterSoil.position.set(x,1.27,zz);area.add(planterSoil);
    const count=Math.max(3,Math.floor(w/2.2));
     for(let n=0;n<count;n++){const px=x+(n-(count-1)/2)*(w-1.8)/Math.max(1,count-1),pz=zz+(n%2?.65:-.65),species=(variant+n)%4;
      if(species===0)addBotanicalTree(px,pz,3.1,leafPalette[1],variant+n);
      else if(species===1)addShrubMass(px,pz,1.05,1.2,variant+n);
      else if(species===2){addGrassTuft(px,pz,.95,variant+n);addFlowerSpray(px+.22,pz-.16,.82,variant+n)}
      else{addBotanicalTree(px,pz,2.7,leafPalette[2],variant+n);addGrassTuft(px-.34,pz+.28,.65,variant+n)}
     }
     for(const side of [-1,1])addRoundedShell(x+side*(w/2-.45),.82,zz,.18,.16,d-.6,warmMetal,.07,.04);
   };
   const addBench=(x,zz,accentMat=warmMetal,rotation=0)=>{
    const g=new T.Group();g.position.set(x,0,zz);g.rotation.y=rotation;area.add(g);
    const seat=addRoundedShell(0,1.1,0,7.4,.42,1.25,ivory,.2,.08);g.add(seat);area.remove(seat);
    const back=addRoundedShell(0,2.15,-.48,7.4,1.7,.38,plum,.18,.08);g.add(back);area.remove(back);
    for(const sx of [-3,3]){const leg=addLathedProfile(sx,0,0,[[.18,0],[.28,.16],[.2,.38],[.16,.96],[.12,1.05]],warmMetal,12);g.add(leg);area.remove(leg)}
    const rail=addRoundedShell(0,1.34,.66,6.8,.12,.14,accentMat,.05,.03);g.add(rail);area.remove(rail);
   };
   const addBeacon=(x,zz,accentMat=cyan,h=5)=>{localCylinder(x,h/2,zz,.48,.72,h,graphite,10);localCylinder(x,h*.72,zz,.58,.58,.26,warmMetal,10);const lens=new T.Mesh(new T.CylinderGeometry(.34,.34,.34,12),accentMat);lens.position.set(x,h*.82,zz);area.add(lens);const cap=new T.Mesh(new T.SphereGeometry(.42,10,8),whiteGlow);cap.position.set(x,h+.08,zz);area.add(cap)};
   const addKiosk=(x,zz,accentMat=cyan,scale=1)=>{
    const g=new T.Group();g.position.set(x,0,zz);g.scale.setScalar(scale);area.add(g);
    const shell=addRoundedShell(0,2.5,0,3.2,5,.9,graphite,.42,.14);g.add(shell);area.remove(shell);
    const fascia=addRoundedShell(0,3.05,.52,2.55,2.35,.12,accentMat,.24,.035);g.add(fascia);area.remove(fascia);
    const hood=addVaultCanopy(0,4.35,.04,3.65,1.25,ivory);g.add(hood);area.remove(hood);
    const base=addRoundedShell(0,.45,.08,3.7,.48,1.05,graphite,.18,.08);g.add(base);area.remove(base);
    for(const sx of [-1,1]){const fin=addLathedProfile(sx*1.25,.68,.5,[[.07,0],[.09,.12],[.06,1.25],[.1,1.35],[.04,1.35]],silver,12);g.add(fin);area.remove(fin)}
    return g;
   };
   const addStorageRack=(x,zz,w=8,h=6,accentMat=warmMetal)=>{for(const sx of [-1,1])addBox(x+sx*w/2,h/2,zz,.28,h,.42,graphite);for(let level=0;level<3;level++){const y=1+level*2.1;addBox(x,y,zz,w,.22,1.1,silver);for(let n=-2;n<=2;n++){const px=x+n*w*.17;addBox(px,y+.72,zz,.95,1.25,.9,n%2?plum:graphite);addBox(px,y+1.39,zz,.62,.1,.94,level%2?accentMat:warmMetal)}}addBox(x,h+.2,zz,w+.8,.28,1.4,accentMat)};
   const addOverheadLamp=(x,zz,accentMat=cyan)=>{addBox(x,12,zz,.24,5,.24,warmMetal);addBox(x,9.35,zz,3.8,.3,1.6,graphite);addBox(x,9.12,zz,2.8,.12,1.1,accentMat)};
   const addPanel=(x,y,zz,w,h,m)=>{const o=new T.Mesh(new T.PlaneGeometry(w,h),m);o.position.set(x,y,zz);area.add(o);return o};
   const addColumn=(x,zz,h=18,width=2.2,m=graphite)=>{
    // Tapered, moulded structural pier with a flared base and capital; no square-post silhouette.
    const profile=[[0,0],[width*.38,0],[width*.5,.18],[width*.43,.52],[width*.39,h-.72],[width*.5,h-.28],[width*.42,h],[0,h]];
    return addLathedProfile(x,0,zz,profile,m,24);
   };
   const addBeam=(x,y,zz,w,h,d,m=graphite,rz=0)=>{
    const o=addRoundedShell(x,y,zz,w,h,d,m,Math.min(.45,h*.28,d*.22),Math.min(.12,h*.16,d*.16));
    o.rotation.z=rz;return o;
   };
   const addFacadeBay=(x,zz,w,h,accentMat=accent)=>{
    // Deep portal surround with softened shoulders, a curved crown and sculpted metal piers.
    const pierProfile=[[0,0],[.72,0],[.86,.22],[.68,.52],[.58,1.15],[.72,1.45],[.58,h*.72],[.88,h*.9],[.82,h],[0,h]];
    for(const side of [-1,1]){
     addLathedProfile(x+side*(w/2),0,zz,pierProfile.map(p=>[p[0],p[1]]),graphite,20);
     addLathedProfile(x+side*(w/2),0,zz,pierProfile.map((p,i)=>[p[0]+(i===0||i===9?0:.13),p[1]]),silver,20);
     addRoundedShell(x+side*(w/2),.55,zz,2.5,1.1,3.0,warmMetal,.38,.08);
    }
    addVaultCanopy(x,h,zz-1.05,w+2.4,3.2,silver);
    addRoundedShell(x,h+.55,zz-.92,w*.78,.28,2.8,accentMat,.12,.06);
    addRoundedShell(x,.95,zz,w,.48,2.5,warmMetal,.18,.08);
   };
   const addScreen=(x,y,zz,w,h,accentMat=cyan)=>{
    addRoundedShell(x,y,zz,w+1.15,h+1.0,.9,graphite,Math.min(1.1,h*.12),.16);
    addRoundedShell(x,y,zz+.43,w+.18,h+.12,.14,plum,Math.min(.9,h*.1),.045);
    const display=new T.MeshBasicMaterial({color:accentMat.color||0x70ddeb,emissive:accentMat.color||0x70ddeb,emissiveIntensity:.32,toneMapped:false,side:T.DoubleSide});
    addCurvedScreen(x,y,zz+.53,w*.92,h*.88,display);
    for(const sx of [-1,1]){
     addLathedProfile(x+sx*(w/2+.39),y-h*.5,zz+.36,[[.12,0],[.16,.12],[.11,.32],[.11,h-.32],[.17,h-.12],[.12,h]],silver,12);
    }
   };
   const addCounter=(x,y,zz,w,d,top=ivory,front=graphite)=>{
    // Furniture-grade counter: radiused carcass, layered stone worktop and recessed service fascia.
    addRoundedShell(x,y,zz,w,1.85,d,front,Math.min(.72,d*.16),.14);
    addRoundedShell(x,y+1.0,zz-.08,w+.48,.34,d+.3,top,.32,.09);
    addRoundedShell(x,y+.28,zz+d*.5+.035,w*.78,.72,.12,plum,.18,.04);
    addRoundedShell(x,y+1.94,zz+d*.34,w*.82,.16,.16,warmMetal,.07,.035);
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
    addSculptedFacade(0,13,-43,100,26,2.4,graphite,1.8);
    addCurvedVolume(0,25.2,-41.55,94,1.0,.7,warmMetal,.65);
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
     addTrussBay(side*34,-12,24,27,amber);
    }
    addVaultCanopy(0,28,-42,101,58,silver);
    for(let i=-4;i<=4;i++)addBeam(i*11,27.05,-13,.34,1.1,56,i%2?warmMetal:graphite);
    addBox(0,29,-13,82,.22,1.2,amber);
    // A waiting gallery sits behind the teller line, with real seating and service dividers.
    for(let i=0;i<4;i++){const x=-30+i*20;addBox(x,1.3,12,14,1.2,4,plum);addBox(x,2.15,12,13,.18,3.7,ivory);addBox(x,4.5,10,1.1,5,.8,silver)}
    for(let i=-3;i<=3;i++){addBox(i*13,7,-31,1.4,5,1.2,silver);addBox(i*13,9.8,-31,5,.18,1.5,amber)}
   }else if(z.id==='ranking'){
    // Ranking forum: a monumental stepped display wall, flanked by deep buttresses and public tiers.
    addSculptedFacade(0,18,-45,102,36,3.2,graphite,2.2);
    addCurvedVolume(0,35,-43.18,94,1.0,.8,silver,.7);
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
     addBox(side*51,17,-15,3,34,62,graphite);
     addBox(side*48.9,14,-15,.18,22,54,coral);
     addBeam(side*39,35,-14,26,1.6,58,silver);
    }
    addStair(0,2,82,5,7,plum);
    addBox(0,1.4,-8,18,2.8,12,warmMetal);addBox(0,2.95,-8,15,.24,9,ivory);
    for(let i=-4;i<=4;i++)addBox(i*9,3.5,35,1.1,6,1.2,i%2?coral:silver);
   }else if(z.id==='recruitment'){
    // Recruitment pavilion: three private interview suites with glazed partitions and shared circulation.
    addSculptedFacade(0,14,-43,100,28,2.2,graphite,1.8);
    addVaultCanopy(0,28,-40.9,103,6,silver);
    for(let bay=-1;bay<=1;bay++){
     const x=bay*32;
     addFacadeBay(x,-40,25,25,jade);
     addCurvedVolume(x,8,-30,23,16,1.2,graphite,1.05);
     addCurvedGlazing(x,8,-29.32,19,12,.16,glass,.78);
     addCurvedVolume(x,8,-28.95,18,11,.22,jade,.72);
     addBox(x,1.5,-19,19,2.1,6,plum);
     addCounter(x,2.0,-37,12,3,ivory,graphite);
     addBox(x,5.3,-35.1,10,.18,.12,jade);
     for(const side of [-1,1]){
      addColumn(x+side*11,-13,23,1.25,graphite);
      addBeam(x+side*11,23,-13,1.4,1.0,54,silver);
      addBox(x+side*11,12,-13,.12,19,48,jade);
     }
     addBeam(x,25,-13,23,1.1,50,warmMetal);
     addBox(x,26,-13,17,.16,50,jade);
     // Privacy fins and acoustic ceiling baffles define each interview room without closing it off.
     for(let j=-2;j<=2;j++)addBox(x+j*3.2,21,-12,.18,5,31,j%2?plum:graphite);
     for(let j=-2;j<=2;j++)addBox(x+j*3.2,23, -5,2.4,.22,18,ivory);
    }
    addBox(0,2,24,78,1.4,8,graphite);
    for(let i=-3;i<=3;i++){const x=i*11;addBox(x,3.2,24,7,.16,7,jade);addBox(x,4.1,21,1.1,2.2,.8,silver)}
   }else if(z.id==='commissions'){
    // Dispatch center: a two-level mission control wall with cantilevered terminal gantries.
    addSculptedFacade(0,17,-45,104,34,3.2,graphite,2.0);
    addVaultCanopy(0,35,-43.1,108,4.2,silver);
    for(let i=0;i<5;i++){
     const x=-40+i*20;
     addCurvedVolume(x,11,-42.95,17,18,.55,plum,.65);
     addScreen(x,15,-42.7,13,9,i%2?cyan:amber);
     addBox(x,3,-39,16,1.2,5,graphite);
     addBox(x,4,-37,14,.18,3,ivory);
     for(let j=-1;j<=1;j++)addBox(x+j*4,6,-37,.55,4,.6,i%2?amber:jade);
    }
    for(const side of [-1,1]){
     addBox(side*52,13,-12,3,26,66,graphite);
     addBox(side*49.8,13,-12,.18,21,58,amber);
     addTrussBay(side*37,-12,27,31,amber);
    }
    addVaultCanopy(0,32,-42,105,62,silver);
    for(let i=-4;i<=4;i++)addBeam(i*12,30.9,-13,.4,1.3,60,i%2?amber:graphite);
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
     addCurvedVolume(sx,7,sz,30,14,1.2,graphite,.9);
     addCurvedGlazing(sx,7,sz+.68,26,10,.16,glass,.62);
     addBox(sx,1.2,sz+7,26,2.4,12,plum);
     addBox(sx,2.55,sz+7,23,.18,10,ivory);
     for(let j=-1;j<=1;j++){addBox(sx+j*8,4,sz+13,1.2,4,1.4,violet);addBox(sx+j*8,6.3,sz+13,4,.18,1.6,warmMetal)}
     addBeam(sx,16,sz,30,1.3,4,silver);
     for(let j=-1;j<=1;j++)addBeam(sx+j*8,13,sz-2,.22,5,.25,violet,j*.12);
    }
    for(const side of [-1,1]){
     addColumn(side*49,-7,23,2.4,graphite);
     addBeam(side*49,31,-7,2.6,1.4,90,silver);
    }
    addBeam(0,32,-7,100,1.8,3.5,warmMetal);
    for(let i=-4;i<=4;i++)addBeam(i*12,30.8,-7,.36,2,86,i%2?violet:graphite);
    for(let i=-2;i<=2;i++){addBox(i*8,1.1,7,7,2.2,6,graphite);addBox(i*8,2.35,7,6.4,.18,5.4,cyan)}
    for(let i=-3;i<=3;i++){const x=i*11;addBox(x,.85,43,9,1.5,4,plum);addBox(x,1.75,43,8,.16,3.8,violet)}
   }else if(z.id==='entertainment'){
    // Simulation pavilion: three large hangar bays with deep portal frames and enclosed equipment shells.
    addSculptedFacade(0,14,-44,104,28,2.8,graphite,2.0);
    for(let bay=-1;bay<=1;bay++){
     const x=bay*34;
     addTrussBay(x,-20,28,bay===0?33:29,violet);
     addCurvedVolume(x,8,-18,24,16,1.5,plum,1.05);
     addCurvedGlazing(x,8,-17.1,20,12,.2,glass,.82);
     addCurvedVolume(x,8,-16.85,18,10,.2,violet,.72);
     addBox(x,2,-5,20,2.2,8,graphite);
     addBox(x,3.25,-5,17,.18,7,ivory);
     for(let side=-1;side<=1;side+=2){
      const fin=addBox(x+side*13,10,-5,1.1,18,28,graphite);fin.rotation.z=side*.1;
      addBox(x+side*11.9,10,-4,.18,14,24,violet);
     }
     // Service hatch, ventilation louvres and reinforced lower casing.
     addBox(x,3,-14,15,5,1.2,silver);
     for(let j=-3;j<=3;j++)addBox(x+j*2,3,-13.25,.22,3.8,.12,graphite);
     addBox(x,25,-7,21,1.2,18,warmMetal);
    }
    addBox(0,1.2,27,82,2.4,14,plum);addBox(0,2.55,27,78,.18,12,violet);
    for(let i=-2;i<=2;i++){const x=i*16;addBox(x,6,38,8,8,1.2,graphite);addScreen(x,7,38.68,6,5,violet)}
   }else if(z.id==='food'){
    // Food hall: a covered market street with three service fronts and a shared dining room.
    addSculptedFacade(0,9,-44,104,18,2.8,graphite,1.6);
    addVaultCanopy(0,18.5,-41.8,108,5.2,warmMetal);
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
    addBeam(0,27,-12,104,1.6,62,ivory);
    for(let i=-4;i<=4;i++)addBeam(i*12,26,-12,.34,1.2,58,i%2?jade:coral);
    // Shared dining room: rectangular tables, benches, lighting rails and a clear central aisle.
    for(let row=0;row<3;row++)for(let col=-2;col<=2;col++){
     const x=col*15,zz=13+row*13;
     addBox(x,1.6,zz,9,1.2,5,ivory);
     addBox(x,2.28,zz,8.7,.16,4.7,copper);
     for(const side of [-1,1]){addBox(x+side*6,1,zz,3.2,1.5,4,plum);addBox(x+side*6,.3,zz,2.8,.18,3.7,warmMetal)}
    }
    for(let i=-3;i<=3;i++){const x=i*14;addColumn(x,-2,9,1.0,warmMetal);addBox(x,13,-2,9,.45,1.4,ivory)}
   }
   // Occupied public-space layer: circulation furniture, service objects, planting and wayfinding.
   // Props sit in secondary bays and along the edges, keeping the central approach clear.
   if(z.id==='exchange'){
    for(let i=0;i<6;i++){const x=-39+i*15.6;localCylinder(x,.68,8,.18,.25,1.36,warmMetal,10);localCylinder(x,1.45,8,.42,.42,.2,amber,10)}
    addKiosk(-43,26,amber,.92);addKiosk(43,26,amber,.92);addPlanter(-43,39,10,5,jade,0);addPlanter(43,39,10,5,jade,1);
    addBench(-22,29,amber);addBench(22,29,amber);for(const x of [-47,0,47])addBeacon(x,-4,amber,6);addStorageRack(0,38,12,6,amber);for(const x of [-34,34])addOverheadLamp(x,4,amber);
   }else if(z.id==='ranking'){
    for(let i=0;i<5;i++){const x=-38+i*19;addBox(x,2.2,24,7,4.4,5,graphite);addBox(x,4.55,24,6.2,.22,4.2,i===2?amber:coral);const trophy=new T.Mesh(new T.TorusGeometry(1.1,.22,8,20),i===2?amber:warmMetal);trophy.position.set(x,6.1,24);area.add(trophy);localCylinder(x,5.7,24,.16,.16,1.1,silver,8)}
    addBench(-37,39,coral);addBench(37,39,coral);addPlanter(-48,31,8,5,jade,2);addPlanter(48,31,8,5,jade,3);for(const x of [-42,-21,21,42])addBeacon(x,9,coral,7);addKiosk(-43,-2,coral,.85);addKiosk(43,-2,coral,.85);for(let i=-2;i<=2;i++)addOverheadLamp(i*18,33,i%2?coral:amber);
   }else if(z.id==='recruitment'){
    addKiosk(-44,26,jade,.92);addKiosk(44,26,jade,.92);addPlanter(-47,38,10,6,jade,0);addPlanter(47,38,10,6,jade,1);addBench(-22,30,jade);addBench(22,30,jade);
    for(const x of [-43,-14,14,43]){addBeacon(x,7,jade,5);addBox(x,3.2,7,2.4,.24,2.4,ivory)}
    for(let i=-2;i<=2;i++){const x=i*17;addBox(x,1.1,40,10,2.2,4,plum);addBox(x,2.32,40,9.2,.16,3.5,jade)}addStorageRack(0,33,13,5,jade);for(const x of [-34,34])addOverheadLamp(x,3,jade);
   }else if(z.id==='commissions'){
    addKiosk(-48,27,amber,.9);addKiosk(48,27,cyan,.9);addPlanter(-51,40,9,5,jade,1);addPlanter(51,40,9,5,jade,2);addStorageRack(-33,27,10,7,amber);addStorageRack(33,27,10,7,cyan);
    for(let i=-2;i<=2;i++){const x=i*18;addBox(x,1.15,43,11,2.3,5,graphite);addBox(x,2.42,43,10.2,.16,4.4,i%2?cyan:amber)}for(const x of [-42,-14,14,42])addBeacon(x,8,x<0?amber:cyan,6);addBench(-18,31,amber);addBench(18,31,cyan);for(let i=-2;i<=2;i++)addOverheadLamp(i*18,4,i%2?cyan:amber);
   }else if(z.id==='teams'){
    for(const x of [-43,43]){addPlanter(x,37,10,6,jade,x>0?1:2);addBench(x,25,violet)}
    for(let cell=0;cell<4;cell++){const x=(cell%2?1:-1)*39,zz=cell<2?-5:39;addKiosk(x,zz,violet,.78);addStorageRack(x,zz+9,8,5,violet);for(const side of [-1,1])addBeacon(x+side*8,zz+1,violet,5)}
    addBox(0,1.2,35,16,2.4,8,graphite);addBox(0,2.55,35,14,.18,7,violet);for(let i=-3;i<=3;i++){const x=i*12;addBox(x,4.4,35,1.1,4.5,1.2,silver);addBox(x,6.8,35,2.2,.18,1.5,amber)}for(const x of [-25,25])addOverheadLamp(x,-1,violet);
   }else if(z.id==='entertainment'){
    for(let bay=-1;bay<=1;bay++){const x=bay*36;addKiosk(x,28,violet,.88);addBench(x,39,violet);addBox(x,2.2,15,9,4.4,5,graphite);addBox(x,4.55,15,8.2,.22,4.2,amber);const prize=new T.Mesh(new T.IcosahedronGeometry(1.35,1),bay===0?amber:violet);prize.position.set(x,6.1,15);area.add(prize);addPlanter(x-12,37,6,5,jade,bay+2)}
    for(let i=-3;i<=3;i++){const x=i*13;addBeacon(x,5,i%2?violet:coral,5);addOverheadLamp(x,43,i%2?violet:cyan)}addStorageRack(-48,26,9,6,violet);addStorageRack(48,26,9,6,coral);
   }else if(z.id==='food'){
    for(let i=-2;i<=2;i++){const x=i*18;addBox(x,1.1,43,10,2.2,5,plum);addBox(x,2.3,43,9.2,.16,4.4,ivory);addBox(x,3.4,43,1.1,2.1,.8,i%2?coral:amber);for(const side of [-1,1]){addBox(x+side*6,.8,43,1.5,1.6,1.5,graphite);addBox(x+side*6,1.65,43,1.3,.16,1.3,warmMetal)}}
    addKiosk(-47,28,coral,.82);addKiosk(47,28,jade,.82);addPlanter(-49,39,10,6,jade,1);addPlanter(49,39,10,6,jade,2);addStorageRack(-36,25,8,5,coral);addStorageRack(36,25,8,5,jade);
    for(const x of [-42,-21,21,42])addBeacon(x,6,x<0?coral:jade,5);for(let i=-3;i<=3;i++)addOverheadLamp(i*13,4,i%2?coral:amber);for(const x of [-29,29]){addBench(x,34,coral);addPlanter(x,43,7,4,jade,0)}
   }
   // Public-life layer: planted edges, sheltered seating, service fixtures and wayfinding.
   // These are arranged around the perimeter of each forecourt; the central approach stays open.
   const addLinearGarden=(x,z,w,m=jade)=>{
    addBox(x,.42,z,w,.84,3.6,graphite);addBox(x,.91,z,w-.35,.16,3.22,ivory);
    const n=Math.max(4,Math.floor(w/2.2));
    for(let k=0;k<n;k++){const px=x+(k-(n-1)/2)*(w-2)/(n-1),pz=z+(k%2?-.55:.55);
     addBotanicalTree(px,pz,3.4,k%2?leafPalette[1]:leafPalette[0],k);
    }
   };
   // Layered edge gardens: architectural planter beds with trees, shrubs and low ground cover.
   // These soften the hard service architecture without obstructing the central circulation aisle.
   const addLandscapeBed=(x,z,length,m=jade,variant=0)=>{
    const width=6.8;
    addBox(x,.48,z,width,.96,length,graphite);
    addBox(x,1.02,z,width-.42,.16,length-.42,ivory);
    addBox(x,1.14,z,width-.9,.08,length-.9,paleStone);
    addBox(x,1.22,z,width-1.15,.12,length-1.15,variant%2?plum:graphite);
    const bedSoil=new T.Mesh(new T.PlaneGeometry(width-1.55,length-1.55),soilMat);bedSoil.rotation.x=-Math.PI/2;bedSoil.position.set(x,1.285,z);area.add(bedSoil);
    const count=variant%2?3:4;
    for(let n=0;n<count;n++){
     const pz=z+(n-(count-1)/2)*(length-3)/Math.max(1,count-1);
     const px=x+(n%2?-.72:.72);
     addBotanicalTree(px,pz,6.8+(n%2)*.8,n%2?leafPalette[1]:leafPalette[0],variant+n);
    }
    for(let n=0;n<Math.floor(length/2.4);n++){
     const pz=z-length*.42+n*2.4;
     const sx=x+(n%2?1.65:-1.65);addShrubMass(sx,pz,1.55,1.05,variant+n);if(n%2===0)addFlowerSpray(sx+.25,pz-.12,.82,variant+n);if(n%3===1)addGrassTuft(sx-.42,pz+.25,.72,variant+n);
    }
   };
   // Paired perimeter gardens create a planted edge and a sense of depth in every district.
   const gardenAccent={exchange:jade,ranking:jade,recruitment:jade,commissions:jade,teams:jade,entertainment:jade,food:jade}[z.id];
   addLandscapeBed(-58.5,19,25,gardenAccent,index);
   addLandscapeBed(58.5,19,25,gardenAccent,index+1);
   const addPublicBench=(x,z,m=warmMetal,rot=0)=>{
    const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;area.add(g);
    addBox(0,.58,0,5.8,.22,1.35,graphite);
    for(let k=0;k<4;k++)addBox(0,.78+k*.22,-.38,5.65,.16,.24,k%2?ivory:m);
    addBox(0,1.65,-.53,5.8,1.35,.28,plum);
    for(const sx of [-2.35,2.35]){addBox(sx,.34,0,.22,.68,1,silver);addBox(sx,1.05,.08,.42,.16,1.15,warmMetal)}
    addBox(0,.96,.62,5.1,.12,.12,m);
   };
   const addInfoTotem=(x,z,m=cyan)=>{
    addBox(x,.38,z,2.8,.76,2.1,graphite);addBox(x,2.65,z,1.45,4.6,1.15,titanium);
    addBox(x,3.05,z+.62,1.12,2.5,.12,plum);addBox(x,3.05,z+.71,.82,1.85,.08,m);
    addBox(x,5.1,z,2.2,.18,1.7,warmMetal);addBox(x,5.32,z,1.35,.12,1,ivory);
   };
   const addWasteStation=(x,z,m=jade)=>{
    addBox(x,.78,z,2.7,1.56,1.8,graphite);addBox(x,1.62,z,2.85,.16,1.95,silver);
    for(let k=-1;k<=1;k++){addBox(x+k*.82,.92,z+.94,.56,.78,.08,k===0?m:ivory);addBox(x+k*.82,1.38,z+.99,.26,.12,.06,graphite)}
   };
   const addQueueRail=(x1,x2,z,m=warmMetal)=>{
    const mid=(x1+x2)/2;
    for(const x of [x1,mid,x2]){addCylinder(area,x,.72,z,.19,.25,1.44,graphite,8);addCylinder(area,x,1.48,z,.25,.25,.18,m,8)}
    addBox(mid,1.22,z,Math.abs(x2-x1),.12,.12,m);
   };
   const addLightPost=(x,z,m=cyan)=>{
    addBox(x,3.2,z,.24,6.4,.24,warmMetal);addBox(x,5.95,z,1.35,.24,.9,graphite);addBox(x,5.78,z,1.05,.1,.62,m);addBox(x,.34,z,1.4,.68,1.15,graphite);
   };
   const addShelterSeat=(x,z,m=cyan)=>{
    addPublicBench(x,z,m);
    addBox(x,5.2,z-1.35,7.4,.32,3.4,graphite);
    for(const sx of [-3.2,3.2])addBox(x+sx,2.75,z-1.35,.22,5.2,.22,silver);
    addBox(x,5.42,z-1.35,6.7,.1,2.8,m);
   };
   addLinearGarden(-43,51,17,accentMat);addLinearGarden(43,51,17,index%2?jade:accentMat);
   addShelterSeat(-25,52,accentMat);addShelterSeat(25,52,index%2?accentMat:warmMetal);
   addInfoTotem(0,57,accentMat);addWasteStation(-56,18,accentMat);addWasteStation(56,18,jade);
   addLightPost(-56,39,accentMat);addLightPost(56,39,index%2?amber:cyan);
   if(z.id==='exchange'){
    addQueueRail(-29,-8,-16,amber);addQueueRail(8,29,-16,amber);
    addPublicBench(-34,4,ivory,Math.PI/2);addPublicBench(34,4,ivory,-Math.PI/2);
    addInfoTotem(-51,-31,amber);addInfoTotem(51,-31,amber);
   }else if(z.id==='ranking'){
    addPublicBench(-47,13,coral,Math.PI/2);addPublicBench(47,13,coral,-Math.PI/2);
    for(let k=0;k<3;k++){addBox(-48+k*4,1.4,45,1.2,2.8,1.2,graphite);addBox(-48+k*4,2.9,45,.9,.16,.9,amber)}
   }else if(z.id==='recruitment'){
    addShelterSeat(-48,13,jade);addShelterSeat(48,13,jade);
    addQueueRail(-28,-8,18,jade);addQueueRail(8,28,18,jade);addWasteStation(0,39,jade);
   }else if(z.id==='commissions'){
    addQueueRail(-35,-12,-19,amber);addQueueRail(12,35,-19,cyan);
    addPublicBench(-48,9,amber,Math.PI/2);addPublicBench(48,9,cyan,-Math.PI/2);addInfoTotem(0,47,amber);
   }else if(z.id==='teams'){
    for(const x of [-48,48]){addShelterSeat(x,8,violet);addInfoTotem(x,-43,violet)}
    addQueueRail(-20,20,48,violet);addWasteStation(0,49,violet);
   }else if(z.id==='entertainment'){
    for(const x of [-48,48]){addPublicBench(x,8,violet,Math.PI/2);addInfoTotem(x,-40,violet)}
    addQueueRail(-25,25,47,violet);addWasteStation(0,48,violet);
   }else if(z.id==='food'){
    addShelterSeat(-49,8,coral);addShelterSeat(49,8,jade);
    addQueueRail(-39,-12,-18,coral);addQueueRail(12,39,-18,jade);addWasteStation(0,49,coral);
   }
// Connected architectural frontage: replace the visual effect of scattered posts with a continuous, legible structure.
   // The open portal frames the district entrance; it does not close the view into the interior.
   const portalZ=-7.5,portalY=17.5,portalWidth=100,portalDepth=13;
   // Continuous fascia and roof spine tie the structural supports together.
   addBox(0,portalY,portalZ,portalWidth,1.35,1.65,graphite);
   addBox(0,portalY+.78,portalZ,portalWidth-2,.16,1.82,accentMat);
   addBox(0,portalY-.82,portalZ,portalWidth-1,.18,1.78,silver);
   addBox(0,portalY-1.35,portalZ,portalWidth-4,.12,.22,warmMetal);
   for(const x of [-46,0,46]){
    // Broad composite piers with plinths, capitals and recessed luminous reveals.
    addBox(x,8.5,portalZ,2.8,17,2.8,graphite);
    addBox(x,1.05,portalZ,4.2,2.1,4.1,silver);
    addBox(x,17.1,portalZ,4.1,1.15,3.8,titanium);
    addBox(x,8.8,portalZ+1.46,.16,12.8,.08,accentMat);
    addBox(x,8.8,portalZ-1.46,.16,12.8,.08,ivory);
   }
   // Repeated cross-ribs and shallow roof cassettes form a canopy rather than isolated uprights.
   for(let k=-5;k<=5;k++){
    const x=k*9.1;
    addBox(x,portalY+.35,portalZ, .42,.32,portalDepth, k%2?warmMetal:silver);
    addBox(x,portalY-.5,portalZ-portalDepth/2,.32,1.0,.32,graphite);
    addBox(x,portalY-.5,portalZ+portalDepth/2,.32,1.0,.32,graphite);
   }
   for(let k=0;k<5;k++){
    const z=portalZ-portalDepth/2+1.3+k*2.55;
    addBox(0,portalY+.12,z,portalWidth-5,.18,1.85,k%2?graphite:titanium);
    addBox(0,portalY+.24,z,portalWidth-8,.06,.12,accentMat);
   }
   // Integrated side galleries: continuous low walls, display niches and planter ledges.
   for(const side of [-1,1]){
    addBox(side*52,2.0,13,1.15,4,39,graphite);
    addBox(side*51.35,4.1,13,.12,.18,37,accentMat);
    addBox(side*51.2,4.55,13,1.65,.22,39,silver);
    for(let bay=0;bay<4;bay++){
     const z=-1+bay*9.2;
     addBox(side*50.55,3.0,z,.12,2.3,5.4,plum);
     addBox(side*50.45,3.1,z,.08,1.65,4.2,side<0?accentMat:jade);
    }
    addBox(side*47.4,.72,20,7.2,1.44,23,graphite);
    addBox(side*47.4,1.48,20,6.8,.18,22,ivory);
    for(let n=0;n<4;n++){
     const z=11+n*6;
     const plant=new T.Mesh(new T.SphereGeometry(1.05,8,6),n%2?jade:accentMat);
     plant.position.set(side*47.4,2.35,z);plant.scale.set(1.1,.75,1.35);area.add(plant);
    }
   }
   // The arrival threshold is a broad rectangular material transition, not another circular pad.
   addBox(0,.055,-1,78,.11,7,floorDark);
   addBox(0,.12,-1,72,.08,.18,accentMat);
   addBox(-37,.18,-1,.22,.22,6,silver);addBox(37,.18,-1,.22,.22,6,silver);
   // Ceiling-mounted continuous light troughs visually connect the canopy and interior.
   for(const side of [-1,1]){
    addBox(0,15.9,side*4,82,.18,.48,graphite);
    addBox(0,15.78,side*4,76,.08,.22,accentMat);
   }
   // Fine facade articulation: shallow trim and service reveals, without duplicate walls or roofs.
   for(const side of [-1,1]){
    for(let level=0;level<3;level++)addBox(side*50.28,4.2+level*5.6,-13,.12,.16,48,level===1?accentMat:warmMetal);
    for(let bay=-2;bay<=2;bay++){const zz=-33+bay*10.2;addBox(side*50.32,9.6,zz,.14,10,.18,bay%2===0?titanium:silver);addBox(side*50.42,9.6,zz,.08,7.6,.08,accentMat)}
   }
   for(let bay=-4;bay<=4;bay++){const x=bay*10.6;addBox(x,19.3,-41.58,7.2,.12,.12,accentMat);addBox(x,2.2,-41.58,7.2,.1,.12,warmMetal)}
      // Interior reveals, door jambs and recessed lighting complete each building envelope.
   for(let side=-1;side<=1;side+=2){
    addBox(side*49,8,-13,1.2,16,60,graphite);
    addBox(side*48.25,8,-13,.12,11,52,accentMat);
   }
   zoneObjects.push(area);
  });
  // City-scale hall meshes do not cast or receive the small room's shadow map.
   // Restrict shadows to architectural masses; keep small trim inexpensive.
    root.traverse(object=>{if(object.isMesh){object.userData.hallIllustration=true;if(!object.geometry.boundingSphere)object.geometry.computeBoundingSphere();const radius=object.geometry.boundingSphere?.radius||0;object.castShadow=!object.userData.hallFloor&&radius>3.2;object.receiveShadow=!object.userData.hallFloor&&radius>4.8;
     const mats=Array.isArray(object.material)?object.material:[object.material];mats.forEach(material=>{if(!material||!material.isMeshStandardMaterial||material.userData.hallPainterInk)return;material.userData.hallPainterInk=true;material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <tonemapping_fragment>',`float pigmentNoise=fract(sin(dot(gl_FragCoord.xy,vec2(17.17,91.73)))*43758.5453)-.5;float paperFiber=sin(gl_FragCoord.y*.73+gl_FragCoord.x*.19)*.5;outgoingLight*=.982+pigmentNoise*.018+paperFiber*.004;vec3 paperTint=vec3(.985,.978,.958);outgoingLight=mix(outgoingLight,outgoingLight*paperTint,.18);\n#include <tonemapping_fragment>`)};material.customProgramCacheKey=()=>'arday-hall-watercolor-paper-ink-v1';material.needsUpdate=true});
    }});
   // Arrival portal is placed inside the immense hall, facing into the open central concourse.
  const portal=new T.Group();portal.position.set(-20,0,0);portal.rotation.y=Math.PI/2;portal.userData.roomTarget='living';portal.name='hall-home-portal';root.add(portal);
  box(portal,0,3.1,0,5.4,6.2,.8,graphite);box(portal,0,3.1,.45,4.4,5.3,.08,glass);
  for(const x of [-2.45,2.45])box(portal,x,3.1,.53,.1,5.8,.08,cyan);
  const gateText=new T.Mesh(new T.PlaneGeometry(3.7,.62),new T.MeshBasicMaterial({map:labelTexture('返回居所','RESIDENTIAL GATE'),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));gateText.position.set(0,6.65,.55);portal.add(gateText);
  return {group:root,zones,zoneObjects,ground:floor,center:{x:-25.18,z:0},spawn:{x:-9.8,z:0},radius:285};
 }
 global.ArdayHallScene={create};
})(window);
