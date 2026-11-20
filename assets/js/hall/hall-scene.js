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
  const floor=new T.Mesh(new T.PlaneGeometry(620,540),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(-20,-.18,0);floor.receiveShadow=true;floor.name='hall-walkable-ground';floor.userData.hallFloor=true;root.add(floor);
  for(let x=-320;x<=280;x+=20){const line=new T.Mesh(new T.PlaneGeometry(.045,520),floorDark);line.rotation.x=-Math.PI/2;line.position.set(x,-.165,0);root.add(line)}
  for(let z=-260;z<=260;z+=20){const line=new T.Mesh(new T.PlaneGeometry(600,.045),floorDark);line.rotation.x=-Math.PI/2;line.position.set(-20,-.164,z);root.add(line)}
  function polygon(parent,points,y,material){const s=new T.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();const o=new T.Mesh(new T.ShapeGeometry(s),material);o.rotation.x=-Math.PI/2;o.position.y=y;o.receiveShadow=true;parent.add(o);return o}
  function strip(x1,z1,x2,z2,width,material){const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),o=new T.Mesh(new T.PlaneGeometry(width,len),material);o.rotation.set(-Math.PI/2,0,-angle);o.position.set((x1+x2)/2,-.105,(z1+z2)/2);root.add(o);return o}
  // Open-air public forum: a monumental perimeter colonnade encloses the plaza.
  // There is deliberately no indoor ceiling or interior column grid; the sky remains visible.
  const perimeter=new T.Group();perimeter.name='hall-outdoor-perimeter-colonnade';root.add(perimeter);
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
  const tex=new T.CanvasTexture(bg);tex.encoding=T.sRGBEncoding;const sky=new T.Mesh(new T.SphereGeometry(720,64,36),new T.MeshBasicMaterial({map:tex,side:T.BackSide,depthWrite:false}));sky.position.set(-20,24,0);sky.renderOrder=-8;root.add(sky);
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
  const zoneObjects=[];
  zones.forEach((z,index)=>{
   const area=new T.Group();area.position.set(z.x,0,z.z);area.userData.hallAction=z.id;area.name='hall-district-'+z.id;root.add(area);
   polygon(area,z.shape,.012,index%2?floorMat:floorDark);
   // Subtle embedded boundary seams, not raised circular platforms or fenced lots.
   const pts=z.shape.map(p=>new T.Vector3(p[0],.025,p[1]));area.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0x78c9d8,transparent:true,opacity:.16})));
   // Low architectural inlays define the district's internal circulation.
   for(let i=-2;i<=2;i++){const seam=new T.Mesh(new T.PlaneGeometry(.06,z.d*.66),cyan);seam.rotation.x=-Math.PI/2;seam.position.set(i*z.w*.13,.035,0);area.add(seam)}
   // Varied landmarks replace the repetitive notice-board wall: each district has a different spatial identity.
   const title=new T.Mesh(new T.PlaneGeometry(24,6),new T.MeshBasicMaterial({map:labelTexture(z.name,z.sub),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));title.position.set(0,15,-z.d*.34);area.add(title);
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
   zoneObjects.push(area);
  });
  // Large, irregular avenues connect neighborhoods; the routes cross and branch rather than radiate from a central circle.
  [[-118,-48,-55,-125],[-55,-125,65,-126],[65,-126,145,-32],[145,-32,130,92],[130,92,5,137],[5,137,-112,105],[-112,105,-118,-48],[-55,-125,5,137],[65,-126,130,92],[-118,-48,130,92]].forEach((p,i)=>strip(p[0],p[1],p[2],p[3],i%3===0?27:20,floorDark));
  [[-118,-48,-55,-125],[-55,-125,65,-126],[65,-126,145,-32],[145,-32,130,92],[130,92,5,137],[5,137,-112,105],[-112,105,-118,-48]].forEach(p=>strip(p[0],p[1],p[2],p[3],.55,cyan));
  // Arrival portal is placed inside the immense hall, facing into the open central concourse.
  const portal=new T.Group();portal.position.set(-20,0,0);portal.rotation.y=-Math.PI/2;portal.userData.roomTarget='living';portal.name='hall-home-portal';root.add(portal);
  box(portal,0,3.1,0,5.4,6.2,.8,graphite);box(portal,0,3.1,.45,4.4,5.3,.08,glass);
  for(const x of [-2.45,2.45])box(portal,x,3.1,.53,.1,5.8,.08,cyan);
  const gateText=new T.Mesh(new T.PlaneGeometry(3.7,.62),new T.MeshBasicMaterial({map:labelTexture('返回居所','RESIDENTIAL GATE'),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));gateText.position.set(0,6.65,.55);portal.add(gateText);
  return {group:root,zones,zoneObjects,ground:floor,center:{x:-25.18,z:0},spawn:{x:-9.8,z:0},radius:250};
 }
 global.ArdayHallScene={create};
})(window);
