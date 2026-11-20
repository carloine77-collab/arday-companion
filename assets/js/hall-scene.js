(function(global){
 'use strict';
 function create(T,scene,M,box){
  const root=new T.Group();root.name='ArdayPublicHall';root.position.set(-5.18,0,0);scene.add(root);
  const mat=(color,roughness=.9)=>M(color,roughness);
  const groundCanvas=document.createElement('canvas');groundCanvas.width=groundCanvas.height=1024;
  const ctx=groundCanvas.getContext('2d');ctx.fillStyle='#b8b5a8';ctx.fillRect(0,0,1024,1024);
  ctx.strokeStyle='rgba(93,91,80,.12)';ctx.lineWidth=2;
  for(let i=0;i<=1024;i+=64){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,1024);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(1024,i);ctx.stroke()}
  let seed=271828;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<3400;i++){const x=rand()*1024,y=rand()*1024,r=.5+rand()*2;ctx.fillStyle=rand()>.5?'rgba(245,239,221,.16)':'rgba(75,78,70,.09)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
  const groundTex=new T.CanvasTexture(groundCanvas);groundTex.wrapS=groundTex.wrapT=T.RepeatWrapping;groundTex.repeat.set(5,5);groundTex.encoding=T.sRGBEncoding;
  const ground=new T.Mesh(new T.PlaneGeometry(112,112),new T.MeshStandardMaterial({map:groundTex,color:0xffffff,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(-20,-.14,0);ground.receiveShadow=true;ground.name='hall-walkable-ground';ground.userData.hallFloor=true;root.add(ground);
  const panorama=document.createElement('canvas');panorama.width=2048;panorama.height=1024;const pctx=panorama.getContext('2d');
  const sky=pctx.createLinearGradient(0,0,0,1024);sky.addColorStop(0,'#aab9b6');sky.addColorStop(.46,'#d6cbb5');sky.addColorStop(.7,'#c4b99f');sky.addColorStop(1,'#a49d89');pctx.fillStyle=sky;pctx.fillRect(0,0,2048,1024);
  pctx.fillStyle='rgba(239,218,177,.42)';pctx.beginPath();pctx.arc(1500,310,105,0,Math.PI*2);pctx.fill();
  for(let layer=0;layer<3;layer++){const y=660+layer*72;pctx.beginPath();pctx.moveTo(0,1024);for(let x=0;x<=2048;x+=32){const yy=y+Math.sin(x*.008+layer*2)*35+Math.sin(x*.021+layer)*17;pctx.lineTo(x,yy)}pctx.lineTo(2048,1024);pctx.closePath();pctx.fillStyle=['#9caa9b','#87988b','#778b80'][layer];pctx.fill()}
  for(let i=0;i<76;i++){const x=i*29+(i%4)*9,w=14+(i%5)*7,h=30+(i*17%100);pctx.fillStyle=i%3?'#75857b':'#8b9586';pctx.fillRect(x,690-h,w,h)}
  const skyTex=new T.CanvasTexture(panorama);skyTex.encoding=T.sRGBEncoding;
  const skyDome=new T.Mesh(new T.SphereGeometry(118,48,24),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,depthWrite:false}));skyDome.position.set(-20,17,0);skyDome.renderOrder=-5;root.add(skyDome);
  const pathMat=mat(0xd7cbb4),edgeMat=mat(0x988f7e),grassMat=mat(0x8d9b7f),wood=mat(0x80664e),cream=mat(0xe9dfcd),dark=mat(0x544d43),metal=mat(0x9b9d91,.62);
  const flat=(x,z,w,d,material,y=-.055)=>{const mesh=new T.Mesh(new T.PlaneGeometry(w,d),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);root.add(mesh);return mesh};
  flat(-20,0,21,21,pathMat,-.065);
  const centerDisc=new T.Mesh(new T.CircleGeometry(10.5,64),mat(0xd2c5ad));centerDisc.rotation.x=-Math.PI/2;centerDisc.position.set(-20,-.045,0);root.add(centerDisc);
  function pathBetween(x1,z1,x2,z2,width=3.4){const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),mesh=new T.Mesh(new T.PlaneGeometry(width,len),pathMat);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=-Math.atan2(dx,dz);mesh.position.set((x1+x2)/2,-.07,(z1+z2)/2);root.add(mesh);return mesh}
  pathBetween(-2,0,-20,0,3.2);
  const zones=[
   {id:'exchange',name:'兑换区',sub:'RMB EXCHANGE',x:-35,z:-7,color:0xb78c64,desc:'人民币账户与交易服务。大厅不引入代币、积分币或第二套货币。',tab:'账户'},
   {id:'ranking',name:'排行区',sub:'HALL OF RECORDS',x:-20,z:-19,color:0x8b9b8c,desc:'玩家排行与赛季记录展示区。在线榜单和跨玩家数据需要服务端接入。'},
   {id:'recruitment',name:'招募区',sub:'RECRUITMENT',x:-5,z:-14,color:0xb78c64,desc:'玩家招募、岗位招募与协作招募公告。',tab:'职业'},
   {id:'commissions',name:'委托区',sub:'REQUEST BOARD',x:-3,z:1,color:0x9c8a70,desc:'发布与领取委托、查看进度并结算报酬。当前可查看已有目标系统。',tab:'目标'},
   {id:'teams',name:'组队区',sub:'PARTY PLAZA',x:-5,z:16,color:0x829a9a,desc:'组队广场。后续接入创建队伍、邀请成员、队伍状态与共同任务。'},
   {id:'entertainment',name:'娱乐区',sub:'ARCADE & PLAY',x:-20,z:20,color:0x9b8ba4,desc:'街机、桌游和休闲小游戏的实体空间。具体游戏玩法将逐项接入。'},
   {id:'food',name:'美食区',sub:'FOOD STREET',x:-35,z:15,color:0xc58d6d,desc:'食材、饮品与街边餐食。可进入现有食材商店。',tab:'商店'},
   {id:'events',name:'公告活动中心',sub:'EVENTS & NOTICES',x:-48,z:3,color:0x879b91,desc:'限时活动、公共公告、更新消息与社区活动。',tab:'信箱'},
   {id:'showcase',name:'个人展示区',sub:'PLAYER GALLERY',x:-35,z:-20,color:0x9c9b83,desc:'展示角色形象、收藏、成就和玩家名片。',tab:'档案'}
  ];
  function signTexture(title,sub,color){
   const canvas=document.createElement('canvas');canvas.width=640;canvas.height=190;const c=canvas.getContext('2d');
   c.fillStyle='#efe4d1';c.fillRect(0,0,640,190);c.strokeStyle='#8a6c50';c.lineWidth=9;c.strokeRect(10,10,620,170);
   c.fillStyle='#594b3b';c.textAlign='center';c.textBaseline='middle';c.font='bold 56px sans-serif';c.fillText(title,320,78);
   c.fillStyle='#907b64';c.font='22px Georgia';c.fillText(sub,320,139);
   const tex=new T.CanvasTexture(canvas);tex.encoding=T.sRGBEncoding;return tex;
  }
  const zoneObjects=[];
  zones.forEach((z,index)=>{
   pathBetween(-20,0,z.x,z.z,2.8);
   const b=new T.Group();b.position.set(z.x,0,z.z);b.rotation.y=Math.atan2(-20-z.x,-z.z);b.userData.hallAction=z.id;b.name='hall-zone-'+z.id;root.add(b);
   const wall=mat(z.color),roof=mat(index%2?0x77776b:0x725d4a),trim=mat(0xe5d8c4),door=mat(0x59483a);
   box(b,0,.16,0,6.4,.32,5.1,edgeMat);
   box(b,1.55,1.55,-1.55,3.25,2.75,1.9,wall);
   box(b,-1.55,1.55,-1.55,3.25,2.75,1.9,wall);
   box(b,0,2.72,-1.55,3.5,.42,1.95,wall);
   box(b,0,.1,-1.55,1.35,.2,.18,door);
   box(b,0,1.08,-.56,1.35,2.05,.18,door);
   box(b,0,2.22,-1.58,4.9,.18,2.3,trim);
   box(b,0,2.42,-1.58,5.25,.2,2.5,roof);
   box(b,0,3.15,-1.58,5.35,.12,2.55,trim);
   for(const x of [-2.1,2.1]){box(b,x,1.35,-.48,.18,2.55,.2,trim);box(b,x,2.63,-.48,.35,.18,.3,roof)}
   const sign=new T.Mesh(new T.PlaneGeometry(3.7,1.1),new T.MeshBasicMaterial({map:signTexture(z.name,z.sub,z.color),side:T.DoubleSide,transparent:false,toneMapped:false}));sign.position.set(0,3.75,-.18);b.add(sign);
   const awning=box(b,0,2.45,.25,4.1,.12,.85,trim);awning.rotation.x=-.08;
   for(const x of [-1.35,-.45,.45,1.35])box(b,x,1.2,.35,.65,1.65,.08,index%2?cream:wall);
   const lantern=new T.Mesh(new T.SphereGeometry(.16,12,10),new T.MeshBasicMaterial({color:0xf0d8a2}));lantern.position.set(0,2.8,.5);b.add(lantern);
   zoneObjects.push(b);
  });
  // Central plaza: a shallow fountain, benches, flower beds and shade trees.
  const fountain=new T.Group();fountain.position.set(-20,0,0);root.add(fountain);
  const basin=new T.Mesh(new T.CylinderGeometry(3.1,3.35,.48,40),mat(0x9b9788));basin.position.y=.18;fountain.add(basin);
  const water=new T.Mesh(new T.CylinderGeometry(2.82,2.82,.07,40),new T.MeshStandardMaterial({color:0x9fb8b3,roughness:.3,metalness:.08}));water.position.y=.45;fountain.add(water);
  const column=new T.Mesh(new T.CylinderGeometry(.42,.62,1.25,16),mat(0xb6a28a));column.position.y=1.05;fountain.add(column);
  const crown=new T.Mesh(new T.SphereGeometry(.5,18,12),mat(0xd5c1a1));crown.position.y=1.72;fountain.add(crown);
  function tree(x,z,scale=1){const t=new T.Group();t.position.set(x,0,z);t.scale.setScalar(scale);root.add(t);const trunk=new T.Mesh(new T.CylinderGeometry(.16,.23,2.0,9),wood);trunk.position.y=1;t.add(trunk);for(const [dx,dy,dz,r] of [[0,2.25,0,1.15],[-.52,2.05,.15,.78],[.52,2.35,-.1,.8],[0,2.85,-.1,.72]]){const leaf=new T.Mesh(new T.IcosahedronGeometry(r,1),grassMat);leaf.position.set(dx,dy,dz);t.add(leaf)}}
  [[-3,-8],[-4,9],[-31,-27],[-10,-29],[-50,-14],[-52,16],[-31,29],[-8,29]].forEach((p,i)=>tree(p[0],p[1],i%3===0?1.15:.88));
  function bench(x,z,rot=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;root.add(g);box(g,0,.48,0,2.1,.16,.62,wood);box(g,0,.95,-.24,2.1,.82,.13,wood);for(const dx of [-.82,.82])box(g,dx,.22,0,.12,.48,.12,metal)}
  bench(-12,-7,.6);bench(-29,8,-.6);bench(-15,12,0);
  function flowerbed(x,z){const g=new T.Group();g.position.set(x,0,z);root.add(g);box(g,0,.14,0,3.4,.28,1.35,wood);for(let i=0;i<15;i++){const f=new T.Mesh(new T.SphereGeometry(.16,9,7),mat([0xc68f83,0xd4b68a,0x9eaf91][i%3]));f.position.set(-1.45+(i%5)*.7,.48,Math.floor(i/5)*.34-.35);g.add(f)}}
  flowerbed(-12,-12);flowerbed(-29,-13);flowerbed(-44,11);
  // The edge is intentionally invisible: the distant painted panorama implies a much larger world.
  return {group:root,zones,zoneObjects,ground,center:{x:-25.18,z:0},spawn:{x:-8.78,z:0},radius:42};
 }
 global.ArdayHallScene={create};
})(window);
