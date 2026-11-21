/*
 * Three.js owned-furniture model factory.
 * Geometry, materials, texture setup and per-model construction live here.
 * Placement, persistence, registration and interaction lifecycle stay in game.js.
 */
window.ArdayFurnitureModels = (() => {
 function create(context) {
  const {T,getRoomMode,rooms,furnitureModelAliases,stylizeMaterial,recolorFurniture,createPainterTexture,applyPainterMap,roomWallMap,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,toast}=context;
  function build(name,record=null) {
   const alias=furnitureModelAliases[name];
   const variant=alias?.variant??(name.includes('·')?name.split('·').slice(1).join('·').trim():'');
   const modelName=alias?.model??name.split('·')[0].trim();
   const room=record?.room||getRoomMode()||'living',parent=rooms[room]||rooms.living;
   const id=record?.id||('furn-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7));
   const group=new T.Group();group.userData.ownedType=name;group.userData.furnitureKey=id;group.userData.roomKey=room;parent.add(group);
   const mat=(color,rough=.78,metalness=0)=>{const material=stylizeMaterial(new T.MeshStandardMaterial({color:recolorFurniture(color),roughness:Math.max(.08,Math.min(1,rough)),metalness:Math.max(0,Math.min(.9,metalness))}));material.userData.dyeable=metalness<.58&&rough>=.28;return material};
   const m={wood:mat(0x946746),oak:mat(0xc39a70),fabric:mat(0xb9a1a0,.95),sofa:mat(0xb9a1a0,.95),sofa2:mat(0xd3c5b1,.98),cream:mat(0xeee1cf,.9),dark:mat(0x39434b,.45),metal:mat(0x858783,.3,.72),leaf:mat(0x477a4d,.9),leaf2:mat(0x88a968,.9),clay:mat(0xb56d50),gold:mat(0xc5a15d,.35,.5),wall:mat(0xf0e4d2),screen:mat(0x25465b,.2)};
   const fabricMap=createPainterTexture('fabric'),woodMap=createPainterTexture('wood'),ceramicMap=createPainterTexture('ceramic');
   [m.fabric,m.sofa,m.sofa2].forEach(material=>applyPainterMap(material,fabricMap,.018));
   [m.wood,m.oak].forEach(material=>applyPainterMap(material,woodMap,.012));
   applyPainterMap(m.cream,ceramicMap,.006);applyPainterMap(m.wall,roomWallMap,.004);
   if(modelName==='地毯'){
    const palettes={'波斯绛红':[0x8f3f3a,0xd8b98b,0xead8b8,0xb78b4d],'奶油棋盘':[0xd8c8ad,0x9a8876,0xf0e5d4,0x9b8064],'海盐蓝':[0x55778a,0xb6c6c7,0xe0e5df,0xc2a66e],'羊毛米白':[0xd8cdbb,0xc6b8a2,0xf0e8da,0xb69b78]};
    const p=palettes[variant]||palettes['奶油棋盘'];m.fabric.color.setHex(p[0]);m.sofa2.color.setHex(p[1]);m.cream.color.setHex(p[2]);m.gold.color.setHex(p[3]);
   }
   if(modelName==='灶台'){
    const palettes={'复古珐琅':[0x8c4941,0xe4d4bd,0xb7a18a],'不锈钢':[0x424c54,0xc8d0d2,0x7c8589],'奶油陶瓷':[0xd8c9ae,0xf1e9dc,0xb9a78f]};
    const p=palettes[variant]||palettes['不锈钢'];m.dark.color.setHex(p[0]);m.metal.color.setHex(p[1]);m.cream.color.setHex(p[2]);
   }
   if(modelName==='沙发'&&variant==='雾蓝绒布'){m.fabric.color.setHex(0x657f94);m.sofa2.color.setHex(0x91a4b2);m.wood.color.setHex(0x594b43)}
   if(modelName==='沙发'&&variant==='鼠尾草绿'){m.fabric.color.setHex(0x82927b);m.sofa2.color.setHex(0xb2bba6);m.wood.color.setHex(0x665443)}
   if(modelName==='沙发'&&variant==='暖灰羊毛'){m.fabric.color.setHex(0xaaa69d);m.sofa2.color.setHex(0xd1cbc0);m.wood.color.setHex(0x71665a)}
   if(modelName==='沙发'&&variant==='亚麻燕麦'){m.fabric.color.setHex(0xc4ad91);m.sofa2.color.setHex(0xe1d3bd);m.wood.color.setHex(0x76543a)}
   // Furniture uses softly bevelled silhouettes instead of razor-sharp box primitives.
   function softBoxGeometry(w,h,d){
    const radius=Math.max(.016,Math.min(w,h,d)*.13),x=w/2,y=h/2,r=radius;
    const shape=new T.Shape();
    shape.moveTo(-x+r,-y);shape.lineTo(x-r,-y);shape.quadraticCurveTo(x,-y,x,-y+r);
    shape.lineTo(x,y-r);shape.quadraticCurveTo(x,y,x-r,y);
    shape.lineTo(-x+r,y);shape.quadraticCurveTo(-x,y,-x,y-r);
    shape.lineTo(-x,-y+r);shape.quadraticCurveTo(-x,-y,-x+r,-y);
    const bevel=Math.min(r*.56,d*.16);
    const geometry=new T.ExtrudeGeometry(shape,{depth:Math.max(.008,d-bevel*2),steps:1,bevelEnabled:true,bevelSegments:2,bevelThickness:bevel,bevelSize:bevel,curveSegments:4});
    geometry.translate(0,0,-d/2+bevel);geometry.computeVertexNormals();return geometry;
   }
   const box=(x,y,z,w,h,d,material)=>{const o=new T.Mesh(softBoxGeometry(w,h,d),material);o.position.set(x,y,z);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
   const cyl=(x,y,z,top,bottom,h,material)=>{const o=new T.Mesh(new T.CylinderGeometry(top,bottom,h,20),material);o.position.set(x,y,z);group.add(o);o.castShadow=true;return o};
   const sphere=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,20,14),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;return o};
   const restoring=!!record&&['x','y','z','rotation','wallSide','wallOffset'].some(key=>Object.prototype.hasOwnProperty.call(record,key));
   let width=1,depth=1,height=.8,surfaceType='floor',surfaceY=.04,supportId=record?.supportId||null,wallAxis=null,wallSide=null,anchor=[0,.5],action=()=>{};
   const legs=(w,d,h,t)=>{for(const x of [-w/2+t,w/2-t])for(const z of [-d/2+t,d/2-t])box(x,h/2,z,t,h,t,m.wood)};
   if(modelName==='床'){
    action=()=>openFurnitureActions('bed',id);
    const isWood=variant==='浅橡木框架',isSoft=variant==='奶油软包',isDouble=name==='双人床';
    width=isDouble?3.55:3.1;depth=3.45;height=1.32;
    const frame=isWood?m.oak:isSoft?m.cream:m.wood;
    const textile=mat(isSoft?0xe8ddcc:isDouble?0xd8cbbb:0xcfc4b6,.97);
    const piping=mat(isWood?0xb69a76:isSoft?0xbba78f:0x9b8878,.86);
    const mattressW=isDouble?3.38:2.92;
    box(0,.2,0,mattressW+.12,.18,3.28,frame);
    box(0,.48,.05,mattressW,.3,3.12,m.cream);
    box(0,.66,.08,mattressW-.08,.12,3.02,textile);
    if(isWood){
     box(0,.96,-1.62,mattressW+.16,.94,.16,m.oak);
     box(0,.58,-1.52,mattressW+.12,.16,.2,m.wood);
     for(let x=-mattressW/2+.14;x<=mattressW/2-.13;x+=.24)box(x,.98,-1.52,.035,.78,.08,m.wood);
     for(const x of [-mattressW/2+.12,mattressW/2-.12]){
      box(x,.18,-1.5,.13,.34,.14,m.oak);box(x,.18,1.48,.13,.34,.14,m.oak);
     }
     box(0,.76,.55,mattressW-.22,.07,1.72,m.cream);
    }else if(isSoft){
     box(0,1.05,-1.63,mattressW+.18,1.5,.22,m.cream);
     box(0,1.03,-1.5,mattressW-.12,1.27,.12,textile);
     for(let x=-mattressW/2+.35;x<=mattressW/2-.3;x+=.42)box(x,1.04,-1.425,.018,1.05,.018,piping);
     for(const x of [-mattressW*.28,0,mattressW*.28])for(const y of [.68,1.02,1.36])sphere(x,y,-1.35,.035,.035,.018,piping);
     box(0,.74,.55,mattressW-.2,.1,1.72,m.cream);
    }else if(isDouble){
     // Double bed: wide upholstered wingback headboard with a split pair of sleeping pillows.
     box(0,.98,-1.62,mattressW+.22,1.34,.22,m.wood);
     box(0,.98,-1.48,mattressW-.08,1.14,.08,textile);
     for(const x of [-mattressW/2+.08,mattressW/2-.08]){
      const wing=box(x,.98,-1.38,.16,1.2,.32,m.cream);wing.rotation.y=x<0?-.1:.1;
     }
     for(const x of [-mattressW*.25,mattressW*.25]){
      const pillow=sphere(x,.92,-.88,.56,.16,.36,m.cream);pillow.rotation.x=-.14;
      for(const side of [-1,1])box(x+side*.25,.92,-.88,.012,.012,.3,piping);
     }
     box(0,.7,.54,mattressW-.16,.12,1.82,m.cream);
     box(0,.73,1.48,mattressW*.84,.15,.38,textile);
     for(const x of [-.62,0,.62])box(x,.99,-1.41,.025,.82,.018,piping);
    }else{
     box(0,.94,-1.62,mattressW+.12,1.22,.2,m.wood);
     box(0,.97,-1.49,mattressW-.08,.98,.06,m.fabric);
     box(0,.69,.52,mattressW-.12,.1,1.78,m.cream);
     for(const x of [-mattressW*.3,mattressW*.3]){
      const pillow=sphere(x,.91,-.9,.52,.15,.34,m.cream);pillow.rotation.x=-.12;
     }
    }
    const duvet=sphere(0,.79,.62,mattressW*.43,.13,1.05,textile);
    duvet.rotation.x=-.025;box(0,.73,1.55,mattressW*.86,.14,.36,textile);
    for(let i=0;i<7;i++){
     const x=-mattressW*.38+i*mattressW*.76/6;
     box(x,.91,.58,.012,.012,1.65,piping);
    }
    for(const x of [-mattressW*.34,mattressW*.34]){
     const pillow=sphere(x,.88,-.88,.48,.13,.32,m.cream);pillow.rotation.x=-.14;
    }
   }else if(modelName==='床头柜'){
    const woven=variant==='藤编抽屉';width=.88;depth=.78;height=.92;
    if(woven){
     const cane=mat(0xc5a47a,.94),frame=mat(0x76543d,.66),shadow=mat(0x4e3829,.82);
     box(0,.48,0,.82,.72,.68,frame);box(0,.87,0,.94,.1,.78,m.oak);
     // A single deep rattan basket drawer and an open lower shelf replace the standard twin-drawer front.
     box(0,.63,.36,.72,.38,.035,shadow);box(0,.63,.39,.7,.34,.035,cane);
     for(let x=-.31;x<=.311;x+=.055){const strand=box(x,.63,.414,.012,.31,.012,m.oak);strand.rotation.z=.12}
     for(let y=.49;y<=.771;y+=.055){const strand=box(0,y,.42,.68,.012,.012,m.cream);strand.rotation.y=.08}
     box(0,.31,.36,.72,.045,.035,m.oak);
     box(0,.25,0,.76,.045,.58,m.oak);
     for(const x of [-.32,.32]){
      const leg=box(x,.14,.25,.07,.28,.07,frame);leg.rotation.z=x*.12;
      const rear=box(x,.14,-.25,.07,.28,.07,frame);rear.rotation.z=x*.12;
     }
     box(0,.45,.43,.14,.025,.025,m.gold);
    }else{
     box(0,.47,0,.86,.76,.72,m.wood);box(0,.87,.02,.94,.1,.8,m.cream);
     for(const y of [.32,.62]){box(0,y,.37,.76,.25,.035,m.sofa2);for(const x of [-.19,.19])cyl(x,y,.405,.018,.018,.035,m.gold,10)}
     for(const x of [-.34,.34])box(x,.08,-.27,.09,.16,.09,m.dark);
    }
   }else if(modelName==='台灯'){
    width=.48;depth=.48;height=.92;surfaceType='tabletop';surfaceY=.9;
    if(variant==='蘑菇'){cyl(0,.12,0,.19,.22,.2,m.gold,16);cyl(0,.43,0,.055,.075,.48,m.cream,16);const dome=new T.Mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),m.cream);dome.scale.set(.31,.2,.31);dome.position.y=.72;group.add(dome)}else if(variant==='琥珀玻璃'){cyl(0,.12,0,.18,.2,.18,m.gold,20);cyl(0,.36,0,.07,.09,.38,m.metal,16);const globe=new T.Mesh(new T.SphereGeometry(.25,24,16),mat(0xc68b4f,.22,.12));globe.scale.set(1,.82,1);globe.position.y=.65;group.add(globe)}else if(variant==='陶瓷折线'){cyl(0,.12,0,.2,.22,.2,m.clay,16);const stem=new T.Mesh(new T.CylinderGeometry(.09,.16,.48,8),m.cream);stem.position.y=.43;group.add(stem);const shade=new T.Mesh(new T.CylinderGeometry(.28,.12,.28,12),m.cream);shade.position.y=.82;group.add(shade)}else{cyl(0,.12,0,.18,.2,.2,m.dark,16);cyl(0,.48,0,.045,.07,.58,m.gold,12);const shade=new T.Mesh(new T.CylinderGeometry(.27,.12,.3,16),m.cream);shade.position.y=.88;group.add(shade)}
   }else if(modelName==='壁灯'){
    width=.72;depth=.22;height=.78;wallAxis='x';wallSide='back';anchor=[0,3.15];box(0,0,-.04,.22,.42,.09,m.gold);cyl(0,-.16,.08,.045,.045,.28,m.gold,12);
    if(variant==='黄铜双臂'){for(const side of [-1,1]){const arm=box(side*.2,.06,.02,.34,.045,.045,m.gold);arm.rotation.z=side*.3;const shade=new T.Mesh(new T.ConeGeometry(.15,.2,12,1,true),m.cream);shade.position.set(side*.34,.22,.1);shade.rotation.x=Math.PI;group.add(shade);cyl(side*.34,.11,.1,.025,.025,.2,m.gold,10)}}else{const shade=new T.Mesh(new T.ConeGeometry(.2,.28,16,1,true),m.cream);shade.position.set(0,.16,.12);shade.rotation.x=Math.PI;group.add(shade);cyl(0,.02,.12,.025,.025,.2,m.gold,10)}
   }else if(modelName==='落地灯'){
    width=.68;depth=.68;height=1.92;surfaceType='floor';surfaceY=.04;
    cyl(0,.045,0,.31,.31,.09,m.dark,24);cyl(0,.105,0,.24,.24,.035,m.gold,24);
    if(variant==='黑色三脚'){
     for(let i=0;i<3;i++){const a=i*Math.PI*2/3,leg=box(Math.cos(a)*.16,.88,Math.sin(a)*.16,.045,1.72,.045,mat(0x343638,.55,.25));leg.rotation.z=Math.cos(a)*.08;leg.rotation.x=Math.sin(a)*.08}
     cyl(0,1.72,0,.045,.045,.12,m.dark,16);const shade=new T.Mesh(new T.CylinderGeometry(.3,.17,.42,24,1,true),m.cream);shade.position.y=1.52;group.add(shade);
    }else if(variant==='黄铜弧形'){
     const arc=new T.CatmullRomCurve3([new T.Vector3(0,.13,0),new T.Vector3(0,.72,0),new T.Vector3(.12,1.38,0),new T.Vector3(.42,1.76,0),new T.Vector3(.47,1.62,0)]);
     group.add(new T.Mesh(new T.TubeGeometry(arc,32,.035,10,false),m.gold));
     const shade=new T.Mesh(new T.ConeGeometry(.23,.28,24,1,true),m.cream);shade.position.set(.47,1.48,0);shade.rotation.z=Math.PI;group.add(shade);cyl(.47,1.33,0,.035,.035,.13,m.gold,12);
    }else{
     cyl(0,.94,0,.035,.045,1.68,m.gold,16);cyl(0,1.78,0,.045,.045,.12,m.gold,16);
     const shade=new T.Mesh(new T.CylinderGeometry(.27,.16,.38,24,1,true),m.cream);shade.position.y=1.55;group.add(shade);
     const diffuser=new T.Mesh(new T.CircleGeometry(.16,24),m.cream);diffuser.position.y=1.35;diffuser.rotation.x=-Math.PI/2;group.add(diffuser);
    }
   }else if(modelName==='成品食物'){
    width=.74;depth=.74;height=.24;surfaceType='tabletop';
    const plate=mat(0xf4eee2,.28),plateEdge=mat(0xc9b99e,.32),rice=mat(0xf1e5c9,.92),egg=mat(0xe8bd58,.78),tomato=mat(0xc85e42,.82),green=mat(0x6f8c50,.9),meat=mat(0x8c5237,.86),noodle=mat(0xe6c77f,.84),broth=mat(0xb88a4f,.3),tofu=mat(0xe8d8b8,.9);
    cyl(0,.045,0,.365,.365,.055,plate,40);cyl(0,.076,0,.34,.34,.018,plateEdge,40);cyl(0,.088,0,.315,.315,.012,plate,40);
    const rim=new T.Mesh(new T.TorusGeometry(.315,.012,10,48),m.gold);rim.rotation.x=Math.PI/2;rim.position.y=.092;group.add(rim);
    const grain=(x,z,sx=.025,sz=.045,material=rice)=>sphere(x,.12,z,sx,.018,sz,material);
    const noodleLine=(pts,material=noodle,r=.018)=>{const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p[0],.13,p[1])));group.add(new T.Mesh(new T.TubeGeometry(curve,28,r,8,false),material))};
    if(variant.includes('蛋炒饭')){
     for(let n=0;n<38;n++){const a=n*2.399,r=.045+Math.sqrt(n/38)*.225;grain(Math.cos(a)*r,Math.sin(a)*r,.018,.025,n%4===0?egg:n%7===0?green:rice)}
     for(let n=0;n<8;n++){const a=n*2.4,r=.12+(n%3)*.035;const o=box(Math.cos(a)*r,.145,Math.sin(a)*r,.035,.022,.028,n%3===0?green:egg);o.rotation.y=a}
    }else if(variant.includes('番茄炒蛋')){
     for(let n=0;n<5;n++){const a=n*1.25,r=.12+(n%2)*.045;const o=sphere(Math.cos(a)*r,.145,Math.sin(a)*r,.09,.035,.055,tomato);o.rotation.y=-a}
     for(let n=0;n<6;n++){const a=n*2.1,r=.09+(n%3)*.045;const o=sphere(Math.cos(a)*r,.16,Math.sin(a)*r,.075,.032,.052,egg);o.rotation.y=a}
    }else if(variant.includes('蔬菜汤')){
     const bowl=mat(0xe9dfca,.26);cyl(0,.15,0,.27,.31,.12,bowl,40);cyl(0,.205,0,.265,.265,.018,broth,40);
     const soupRim=new T.Mesh(new T.TorusGeometry(.27,.018,10,40),plateEdge);soupRim.rotation.x=Math.PI/2;soupRim.position.y=.22;group.add(soupRim);
     for(let n=0;n<12;n++){const a=n*2.4,r=.08+(n%3)*.045;sphere(Math.cos(a)*r,.24,Math.sin(a)*r,.045,.022,.04,n%3===0?tomato:n%3===1?green:tofu)}
    }else if(variant.includes('红烧牛肉面')){
     const bowl=mat(0xd9d0bf,.24);cyl(0,.15,0,.29,.33,.15,bowl,40);cyl(0,.225,0,.285,.285,.025,broth,40);
     const soupRim=new T.Mesh(new T.TorusGeometry(.29,.018,10,40),plateEdge);soupRim.rotation.x=Math.PI/2;soupRim.position.y=.245;group.add(soupRim);
     for(let n=0;n<5;n++){const a=n*1.25,r=.12+(n%2)*.04;noodleLine([[Math.cos(a)*r,Math.sin(a)*r],[Math.cos(a+.6)*r,Math.sin(a+.6)*r],[Math.cos(a+1.2)*r,Math.sin(a+1.2)*r]])}
     for(let n=0;n<4;n++){const o=sphere(Math.cos(n*1.6)*.13,.275,Math.sin(n*1.6)*.13,.065,.018,.045,meat);o.rotation.y=n*.6}
    }else if(variant.includes('奶油蘑菇烩饭')){
     for(let n=0;n<34;n++){const a=n*2.399,r=.04+Math.sqrt(n/34)*.2;grain(Math.cos(a)*r,Math.sin(a)*r,.023,.03,n%6===0?green:rice)}
     for(let n=0;n<8;n++){const a=n*2.1,r=.08+(n%3)*.045;const o=sphere(Math.cos(a)*r,.16,Math.sin(a)*r,.045,.025,.06,n%2?tofu:meat);o.rotation.y=a}
    }else if(variant.includes('香煎蛋吐司')){
     box(0,.125,0,.43,.07,.3,mat(0xc99657,.92));box(0,.16,0,.39,.018,.27,mat(0xf0d9a8,.9));sphere(0,.19,0,.13,.035,.11,egg);sphere(.025,.215,.005,.045,.012,.04,mat(0xf1d58a,.8));
    }else if(variant.includes('豆腐蔬菜煲')){
     const bowl=mat(0xd9cbb4,.26);cyl(0,.15,0,.29,.33,.15,bowl,40);cyl(0,.225,0,.285,.285,.025,broth,40);
     const soupRim=new T.Mesh(new T.TorusGeometry(.29,.018,10,40),plateEdge);soupRim.rotation.x=Math.PI/2;soupRim.position.y=.245;group.add(soupRim);
     for(let n=0;n<10;n++){const a=n*2.4,r=.08+(n%3)*.045;sphere(Math.cos(a)*r,.26,Math.sin(a)*r,.045,.03,.04,n%3===0?tomato:n%3===1?green:tofu)}
    }else if(variant.includes('葱香土豆饼')){
     const pancake=mat(0xc99a52,.9),crust=mat(0x9a6937,.92);cyl(0,.12,0,.27,.27,.035,plate,36);
     for(let n=0;n<3;n++){const cake=cyl(0,.15+n*.035,0,.19,.19,.035,n===2?pancake:crust,32);cake.rotation.y=n*.18}
     for(let n=0;n<12;n++){const a=n*2.4,r=.07+(n%3)*.035;sphere(Math.cos(a)*r,.265,Math.sin(a)*r,.012,.006,.025,green)}
    }else if(variant.includes('土豆炖牛肉')){
     const bowl=mat(0xd9cbb4,.26);cyl(0,.15,0,.29,.33,.15,bowl,40);cyl(0,.225,0,.285,.285,.025,broth,40);
     for(let n=0;n<7;n++){const a=n*2.4,r=.07+(n%3)*.05;const o=box(Math.cos(a)*r,.27,Math.sin(a)*r,.065,.05,.065,n%2?tofu:meat);o.rotation.y=a}
    }
   }else if(modelName==='吊灯'){
    width=.78;depth=.78;height=.56;surfaceType='ceiling';cyl(0,.28,0,.07,.07,.12,m.gold,12);cyl(0,.04,0,.025,.025,.42,m.gold,10);if(variant==='藤编圆罩'){const shade=new T.Mesh(new T.SphereGeometry(.38,24,16,0,Math.PI*2,0,Math.PI/2),mat(0xb68d5e,.94));shade.position.y=-.12;shade.scale.set(1,.82,1);group.add(shade);cyl(0,-.31,0,.16,.16,.035,m.cream,24)}else if(variant==='乳白玻璃'){const globe=new T.Mesh(new T.SphereGeometry(.3,20,14),m.cream);globe.position.y=-.22;group.add(globe);cyl(0,-.48,0,.12,.12,.045,m.gold,12)}else{const shade=new T.Mesh(new T.CylinderGeometry(.34,.16,.28,20),m.cream);shade.position.y=-.25;group.add(shade);cyl(0,-.41,0,.18,.18,.035,m.gold,12)}
   }else if(modelName==='衣柜'){
    width=1.85;depth=.78;height=2.45;
    const body=mat(0x76543d,.68),front=mat(0xd8c8b3,.76),inner=mat(0x4c382c,.82);
    box(0,1.2,0,1.78,2.3,.68,body);box(0,2.38,0,1.92,.12,.78,m.oak);box(0,.08,0,1.86,.16,.76,m.dark);
    // Two full-height doors with recessed framed panels and separate handles.
    for(const x of [-.45,.45]){
     box(x,1.22,.355,.84,2.12,.045,front);
     for(const dx of [-.38,.38])box(x+dx,1.22,.383,.025,1.98,.018,m.oak);
     for(const y of [.25,2.19])box(x,y,.383,.78,.025,.018,m.oak);
     box(x,1.22,.382,.72,1.78,.012,m.cream);
     cyl(x+(x<0?.3:-.3),1.2,.425,.025,.025,.08,m.gold,12);
    }
    // A narrow central reveal, plinth and crown moulding make the carcass read as furniture.
    box(0,1.22,.36,.025,2.12,.02,inner);
    box(0,.16,.02,1.78,.12,.7,body);box(0,2.46,0,2.0,.08,.82,m.oak);
    for(const x of [-.72,.72])box(x,.12,.02,.1,.2,.72,m.dark);
   }else if(modelName==='卧室地毯'){
    width=3.4;depth=2.5;surfaceType='rug';box(0,.035,0,3.4,.07,2.5,m.fabric);box(0,.075,0,3.18,.012,2.28,m.sofa2);
   }else if(modelName==='橱柜'){
    width=2.8;depth=.82;height=1.05;surfaceType='table';surfaceY=1.1;
    const carcass=mat(0xb99b78,.72),front=mat(0xe4d8c7,.82),counter=mat(0xd9d2c5,.42);
    box(0,.47,0,2.72,.92,.76,carcass);box(0,.98,0,2.9,.13,.9,counter);
    // Three lower cabinet doors, two drawer banks and a recessed toe-kick.
    for(const x of [-.9,0,.9]){
     box(x,.46,.393,.82,.76,.035,front);
     for(const y of [.13,.79])box(x,y,.416,.76,.018,.012,m.oak);
     for(const dx of [-.37,.37])box(x+dx,.46,.416,.018,.68,.012,m.oak);
     cyl(x+(x<0?.27:-.27),.47,.44,.022,.022,.045,m.gold,10);
    }
    box(0,.12,.02,2.62,.18,.68,m.dark);
    box(0,.98,-.04,2.72,.025,.74,m.cream);
    for(const x of [-1.2,1.2])box(x,.46,-.395,.08,.78,.08,m.oak);
   }else if(modelName==='吊柜'){
    width=2.2;depth=.48;height=1.05;wallAxis='x';wallSide='back';anchor=[0,2.9];
    const carcass=mat(0x76543d,.68),door=mat(0xe6dac9,.78);
    box(0,0,0,2.16,1.0,.44,carcass);box(0,-.49,.22,2.22,.055,.5,m.oak);
    for(const x of [-.72,0,.72]){
     box(x,0,.235,.68,.91,.035,door);
     for(const dx of [-.3,.3])box(x+dx,0,.258,.018,.82,.012,m.oak);
     box(x,0,.258,.58,.018,.012,m.oak);
     cyl(x+(x<0?.23:-.23),-.02,.29,.018,.018,.045,m.gold,10);
    }
    for(const x of [-1.03,1.03])box(x,0,-.18,.07,.9,.08,m.wood);
   }else if(modelName==='冰箱'){
    action=()=>openKitchenPanel();width=1.02;depth=.86;height=2.2;
    const shell=mat(0xe8e4dc,.38),edge=mat(0xb9b7b0,.46),glass=mat(0x9eb6bc,.22,.12);
    box(0,1.08,0,1.02,2.16,.86,shell);box(0,2.19,0,1.04,.08,.88,edge);
    box(0,1.45,.445,.94,1.28,.035,m.cream);box(0,.52,.445,.94,.94,.035,m.cream);
    box(0,.99,.468,.94,.035,.025,edge);
    // Upper control strip and separate recessed handles.
    box(0,2.0,.47,.76,.12,.025,m.dark);for(let i=0;i<4;i++)cyl(-.24+i*.16,2.0,.492,.018,.018,.018,m.gold,10);
    for(const y of [.88,1.72]){
     box(.36,y,.49,.035,.28,.045,m.metal);
     box(.36,y,.515,.012,.2,.012,m.cream);
    }
    box(0,.05,0,.98,.08,.82,m.dark);
    for(const x of [-.39,.39])box(x,.12,.32,.09,.08,.08,edge);
   }else if(modelName==='灶台'){
    action=()=>openKitchenPanel();width=variant==='复古珐琅'?1.5:1.35;depth=.82;height=variant==='不锈钢'?1.02:.94;
    if(variant==='复古珐琅'){
     box(0,.43,0,1.5,.86,.82,m.dark);box(0,.91,0,1.56,.1,.9,m.cream);
     for(const x of [-.43,.43])for(const z of [-.23,.23]){cyl(x,.99,z,.17,.17,.06,m.dark);cyl(x,1.025,z,.105,.105,.025,m.gold)}
     for(const x of [-.58,.58])box(x,.32,.43,.16,.12,.035,m.gold);
     box(0,.18,.426,.82,.3,.035,m.clay);box(0,.18,.45,.66,.19,.018,m.dark);
    }else if(variant==='奶油陶瓷'){
     box(0,.42,0,1.35,.84,.82,m.cream);box(0,.88,0,1.42,.09,.87,m.cream);
     for(const x of [-.4,.4])for(const z of [-.23,.23]){cyl(x,.95,z,.18,.18,.06,m.gold);cyl(x,.99,z,.105,.105,.025,m.dark)}
     for(const x of [-.48,.48])cyl(x,.34,.43,.045,.045,.12,m.gold,10);
    }else{
     box(0,.47,0,1.35,.94,.82,m.dark);box(0,.99,0,1.4,.08,.86,m.metal);
     for(const x of [-.38,.38])for(const z of [-.22,.22]){cyl(x,1.05,z,.16,.16,.055,m.dark);cyl(x,1.09,z,.09,.09,.025,m.metal)}
     box(0,.22,.425,.95,.38,.035,m.metal);box(0,.22,.45,.76,.25,.018,m.dark);
    }
   }else if(modelName==='水槽'){
    action=()=>openFurnitureActions('sink',id);width=1.35;depth=.88;height=.98;
    const cabinet=mat(0xb18a61,.72),steel=mat(0xbfc5c5,.24,.48),basin=mat(0x687b80,.26,.28);
    box(0,.43,0,1.35,.86,.88,cabinet);
    box(0,.91,0,1.43,.12,.94,steel);
    // Inset sink bowl with a visible rim and sloped inner basin.
    box(0,.985,-.02,.82,.025,.58,m.metal);
    box(0,1.005,-.02,.72,.018,.46,basin);
    box(0,.96,-.29,.72,.055,.045,steel);box(0,.96,.25,.72,.055,.045,steel);
    for(const x of [-.36,.36])box(x,.96,-.02,.055,.055,.55,steel);
    // Gooseneck faucet and two separate controls.
    const tapCurve=new T.CatmullRomCurve3([new T.Vector3(0,1.02,-.31),new T.Vector3(0,1.24,-.31),new T.Vector3(0,1.43,-.18),new T.Vector3(0,1.43,.02),new T.Vector3(0,1.28,.06)]);
    group.add(new T.Mesh(new T.TubeGeometry(tapCurve,24,.027,10,false),steel));
    for(const x of [-.48,.48]){
     cyl(x,1.02,-.27,.04,.04,.07,m.gold,12);
     const lever=box(x,1.08,-.27,.13,.025,.035,steel);lever.rotation.z=x*.2;
    }
    box(0,.12,0,1.22,.16,.72,m.dark);
   }else if(modelName==='地毯'){
    width=3.7;depth=2.7;surfaceType='rug';surfaceY=.075;
    const wool=name==='羊毛地毯',bedroom=name==='卧室地毯';
    if(wool){
     // A continuous padded backing, woven top cloth, bound perimeter and one merged
     // fiber mesh replace the old grid of intersecting spheres and box fringe.
     height=.14;surfaceY=.13;
     const backing=mat(0xaaa08f,.99),top=mat(0xe7dfd2,.99),binding=mat(0xb8aa96,.98);
     applyPainterMap(backing,fabricMap,.018);applyPainterMap(top,fabricMap,.022);applyPainterMap(binding,fabricMap,.014);
     box(0,.032,0,width,.064,depth,backing);
     box(0,.069,0,3.58,.012,2.58,top);
     box(0,.079,-1.265,3.54,.018,.035,binding);
     box(0,.079,1.265,3.54,.018,.035,binding);
     box(-1.765,.079,0,.035,.018,2.52,binding);
     box(1.765,.079,0,.035,.018,2.52,binding);
     const positions=[],colors=[];
     const rand=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v)};
     const addVertex=(x,y,z,r,g,b)=>{positions.push(x,y,z);colors.push(r,g,b)};
     const fiberCount=920;
     for(let i=0;i<fiberCount;i++){
      const x=(rand(i*5+1)-.5)*3.42,z=(rand(i*5+2)-.5)*2.42;
      const angle=rand(i*5+3)*Math.PI*2,length=.035+rand(i*5+4)*.055,height=.018+rand(i*5+5)*.035;
      const dx=Math.cos(angle),dz=Math.sin(angle),sx=-dz,sz=dx,half=.003+rand(i*7+6)*.002;
      const shade=.84+rand(i*7+7)*.22;
      const fiberColor=[.91*shade,.87*shade,.80*shade];
      const left=[],right=[];
      for(let segment=0;segment<3;segment++){
       const t=segment/2,curve=Math.sin(t*Math.PI)*.012*(rand(i*11+8)-.35);
       const cx=x+dx*length*t+sx*curve,cz=z+dz*length*t+sz*curve;
       const cy=.075+height*(t*(1.15-.15*t)),w=half*(1-.72*t);
       left.push([cx-sx*w,cy,cz-sz*w]);right.push([cx+sx*w,cy,cz+sz*w]);
      }
      for(let segment=0;segment<2;segment++){
       const a=left[segment],b=right[segment],c=left[segment+1],d=right[segment+1];
       [a,b,c,b,d,c].forEach(v=>addVertex(v[0],v[1],v[2],fiberColor[0],fiberColor[1],fiberColor[2]));
      }
     }
     const fibersGeometry=new T.BufferGeometry();
     fibersGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
     fibersGeometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
     fibersGeometry.computeVertexNormals();
     const fibersMaterial=stylizeMaterial(new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.99,metalness:0,side:T.DoubleSide}));
     const fibers=new T.Mesh(fibersGeometry,fibersMaterial);fibers.castShadow=false;fibers.receiveShadow=true;group.add(fibers);
     // Fine perimeter seams give the rug a finished textile edge without rigid tassels.
     const seam=mat(0xd8cebf,.98);
     for(let x=-1.62;x<=1.621;x+=.12){
      box(x,.089,-1.245,.035,.006,.008,seam);
      box(x,.089,1.245,.035,.006,.008,seam);
     }
     for(let z=-1.12;z<=1.121;z+=.12){
      box(-1.745,.089,z,.008,.006,.035,seam);
      box(1.745,.089,z,.008,.006,.035,seam);
     }
    }else{
     box(0,.035,0,width,.07,depth,m.fabric);
     box(0,.074,0,3.48,.012,2.48,m.cream);
     box(0,.083,0,3.25,.012,2.25,m.fabric);
     for(const x of [-1.7,1.7])for(const z of [-1.2,1.2])box(x,.092,z,.14,.012,.14,m.gold);
     if(bedroom){
      // Bedroom rug: a restrained central medallion, double inset border and corner rosettes.
      const border=mat(0xb69b78,.72),motif=mat(0x9c8064,.82);
      for(const z of [-1.13,1.13])box(0,.105,z,3.28,.018,.035,border);
      for(const x of [-1.58,1.58])box(x,.105,0,.035,.018,2.28,border);
      for(const x of [-1.42,1.42])for(const z of [-.98,.98]){
       const rosette=new T.Mesh(new T.OctahedronGeometry(.16,1),motif);rosette.position.set(x,.12,z);rosette.scale.set(1,.12,1);group.add(rosette);
       sphere(x,.14,z,.045,.018,.045,m.gold);
      }
      const medallion=new T.Mesh(new T.TorusGeometry(.48,.018,8,48),border);medallion.rotation.x=Math.PI/2;medallion.position.y=.115;group.add(medallion);
      const inner=new T.Mesh(new T.TorusGeometry(.34,.012,8,48),motif);inner.rotation.x=Math.PI/2;inner.position.y=.118;group.add(inner);
      for(let i=0;i<8;i++){const a=i*Math.PI/4;const leaf=sphere(Math.cos(a)*.28,.125,Math.sin(a)*.28,.11,.012,.045,m.gold);leaf.rotation.y=-a;}
     }else if(variant==='波斯绛红'){
      for(let x=-1.25;x<=1.25;x+=.42)for(let z=-.82;z<=.82;z+=.42){const motif=new T.Mesh(new T.OctahedronGeometry(.105,0),m.gold);motif.position.set(x,.105,z);motif.scale.y=.12;group.add(motif)}
      box(0,.105,0,.08,.012,1.9,m.cream);
     }else if(variant==='奶油棋盘'){
      for(let x=-1.38;x<1.4;x+=.46)for(let z=-.92;z<.95;z+=.46)if((Math.round((x+1.38)/.46)+Math.round((z+.92)/.46))%2===0)box(x,.105,z,.44,.012,.44,m.sofa2);
     }else if(variant==='海盐蓝'){
      for(let z=-.82;z<=.82;z+=.28)box(0,.105,z,2.95,.012,.025,m.cream);
      for(const x of [-1.52,1.52])for(let z=-.9;z<=.9;z+=.3)box(x,.11,z,.055,.018,.055,m.gold);
     }
    }
   }else if(modelName==='沙发'){
    width=2.35;depth=1.12;height=.94;action=()=>openFurnitureActions('sofa',id);
    const fabric=mat(variant==='雾蓝绒布'?0x657f94:variant==='亚麻燕麦'?0xc4ad91:variant==='暖灰羊毛'?0xaaa69d:0xe4d9c7,.96),fabricShade=mat(variant==='雾蓝绒布'?0x91a4b2:variant==='亚麻燕麦'?0xe1d3bd:variant==='暖灰羊毛'?0xd1cbc0:0xd3c5b1,.98),welt=mat(variant==='雾蓝绒布'?0x526b80:variant==='亚麻燕麦'?0xb69c7d:variant==='暖灰羊毛'?0x8d887f:0xc2b39e,.92),walnut=mat(variant==='雾蓝绒布'?0x594b43:variant==='亚麻燕麦'?0x76543a:variant==='暖灰羊毛'?0x71665a:0x67452f,.62),walnutEdge=mat(variant==='雾蓝绒布'?0x71808a:variant==='亚麻燕麦'?0x987451:variant==='暖灰羊毛'?0x938a7e:0x8a6344,.58);
    applyPainterMap(fabric,fabricMap,.026);applyPainterMap(fabricShade,fabricMap,.022);applyPainterMap(welt,fabricMap,.016);
    applyPainterMap(walnut,woodMap,.014);applyPainterMap(walnutEdge,woodMap,.012);
    const soft=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,32,22),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
    const seam=(points,r=.008,material=welt)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(16,points.length*3),r,8,false),material);group.add(mesh);mesh.castShadow=true};
    box(0,.27,0,2.08,.16,.82,walnut);box(0,.31,-.425,1.98,.19,.055,walnutEdge);box(0,.35,.39,1.98,.16,.06,walnut);
    for(const x of [-.62,0,.62]){soft(x,.49,-.105,.345,.145,.405,fabric);seam([[x-.29,.53,-.48],[x-.15,.55,-.49],[x,.55,-.49],[x+.15,.55,-.49],[x+.29,.53,-.48]],.009)}
    for(const x of [-.62,0,.62]){const back=soft(x,.755,.295,.34,.315,.16,fabricShade);back.rotation.x=-.13;seam([[x-.28,.73,.13],[x-.16,.72,.125],[x,.72,.12],[x+.16,.72,.125],[x+.28,.73,.13]],.007)}
    for(const x of [-1.015,1.015]){soft(x,.59,-.015,.17,.285,.49,fabric);soft(x,.855,-.045,.19,.085,.43,fabricShade);box(x,.39,.02,.055,.43,.79,walnut);seam([[x,.91,-.34],[x,.925,-.18],[x,.925,0],[x,.925,.18],[x,.91,.31]],.007)}
    for(const x of [-.86,.86])for(const z of [-.32,.32]){const leg=new T.Mesh(new T.CylinderGeometry(.035,.052,.25,12),walnut);leg.position.set(x,.125,z);group.add(leg);leg.castShadow=true}
    box(0,.19,-.423,1.86,.07,.035,walnutEdge);
    if(variant==='亚麻燕麦'){
     // Compact loveseat: tapered exposed legs, channel back and two broad cushions.
     box(0,.25,-.02,1.82,.12,.78,walnut);
     for(const x of [-.46,.46]){const cushion=soft(x,.49,-.09,.43,.14,.36,fabric);cushion.rotation.x=-.04}
     for(let x=-.72;x<=.721;x+=.24){const channel=box(x,.79,.405,.035,.43,.035,welt);channel.rotation.z=-.06}
     for(const x of [-.94,.94]){const arm=soft(x,.62,.02,.13,.24,.43,fabricShade);arm.rotation.z=-.08}
     width=2.2;depth=1.15;
    }else if(variant==='雾蓝绒布'){
     // L-shaped sectional: return chaise, extended base and a distinct corner back.
     box(.92,.27,.78,.78,.16,1.05,walnut);soft(.92,.49,.78,.37,.15,.48,fabric);const chaiseBack=soft(.92,.77,1.12,.37,.31,.15,fabricShade);chaiseBack.rotation.x=-.12;
     soft(1.28,.59,.76,.16,.28,.5,fabric);box(1.28,.39,.76,.055,.42,.78,walnut);width=3.05;depth=2.15;
    }else if(variant==='经典款'){
     for(const x of [-.72,-.36,0,.36,.72]){const tuft=new T.Mesh(new T.SphereGeometry(.035,8,6),gold);tuft.position.set(x,.86,.455);group.add(tuft)}
     box(0,.92,.31,1.78,.16,.13,walnut);for(const x of [-.82,.82]){const roll=soft(x,.78,.18,.18,.12,.48,fabricShade);roll.rotation.z=x<0?-.08:.08}
     width=2.35;depth=1.12;
    }else if(name==='羊毛沙发'||name==='休闲沙发'){
     const genericChildren=group.children.slice();for(const child of genericChildren)group.remove(child);
     if(name==='羊毛沙发'){
      width=2.55;depth=1.28;height=.88;
      box(0,.25,0,2.34,.2,.96,walnut);
      soft(0,.43,-.02,1.13,.17,.47,fabric);
      for(const x of [-.78,0,.78]){
       const seat=soft(x,.53,-.02,.39,.16,.43,fabricShade);
       const seamTube=new T.Mesh(new T.TorusGeometry(.31,.009,8,28),welt);
       seamTube.position.set(x,.57,-.025);seamTube.rotation.x=Math.PI/2;group.add(seamTube);
       const back=soft(x,.75,.36,.39,.28,.17,fabric);back.rotation.x=-.1;
      }
      for(const x of [-1.02,1.02]){
       soft(x,.62,-.02,.24,.31,.53,fabric);
       soft(x,.87,-.02,.24,.09,.43,fabricShade);
      }
      for(const x of [-.9,.9])for(const z of [-.38,.38]){
       const foot=new T.Mesh(new T.CylinderGeometry(.035,.045,.17,12),walnut);
       foot.position.set(x,.11,z);group.add(foot);
      }
     }else{
      width=2.3;depth=1.08;height=.98;
      box(0,.29,0,2.05,.12,.78,walnut);
      for(const x of [-.94,.94]){
       box(x,.57,-.02,.07,.64,.07,walnut);
       box(x,.83,.12,.08,.08,.5,walnut);
       box(x,.36,-.03,.07,.25,.08,walnut);
      }
      for(const x of [-.52,.52]){
       const seat=soft(x,.49,-.04,.48,.13,.36,fabric);
       const back=soft(x,.77,.27,.47,.25,.12,fabricShade);back.rotation.x=-.1;
       seam([[x-.35,.53,-.4],[x,.54,-.43],[x+.35,.53,-.4]],.008);
      }
      for(const x of [-.82,.82])for(const z of [-.29,.29]){
       const leg=new T.Mesh(new T.CylinderGeometry(.025,.035,.3,10),walnut);
       leg.position.set(x,.15,z);group.add(leg);
      }
     }
    }
    // Fine upholstery finishing: welted cushion edges, panel seams and recessed feet.
    for(const x of [-.62,0,.62]){
     const stitch=soft(x,.515,-.505,.22,.008,.012,welt);
     stitch.scale.set(.22,.012,.018);
     for(const side of [-1,1]){
      const seamLine=box(x+side*.285,.49,-.105,.012,.012,.62,welt);
      seamLine.rotation.z=side*.025;
     }
    }
    for(const x of [-1.015,1.015]){
     for(const z of [-.27,.27]){const piping=new T.Mesh(new T.TorusGeometry(.105,.009,6,24,Math.PI),welt);piping.position.set(x,.61,z);piping.rotation.z=Math.PI/2;group.add(piping)}
     box(x,.48,-.015,.018,.3,.68,walnutEdge);
    }
    for(const x of [-.86,.86])for(const z of [-.32,.32]){
     const ferrule=new T.Mesh(new T.CylinderGeometry(.054,.052,.045,16),walnutEdge);
     ferrule.position.set(x,.035,z);group.add(ferrule);
    }
   }else if(modelName==='壁画'){
    action=()=>openFurnitureActions('wallArt',id);
    width=1.5;depth=.14;height=1.18;wallAxis='x';wallSide='back';anchor=[0,1.9];
    box(0,0,0,1.52,1.18,.13,m.wood);box(0,0,.075,1.4,1.06,.035,m.gold);box(0,0,.098,1.32,.98,.018,m.cream);
    const arch=new T.Mesh(new T.CircleGeometry(.36,32,0,Math.PI),m.wall);arch.position.set(0,.17,.112);group.add(arch);box(0,-.19,.115,.72,.72,.012,m.wall);
    const stemA=new T.CatmullRomCurve3([new T.Vector3(-.22,-.34,.135),new T.Vector3(-.13,-.08,.145),new T.Vector3(-.16,.2,.14),new T.Vector3(-.32,.37,.135)]);
    const stemB=new T.CatmullRomCurve3([new T.Vector3(.1,-.36,.14),new T.Vector3(.19,-.08,.15),new T.Vector3(.12,.17,.14),new T.Vector3(.31,.35,.135)]);
    for(const curve of [stemA,stemB])group.add(new T.Mesh(new T.TubeGeometry(curve,20,.012,6,false),m.clay));
    for(const [x,y,rot] of [[-.27,-.08,-.6],[-.12,.12,.65],[-.3,.3,-.7],[.2,-.08,.65],[.14,.17,-.65],[.29,.3,.7]]){const leaf=sphere(x,y,.15,.12,.045,.018,m.leaf);leaf.rotation.z=rot}
    cyl(0,-.39,.145,.18,.18,.018,m.gold,16);
   }else if(modelName==='隔断'){
    width=2.45;depth=.34;height=2.12;
    for(let panel=0;panel<3;panel++){
     const x=(panel-1)*.82,angle=panel===1?0:(panel===0?.13:-.13);
     const part=new T.Group();part.position.set(x,0,0);part.rotation.y=angle;group.add(part);
     box(0,1.02,0,.075,2.02,.13,m.wood);box(0,1.02,.078,.72,1.78,.035,m.cream);
     for(const y of [.15,1.88])box(0,y,.105,.78,.09,.08,m.oak);
     for(let n=0;n<5;n++){const slat=box(-.27+n*.135,1.02,.105,.025,1.62,.025,n%2?m.gold:m.wood);slat.rotation.z=(n-2)*.035}
     for(const y of [.3,.58,.86,1.14,1.42,1.7])box(0,y,.12,.67,.018,.025,m.gold);
     box(0,.07,.02,.18,.14,.36,m.wood);
     if(panel<2)cyl(x+.405,1.02,.02,.035,.035,1.86,m.gold);
    }
   }else if(modelName==='棕榈树绿植'){
    width=1.05;depth=1.05;height=2.3;
    const pot=new T.Mesh(new T.CylinderGeometry(.23,.34,.48,24,1),m.clay);pot.position.y=.25;group.add(pot);
    cyl(0,.5,0,.31,.31,.055,m.gold,24);cyl(0,1.16,0,.055,.075,1.28,m.wood,14);
    for(let i=0;i<9;i++){
     const a=i*Math.PI*2/9,dx=Math.cos(a),dz=Math.sin(a);
     const curve=new T.CatmullRomCurve3([new T.Vector3(0,1.7,0),new T.Vector3(dx*.24,2.05,dz*.24),new T.Vector3(dx*.52,1.98,dz*.52),new T.Vector3(dx*.72,1.72,dz*.72)]);
     group.add(new T.Mesh(new T.TubeGeometry(curve,14,.018,6,false),m.leaf2));
     for(let n=1;n<=5;n++){const t=n/6,p=curve.getPoint(t);for(const side of [-1,1]){const leaflet=sphere(p.x-dz*side*.095,p.y-.025,p.z+dx*side*.095,.11,.025,.045,(n+i)%2?m.leaf:m.leaf2);leaflet.rotation.y=a;leaflet.rotation.z=side*.35}}
    }
    sphere(0,1.77,0,.14,.16,.14,m.leaf);
   }else if(modelName==='书架'){
    action=()=>openFurnitureActions('bookshelf',id);width=1.45;depth=.58;height=2.12;
    const open=variant==='开放格架',woodGrid=variant==='白蜡木开放格';
    const frame=variant==='深胡桃木书柜'?mat(0x503a2d,.62):woodGrid?mat(0xc4a77f,.7):m.wood;
    const shelf=woodGrid?mat(0xe0cba7,.68):variant==='深胡桃木书柜'?mat(0x74543a,.62):m.oak;
    if(open){
     for(const x of [-.65,.65])box(x,1.04,0,.075,2.08,.48,frame);
     for(const [y,w,d] of [[.16,1.34,.5],[.66,1.18,.46],[1.22,1.34,.46],[1.78,1.12,.42]])box(0,y,0,w,.065,d,shelf);
     box(0,1.02,-.225,1.26,1.92,.025,m.cream);
    }else if(woodGrid){
     box(0,1.05,-.02,1.48,2.1,.52,frame);
     box(0,1.05,.255,1.34,1.94,.035,m.cream);
     for(const y of [.16,.68,1.2,1.72,2.0])box(0,y,.015,1.42,.075,.55,shelf);
     for(const x of [-.46,0,.46])box(x,1.08,.015,.055,1.82,.52,frame);
     for(const x of [-.68,.68])box(x,1.05,0,.09,2.1,.58,frame);
    }else if(variant==='深胡桃木书柜'){
     // Vintage library cabinet: crown moulding, open upper shelves and closed lower doors.
     box(0,1.05,0,1.48,2.1,.55,frame);
     box(0,2.12,0,1.62,.12,.68,shelf);
     box(0,1.65,-.25,1.3,.82,.035,mat(0x3e2b20,.82));
     for(const y of [1.3,1.72,2.02])box(0,y,-.01,1.34,.055,.5,shelf);
     for(const x of [-.58,.58])box(x,1.58,.04,.075,1.0,.58,frame);
     box(0,.4,.29,1.4,.68,.035,frame);
     for(const x of [-.34,.34]){
      box(x,.4,.315,.64,.58,.025,shelf);
      for(const dx of [-.28,.28])box(x+dx,.4,.34,.018,.52,.018,m.oak);
      cyl(x+(x<0?.22:-.22),.4,.37,.025,.025,.05,m.gold,10);
     }
     for(const x of [-.7,.7])box(x,1.05,.02,.08,2.08,.62,frame);
    }else{
     // Glass-front display bookcase with framed double doors and a central meeting stile.
     box(0,1.05,0,1.48,2.1,.55,frame);
     box(0,.28,.29,1.38,.48,.035,shelf);
     for(const y of [.68,1.2,1.72])box(0,y,0,1.34,.055,.5,shelf);
     const glass=mat(0xc4d8d9,.14,.12);glass.transparent=true;glass.opacity=.26;
     for(const x of [-.34,.34]){
      box(x,1.38,.285,.62,1.18,.025,glass);
      for(const edge of [-.31,.31])box(x+edge,1.38,.305,.025,1.22,.045,frame);
      box(x,1.38,.305,.62,.025,.045,frame);
      cyl(x+(x<0?.24:-.24),1.34,.34,.018,.018,.05,m.gold,10);
     }
     box(0,.28,.31,1.38,.46,.035,frame);
     for(const x of [-.32,.32])cyl(x,.28,.35,.025,.025,.045,m.gold,10);
    }
    for(let level=0;level<3;level++){
     const y=.38+level*.53;
     for(let j=0;j<5;j++){
      const x=-.48+j*.22,bookH=.24+(j%3)*.07;
      const bookMat=[m.clay,m.leaf,m.gold,m.dark,m.sofa2][(j+level)%5];
      box(x,y,-.12,.13,bookH,.22,bookMat);
      box(x,y+bookH/2+.008,-.12,.105,.012,.225,m.cream);
      box(x,y,-.236,.012,bookH*.72,.012,shelf);
     }
    }
   }else if(modelName==='书桌'||modelName==='餐桌'){
    action=()=>modelName==='书桌'?openFurnitureActions('desk',id):openFurnitureActions('dining',id);
    const dining=modelName==='餐桌';width=dining?1.95:1.62;depth=dining?1.15:.88;height=dining?.82:.78;surfaceType='table';surfaceY=height+.05;
    if(dining&&variant==='浅橡木长桌'){
     box(0,.83,0,2.05,.13,1.12,m.oak);box(0,.91,0,1.98,.025,1.05,m.cream);
     for(const x of [-.82,.82])for(const z of [-.39,.39])box(x,.4,z,.12,.76,.12,m.wood);
     box(0,.38,0,1.5,.08,.08,m.wood);
     for(const x of [-.82,.82])box(x,.9,.57,.08,.08,.08,m.gold);
    }else if(dining){
     cyl(0,.4,0,.13,.2,.72,m.wood,12);cyl(0,.12,0,.62,.62,.13,m.oak,12);
     cyl(0,.82,0,.08,.08,.1,m.gold,12);cyl(0,.88,0,.62,.58,.12,m.wood,12);cyl(0,.95,0,.57,.57,.035,m.cream,12);
    }else if(variant==='白蜡木极简'){
     const top=mat(0xe0cba7,.58);box(0,.78,0,1.62,.095,.86,m.oak);box(0,.835,0,1.58,.025,.82,top);
     for(const x of [-.64,.64]){
      const legA=box(x,.4,-.29,.055,.72,.055,m.wood);legA.rotation.z=x<0?-.045:.045;
      const legB=box(x,.4,.29,.055,.72,.055,m.wood);legB.rotation.z=x<0?-.045:.045;
     }
     box(0,.67,-.31,1.3,.055,.06,m.oak);
    }else if(variant==='深胡桃木复古'){
     const walnut=mat(0x503626,.58),edge=mat(0x76543a,.56);
     box(0,.79,0,1.7,.16,.92,walnut);box(0,.88,0,1.72,.035,.94,edge);
     box(0,.58,-.32,1.42,.27,.12,walnut);
     for(const x of [-.48,0,.48]){
      box(x,.58,-.247,.42,.2,.025,edge);
      const knob=new T.Mesh(new T.SphereGeometry(.028,12,8),m.gold);knob.position.set(x,.58,-.22);group.add(knob);
     }
     for(const x of [-.68,.68])for(const z of [-.34,.34]){
      const leg=new T.Mesh(new T.CylinderGeometry(.045,.075,.68,12),walnut);leg.position.set(x,.39,z);group.add(leg);
     }
     box(0,.36,0,1.38,.07,.72,edge);
    }else{
     const carcass=mat(0xb18a61,.7),front=mat(0xd9c4a6,.72);
     box(-.43,.42,0,.58,.72,.78,carcass);
     for(let i=0;i<3;i++){
      const y=.2+i*.22;box(-.43,y,.405,.52,.19,.025,front);
      cyl(-.43,y,.445,.025,.025,.035,m.gold,10);
     }
     box(.42,.78,0,1.0,.1,.86,m.oak);box(.42,.835,0,.98,.025,.82,m.cream);
     for(const z of [-.34,.34])box(.42,.39,z,.09,.72,.09,m.wood);
     box(0,.73,-.37,.95,.1,.08,m.oak);
    }
    for(const z of [-depth/2,depth/2])box(0,height-.012,z,width*.94,.018,.018,m.oak);
   }else if(modelName==='椅子'||modelName==='餐桌椅'){
    action=()=>openFurnitureActions('chair',id);
    width=variant==='软包扶手椅'?.98:.78;depth=.82;height=1.08;
    if(variant==='藤编餐椅'){
     width=.78;depth=.82;
     const cane=mat(0xc39b6d,.96),wood=mat(0x76543d,.62),edge=mat(0x98724d,.66);
     box(0,.52,0,.74,.13,.7,wood);box(0,.59,.015,.7,.055,.66,edge);
     legs(.72,.66,.5,.055);
     // Dense crossed cane strips replace the former decorative metal-looking slats.
     for(let i=-3;i<=3;i++){const a=box(i*.085,.625,.015,.012,.012,.62,cane);a.rotation.y=.16;const b=box(0,.627,i*.085,.66,.012,.012,cane);b.rotation.y=-.12}
     for(const x of [-.32,.32]){
      const post=box(x,.88,-.31,.065,.58,.065,wood);post.rotation.z=x*.08;
      for(let y=.69;y<=1.08;y+=.075)box(x,.78+(y-.69),-.31,.075,.018,.07,edge);
     }
     const crest=new T.CatmullRomCurve3([new T.Vector3(-.35,1.12,-.31),new T.Vector3(-.25,1.18,-.31),new T.Vector3(0,1.2,-.31),new T.Vector3(.25,1.18,-.31),new T.Vector3(.35,1.12,-.31)]);
     group.add(new T.Mesh(new T.TubeGeometry(crest,24,.035,8,false),wood));
     for(let x=-.25;x<=.251;x+=.08){const strand=box(x,.88,-.31,.012,.38,.018,cane);}
    }else if(variant==='软包扶手椅'){
     width=1.02;depth=.9;height=1.12;
     const upholstery=mat(0xd8cbb8,.96),piping=mat(0xa68b6d,.78),frame=mat(0x76543d,.62);
     box(0,.49,0,.88,.18,.78,frame);box(0,.61,.015,.84,.18,.74,upholstery);
     box(0,1.0,-.31,.86,.78,.18,frame);box(0,1.0,-.205,.76,.65,.08,upholstery);
     for(const x of [-.46,.46]){
      const arm=box(x,.76,-.005,.13,.48,.76,frame);
      box(x,.91,.015,.15,.15,.72,upholstery);
      box(x,.69,.31,.15,.13,.12,piping);
     }
     for(const x of [-.34,.34])for(const z of [-.28,.28]){const leg=box(x,.23,z,.075,.46,.075,frame);leg.rotation.z=x*.045}
     for(let x=-.3;x<=.301;x+=.15){const seam=box(x,.705,.39,.012,.012,.018,piping)}
    }else{
     // Windsor-style curved crest rail, turned front legs and narrow vertical spindles.
     const wood=mat(0x805a3c,.58),edge=mat(0xa47b51,.56);
     box(0,.51,0,.66,.13,.66,m.oak);
     for(const x of [-.25,.25])for(const z of [-.24,.24]){const leg=cyl(x,.3,z,.038,.052,.58,wood,12);sphere(x,.56,z,.065,.045,.065,edge)}
     for(const z of [-.23,.23])box(0,.32,z,.54,.045,.045,wood);
     for(let x=-.25;x<=.251;x+=.125){const spindle=cyl(x,.83,-.29,.022,.022,.48,wood,10);sphere(x,.63,-.29,.038,.035,.038,edge)}
     const crest=new T.CatmullRomCurve3([new T.Vector3(-.34,1.08,-.29),new T.Vector3(-.3,1.17,-.29),new T.Vector3(-.15,1.21,-.29),new T.Vector3(0,1.22,-.29),new T.Vector3(.15,1.21,-.29),new T.Vector3(.3,1.17,-.29),new T.Vector3(.34,1.08,-.29)]);
     group.add(new T.Mesh(new T.TubeGeometry(crest,28,.045,10,false),wood));
     for(const x of [-.32,.32]){const post=box(x,.78,-.29,.065,.58,.065,wood);post.rotation.z=x*.08}
     for(const x of [-.3,.3]){const arm=box(x,.7,-.01,.075,.07,.58,wood);arm.rotation.z=x*.06}
    }
   }else if(modelName==='电脑'){
    action=()=>openFurnitureActions('computer',id);
    width=.72;depth=.55;height=.72;surfaceType='tabletop';surfaceY=.04;
    // Desktop monitor with a sculpted bezel, webcam, stand, keyboard keycaps and mouse.
    box(0,.48,-.16,.76,.49,.065,m.dark);box(0,.49,-.122,.704,.425,.012,m.screen);
    box(0,.49,-.113,.68,.395,.006,mat(0x718f9b,.34));
    box(0,.275,-.16,.075,.12,.09,m.metal);box(0,.205,-.16,.34,.035,.22,m.metal);
    sphere(0,.716,-.113,.018,.018,.012,m.gold);
    box(0,.07,.15,.68,.045,.23,m.dark);box(0,.096,.15,.6,.012,.17,m.cream);
    for(let row=0;row<4;row++)for(let col=0;col<13;col++){const key=box(-.265+col*.044,.108,.085+row*.043,.032,.012,.028,row===0?m.metal:m.oak);key.position.y=.108+((row+col)%5)*.001}
    const mouse=sphere(.43,.105,.16,.055,.025,.085,m.dark);mouse.rotation.y=-.18;
    for(const x of [-.43,.43]){box(x,.2,-.14,.085,.22,.12,m.wood);box(x,.2,-.072,.045,.12,.012,m.dark);cyl(x,.2,-.06,.018,.018,.012,m.gold,10)}
    box(0,.74,-.12,.16,.018,.012,m.gold);
   }else if(modelName==='电视'){
    action=()=>openFurnitureActions('television',id);width=1.62;depth=.58;height=1.42;surfaceType='floor';surfaceY=.04;
    box(0,.32,0,1.55,.58,.52,m.wood);box(0,.64,-.015,1.48,.045,.49,m.oak);box(0,.68,-.015,1.42,.025,.45,m.cream);
    for(const x of [-.57,.57])box(x,.075,.12,.09,.15,.1,m.dark);
    // Rounded, layered television housing with a recessed glass panel and a separate soundbar.
    box(0,1.2,-.12,1.48,.92,.095,m.dark);
    box(0,1.2,-.174,1.405,.845,.018,m.metal);
    box(0,1.2,-.186,1.375,.815,.012,m.screen);
    const tvGlow=box(0,1.2,-.194,1.31,.75,.004,mat(0x66899a,.3));tvGlow.material.emissive=new T.Color(0x1d3542);tvGlow.material.emissiveIntensity=.16;
    for(const x of [-.68,.68]){box(x,1.2,-.197,.012,.78,.008,m.cream)}
    box(0,.735,-.12,.12,.18,.09,m.metal);box(0,.66,-.12,.48,.045,.2,m.metal);
    box(0,.78,.32,.72,.075,.11,m.dark);for(let i=0;i<18;i++)box(-.31+i*.036,.78,.379,.012,.026,.006,m.metal);
    sphere(.66,.77,-.195,.012,.012,.008,m.gold);
   }else if(modelName==='唱片机'){
    action=()=>openFurnitureActions('recordPlayer',id);width=.92;depth=.78;height=.92;surfaceType='floor';surfaceY=.04;
    box(0,.48,0,.88,.2,.72,m.wood);box(0,.59,-.01,.9,.055,.74,m.oak);
    for(const x of [-.34,.34])for(const z of [-.25,.25])box(x,.13,z,.065,.24,.065,m.dark);
    cyl(0,.64,-.035,.27,.27,.045,m.metal,32);cyl(0,.672,-.035,.235,.235,.018,m.dark,40);
    for(let r=.07;r<.22;r+=.035){const groove=new T.Mesh(new T.TorusGeometry(r,.003,4,48),m.metal);groove.rotation.x=Math.PI/2;groove.position.set(0,.684,-.035);group.add(groove)}
    cyl(0,.686,-.035,.035,.035,.012,m.gold,20);
    const arm=box(.22,.71,-.02,.025,.025,.34,m.metal);arm.rotation.x=-.08;arm.rotation.y=-.24;
    sphere(.22,.72,-.19,.035,.025,.035,m.gold);
    box(0,.79,.27,.72,.025,.08,m.cream);
   }else if(modelName==='捧花摆件'){
    action=()=>openFurnitureActions('bouquet',id);
    width=.42;depth=.42;height=.72;surfaceType='floor';surfaceY=.04;
    const vase=new T.Mesh(new T.LatheGeometry([new T.Vector2(.11,0),new T.Vector2(.17,.08),new T.Vector2(.2,.28),new T.Vector2(.13,.42),new T.Vector2(.085,.48)],18),m.clay);vase.position.y=.08;group.add(vase);
    cyl(0,.56,0,.11,.11,.035,m.gold,16);
    for(let i=0;i<7;i++){const angle=i*Math.PI*2/7,x=Math.cos(angle),z=Math.sin(angle),stem=new T.CatmullRomCurve3([new T.Vector3(x*.035,.55,z*.035),new T.Vector3(x*.07,.75,z*.07),new T.Vector3(x*.14,.91+(i%2)*.05,z*.14)]);group.add(new T.Mesh(new T.TubeGeometry(stem,12,.012,6,false),m.leaf));const flower=new T.Group();flower.position.set(x*.14,.91+(i%2)*.05,z*.14);group.add(flower);for(let petal=0;petal<6;petal++){const a=petal*Math.PI/3,p=sphere(Math.cos(a)*.065,0,Math.sin(a)*.065,.06,.075,.045,[m.cream,m.clay,m.gold][i%3]);p.position.add(flower.position)}sphere(flower.position.x,flower.position.y+.015,flower.position.z,.035,.035,.035,m.gold,12)}

   }else if(modelName==='茶几'){
    width=variant==='圆形浅橡木'?1.12:1.42;depth=variant==='圆形浅橡木'?1.12:.88;height=.48;surfaceType='table';surfaceY=.52;
    if(variant==='圆形浅橡木'){cyl(0,.43,0,.56,.56,.1,m.oak,40);cyl(0,.22,0,.12,.16,.42,m.wood,20);cyl(0,.06,0,.42,.42,.08,m.oak,32)}
    else if(variant==='米白石材'){box(0,.43,0,1.44,.11,.9,mat(0xe5dfd4,.34));for(const x of [-.54,.54])for(const z of [-.3,.3])box(x,.21,z,.075,.42,.075,m.dark)}
    else{box(0,.4,0,1.42,.12,.86,m.wood);box(0,.47,0,1.38,.035,.82,m.oak);for(const x of [-.58,.58])for(const z of [-.32,.32])box(x,.2,z,.075,.38,.075,m.wood);for(const x of [-.36,.36]){box(x,.27,.44,.48,.19,.035,m.oak);cyl(x,.27,.47,.025,.025,.045,m.gold,10)}}
   }else if(modelName==='边桌'){
    width=.72;depth=.72;height=.68;surfaceType='table';surfaceY=.7;
    if(variant==='黄铜圆桌'){
     const brass=mat(0xb58c54,.32,.78),dark=mat(0x6c5946,.48,.55);
     cyl(0,.64,0,.34,.34,.075,brass,40);
     const inset=new T.Mesh(new T.TorusGeometry(.285,.012,8,48),dark);inset.rotation.x=Math.PI/2;inset.position.y=.682;group.add(inset);
     cyl(0,.34,0,.055,.075,.52,brass,24);
     for(let i=0;i<12;i++){const a=i*Math.PI/6,flute=box(Math.cos(a)*.047,.36,Math.sin(a)*.047,.012,.34,.012,dark);flute.rotation.y=-a}
     cyl(0,.07,0,.255,.255,.07,brass,32);
     const foot=new T.Mesh(new T.TorusGeometry(.22,.018,8,36),dark);foot.rotation.x=Math.PI/2;foot.position.y=.105;group.add(foot);
     for(let i=0;i<3;i++){const a=i*Math.PI*2/3;cyl(Math.cos(a)*.18,.035,Math.sin(a)*.18,.035,.035,.045,m.dark,12)}
    }else{
     const walnut=mat(0x62442f,.62),edge=mat(0x9a704b,.58),brass=mat(0xb28b58,.34,.65);
     box(0,.62,0,.72,.085,.72,walnut);box(0,.672,0,.68,.018,.68,edge);
     box(0,.42,.366,.52,.24,.025,edge);box(0,.42,.385,.46,.18,.018,walnut);
     for(const x of [-.13,.13])cyl(x,.42,.405,.018,.018,.035,brass,12);
     for(const x of [-.27,.27])for(const z of [-.27,.27]){
      const leg=new T.Mesh(new T.CylinderGeometry(.035,.055,.49,12),walnut);leg.position.set(x,.29,z);leg.rotation.z=-x*.12;leg.rotation.x=z*.12;group.add(leg);
     }
     box(0,.18,0,.58,.045,.58,edge);
     for(const x of [-.24,.24])for(const z of [-.24,.24])cyl(x,.045,z,.035,.035,.045,m.dark,10);
    }
   }else if(modelName==='电视柜'){
    width=2.15;depth=.58;height=.72;surfaceType='table';surfaceY=.78;
    box(0,.38,0,2.12,.68,.56,m.oak);box(0,.75,0,2.2,.09,.62,m.cream);
    for(const x of [-.72,0,.72]){box(x,.39,.29,.66,.56,.035,m.wood);box(x,.39,.315,.59,.48,.018,m.sofa2);for(const y of [.2,.56])box(x,y,.33,.5,.015,.012,m.cream)}
    for(const x of [-.93,.93])box(x,.08,-.18,.09,.16,.09,m.dark);
    // Cabinet door reveals, drawer-like central bay and continuous shadow gaps.
    for(const x of [-.72,0,.72]){
     box(x,.39,.322,.018,.49,.012,m.wood);
     const knob=new T.Mesh(new T.SphereGeometry(.028,12,8),m.gold);
     knob.position.set(x+(x===0?-.22:.22),.4,.345);group.add(knob);
    }
    for(const x of [-.93,.93])for(const z of [-.19,.19]){
     const foot=new T.Mesh(new T.CylinderGeometry(.045,.055,.18,12),m.wood);
     foot.position.set(x,.09,z);group.add(foot);
    }
   }else if(modelName==='斗柜'){
    const cream=variant==='奶油三抽';width=1.28;depth=.68;height=1.18;
    const body=cream?mat(0xe4d8c7,.82):mat(0x60432f,.62),front=cream?mat(0xf0e8dc,.9):mat(0x806044,.64),edge=mat(cream?0xbca88e:0x3d2d23,.68),brass=mat(0xb58d56,.35,.68);
    box(0,.57,0,1.22,1.08,.61,body);
    box(0,1.13,0,1.32,.1,.69,front);
    for(const x of [-.57,.57])box(x,.59,.32,.055,.95,.055,edge);
    const count=cream?3:4,drawerH=cream?.27:.205,spacing=cream?.31:.235;
    for(let i=0;i<count;i++){
     const y=.19+i*spacing;
     box(0,y,.323,1.08,drawerH,.055,edge);
     box(0,y,.357,1.015,drawerH-.045,.025,front);
     box(0,y+drawerH*.36,.374,.92,.012,.012,edge);
     if(cream){
      for(const x of [-.32,.32]){const pull=new T.Mesh(new T.TorusGeometry(.025,.009,6,16),brass);pull.position.set(x,y,.39);group.add(pull)}
     }else{
      for(const x of [-.31,.31]){cyl(x,y,.39,.024,.024,.045,brass,12);box(x,y,.414,.065,.018,.018,brass)}
     }
    }
    box(0,1.2,0,1.3,.035,.67,edge);
    for(const x of [-.48,.48])for(const z of [-.23,.23]){
     const foot=new T.Mesh(new T.CylinderGeometry(.045,.065,.17,12),body);foot.position.set(x,.085,z);foot.rotation.z=-x*.08;group.add(foot);
    }
    for(const x of [-.59,.59])box(x,.59,-.12,.035,.9,.035,front);
   }else if(modelName==='梳妆台'){
    width=1.42;depth=.68;height=1.62;surfaceType='table';surfaceY=.9;
    if(name==='复古妆台'){
     const walnut=mat(0x563b2b,.58),trim=mat(0x94704b,.52),ivory=mat(0xe6d7c2,.78);
     box(0,.86,0,1.48,.12,.66,walnut);box(0,.92,0,1.5,.035,.68,trim);
     // Three shallow drawers, a shaped apron and cabriole-style legs give the vintage vanity its own silhouette.
     for(const x of [-.45,0,.45]){box(x,.68,.34,.4,.23,.045,ivory);box(x,.68,.37,.36,.19,.018,walnut);cyl(x,.68,.405,.025,.025,.045,m.gold,12)}
     const apron=box(0,.48,.04,1.12,.18,.48,walnut);
     for(const x of [-.58,.58])for(const z of [-.22,.22]){
      const leg=box(x,.25,z,.075,.48,.075,walnut);leg.rotation.z=x<0?-.12:.12;
      sphere(x*1.08,.48,z,.075,.055,.075,trim);
     }
     box(0,1.18,-.22,.14,.5,.1,walnut);
     const frame=new T.Mesh(new T.SphereGeometry(.39,28,20),trim);frame.position.set(0,1.65,-.2);frame.scale.set(1,.82,.12);group.add(frame);
     const glass=new T.Mesh(new T.SphereGeometry(.34,28,20),mat(0x9eafb0,.2,.16));glass.position.set(0,1.65,-.185);glass.scale.set(1,.82,.1);group.add(glass);
     for(const x of [-.3,.3])sphere(x,1.98,-.18,.045,.07,.045,m.gold);
     sphere(0,2.02,-.18,.075,.075,.045,m.gold);
     width=1.55;height=2.12;
    }else{
     const top=mat(0xd9c7ae,.62),body=mat(0xe8ddcc,.8);
     box(0,.84,0,1.38,.1,.62,top);
     box(0,.66,.25,.76,.24,.035,body);box(0,.66,.28,.68,.19,.018,m.cream);
     cyl(0,.66,.31,.025,.025,.045,m.gold,12);
     for(const x of [-.56,.56]){
      const leg=box(x,.4,0,.075,.72,.075,m.wood);leg.rotation.z=x*.045;
      box(x,.4,.28,.16,.28,.035,body);
     }
     box(0,1.4,-.23,.08,.92,.08,m.wood);
     const mirrorFrame=new T.Mesh(new T.SphereGeometry(.32,28,20),m.oak);mirrorFrame.position.set(0,1.62,-.23);mirrorFrame.scale.set(1,.82,.13);group.add(mirrorFrame);
     const mirror=new T.Mesh(new T.SphereGeometry(.28,28,20),mat(0x9eafb0,.2,.16));mirror.position.set(0,1.62,-.205);mirror.scale.set(1,.82,.1);group.add(mirror);
    }
   }else if(modelName==='全身镜'){
    width=.92;depth=.3;height=2.12;
    const frame=mat(variant==='黄铜拱形'?0xb89a62:0x77563d,.42,variant==='黄铜拱形'?.62:.08);
    const rear=mat(0x493b32,.72);
    // Extruded arched frame and a shader-backed reflective face, rather than a flat grey panel.
    const outer=new T.Shape();outer.moveTo(-.42,-.91);outer.lineTo(-.42,.48);outer.quadraticCurveTo(-.42,.98,0,.98);outer.quadraticCurveTo(.42,.98,.42,.48);outer.lineTo(.42,-.91);outer.closePath();
    const frameGeo=new T.ExtrudeGeometry(outer,{depth:.12,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:28});frameGeo.translate(0,1.05,0);
    const frameMesh=new T.Mesh(frameGeo,frame);frameMesh.castShadow=true;frameMesh.receiveShadow=true;group.add(frameMesh);
    const inner=new T.Shape();inner.moveTo(-.345,-.82);inner.lineTo(-.345,.47);inner.quadraticCurveTo(-.345,.84,0,.84);inner.quadraticCurveTo(.345,.84,.345,.47);inner.lineTo(.345,-.82);inner.closePath();
    const mirrorMat=new T.ShaderMaterial({
     uniforms:{edgeTint:{value:new T.Color(0x53636a)},silverTint:{value:new T.Color(0xd9e1e1)}},
     vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
     fragmentShader:`uniform vec3 edgeTint;uniform vec3 silverTint;varying vec2 vUv;
      void main(){float edge=pow(abs(vUv.x-.5)*2.0,2.2);float sweep=exp(-pow((vUv.x-.28)*8.0,2.0))*.18;float vertical=.34+.32*vUv.y;vec3 reflection=mix(edgeTint,silverTint,vertical);reflection=mix(reflection,vec3(.96,.97,.94),sweep);reflection=mix(reflection,edgeTint,edge*.28);gl_FragColor=vec4(reflection,1.0);}`,
     side:T.DoubleSide,toneMapped:false
    });
    const mirror=new T.Mesh(new T.ShapeGeometry(inner,32),mirrorMat);mirror.position.set(0,1.05,.135);group.add(mirror);
    const innerLine=new T.CatmullRomCurve3([new T.Vector3(-.35,.23,.145),new T.Vector3(-.35,1.48,.145),new T.Vector3(-.34,1.68,.145),new T.Vector3(0,1.82,.145),new T.Vector3(.34,1.68,.145),new T.Vector3(.35,1.48,.145),new T.Vector3(.35,.23,.145)]);group.add(new T.Mesh(new T.TubeGeometry(innerLine,42,.008,6,false),mat(0xd3bd91,.38,.55)));
    box(0,.09,.02,.96,.14,.38,rear);
    for(const side of [-1,1]){const foot=new T.Mesh(new T.CylinderGeometry(.045,.07,.28,12),frame);foot.position.set(side*.31,.16,-.02);foot.rotation.z=side*.08;group.add(foot)}
    const support=box(0,.62,-.13,.055,1.1,.055,rear);support.rotation.x=-.2;
    for(const y of [.34,1.72])for(const side of [-1,1])cyl(side*.405,y,.145,.018,.018,.025,m.gold,10);
   }else if(modelName==='餐边柜'){
    width=1.92;depth=.64;height=1.22;surfaceType='table';surfaceY=1.26;
    const carcass=mat(0x76543d,.66),front=mat(0xc5a47e,.72),dark=mat(0x47372d,.78),brass=mat(0xb58d56,.34,.68),stone=mat(0xe5ded1,.42);
    box(0,.58,0,1.86,1.08,.6,carcass);
    box(0,1.16,0,1.98,.1,.68,stone);
    box(0,1.105,0,1.9,.035,.64,front);
    // Two paneled cupboards flank an open central display bay.
    for(const x of [-.62,.62]){
     box(x,.58,.315,.56,.88,.045,front);
     box(x,.58,.344,.47,.76,.018,carcass);
     box(x,.58,.357,.42,.7,.012,front);
     for(const y of [.25,.9])box(x,y,.37,.38,.012,.012,brass);
     cyl(x+(x<0?.17:-.17),.58,.39,.024,.024,.04,brass,12);
     for(const z of [-.2,.2]){const foot=new T.CylinderGeometry(.035,.05,.16,10);const f=new T.Mesh(foot,carcass);f.position.set(x,.08,z);group.add(f)}
    }
    box(0,.36,.28,.58,.035,.12,dark);box(0,.75,.28,.58,.035,.12,dark);
    for(const y of [.44,.83]){
     box(0,y,.16,.55,.025,.25,front);
     for(let k=0;k<3;k++){const bottle=cyl(-.17+k*.17,y+.11,.2,.035,.035,.19,k===1?m.leaf:m.clay,12);cyl(-.17+k*.17,y+.22,.2,.022,.022,.045,brass,10)}
    }
    box(0,1.22,.34,.48,.035,.025,brass);
    for(const x of [-.88,.88])for(const z of [-.22,.22]){const foot=new T.CylinderGeometry(.04,.055,.17,10);const f=new T.Mesh(foot,carcass);f.position.set(x,.085,z);group.add(f)}
   }else if(modelName==='阅读椅'){
    width=1.08;depth=1.02;height=1.24;action=()=>openFurnitureActions('chair',id);
    const timber=mat(0x76543d,.58),upholstery=mat(0xd8cbb8,.96),shade=mat(0xbcae9e,.98),piping=mat(0x9b8068,.82);
    applyPainterMap(upholstery,fabricMap,.024);applyPainterMap(shade,fabricMap,.022);
    // A deep wingback reading chair with a sprung seat, rolled arms and a tall enveloping back.
    box(0,.35,0,.96,.18,.88,timber);
    const seat=sphere(0,.57,.04,.49,.17,.43,upholstery,28);seat.scale.y=.78;
    const seatTop=sphere(0,.65,.055,.445,.09,.385,shade,28);
    const back=sphere(0,1.02,-.34,.47,.56,.15,upholstery,28);back.rotation.x=-.12;
    const innerBack=sphere(0,1.03,-.235,.365,.43,.055,shade,24);innerBack.rotation.x=-.12;
    for(const side of [-1,1]){
     const wing=sphere(side*.405,1.02,-.27,.105,.48,.18,upholstery,20);wing.rotation.z=-side*.13;
     const armBase=box(side*.43,.68,-.005,.16,.17,.68,timber);armBase.rotation.x=-.06;
     const arm=sphere(side*.43,.81,.015,.115,.105,.36,upholstery,20);arm.rotation.x=-.05;
     const armEdge=new T.CatmullRomCurve3([new T.Vector3(side*.43,.86,-.29),new T.Vector3(side*.43,.89,-.12),new T.Vector3(side*.43,.89,.12),new T.Vector3(side*.43,.84,.31)]);
     group.add(new T.Mesh(new T.TubeGeometry(armEdge,20,.012,7,false),piping));
     for(const z of [-.28,.28]){const leg=new T.Mesh(new T.CylinderGeometry(.035,.052,.42,12),timber);leg.position.set(side*.39,.2,z);leg.rotation.z=-side*.08;group.add(leg)}
    }
    const backSeam=new T.CatmullRomCurve3([new T.Vector3(-.34,.72,-.21),new T.Vector3(-.37,1.02,-.19),new T.Vector3(-.3,1.35,-.2),new T.Vector3(0,1.48,-.2),new T.Vector3(.3,1.35,-.2),new T.Vector3(.37,1.02,-.19),new T.Vector3(.34,.72,-.21)]);
    group.add(new T.Mesh(new T.TubeGeometry(backSeam,42,.009,6,false),piping));
    for(const x of [-.16,0,.16])for(const y of [.91,1.12])sphere(x,y,-.177,.018,.018,.012,m.gold,10);
    const frontSeam=new T.CatmullRomCurve3([new T.Vector3(-.37,.67,.37),new T.Vector3(-.2,.7,.42),new T.Vector3(0,.7,.43),new T.Vector3(.2,.7,.42),new T.Vector3(.37,.67,.37)]);
    group.add(new T.Mesh(new T.TubeGeometry(frontSeam,24,.009,6,false),piping));
    for(const z of [-.27,.27]){const rail=box(0,.18,z,.78,.06,.055,timber)}
    for(const side of [-1,1]){const brace=box(side*.4,.2,0,.045,.06,.5,timber);brace.rotation.z=side*.08}
   }else if(modelName==='花瓶'){
    width=.5;depth=.5;height=.88;surfaceType='tabletop';surfaceY=.04;
    const ceramic=mat(0xc58d70,.3),lip=mat(0xe2bda0,.28),inside=mat(0x805d4b,.82);
    const vase=new T.Mesh(new T.LatheGeometry([new T.Vector2(.12,0),new T.Vector2(.16,.06),new T.Vector2(.23,.2),new T.Vector2(.25,.36),new T.Vector2(.19,.52),new T.Vector2(.105,.66),new T.Vector2(.11,.72)],32),ceramic);vase.position.y=.08;group.add(vase);
    cyl(0,.805,0,.115,.115,.025,lip,32);
    for(let rib=0;rib<12;rib++){const a=rib*Math.PI*2/12,curve=new T.CatmullRomCurve3([new T.Vector3(Math.cos(a)*.16,.19,Math.sin(a)*.16),new T.Vector3(Math.cos(a)*.23,.39,Math.sin(a)*.23),new T.Vector3(Math.cos(a)*.15,.61,Math.sin(a)*.15)]);group.add(new T.Mesh(new T.TubeGeometry(curve,12,.006,5,false),lip))}
    for(let i=0;i<5;i++){const a=i*1.25,curve=new T.CatmullRomCurve3([new T.Vector3(0,.76,0),new T.Vector3(Math.cos(a)*.12,.95,Math.sin(a)*.12),new T.Vector3(Math.cos(a)*.22,1.12+(i%2)*.08,Math.sin(a)*.22)]);group.add(new T.Mesh(new T.TubeGeometry(curve,14,.012,6,false),m.leaf));for(let n=0;n<3;n++){const p=curve.getPoint(.45+n*.15);const leaf=sphere(p.x,p.y,p.z,.09,.025,.035,n%2?m.leaf:m.leaf2);leaf.rotation.y=a}}
   }else if(modelName==='挂钟'){
    width=.58;depth=.16;height=.68;wallAxis='x';wallSide='back';anchor=[0,2.0];
    const clockBody=cyl(0,0,.02,.29,.29,.07,m.wood,40);clockBody.rotation.x=Math.PI/2;const clockFace=cyl(0,0,.07,.245,.245,.018,m.cream,40);clockFace.rotation.x=Math.PI/2;
    cyl(0,0,.09,.012,.012,.02,m.gold,16);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;const dot=sphere(Math.sin(a)*.19,Math.cos(a)*.19,.105,.012,.012,.012,m.dark)}
    const hand=box(.04,.055,.11,.012,.13,.008,m.dark);hand.rotation.z=-.35;
   }else if(modelName==='窗帘'){
    width=2.7;depth=.3;height=2.6;wallAxis='x';wallSide='back';anchor=[0,2.8];
    const cloth=mat(0xc9b9a5,.98),shade=mat(0xb5a18b,.98),rodMat=mat(0x92734f,.52,.62);
    const rod=cyl(0,1.22,0,.035,.035,2.82,rodMat,16);rod.rotation.z=Math.PI/2;
    for(const x of [-1.2,1.2]){
     box(x,1.18,0,.08,2.35,.16,m.wood);
     sphere(x,2.36,0,.075,.075,.075,m.gold);
    }
    for(let i=0;i<18;i++){
     const x=-1.25+i*.147,depthWave=Math.sin(i*.72);
     const fold=box(x,1.12,.015+depthWave*.018,.14,2.2,.075,i%3===0?shade:cloth);
     fold.rotation.z=Math.sin(i*.6)*.018;
     cyl(x,2.28,.02,.027,.027,.045,m.gold,8);
    }
    // Both panels gather toward the sides with visible tiebacks and hanging folds.
    for(const side of [-1,1]){
     const gather=side*1.02;
     const tie=box(gather,1.02,.105,.38,.075,.08,m.gold);tie.rotation.z=side*.08;
     for(let k=0;k<3;k++){
      const x=gather+side*(k*.055);
      const drape=box(x,.82,.055,.11,.72,.07,k%2?cloth:shade);
      drape.rotation.z=side*(.06+k*.025);
     }
     const tassel=new T.Mesh(new T.ConeGeometry(.045,.16,10),m.gold);
     tassel.position.set(gather, .91,.15);group.add(tassel);
    }
    box(0,2.34,-.015,2.5,.035,.045,m.wood);
   }else if(modelName==='办公椅'){
    width=.78;depth=.82;height=1.28;
    const frame=mat(0x454b50,.46,.72),mesh=mat(0x30383d,.96),fabric=mat(0x252b30,.98),trim=mat(0x68747a,.5,.5);
    // Five-spoke aluminium base, central gas lift and individual caster housings.
    cyl(0,.38,0,.055,.055,.48,frame,20);cyl(0,.16,0,.105,.105,.09,frame,20);
    for(let i=0;i<5;i++){
     const a=i*Math.PI*2/5,x=Math.cos(a),z=Math.sin(a);
     const spoke=box(x*.23,.12,z*.23,.52,.045,.065,frame);spoke.rotation.y=-a;
     const fork=box(x*.46,.105,z*.46,.07,.09,.075,frame);
     const wheel=cyl(x*.49,.075,z*.49,.052,.052,.12,mesh,14);wheel.rotation.x=Math.PI/2;
    }
    // Separate seat pan, rounded cushion and adjustable arm supports.
    box(0,.57,.025,.68,.14,.66,frame);
    const cushion=new T.Mesh(new T.CapsuleGeometry(.29,.09,5,12),fabric);cushion.rotation.x=Math.PI/2;cushion.position.set(0,.67,.035);cushion.scale.set(1,.9,1);group.add(cushion);
    box(0,.75,-.245,.12,.12,.12,frame);
    for(const x of [-.37,.37]){
     box(x,.79,-.015,.065,.38,.065,frame);
     box(x,.98,.02,.1,.07,.34,mesh);
     box(x,.82,.025,.13,.045,.34,trim);
    }
    // Open mesh back with a visible perimeter frame, lumbar arc and headrest.
    for(const x of [-.29,.29]){const rail=box(x,1.04,-.28,.045,.62,.055,frame);rail.rotation.x=-.08}
    box(0,1.32,-.28,.58,.045,.055,frame);box(0,.76,-.25,.58,.045,.055,frame);
    for(let row=0;row<9;row++)for(let col=0;col<13;col++){
     const x=-.25+col*.041,y=.81+row*.058;
     if((row+col)%2===0)box(x,y,-.252,.012,.012,.012,mesh);
    }
    const lumbar=new T.CatmullRomCurve3([new T.Vector3(-.24,.91,-.29),new T.Vector3(-.12,.86,-.31),new T.Vector3(0,.85,-.32),new T.Vector3(.12,.86,-.31),new T.Vector3(.24,.91,-.29)]);
    group.add(new T.Mesh(new T.TubeGeometry(lumbar,20,.025,8,false),trim));
    box(0,1.43,-.27,.34,.16,.1,fabric);box(0,1.43,-.32,.3,.11,.035,mesh);
   }else if(modelName==='坐垫'){
    action=()=>openFurnitureActions('cushion',id);
    width=.82;depth=.82;height=.2;surfaceType='floor';
    const textile=mat(0xb9a1a0,.98),shadow=mat(0x97847f,.98),piping=mat(0xeee1cf,.92);
    applyPainterMap(textile,fabricMap,.03);applyPainterMap(shadow,fabricMap,.025);
    // Soft, overfilled cushion with rounded loft, double piping and four corner gathers.
    const base=sphere(0,.105,0,.405,.105,.405,shadow,28);base.scale.y=.72;
    const crown=sphere(0,.17,0,.39,.115,.39,textile,32);crown.scale.y=.82;
    const seam=new T.CatmullRomCurve3([
     new T.Vector3(-.31,.19,-.29),new T.Vector3(-.37,.21,0),new T.Vector3(-.29,.19,.31),
     new T.Vector3(0,.2,.37),new T.Vector3(.31,.19,.29),new T.Vector3(.37,.21,0),
     new T.Vector3(.29,.19,-.31),new T.Vector3(0,.2,-.37),new T.Vector3(-.31,.19,-.29)
    ]);
    group.add(new T.Mesh(new T.TubeGeometry(seam,64,.009,7,false),piping));
    for(const x of [-.28,.28])for(const z of [-.28,.28]){
     const gather=sphere(x,.16,z,.065,.045,.065,shadow,14);gather.rotation.y=Math.atan2(z,x);
     sphere(x*.82,.235,z*.82,.018,.012,.018,piping,10);
    }
    sphere(0,.265,0,.022,.012,.022,piping,10);
   }else if(modelName==='伞架'){
    width=.62;depth=.62;height=1.12;
    const vessel=mat(0x555b60,.38,.42),rim=mat(0x9a805f,.48,.58);
    cyl(0,.09,0,.29,.31,.17,vessel,28);
    cyl(0,.17,0,.3,.3,.045,rim,28);
    const body=cyl(0,.56,0,.22,.25,.72,vessel,28);
    cyl(0,.94,0,.25,.25,.075,rim,28);
    // Three umbrellas are visible above the stand, with differentiated canopy colours and curved handles.
    for(let i=0;i<3;i++){
     const a=i*Math.PI*2/3,x=Math.cos(a)*.11,z=Math.sin(a)*.11;
     const shaft=cyl(x,.95,z,.018,.018,.88,i===1?m.gold:m.wood,10);
     const canopy=new T.Mesh(new T.ConeGeometry(.18,.2,18,1,true),i===0?m.fabric:i===1?m.clay:m.leaf);
     canopy.position.set(x,.99,z);canopy.rotation.x=Math.PI;group.add(canopy);
     const tip=sphere(x,1.09,z,.035,.035,.035,m.gold);
     const handleCurve=new T.CatmullRomCurve3([
      new T.Vector3(x,.5,z),new T.Vector3(x,.38,z),new T.Vector3(x+.055,.34,z),new T.Vector3(x+.09,.4,z)
     ]);
     group.add(new T.Mesh(new T.TubeGeometry(handleCurve,12,.018,8,false),m.wood));
    }
   }else if(modelName==='展示柜'){
    width=1.55;depth=.62;height=2.05;surfaceType='table';surfaceY=2.08;
    const wood=mat(0x76543d,.62),glass=mat(0xc9dadd,.12,.12);glass.transparent=true;glass.opacity=.2;
    box(0,1.02,0,1.5,2.0,.56,wood);
    for(const y of [.12,.65,1.2,1.75,2.0])box(0,y,0,1.42,.055,.52,m.oak);
    for(const x of [-.72,.72])box(x,1.02,0,.08,2.0,.58,wood);
    // Framed glazed doors with a central meeting stile and discreet pulls.
    for(const x of [-.35,.35]){
     box(x,1.08,.29,.66,1.7,.018,glass);
     for(const dx of [-.32,.32])box(x+dx,1.08,.315,.025,1.76,.045,wood);
     for(const y of [.2,1.96])box(x,y,.315,.66,.025,.045,wood);
     cyl(x+(x<0?.25:-.25),1.05,.35,.018,.018,.045,m.gold,10);
    }
    box(0,1.08,.32,.035,1.72,.045,m.gold);
    for(let i=0;i<8;i++){
     const x=-.54+(i%4)*.36,y=.35+Math.floor(i/4)*.55;
     const ornament=sphere(x,y,.02,.09,.11,.07,i%2?m.clay:m.cream);
    }
   }else if(modelName==='躺椅'){
    width=1.05;depth=1.9;height=.95;action=()=>openFurnitureActions('sofa',id);
    const frame=mat(0x76543a,.62),canvas=mat(0xc5b49d,.94);
    for(const x of [-.43,.43]){
     const rail=box(x,.32,0,.065,.55,1.7,frame);
     const frontLeg=box(x,.16,.72,.07,.32,.07,frame);
     const rearLeg=box(x,.16,-.72,.07,.32,.07,frame);
     for(const z of [-.64,-.3,.08,.46])box(x,.56,z,.07,.055,.055,m.oak);
    }
    const seat=box(0,.58,.22,.82,.1,1.16,canvas);
    const back=box(0,.82,-.55,.82,.1,.72,canvas);back.rotation.x=-.42;
    const head=sphere(0,.91,-.72,.34,.11,.18,m.cream);head.rotation.x=-.4;
    for(const x of [-.28,.28]){
     const seam=box(x,.64,.22,.012,.012,1.06,m.oak);
     const backSeam=box(x,.87,-.55,.012,.012,.66,m.oak);backSeam.rotation.x=-.42;
    }
    for(const x of [-.48,.48]){
     const arm=box(x,.7,-.03,.075,.08,.58,frame);
     const support=box(x,.63,-.28,.06,.3,.06,frame);
    }
   }else if(modelName==='海报'){
    action=()=>openFurnitureActions('wallArt',id);
    width=1.02;depth=.14;height=1.32;wallAxis='x';wallSide='back';anchor=[0,2.05];
    const frame=mat(0x6c4c35,.62),matte=mat(0xe9dfcf,.92),ink=mat(0x354b50,.9),clay=mat(0xb96f55,.9),gold=mat(0xc59b59,.42,.38);
    box(0,0,0,1.02,1.32,.085,frame);
    box(0,0,.048,.94,1.24,.025,gold);
    box(0,0,.066,.88,1.18,.018,matte);
    box(0,0,.078,.78,1.08,.012,mat(0xd5d8cf,.95));
    // Layered mid-century landscape artwork with overlapping cut-paper hills and a sun disc.
    const sky=new T.Mesh(new T.PlaneGeometry(.74,.52),mat(0xb9c9c4,.98));sky.position.set(0,.23,.09);group.add(sky);
    const sunDisk=new T.Mesh(new T.CircleGeometry(.145,40),gold);sunDisk.position.set(.19,.39,.101);group.add(sunDisk);
    const hill1=new T.Shape();hill1.moveTo(-.37,-.02);hill1.quadraticCurveTo(-.18,.32,.02,.08);hill1.quadraticCurveTo(.22,-.05,.37,.16);hill1.lineTo(.37,-.27);hill1.lineTo(-.37,-.27);hill1.closePath();
    const hill2=new T.Shape();hill2.moveTo(-.37,-.16);hill2.quadraticCurveTo(-.12,.06,.08,-.13);hill2.quadraticCurveTo(.23,-.25,.37,-.07);hill2.lineTo(.37,-.27);hill2.lineTo(-.37,-.27);hill2.closePath();
    const h1=new T.Mesh(new T.ShapeGeometry(hill1),clay);h1.position.set(0,.13,.108);group.add(h1);
    const h2=new T.Mesh(new T.ShapeGeometry(hill2),ink);h2.position.set(0,.13,.112);group.add(h2);
    for(let i=0;i<5;i++){const line=box(-.2+i*.1,-.43,.105,.055,.012,.01,i%2?gold:ink)}
    for(const x of [-.405,.405])for(const y of [-.56,.56])cyl(x,y,.075,.018,.018,.018,gold,10);
    box(0,.63,.075,.72,.018,.012,frame);
   }else if(modelName==='门'){
    width=1.24;depth=.2;height=2.42;wallAxis='x';wallSide='back';anchor=[0,2.55];group.userData.isDoor=true;
    const isGlass=variant==='白橡木玻璃门',isCream=variant==='奶油法式双线门',isRattan=variant==='藤编门',isSliding=variant==='深色格栅推拉门',isArch=variant==='复古拱顶门';
    const timber=mat(isCream?0xe4d5bd:isGlass?0xb28d60:isRattan?0x9a7047:isSliding?0x554a42:isArch?0x876047:0x76513a,.72);
    const panel=mat(isCream?0xf0e6d7:isRattan?0xc49a68:isSliding?0x75675b:isArch?0xb28a63:0xa9845e,.82);
    const shadow=mat(0x4b3426,.86),glass=mat(0x9db9b7,.28,.12),brass=mat(0xc5a15d,.42,.45);
    // All door variants share the same 1.24 m casing and ground-level origin.
    // This is also the exact model used by the initial apartment doors.
    box(-.62,1.2,0,.12,2.4,.2,timber);box(.62,1.2,0,.12,2.4,.2,timber);box(0,2.38,0,1.36,.14,.2,timber);
    box(0,1.2,.035,1.08,2.22,.075,shadow);
    box(0,1.2,.08,1.02,2.16,.055,panel);
    if(isGlass){
     box(0,1.58,.12,.76,1.08,.04,glass);box(0,2.16,.145,.84,.07,.055,timber);box(0,1.0,.145,.84,.07,.055,timber);
     for(const x of [-.39,0,.39])box(x,1.57,.16,.025,1.12,.035,timber);
    }else if(isRattan){
     box(0,1.2,.12,.82,1.58,.045,shadow);
     for(let y=.48;y<=1.92;y+=.11)for(let x=-.36;x<=.36;x+=.11){const slat=box(x,y,.15,.025,.025,.025,brass);slat.rotation.z=.58}
     for(let y=.48;y<=1.92;y+=.11)for(let x=-.36;x<=.36;x+=.11){const slat=box(x,y,.155,.025,.025,.025,timber);slat.rotation.z=-.58}
    }else if(isSliding){
     box(-.24,1.2,.14,.48,2.0,.04,timber);box(.24,1.2,.17,.48,2.0,.04,panel);
     for(let x=-.4;x<=.4;x+=.13)box(x,1.2,.205,.035,1.92,.025,shadow);
     box(0,2.27,.12,1.12,.08,.07,brass);
    }else{
     for(const y of [.53,1.18,1.86]){
      const ph=y===1.18?.42:.5,ww=isCream?.84:.78;
      box(0,y,.115,ww,ph,.045,isCream?brass:timber);
      box(0,y,.143,ww-.08,ph-.08,.018,panel);
      if(isCream)box(0,y,.158,ww-.17,ph-.17,.012,panel);
     }
     if(isArch){
      const arch=new T.Mesh(new T.TorusGeometry(.43,.045,8,28,Math.PI),timber);arch.position.set(0,2.13,.16);arch.rotation.z=Math.PI;group.add(arch);
     }
    }
    // Consistent brass lever, lock escutcheon and destination plaque.
    cyl(.39,1.18,.16,.065,.065,.025,brass,18);box(.47,1.18,.19,.19,.035,.035,brass);cyl(.39,.94,.16,.035,.035,.025,m.metal,14);
    const labelCanvas=document.createElement('canvas');labelCanvas.width=640;labelCanvas.height=192;
    const labelTexture=new T.CanvasTexture(labelCanvas);labelTexture.encoding=T.sRGBEncoding;
    const labelMesh=new T.Mesh(new T.PlaneGeometry(.96,.29),new T.MeshBasicMaterial({map:labelTexture,transparent:true,side:T.DoubleSide,depthWrite:false}));
    labelMesh.position.set(0,2.32,.215);group.add(labelMesh);
    group.userData.doorDestinationCanvas=labelCanvas;group.userData.doorDestinationTexture=labelTexture;group.userData.doorDestinationLabel=labelMesh;
    group.userData.doorVariant=variant||'标准胡桃木';
   }else if(modelName==='懒人沙发'){
    width=1.5;depth=1.25;height=.85;action=()=>openFurnitureActions('sofa',id);
    const fabric=mat(0xb7a18d,.98),welt=mat(0x8d7866,.9);
    const bean=(x,y,z,sx,sy,sz,rot=0)=>{
     const o=new T.Mesh(new T.SphereGeometry(1,32,22),fabric);
     o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.z=rot;group.add(o);o.castShadow=true;return o;
    };
    bean(0,.36,.02,.68,.34,.58,-.04);
    bean(0,.61,-.2,.58,.43,.38,-.22);
    bean(-.38,.49,.13,.28,.29,.42,-.2);bean(.38,.49,.13,.28,.29,.42,.2);
    bean(0,.24,.28,.46,.16,.34,0);
    // A visible perimeter welt and gathered fabric folds distinguish the soft sack form.
    const seamCurve=new T.CatmullRomCurve3([
     new T.Vector3(-.48,.38,.45),new T.Vector3(-.25,.28,.55),
     new T.Vector3(0,.26,.58),new T.Vector3(.25,.28,.55),new T.Vector3(.48,.38,.45)
    ]);
    group.add(new T.Mesh(new T.TubeGeometry(seamCurve,28,.012,8,false),welt));
    for(const x of [-.24,0,.24]){
     const fold=box(x,.18,.43,.018,.012,.2,welt);fold.rotation.z=x*.25;
    }
   }else if(modelName==='鞋柜'){
    width=1.25;depth=.58;height=1.05;surfaceType='table';surfaceY=1.08;
    const carcass=mat(0xb18a61,.72),front=mat(0xe4d8c7,.78),shadow=mat(0x594536,.86);
    // Open-front three-tier shoe cabinet: the footwear is deliberately visible from the room.
    box(0,.52,-.015,1.2,.98,.53,carcass);
    box(0,1.02,0,1.3,.085,.62,m.oak);
    box(0,.52,-.285,1.12,.9,.035,shadow);
    for(const x of [-.59,.59])box(x,.53,.015,.075,.98,.59,front);
    for(const y of [.15,.43,.71])box(0,y,0,1.12,.045,.52,m.oak);
    for(const y of [.29,.57,.85])box(0,y,.278,1.12,.035,.045,carcass);
    const shoeUpper=[mat(0x6f5141,.88),mat(0x343a40,.84),mat(0x9a6248,.88)];
    const sole=mat(0xe6dfd1,.94),lace=mat(0xe8d9c5,.92);
    for(let row=0;row<3;row++)for(const x of [-.27,.27]){
     const baseY=.18+row*.28,upper=shoeUpper[(row+(x>0?1:0))%shoeUpper.length];
     box(x,baseY+.018,.105,.17,.035,.31,sole);
     const body=sphere(x,baseY+.09,.075,.083,.072,.145,upper);
     body.rotation.x=-.06;
     sphere(x,baseY+.09,.185,.08,.06,.085,upper);
     box(x,baseY+.12,-.025,.105,.07,.075,upper);
     box(x,baseY+.145,.045,.035,.065,.09,lace);
     for(let k=0;k<3;k++){
      const laceBar=box(x,baseY+.157,.025+k*.035,.075,.009,.012,lace);
      laceBar.rotation.y=(k-1)*.12;
     }
    }
    for(const x of [-.49,.49])for(const y of [.31,.59,.87])cyl(x,y,.315,.012,.012,.018,m.gold,8);
    for(const x of [-.49,.49])box(x,.08,-.2,.09,.16,.09,m.dark);
    // A visible pair of everyday shoes rests on the cabinet top.
    const topShoes=[mat(0x5b4638,.9),mat(0x39454a,.88)],topSoles=mat(0xe7dfd1,.96),topLaces=mat(0xe9dfcb,.9);
    for(let i=0;i<2;i++){
     const x=i===0?-.265:.265,upper=topShoes[i],z=.025;
     const soleTop=box(x,1.09,z,.19,.035,.34,topSoles);
     const shoeBody=sphere(x,1.145,z-.005,.09,.065,.145,upper);
     shoeBody.rotation.x=-.08;
     const toe=sphere(x,1.137,z+.105,.088,.052,.105,upper);
     toe.rotation.x=-.08;
     box(x,1.153,z-.12,.105,.075,.09,upper);
     box(x,1.19,z-.005,.035,.075,.12,topLaces);
     for(let lace=0;lace<3;lace++){
      const tie=box(x,1.205,z-.045+lace*.038,.066,.008,.012,topLaces);
      tie.rotation.y=(i===0?-.12:.12);
     }
     const heel=box(x,1.13,z-.145,.12,.055,.055,upper);
    }
   }else if(modelName==='沙发床'){
    width=2.15;depth=1.5;height=.92;action=()=>openFurnitureActions('sofa',id);
    const frame=mat(0x76543a,.64),upholstery=mat(0xc9b9a5,.96),piping=mat(0x9f8972,.9);
    // Low convertible frame, pull-out platform and two independently upholstered panels.
    box(0,.25,0,2.08,.18,1.42,frame);
    box(0,.36,.34,2.0,.16,.72,upholstery);
    box(0,.29,.78,1.92,.12,.48,m.oak);
    box(0,.48,-.47,2.02,.72,.18,frame);
    box(0,.53,-.36,1.88,.58,.12,upholstery);
    for(const x of [-.93,.93]){
     box(x,.55,0,.16,.48,1.18,frame);
     box(x,.65,.04,.17,.22,.96,upholstery);
    }
    for(const x of [-.62,0,.62]){
     const seat=sphere(x,.49,.36,.31,.12,.33,upholstery);
     const seam=new T.Mesh(new T.TorusGeometry(.25,.008,6,24),piping);
     seam.position.set(x,.51,.36);seam.rotation.x=Math.PI/2;group.add(seam);
    }
    // Pull-out front rail and small caster feet.
    box(0,.22,.82,1.88,.09,.055,frame);
    for(const x of [-.86,.86])for(const z of [-.55,.65]){
     const foot=new T.Mesh(new T.CylinderGeometry(.035,.045,.16,12),m.dark);foot.position.set(x,.1,z);group.add(foot);
    }
   }else if(modelName==='榻榻米'){
    width=2.55;depth=2.15;height=.38;
    const base=mat(0x8e6848,.76),matting=mat(0xb9ad91,.98),edge=mat(0x58735c,.9);
    box(0,.16,0,2.55,.3,2.15,base);
    box(0,.33,0,2.48,.08,2.08,matting);
    // Four individual woven tatami panels with dark fabric binding.
    for(const x of [-.62,.62]){
     for(const z of [-.51,.51]){
      box(x,.39,z,1.18,.055,.98,matting);
      for(const side of [-1,1]){
       box(x+side*.575,.42,z,.025,.025,.94,edge);
       box(x,.42,z+side*.47,1.12,.025,.025,edge);
      }
      for(let line=-.48;line<=.481;line+=.09)box(x+line,.422,z,.008,.008,.88,mat(0xcfc4ac,.98));
     }
    }
    // Low raised perimeter and folded sleeping cushions.
    for(const x of [-1.22,1.22])box(x,.27,0,.06,.2,2.0,base);
    for(const z of [-1.02,1.02])box(0,.27,z,2.42,.2,.06,base);
    for(const x of [-.72,.72]){
     const pillow=sphere(x,.52,-.62,.34,.13,.24,m.cream);pillow.rotation.x=-.16;
    }
   }else if(modelName==='哑铃架'){
    action=()=>openFurnitureActions('dumbbellRack',id);
    width=1.35;depth=.68;height=1.02;
    const frame=mat(0x343b40,.42,.72),chrome=mat(0xaeb8bb,.28,.78),rubber=mat(0x252a2d,.92);
    // Two-tier steel rack with end uprights, stabilising feet and loaded dumbbells.
    for(const x of [-.59,.59]){
     box(x,.48,0,.065,.9,.58,frame);
     box(x,.91,0,.12,.08,.64,chrome);
     box(x,.08,0,.16,.12,.68,frame);
     for(const y of [.35,.72]){
      box(0,y,0,1.18,.065,.5,frame);
      box(0,y+.06,.22,1.18,.045,.045,chrome);
      for(const dx of [-.47,-.16,.16,.47]){
       const weight=cyl(dx,y+.15,0,.105,.105,.16,rubber,18);
       cyl(dx,y+.15,.095,.11,.11,.025,chrome,18);
       cyl(dx,y+.15,-.095,.11,.11,.025,chrome,18);
       cyl(dx,y+.15,0,.025,.025,.18,chrome,10);
      }
     }
    }
    for(let i=0;i<3;i++){const plate=cyl(-.55+i*.09,.1,-.34,.09,.09,.035,rubber,18);plate.rotation.x=Math.PI/2}
   }else if(modelName==='窗'){
    action=()=>openFurnitureActions('window',id);
    width=2.2;depth=.2;height=1.95;wallAxis='x';wallSide='back';anchor=[0,2.65];
    // Reuse the exact built-in room-window assembly: outdoor canvas, timed
    // sunlight, hinged open casements, curtain fabric, rings and brass rod.
    addWindowSun(parent,group,2.65);
    addWindowView(group,2.6,2.1,1.85);
    addOpenCasementWindow(group,m.oak);
    addWindowDressing(group,2.1,1.85,0xc7b7a4,2.6);
   }else if(modelName==='上床下桌'){
    width=3.0;depth=2.0;height=2.75;action=()=>openFurnitureActions('bed',id);for(const x of [-1.35,1.35]){box(x,1.35,0,.12,2.65,.12,m.wood);box(x,2.63,0,.18,.12,1.9,m.oak)}box(0,2.18,-.72,2.7,.16,.78,m.wood);box(0,2.3,-.72,2.65,.22,.72,m.fabric);box(0,2.55,-1.58,2.7,.5,.12,m.cream);for(const x of [-1.25,1.25])box(x,.82,.35,.1,1.6,.1,m.wood);box(0,.92,0,2.55,.12,.82,m.oak);box(0,.99,0,2.5,.04,.78,m.cream);for(const x of [-1.1,1.1])box(x,.45,0,.08,.88,.72,m.wood);for(let i=0;i<6;i++)box(-.22+i*.09,.18,.18,.045,.012,.3,m.gold);for(let i=0;i<5;i++){const step=box(-1.5,.22+i*.36,.65-i*.28,.38,.06,.24,m.oak);step.rotation.z=.0}
   }else if(modelName==='钢琴'){
    action=()=>openFurnitureActions('piano',id);
    width=1.68;depth=1.02;height=1.5;
    const caseMat=mat(0x202326,.22,.5),wood=mat(0x68452f,.48),ivory=mat(0xf4eddd,.32),ebony=mat(0x151719,.2,.12);
    const brass=mat(0xb59a67,.34,.62),felt=mat(0x596c5c,.94),paper=mat(0xf1ead8,.94);
    // Upright piano: continuous cabinet, raised crown, inset front panel and a proper keyboard.
    box(0,.69,0,1.56,1.2,.78,caseMat);
    box(0,1.315,-.015,1.64,.13,.84,wood);
    box(0,1.385,-.015,1.57,.035,.79,caseMat);
    box(0,.91,.397,1.38,.48,.035,wood);
    box(0,.91,.418,1.28,.39,.012,caseMat);
    box(0,.91,.428,.34,.13,.012,wood);
    const crest=sphere(0,.91,.448,.055,.055,.012,brass);
    for(const x of [-.73,.73]){
     box(x,.72,.405,.105,1.16,.105,wood);
     box(x,.72,.462,.035,1.02,.012,brass);
     box(x,.12,-.22,.105,.22,.12,caseMat);
    }
    // Keyboard bed and 52 white keys; black-key placement follows the 2+3 octave pattern.
    box(0,.515,.43,1.46,.16,.16,wood);
    box(0,.575,.505,1.42,.045,.1,ebony);
    for(let i=0;i<52;i++){
     const x=-.665+i*.026;
     box(x,.605,.55,.024,.105,.36,ivory);
     if(i%7!==2&&i%7!==6){
      box(x+.013,.667,.405,.014,.075,.19,ebony);
     }
    }
    box(0,.79,.39,1.39,.045,.12,wood);
    box(0,.81,.455,1.34,.018,.018,brass);
    // Music rest with two angled pages, staff lines and small note marks.
    const rest=box(0,1.115,-.285,1.02,.035,.12,wood);rest.rotation.x=-.16;
    const pageLeft=box(-.235,1.16,-.345,.43,.34,.018,paper);pageLeft.rotation.x=-.16;
    const pageRight=box(.235,1.16,-.345,.43,.34,.018,paper);pageRight.rotation.x=-.16;
    for(const side of [-1,1]){
     for(let line=0;line<5;line++){
      const staff=box(side*.235,1.065+line*.035,-.332,.34,.004,.003,felt);staff.rotation.x=-.16;
     }
     for(let note=0;note<4;note++){
      const mark=sphere(side*.235-.105+note*.07,1.105+(note%2)*.055,-.326,.012,.009,.004,ebony);
     }
    }
    for(const x of [-.47,.47]){
     cyl(x,1.34,-.03,.018,.018,.035,brass,12);
     box(x,1.03,-.24,.035,.12,.06,caseMat);
    }
    // Three brass pedals on a shaped lyre and a recessed lower kick panel.
    box(0,.19,.32,.66,.34,.09,caseMat);
    for(const x of [-.24,0,.24]){
     const pedalStem=box(x,.105,.42,.035,.16,.035,brass);
     const pedal=box(x,.035,.48,.105,.025,.13,brass);pedal.rotation.x=-.18;
    }
    box(0,.27,.425,.38,.035,.045,wood);
   }else if(modelName==='洗衣机'){
    action=()=>openFurnitureActions('washingMachine',id);
    width=.92;depth=.86;height=1.28;
    const enamel=mat(0xe8e5df,.34,.18),steel=mat(0xaeb7b9,.28,.58),dark=mat(0x34434a,.18,.24),rubber=mat(0x252a2d,.88);
    box(0,.63,0,.88,1.22,.82,enamel);
    box(0,1.17,.42,.8,.18,.025,steel);
    box(0,1.18,.44,.58,.12,.012,dark);
    for(let i=0;i<3;i++){cyl(-.25+i*.25,1.18,.46,.035,.035,.025,m.metal,12);sphere(-.25+i*.25,1.18,.48,.012,.012,.012,m.gold)}
    // Deep porthole with rubber gasket, glass drum and concentric inner rings.
    const gasket=new T.Mesh(new T.TorusGeometry(.29,.055,14,40),rubber);gasket.position.set(0,.58,.43);group.add(gasket);
    const rim=new T.Mesh(new T.TorusGeometry(.255,.025,12,40),steel);rim.position.set(0,.58,.46);group.add(rim);
    const glass=new T.Mesh(new T.CircleGeometry(.225,40),dark);glass.position.set(0,.58,.445);group.add(glass);
    const drum=new T.Mesh(new T.TorusGeometry(.16,.012,8,32),steel);drum.position.set(0,.58,.46);group.add(drum);
    sphere(0,.58,.465,.11,.11,.012,mat(0x718c94,.22,.12));
    box(-.22,.98,.445,.22,.035,.018,m.cream);
    box(.25,.98,.445,.22,.035,.018,m.cream);
    for(const x of [-.34,.34])box(x,.06,.28,.1,.12,.12,rubber);
    box(0,.06,-.3,.72,.12,.12,rubber);
   }else if(modelName==='洗手台'){
    action=()=>openFurnitureActions('sink',id);width=1.28;depth=.82;height=1.72;
    const porcelain=mat(0xe8e5dc,.22),cabinet=mat(0x9b8064,.82),brass=mat(0xb18b58,.34,.58),mirror=mat(0xa9bdc0,.16,.42);
    box(0,.42,0,1.22,.82,.76,cabinet);box(0,.86,0,1.32,.12,.84,m.cream);box(0,.96,.02,1.12,.1,.66,porcelain);box(0,1.015,.04,.78,.035,.43,m.cream);
    const bowl=new T.Mesh(new T.TorusGeometry(.29,.045,10,32),porcelain);bowl.rotation.x=Math.PI/2;bowl.position.set(0,1.04,.04);group.add(bowl);
    const faucet=new T.CatmullRomCurve3([new T.Vector3(0,1.02,-.25),new T.Vector3(0,1.28,-.25),new T.Vector3(0,1.4,-.08),new T.Vector3(0,1.4,.05)]);group.add(new T.Mesh(new T.TubeGeometry(faucet,20,.024,8,false),brass));
    for(const x of [-.42,.42])cyl(x,1.04,-.22,.035,.035,.055,brass,12);
    box(0,1.58,-.37,1.12,.58,.045,m.wood);box(0,1.58,-.34,1.02,.48,.018,mirror);
    for(const x of [-.55,.55])box(x,.42,.39,.045,.7,.045,m.oak);
   }else if(modelName==='马桶'){
    width=.78;depth=1.12;height=.82;const ceramic=mat(0xe9e6de,.24),shadow=mat(0xb8b9b2,.55),seat=mat(0x59636a,.32);
    box(0,.55,-.34,.68,.72,.42,ceramic);box(0,.83,-.34,.72,.12,.46,m.cream);
    const pedestal=new T.Mesh(new T.CylinderGeometry(.27,.31,.43,28),ceramic);pedestal.position.set(0,.25,.13);group.add(pedestal);
    const bowl=new T.Mesh(new T.SphereGeometry(1,28,18),ceramic);bowl.scale.set(.38,.19,.48);bowl.position.set(0,.43,.2);group.add(bowl);
    const opening=new T.Mesh(new T.TorusGeometry(.245,.035,10,32),seat);opening.rotation.x=Math.PI/2;opening.position.set(0,.57,.2);group.add(opening);
    const inner=new T.Mesh(new T.CircleGeometry(.21,32),shadow);inner.rotation.x=-Math.PI/2;inner.position.set(0,.555,.2);group.add(inner);
    box(0,.93,-.35,.42,.035,.025,m.metal);box(.25,.97,-.34,.08,.06,.045,m.gold);
   }else if(modelName==='淋浴间'){
    action=()=>openFurnitureActions('sink',id);width=1.48;depth=1.42;height=2.32;
    const glass=mat(0xc8d9d8,.12,.08);glass.transparent=true;glass.opacity=.25;glass.depthWrite=false;const frame=mat(0x9b8064,.38,.52),stone=mat(0xc9c8c0,.42);
    box(0,.12,0,1.42,.18,1.36,stone);box(0,.22,0,1.26,.045,1.2,m.cream);
    for(const x of [-.68,.68])box(x,1.15,-.55,.045,2.1,.045,frame);
    for(const z of [-.55,.62])box(.68,1.15,z,.045,2.1,.045,frame);
    box(.68,1.15,.035,.025,2.0,1.12,glass);box(0,1.15,-.55,1.35,2.0,.025,glass);
    const pipe=new T.CatmullRomCurve3([new T.Vector3(-.5,2.05,-.45),new T.Vector3(-.5,2.18,-.45),new T.Vector3(-.5,2.2,-.22)]);group.add(new T.Mesh(new T.TubeGeometry(pipe,12,.025,8,false),m.metal));
    const head=new T.Mesh(new T.CylinderGeometry(.16,.2,.055,24),m.metal);head.rotation.x=Math.PI/2;head.position.set(-.5,2.17,-.18);group.add(head);
    cyl(-.48,1.08,-.42,.055,.055,.09,m.gold,12);box(-.48,1.2,-.42,.24,.035,.035,m.metal);
   }else if(modelName==='浴缸'){
    action=()=>openFurnitureActions('sink',id);width=2.25;depth=1.12;height=.72;const enamel=mat(0xe8e4dc,.26),outer=mat(0xd2c7b7,.72),metal=mat(0xaeb5b4,.28,.58);
    box(0,.34,0,2.16,.56,1.02,outer);box(0,.57,0,2.22,.16,1.1,enamel);box(0,.62,0,1.82,.035,.74,mat(0xb9c7c5,.3));
    for(const x of [-.9,.9])for(const z of [-.39,.39])sphere(x,.38,z,.12,.2,.12,enamel);
    cyl(.82,.78,-.37,.035,.035,.16,metal,12);cyl(.82,.87,-.37,.055,.055,.045,m.gold,12);
   }else if(modelName==='酒柜'){
    width=1.25;depth=.58;height=1.72;surfaceType='table';surfaceY=1.75;
    const wood=mat(0x503626,.62),back=mat(0x34251e,.82),glass=mat(0xc9dadd,.14,.12);glass.transparent=true;glass.opacity=.2;
    box(0,.84,0,1.2,1.62,.54,wood);box(0,1.68,0,1.28,.08,.62,m.oak);
    box(0,.86,-.275,1.08,1.42,.025,back);
    // Individual bottle cubbies below and stemware rail above.
    for(const y of [.28,.72,1.16]){
     box(0,y,.02,1.1,.045,.5,m.oak);
     for(const x of [-.4,-.13,.13,.4])box(x,y+.1,.04,.018,.18,.44,wood);
    }
    for(let i=0;i<5;i++){
     const x=-.42+i*.21;
     cyl(x,.48,.02,.052,.052,.25,i%2?m.clay:m.gold,14);
     cyl(x,.64,.02,.03,.03,.1,m.dark,12);
     cyl(x,.78,.02,.016,.016,.18,m.gold,10);
    }
    for(const x of [-.52,.52])box(x,.9,.285,.025,1.42,.025,wood);
    box(0,1.62,.285,1.08,.035,.035,wood);
    for(let i=0;i<4;i++){
     const x=-.36+i*.24;
     const stem=cyl(x,1.36,.12,.012,.012,.18,glass,10);
     const bowl=sphere(x,1.47,.12,.055,.075,.055,glass);
    }
    // Three individually modeled bottles stand on the cabinet crown, not inside the cubbies.
    const bottleGlass=[mat(0x244b3d,.2,.16),mat(0x75402d,.2,.12),mat(0x3a5148,.18,.2)];
    const bottleFoil=[mat(0xb68b45,.32,.48),mat(0x8e3834,.3,.35),mat(0xb8a16a,.3,.42)];
    const bottleLabel=mat(0xe6d9bd,.86),bottleInk=mat(0x6b4b35,.72);
    [-.36,0,.36].forEach((x,i)=>{
     const z=.045+(i===1?-.035:0),glassMat=bottleGlass[i],foil=bottleFoil[i];
     cyl(x,1.865,z,.052,.057,.235,glassMat,18);
     sphere(x,1.982,z,.047,.055,.047,glassMat);
     cyl(x,2.055,z,.023,.023,.105,glassMat,16);
     cyl(x,2.112,z,.026,.026,.025,foil,16);
     cyl(x,2.13,z,.019,.019,.018,bottleInk,12);
     box(x,1.865,z+.057,.066,.082,.008,bottleLabel);
     box(x,1.865,z+.062,.036,.009,.004,foil);
    });
   }else if(modelName==='料理台'){
    width=1.9;depth=.92;height=1.02;surfaceType='table';surfaceY=1.05;
    const island=mat(0x9c8064,.7),stone=mat(0xe5dfd4,.34),wood=mat(0xb18a61,.7);
    // Freestanding prep island, clearly different from the wall-side cabinet run.
    box(0,.48,0,1.78,.88,.82,island);
    box(0,.96,0,1.96,.14,.96,stone);
    box(0,.89,0,1.78,.035,.82,m.cream);
    // Open front shelves with a lower plinth and side cheeks.
    box(0,.1,0,1.68,.14,.72,wood);
    for(const x of [-.82,.82])box(x,.48,0,.08,.78,.78,wood);
    box(0,.34,.36,1.55,.045,.16,wood);box(0,.68,.36,1.55,.045,.16,wood);
    for(const x of [-.48,0,.48]){
     box(x,.5,.39,.012,.24,.018,m.oak);
     const basket=new T.Mesh(new T.BoxGeometry(.38,.16,.28),mat(0xd0b18b,.9));basket.position.set(x,.43,.17);group.add(basket);
     for(let line=-.12;line<=.121;line+=.04)box(x+line,.43,.315,.012,.14,.012,m.cream);
    }
    // Chopping board, knife rail and inset prep basin.
    box(-.48,1.055,-.12,.55,.035,.38,wood);
    box(-.48,1.08,-.12,.48,.012,.32,m.oak);
    const knife=box(-.43,1.13,-.12,.025,.11,.22,m.metal);knife.rotation.z=-.18;
    box(.54,1.045,-.08,.48,.025,.34,m.metal);
    box(.54,1.06,-.08,.39,.018,.25,m.dark);
   }else if(modelName==='任务板'){
    width=1.35;depth=.16;height=1.12;wallAxis='x';wallSide='back';anchor=[0,2.1];
    const frame=mat(0x76543d,.58),cork=mat(0xb98d61,.98),paper=mat(0xf0e8d8,.92);
    box(0,0,0,1.35,1.12,.1,frame);
    box(0,0,.058,1.22,1.0,.035,cork);
    for(const x of [-.62,.62])box(x,0,.085,.035,1.04,.045,m.gold);
    for(const y of [-.51,.51])box(0,y,.085,1.28,.035,.045,m.gold);
    // Pinned notes, a small calendar and a weekly list create separate readable zones.
    box(-.31,.18,.092,.48,.53,.018,paper);
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
     box(-.48+col*.105,.32-row*.105,.105,.075,.065,.008,row===0?m.clay:m.cream);
    }
    sphere(-.31,.46,.12,.035,.035,.025,m.gold);
    box(.34,.23,.095,.42,.34,.018,m.cream);
    for(let row=0;row<3;row++)box(.34,.32-row*.1,.11,.31,.012,.008,m.oak);
    for(const x of [.2,.48])sphere(x,.39,.13,.025,.025,.02,m.clay);
    box(.28,-.26,.095,.62,.34,.018,paper);
    for(let row=0;row<3;row++){
     box(.28,-.17-row*.09,.11,.43,.012,.008,m.oak);
     box(.03,-.17-row*.09,.115,.035,.035,.012,row===1?m.leaf:m.gold);
    }
    // A narrow lower ledge holds chalk and a small pencil cup.
    box(0,-.58,.15,1.12,.075,.18,frame);
    cyl(.43,-.47,.19,.065,.065,.16,m.clay,14);
    for(let i=0;i<3;i++){const pencil=cyl(.39+i*.035,-.34,.19,.009,.009,.24,m.gold,8);pencil.rotation.z=(i-1)*.1}
   }else if(modelName==='照片墙'){
    action=()=>openFurnitureActions('wallArt',id);
    width=1.95;depth=.16;height=1.45;wallAxis='x';wallSide='back';anchor=[0,2.15];
    const frameA=mat(0x76543d,.62),frameB=mat(0xb69a72,.62),matte=mat(0xf0e8d8,.92);
    const frames=[
     [-.62,.31,.48,.58,frameA,0x8ca49b],
     [0,.12,.62,.78,frameB,0x9aabb6],
     [.65,.34,.42,.5,frameA,0xc49b79],
     [-.34,-.47,.56,.44,frameB,0x8e887b],
     [.47,-.43,.62,.48,frameA,0x82918b]
    ];
    for(let i=0;i<frames.length;i++){
     const [x,y,w,h,frame,colour]=frames[i];
     box(x,y,0,w+.09,h+.09,.075,frame);
     box(x,y,.045,w,h,.018,matte);
     box(x,y,.06,w*.84,h*.84,.012,mat(colour,.92));
     // Different artwork silhouettes: landscape, portrait, botanical and abstract blocks.
     if(i===0){
      box(x,y-.07,.072,w*.72,.012,.008,m.cream);
      for(let k=0;k<4;k++)box(x-w*.3+k*.08,y+.08,.078,.07,.11,.008,k%2?m.leaf:m.clay);
     }else if(i===1){
      const sun=sphere(x+.13,y+.13,.08,.12,.12,.018,m.gold);
      const hill=box(x,y-.13,.078,w*.72,.14,.008,m.leaf);hill.rotation.z=-.08;
     }else if(i===2){
      const vase=sphere(x,y-.04,.08,.09,.16,.018,m.clay);
      for(let k=0;k<3;k++){const stem=box(x-.1+k*.1,y+.12,.085,.012,.22,.008,m.leaf);stem.rotation.z=(k-1)*.16}
     }else{
      for(let k=0;k<4;k++){const stripe=box(x-w*.28+k*.12,y,.08,.045,h*.68,.008,k%2?m.gold:m.cream);stripe.rotation.z=(k-1.5)*.12}
     }
    }
    // Small brass hanging rail unifies the asymmetrical gallery arrangement.
    box(0,.78,.015,1.45,.025,.035,m.gold);
   }else if(modelName==='跑步机'){
    action=()=>openFurnitureActions('treadmill',id);
    width=.9;depth=1.92;height=1.48;
    const frame=mat(0x343b40,.42,.72),belt=mat(0x20272b,.94),rail=mat(0x858f92,.42,.65),rubber=mat(0x171c20,.98);
    // Deep running deck with a continuous belt, end rollers and side foot rails.
    box(0,.19,0,.84,.22,1.82,frame);
    box(0,.315,0,.68,.025,1.62,belt);
    for(const z of [-.82,.82])cyl(0,.32,z,.035,.035,.7,rail,20);
    for(const x of [-.39,.39]){
     box(x,.34,0,.09,.045,1.72,rubber);
     box(x,.2,-.78,.1,.12,.16,frame);
     box(x,.2,.78,.1,.12,.16,frame);
     const upright=box(x,.83,-.62,.055,1.05,.055,rail);upright.rotation.x=-.18;
     const grip=box(x,.99,-1.02,.11,.09,.48,rubber);grip.rotation.x=.12;
    }
    box(0,1.27,-.98,.62,.34,.15,frame);
    box(0,1.29,-.895,.49,.22,.018,m.screen);
    box(0,1.12,-.88,.5,.035,.08,m.metal);
    for(let i=0;i<5;i++)cyl(-.19+i*.095,1.12,-.865,.018,.018,.018,i===2?m.clay:m.gold,10);
    for(const x of [-.27,.27]){const safety=box(x,1.08,-.82,.045,.025,.1,m.clay);safety.rotation.z=x*.12}
    for(const x of [-.3,.3])for(const z of [-.72,.72])cyl(x,.075,z,.045,.045,.08,rubber,12);
   }else if(modelName==='游戏机'){
    action=()=>openFurnitureActions('gameConsole',id);
    width=.72;depth=.48;height=.34;surfaceType='tabletop';surfaceY=.04;
    const shell=mat(0x30363b,.38,.58),edge=mat(0x555e64,.42,.55),vent=mat(0x171d22,.9),light=mat(0x8caeaa,.3,.2);
    // Low console chassis with layered shell, front ports and top ventilation.
    box(0,.13,0,.68,.2,.42,shell);
    box(0,.235,0,.65,.035,.4,edge);
    box(0,.258,0,.55,.012,.31,shell);
    for(let i=0;i<13;i++)box(-.25+i*.042,.267,-.12,.012,.008,.12,vent);
    for(const x of [-.25,.25]){box(x,.13,.215,.1,.055,.012,vent);cyl(x,.13,.23,.018,.018,.012,light,10)}
    for(const x of [-.24,.24]){const foot=box(x,.025,-.13,.12,.05,.12,vent)}
    // Two separate controllers with grips, thumb sticks, D-pad and face buttons.
    for(const x of [-.29,.29]){
     const pad=new T.Mesh(new T.SphereGeometry(1,24,16),shell);pad.position.set(x,.105,.39);pad.scale.set(.15,.065,.105);group.add(pad);
     for(const side of [-1,1]){const grip=new T.Mesh(new T.SphereGeometry(1,18,12),shell);grip.position.set(x+side*.075,.07,.43);grip.scale.set(.055,.06,.1);group.add(grip)}
     cyl(x-.045,.17,.36,.022,.022,.018,light,12);
     cyl(x+.045,.17,.36,.022,.022,.018,m.gold,12);
     for(let k=0;k<4;k++)sphere(x+.035+(k%2)*.035,.17,.405+Math.floor(k/2)*.035,.012,.012,.012,k%2?m.clay:m.cream);
    }
   }else if(modelName==='置物架'){
    width=1.3;depth=.52;height=1.92;
    const frame=mat(0x51463d,.46,.62),shelf=mat(0xb28c62,.66),back=mat(0x75604c,.88);
    for(const x of [-.59,.59])for(const z of [-.2,.2])box(x,.96,z,.055,1.88,.055,frame);
    // Five distinct shelves with raised lips, diagonal rear bracing and varied stored objects.
    for(let level=0;level<5;level++){
     const y=.13+level*.42;
     box(0,y,0,1.22,.055,.48,shelf);
     box(0,y+.045,.235,1.18,.045,.035,frame);
     for(const x of [-.55,.55])box(x,y+.08,-.18,.035,.16,.035,frame);
     if(level===0){
      for(let k=0;k<4;k++){const pot=cyl(-.39+k*.25,y+.17,.02,.065,.075,.2,k%2?m.clay:m.cream,14);cyl(-.39+k*.25,y+.28,.02,.055,.055,.025,m.leaf,14)}
     }else if(level===1){
      for(let k=0;k<5;k++){const book=box(-.45+k*.18,y+.16,.02,.13,.24,.24,[m.clay,m.cream,m.leaf,m.oak,m.fabric][k]);book.rotation.z=(k-2)*.035}
     }else if(level===2){
      for(let k=0;k<3;k++){const basket=box(-.38+k*.38,y+.12,.02,.29,.17,.3,mat(k===1?0xb99a73:0x9a7d5c,.94));for(let q=0;q<4;q++)box(-.48+k*.38+q*.06,y+.12,.18,.012,.13,.012,m.cream)}
     }else if(level===3){
      for(let k=0;k<3;k++){const frameBox=box(-.37+k*.37,y+.16,.02,.26,.24,.18,k===1?m.clay:m.cream);box(-.37+k*.37,y+.17,.12,.18,.16,.012,m.gold)}
     }else{
      const plant=cyl(-.35,y+.12,.02,.07,.09,.17,m.clay,14);
      for(let k=0;k<5;k++){const leaf=sphere(-.35+Math.cos(k*1.25)*.09,y+.28+Math.sin(k*1.25)*.04,.02,.07,.12,.035,m.leaf);leaf.rotation.z=Math.cos(k*1.25)*.5}
      for(let k=0;k<3;k++)box(.12+k*.14,y+.13,.02,.11,.2,.2,m.cream);
     }
    }
    for(const side of [-1,1]){const brace=box(side*.35,.96,-.225,.028,1.72,.028,frame);brace.rotation.z=side*.34}
   }else if(modelName==='衣帽架'){
    width=.82;depth=.82;height=2.05;
    const wood=mat(0x76543d,.62),brass=mat(0xb69a68,.48,.65);
    cyl(0,.075,0,.34,.34,.14,m.dark,24);
    cyl(0,1.0,0,.052,.065,1.82,wood,20);
    // A stepped crown with six curved hooks, each ending in a protective wooden knob.
    for(let i=0;i<6;i++){
     const a=i*Math.PI/3,x=Math.cos(a),z=Math.sin(a);
     const curve=new T.CatmullRomCurve3([
      new T.Vector3(x*.025,1.72,z*.025),
      new T.Vector3(x*.2,1.82,z*.2),
      new T.Vector3(x*.31,1.94,z*.31),
      new T.Vector3(x*.27,2.0,z*.27)
     ]);
     group.add(new T.Mesh(new T.TubeGeometry(curve,12,.022,8,false),brass));
     sphere(x*.27,2.0,z*.27,.055,.055,.055,wood);
     const collar=cyl(x*.04,1.73,z*.04,.075,.075,.035,m.gold,12);
     collar.rotation.x=Math.PI/2;
    }
    for(let i=0;i<3;i++){
     const a=i*Math.PI*2/3,x=Math.cos(a),z=Math.sin(a);
     const peg=box(x*.18,1.36,z*.18,.24,.045,.045,brass);peg.rotation.y=-a;
     sphere(x*.31,1.36,z*.31,.045,.045,.045,wood);
    }
    // A hanging coat and scarf establish scale and show how the hooks are used.
    const coat=box(.19,1.02,.1,.42,.68,.13,m.fabric);coat.rotation.z=-.08;
    const lapel=box(.19,1.34,.17,.22,.22,.025,m.cream);lapel.rotation.z=-.1;
    const scarf=box(-.2,1.26,.12,.1,.78,.035,mat(0x8a9b91,.96));scarf.rotation.z=.12;
   }else if(name.startsWith('成品食物·')){
    const dishName=name.slice('成品食物·'.length);
    width=.58;depth=.52;height=.22;surfaceType='tabletop';surfaceY=.22;
    const porcelain=mat(0xf3eee3,.24,.04),rimMat=mat(0xb58d5d,.34,.38),rice=mat(0xf1e5c9,.96),egg=mat(0xf2cf72,.88),tomato=mat(0xc85f43,.86),greens=mat(0x6f8a55,.92),beef=mat(0x865039,.88),mushroom=mat(0xa58a6a,.94),tofu=mat(0xf0e4ca,.92),potato=mat(0xd6ad68,.9),sauce=mat(0x9a603d,.84);
    // A complete plated meal with a raised ceramic rim; each recipe gets its own silhouette and garnish.
    cyl(0,.035,0,.255,.225,.055,porcelain,36);
    const plateRim=new T.Mesh(new T.TorusGeometry(.224,.012,8,40),rimMat);plateRim.rotation.x=Math.PI/2;plateRim.position.y=.064;group.add(plateRim);
    cyl(0,.068,0,.19,.19,.012,mat(0xe8dfce,.32),32);
    if(dishName==='蛋炒饭'){
     sphere(0,.12,-.015,.165,.058,.145,rice);
     for(const [x,z] of [[-.1,-.04],[-.04,.045],[.055,-.065],[.105,.025]])sphere(x,.153,z,.026,.014,.023,egg);
     for(const [x,z] of [[-.12,.04],[.02,-.11],[.12,-.045],[-.02,.11]])box(x,.157,z,.022,.018,.022,greens);
     for(const [x,z] of [[-.06,-.09],[.075,.085]])sphere(x,.16,z,.014,.012,.014,tomato);
    }else if(dishName==='番茄炒蛋'){
     for(const [x,z] of [[-.1,-.055],[.025,-.09],[.11,-.025],[-.045,.08],[.075,.09]]){
      const piece=sphere(x,.13,z,.065,.025,.048,(x+z)>0?egg:tomato);piece.rotation.y=(x-z)*2;
     }
     for(const [x,z] of [[-.12,.08],[.02,.02],[.13,.055]])sphere(x,.16,z,.018,.012,.018,greens);
    }else if(dishName==='蔬菜汤'){
     // Shallow soup bowl with a glossy broth surface and floating vegetables.
     cyl(0,.105,0,.195,.155,.105,porcelain,32);
     cyl(0,.16,0,.168,.168,.012,mat(0xc98f52,.2),32);
     const soupRim=new T.Mesh(new T.TorusGeometry(.18,.012,8,36),rimMat);soupRim.rotation.x=Math.PI/2;soupRim.position.y=.165;group.add(soupRim);
     for(const [x,z] of [[-.09,-.045],[.015,-.075],[.085,.035],[-.04,.075]]){
      sphere(x,.177,z,.035,.014,.028,greens);
      sphere(x+.025,.179,z+.012,.018,.012,.018,potato);
     }
     sphere(-.08,.18,.09,.025,.012,.022,tomato);
    }else if(dishName==='牛肉面'){
     cyl(0,.095,0,.19,.16,.1,porcelain,32);
     cyl(0,.15,0,.165,.165,.012,mat(0xb77b4d,.25),32);
     const noodleMat=mat(0xf0d28a,.76);
     for(let i=0;i<5;i++){
      const ring=new T.Mesh(new T.TorusGeometry(.075+i*.012,.009,6,24),noodleMat);ring.rotation.x=Math.PI/2;ring.position.set((i%2-.5)*.035,.17+(i%2)*.006,(Math.floor(i/2)-.5)*.025);group.add(ring);
     }
     for(const [x,z] of [[-.09,-.045],[.07,-.055],[.095,.055]]){
      const slice=sphere(x,.19,z,.055,.022,.04,beef);slice.rotation.y=x*2;
     }
     for(const [x,z] of [[-.02,.08],[.12,-.005]])sphere(x,.198,z,.018,.01,.018,greens);
    }else if(dishName==='奶油蘑菇饭'){
     sphere(0,.12,0,.17,.055,.15,mat(0xe8d7ae,.95));
     for(const [x,z] of [[-.11,-.04],[.02,-.09],[.105,.025],[-.045,.09]]){
      sphere(x,.175,z,.04,.018,.035,mushroom);
      cyl(x,.157,z,.018,.02,.035,porcelain,10);
     }
     for(const [x,z] of [[-.03,.02],[.11,-.07]])sphere(x,.19,z,.018,.009,.016,greens);
    }else if(dishName==='香煎蛋吐司'){
     for(const x of [-.095,.095]){
      const toastSlice=box(x,.112,0,.16,.045,.22,mat(0xb77a43,.88));toastSlice.rotation.y=x*.6;
      box(x,.14,0,.135,.018,.19,mat(0xf0d28d,.9));
     }
     sphere(0,.17,-.015,.072,.018,.072,egg);
     sphere(0,.19,-.015,.034,.012,.034,mat(0xe5a83e,.82));
     for(const [x,z] of [[-.12,.08],[.12,-.08]])sphere(x,.163,z,.016,.01,.016,greens);
    }else if(dishName==='豆腐煲'){
     cyl(0,.105,0,.195,.155,.105,porcelain,32);
     cyl(0,.16,0,.168,.168,.012,sauce,32);
     const stewRim=new T.Mesh(new T.TorusGeometry(.18,.012,8,36),rimMat);stewRim.rotation.x=Math.PI/2;stewRim.position.y=.165;group.add(stewRim);
     for(const [x,z] of [[-.09,-.045],[.025,-.075],[.09,.035],[-.035,.07]]){
      const cube=box(x,.205,z,.065,.045,.065,tofu);cube.rotation.y=(x-z)*1.5;
     }
     for(const [x,z] of [[-.11,.075],[.1,-.065]])sphere(x,.22,z,.025,.012,.022,greens);
     sphere(.02,.218,.105,.026,.012,.024,tomato);
    }else if(dishName==='土豆牛肉'){
     for(const [x,z] of [[-.1,-.06],[.02,-.09],[.11,-.025],[-.045,.075],[.075,.09]]){
      const chunk=box(x,.14,z,.078,.06,.072,(x+z)>0?potato:beef);chunk.rotation.y=(x-z)*1.8;chunk.rotation.z=.12;
     }
     for(const [x,z] of [[-.12,.08],[.03,.02],[.13,.055]])sphere(x,.18,z,.018,.012,.018,greens);
    }else if(dishName==='葱香土豆饼'){
     const pancake=cyl(0,.115,0,.155,.17,.055,potato,36);
     const top=sphere(0,.145,0,.145,.018,.13,mat(0xe9c77d,.88));
     for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7;
      const herb=sphere(Math.cos(a)*.09,.166,Math.sin(a)*.08,.014,.008,.012,greens);herb.rotation.z=.3;
     }
    }else{
     sphere(0,.12,0,.15,.055,.14,rice);
     for(let i=0;i<4;i++)sphere(Math.cos(i*1.57)*.09,.16,Math.sin(i*1.57)*.08,.025,.014,.025,greens);
    }
    group.userData.foodDisplay=true;group.userData.foodName=dishName;
   }else if(modelName==='凳子'){
    width=.66;depth=.66;height=.72;action=()=>openFurnitureActions('chair',id);
    const timber=mat(0x76543d,.62),seat=mat(0xc9b89f,.96),brass=mat(0x9b805f,.48,.55);
    // A round upholstered perch with four splayed legs and a circular footrest.
    cyl(0,.57,0,.34,.34,.13,timber,32);
    cyl(0,.655,0,.33,.33,.07,seat,32);
    const piping=new T.Mesh(new T.TorusGeometry(.315,.012,8,40),brass);piping.rotation.x=Math.PI/2;piping.position.y=.69;group.add(piping);
    for(let i=0;i<4;i++){
     const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a),z=Math.sin(a);
     const leg=box(x*.19,.29,z*.19,.075,.58,.075,timber);leg.rotation.z=-x*.13;leg.rotation.x=z*.13;
     sphere(x*.29,.055,z*.29,.055,.045,.055,brass);
    }
    const ring=new T.Mesh(new T.TorusGeometry(.22,.025,8,32),timber);ring.rotation.x=Math.PI/2;ring.position.y=.29;group.add(ring);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const tack=sphere(Math.cos(a)*.29,.67,Math.sin(a)*.29,.018,.018,.018,brass)}
   }else{toast('没有找到这种家具模型：'+name);return null}
   // Fine finish pass: small joinery, upholstery and hardware details for existing models.
   if(modelName==='床头柜'){for(const x of [-.31,.31])cyl(x,.075,-.27,.035,.035,.11,m.gold,12);box(0,.49,.414,.24,.025,.018,m.gold)}
   if(modelName==='椅子'||modelName==='餐桌椅'){const seatEdge=mat(0x9c8064,.9);for(const x of [-.29,.29]){box(x,.565,.34,.025,.025,.025,m.gold)}if(variant==='软包扶手椅'){for(const x of [-.3,.3]){const piping= new T.Mesh(new T.TorusGeometry(.27,.008,6,24,Math.PI),seatEdge);piping.position.set(x,.66,-.19);piping.rotation.y=Math.PI/2;group.add(piping)}}}
   if(modelName==='电脑'){const screenGlow=box(0,.49,-.112,.62,.012,.006,mat(0x6b9eb1,.28));screenGlow.material.emissive=new T.Color(0x23485b);screenGlow.material.emissiveIntensity=.28;for(let row=0;row<3;row++)for(let col=0;col<10;col++)box(-.27+col*.06,.104+row*.002,.105+row*.047,.035,.006,.025,m.metal)}
   const cabinetTopHeights={'床头柜':.94,'衣柜':2.52,'书架':2.16,'展示柜':2.08,'斗柜':1.22,'电视柜':.78,'橱柜':1.1,'鞋柜':1.08,'置物架':1.96,'酒柜':1.75,'餐边柜':1.26,'料理台':1.05,'吊柜':.55};
   if(Object.prototype.hasOwnProperty.call(cabinetTopHeights,modelName)){surfaceType='table';surfaceY=cabinetTopHeights[modelName]}
   return {variant,modelName,room,parent,id,group,restoring,width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action};
  }
  return {build};
 }
 return {create};
})();
