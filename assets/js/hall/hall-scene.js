(function(global){
 'use strict';
 function create(T,scene,M,box){
  const root=new T.Group();root.name='ArdayPublicHall';root.position.set(-5.18,0,0);scene.add(root);
  const mat=(c,m=.68,r=.32)=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:r});
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
  // A 78m-high ceiling. Structural columns are pushed to the distant perimeter, never across the arrival sightline.
  const ceiling=new T.Group();ceiling.position.set(-20,0,0);root.add(ceiling);
  for(let i=0;i<13;i++){const x=-300+i*46;box(ceiling,x,79,0,1.5,1.1,500,i%2?silver:graphite);box(ceiling,x,78.35,0,.16,.1,470,whiteGlow)}
  for(let i=0;i<15;i++){const z=-250+i*36;box(ceiling,0,82,z,610,.9,1.1,graphite);box(ceiling,0,82.55,z,580,.1,.12,cyan)}
  for(const x of [-300,300])for(const z of [-250,250]){box(ceiling,x,38,z,3,76,3,graphite);box(ceiling,x,38,z+1.65,.16,74,.12,cyan)}
  // Distant architectural backdrop, deliberately beyond the playable boundary.
  const bg=document.createElement('canvas');bg.width=2048;bg.height=1024;const ctx=bg.getContext('2d'),grad=ctx.createLinearGradient(0,0,0,1024);grad.addColorStop(0,'#07111f');grad.addColorStop(.52,'#172c40');grad.addColorStop(1,'#263c4e');ctx.fillStyle=grad;ctx.fillRect(0,0,2048,1024);
  let seed=90317;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<2600;i++){ctx.fillStyle='rgba(180,225,245,'+(.08+rand()*.32)+')';ctx.beginPath();ctx.arc(rand()*2048,rand()*1024,.3+rand()*1.2,0,Math.PI*2);ctx.fill()}
  for(let i=0;i<90;i++){const x=i*24,w=8+rand()*36,h=120+rand()*420;ctx.fillStyle='rgba(75,125,155,.24)';ctx.fillRect(x,930-h,w,h)}
  const tex=new T.CanvasTexture(bg);tex.encoding=T.sRGBEncoding;const sky=new T.Mesh(new T.SphereGeometry(720,64,36),new T.MeshBasicMaterial({map:tex,side:T.BackSide,depthWrite:false}));sky.position.set(-20,24,0);sky.renderOrder=-8;root.add(sky);
  function labelTexture(title,sub){const c=document.createElement('canvas');c.width=768;c.height=224;const g=c.getContext('2d');g.fillStyle='rgba(8,23,37,.88)';g.fillRect(8,8,752,208);g.strokeStyle='#78d9e8';g.lineWidth=4;g.strokeRect(12,12,744,200);g.fillStyle='#effaff';g.textAlign='center';g.textBaseline='middle';g.font='bold 66px sans-serif';g.fillText(title,384,88);g.fillStyle='#82c9d9';g.font='25px sans-serif';g.fillText(sub,384,163);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
  const zones=[
   {id:'exchange',name:'兑换区',sub:'RMB EXCHANGE',x:-205,z:-105,w:94,d:78,shape:[[-48,-31],[22,-42],[55,-15],[49,28],[8,43],[-42,29],[-58,-2]]},
   {id:'ranking',name:'排行区',sub:'RANKING MATRIX',x:-75,z:-190,w:86,d:76,shape:[[-40,-30],[26,-43],[50,-12],[42,34],[-8,43],[-49,15]]},
   {id:'recruitment',name:'招募区',sub:'RECRUITMENT',x:95,z:-190,w:98,d:82,shape:[[-48,-34],[30,-42],[57,-5],[45,37],[-18,45],[-57,9]]},
   {id:'commissions',name:'委托区',sub:'CONTRACT TERMINAL',x:225,z:-65,w:100,d:84,shape:[[-52,-33],[31,-45],[59,-7],[45,39],[-22,45],[-61,8]]},
   {id:'teams',name:'组队区',sub:'SQUAD ASSEMBLY',x:205,z:125,w:104,d:88,shape:[[-55,-36],[29,-46],[62,-4],[43,42],[-26,47],[-65,5]]},
   {id:'entertainment',name:'娱乐区',sub:'SIMULATION DECK',x:25,z:195,w:112,d:92,shape:[[-58,-38],[32,-49],[66,-7],[47,45],[-24,49],[-68,8]]},
   {id:'food',name:'美食区',sub:'FOOD & SUPPLY',x:-165,z:145,w:100,d:84,shape:[[-52,-34],[27,-43],[60,-4],[44,39],[-19,45],[-62,6]]}
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
   zoneObjects.push(area);
  });
  // Large, irregular avenues connect neighborhoods; the routes cross and branch rather than radiate from a central circle.
  [[-205,-105,-75,-190],[-75,-190,95,-190],[95,-190,225,-65],[225,-65,205,125],[205,125,25,195],[25,195,-165,145],[-165,145,-205,-105],[-75,-190,25,195],[95,-190,205,125],[-205,-105,25,195]].forEach((p,i)=>strip(p[0],p[1],p[2],p[3],i%3===0?24:17,floorDark));
  [[-205,-105,-75,-190],[-75,-190,95,-190],[95,-190,225,-65],[225,-65,205,125],[205,125,25,195],[25,195,-165,145],[-165,145,-205,-105]].forEach(p=>strip(p[0],p[1],p[2],p[3],.45,cyan));
  // Arrival portal is placed inside the immense hall, facing into the open central concourse.
  const portal=new T.Group();portal.position.set(-20,0,0);portal.rotation.y=-Math.PI/2;portal.userData.roomTarget='living';portal.name='hall-home-portal';root.add(portal);
  box(portal,0,3.1,0,5.4,6.2,.8,graphite);box(portal,0,3.1,.45,4.4,5.3,.08,glass);
  for(const x of [-2.45,2.45])box(portal,x,3.1,.53,.1,5.8,.08,cyan);
  const gateText=new T.Mesh(new T.PlaneGeometry(3.7,.62),new T.MeshBasicMaterial({map:labelTexture('返回居所','RESIDENTIAL GATE'),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));gateText.position.set(0,6.65,.55);portal.add(gateText);
  return {group:root,zones,zoneObjects,ground:floor,center:{x:-25.18,z:0},spawn:{x:-9.8,z:0},radius:250};
 }
 global.ArdayHallScene={create};
})(window);
