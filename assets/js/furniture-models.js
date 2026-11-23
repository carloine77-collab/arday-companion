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
    const palettes={'波斯绛红':[0x8f3f3a,0xd8b98b,0xead8b8,0xb78b4d],'奶油棋盘':[0xd8c8ad,0x9a8876,0xf0e5d4,0x9b8064],'海盐蓝':[0x55778a,0xb6c6c7,0xe0e5df,0xc2a66e],'羊毛米白':[0xd8cdbb,0xc6b8a2,0xf0e8da,0xb69b78],'卧室长绒':[0x9a8978,0xc9bba8,0xe8dfd1,0x806c5c]};
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
   const modularBuilder=modelName!=='成品食物'?window.ArdayFurnitureModelCategories?.[modelName]:null;
   if(modularBuilder){
    const ctx={T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast,width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action};
    if(modularBuilder(ctx)!==true){group.traverse(o=>{o.geometry?.dispose?.();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(material=>material?.dispose?.())});parent.remove(group);return null;}
    ({width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx);
   }else if(modelName==='床'){

    action=()=>openFurnitureActions('bed',id);
    const isWood=variant==='浅橡木框架',isSoft=variant==='奶油软包',isDouble=name==='双人床',isFabric=name==='布艺床';
    width=isDouble?3.72:3.12;depth=3.48;height=isSoft?1.72:isDouble?1.62:1.5;
    const oak=mat(0xb98b5d,.58),oakDark=mat(0x765239,.62),upholstery=mat(isSoft?0xe6d9c8:isDouble?0xc9c0b4:isFabric?0xb9a99a:0xcfc4b6,.98),duvet=mat(isSoft?0xe9e0d3:isDouble?0xd8d0c4:isFabric?0xd6c8b8:0xd9d0c5,.98),piping=mat(isWood?0x98734f:0xa9957d,.88),shadow=mat(0x887d70,.96);
    applyPainterMap(oak,woodMap,.012);applyPainterMap(oakDark,woodMap,.012);applyPainterMap(upholstery,fabricMap,.025);applyPainterMap(duvet,fabricMap,.022);
    const cushion=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,30,20),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
    const pillow=(x,y,z,w,d,material,tilt=0)=>{const o=cushion(x,y,z,w*.5,.095,d*.5,material);o.rotation.z=tilt;const pts=[];for(let i=0;i<16;i++){const a=i*Math.PI*2/16;pts.push(new T.Vector3(x+Math.cos(a)*w*.46,y+.055,z+Math.sin(a)*d*.46))}group.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts,true),40,.006,6,true),piping));return o};
    const linen=mat(0xf1e9dd,.98),blue=mat(0xaebfc0,.98),oat=mat(0xc7b69e,.98),throwMat=mat(0x8f9c98,.98);
    const foot=(x,z,material,h=.25)=>{const o=new T.Mesh(new T.CylinderGeometry(.065,.045,h,12),material);o.position.set(x,h/2,z);group.add(o);o.castShadow=true};
    if(isSoft){
     width=3.12;height=1.72;box(0,.25,0,2.94,.38,3.18,upholstery);box(0,.48,.02,2.78,.22,2.96,shadow);box(0,.64,.02,2.82,.28,2.98,duvet);
     box(0,1.18,-1.58,3.08,1.12,.24,upholstery);box(0,1.17,-1.435,2.84,.88,.08,duvet);
     for(const x of [-.94,-.47,0,.47,.94]){cushion(x,1.19,-1.38,.225,.39,.075,upholstery);box(x,1.17,-1.294,.012,.72,.012,piping)}
     for(const x of [-1.42,1.42]){cushion(x,.54,-.02,.12,.22,1.48,upholstery);cushion(x,.7,-.02,.14,.08,1.36,duvet)}
     box(0,.79,.42,2.55,.14,1.82,duvet);pillow(-.64,.94,-.91,.62,.38,linen,-.08);pillow(.64,.94,-.91,.56,.34,blue,.1);box(0,.89,1.02,2.52,.12,.46,oat);
     for(const x of [-.82,-.41,0,.41,.82])box(x,.958,1.02,.012,.012,.38,piping);for(const x of [-1.2,1.2])for(const z of [-1.35,1.35])foot(x,z,shadow,.12);
    }else if(isWood){
     width=3.12;height=1.42;box(0,.28,0,2.92,.2,3.18,oak);box(0,.42,0,2.78,.14,3,oakDark);box(0,.57,.02,2.78,.18,2.96,duvet);
     for(const x of [-1.38,1.38]){box(x,.38,0,.16,.48,3.18,oak);box(x,.17,0,.14,.34,.14,oakDark)}
     box(0,.48,1.52,2.96,.42,.16,oak);box(0,1.1,-1.58,2.98,.98,.16,oak);box(0,1.57,-1.58,3.04,.12,.2,oakDark);
     for(let x=-1.34;x<=1.341;x+=.19){box(x,1.1,-1.56,.085,.78,.095,oak);box(x,1.1,-1.49,.025,.68,.018,oakDark)}
     for(const x of [-1.38,1.38]){foot(x,-1.48,oakDark,.42);foot(x,1.48,oakDark,.42)}
     box(0,.73,.38,2.54,.12,1.72,duvet);pillow(-.65,.94,-.91,.56,.34,linen,-.04);pillow(.65,.94,-.91,.48,.3,oat,.08);box(0,.85,1.05,2.5,.09,.4,throwMat);
     for(const x of [-.82,-.41,0,.41,.82])box(x,.9,1.05,.012,.012,.34,piping);
    }else if(isDouble){
     width=3.72;height=1.62;box(0,.26,0,3.54,.22,3.2,oakDark);box(0,.45,0,3.42,.18,3.12,upholstery);box(0,.62,.04,3.34,.2,3,duvet);
     box(0,1.02,-1.58,3.62,1.08,.2,oakDark);box(0,1.02,-1.45,3.48,.96,.12,upholstery);
     for(const x of [-1.56,1.56]){const wing=cushion(x,1.05,-1.35,.22,.58,.31,upholstery);wing.rotation.y=x<0?-.16:.16;box(x,.5,0,.12,.72,3.02,oak)}
     box(0,1.52,-1.55,3.62,.12,.24,oak);for(const x of [-1.08,-.54,0,.54,1.08])box(x,1.04,-1.372,.018,.78,.018,piping);
     for(const x of [-.82,.82]){pillow(x,.94,-.91,.72,.4,x<0?linen:blue,x<0?-.06:.06);box(x,.79,.48,1.48,.13,1.92,duvet);for(const z of [-.28,.18,.62,1.06])box(x,.862,z,.62,.012,.012,piping)}
     box(0,.79,.53,.055,.16,1.82,piping);box(0,.72,1.42,2.94,.18,.42,upholstery);for(const x of [-1.55,1.55])for(const z of [-1.42,1.42])foot(x,z,oakDark,.22);
    }else if(isFabric){
     // Upholstered sleigh bed with a bowed head and foot rail, tufted back and quilted runner.
     width=3.12;height=1.58;box(0,.3,0,2.9,.3,3.1,upholstery);box(0,.53,0,2.72,.2,2.96,shadow);box(0,.67,.02,2.72,.18,2.92,duvet);
     const head=new T.CatmullRomCurve3([new T.Vector3(-1.38,.42,-1.55),new T.Vector3(-1.3,1.2,-1.62),new T.Vector3(-.8,1.42,-1.65),new T.Vector3(0,1.48,-1.65),new T.Vector3(.8,1.42,-1.65),new T.Vector3(1.3,1.2,-1.62),new T.Vector3(1.38,.42,-1.55)]);group.add(new T.Mesh(new T.TubeGeometry(head,56,.12,16,false),upholstery));
     const footboard=new T.CatmullRomCurve3([new T.Vector3(-1.36,.38,1.45),new T.Vector3(-1.1,.72,1.58),new T.Vector3(0,.82,1.62),new T.Vector3(1.1,.72,1.58),new T.Vector3(1.36,.38,1.45)]);group.add(new T.Mesh(new T.TubeGeometry(footboard,48,.09,14,false),upholstery));
     for(let i=0;i<7;i++){const x=-1.08+i*.36;sphere(x,1.31,-1.56,.035,.035,.025,m.gold);const tuft=new T.CatmullRomCurve3([new T.Vector3(x-.1,1.22,-1.56),new T.Vector3(x,1.17,-1.55),new T.Vector3(x+.1,1.22,-1.56)]);group.add(new T.Mesh(new T.TubeGeometry(tuft,12,.008,5,false),piping))}
     box(0,.78,.35,2.46,.16,1.88,duvet);pillow(-.64,.94,-.96,.64,.42,linen,-.1);pillow(.64,.94,-.96,.58,.38,oat,.08);box(0,.88,1.05,2.48,.07,.42,throwMat);
     for(const x of [-1.18,1.18])for(const z of [-1.38,1.38])foot(x,z,oakDark,.2);
    }else{
     width=3.12;height=1.42;box(0,.28,0,2.92,.2,3.18,oakDark);box(0,.49,.02,2.78,.22,3,duvet);box(0,.96,-1.58,2.98,.88,.18,oakDark);box(0,.96,-1.46,2.82,.72,.08,upholstery);
     for(const x of [-1.2,1.2]){foot(x,-1.42,oakDark,.28);foot(x,1.42,oakDark,.28)}
     box(0,.72,.48,2.54,.13,1.82,duvet);pillow(-.64,.9,-.91,.58,.34,linen,-.08);pillow(.64,.9,-.91,.5,.32,oat,.08);box(0,.84,1.02,2.5,.1,.42,throwMat);
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

    width=.76;depth=.24;height=.82;wallAxis='x';wallSide='back';anchor=[0,3.15];
    const plate=mat(0x9d794b,.36,.62),arm=mat(0xb58d56,.3,.66),backplate=new T.Mesh(new T.CylinderGeometry(.13,.13,.42,24),plate);backplate.position.set(0,0,-.045);group.add(backplate);for(const y of [-.2,.2])sphere(0,y,-.045,.13,.13,.04,plate);
    for(const y of [-.18,.18])cyl(0,y,.01,.025,.025,.025,arm,12);
    if(variant==='玻璃单臂'){
     const curve=new T.CatmullRomCurve3([new T.Vector3(0,-.02,0),new T.Vector3(.12,-.02,.08),new T.Vector3(.28,.02,.12),new T.Vector3(.31,.18,.12)]);group.add(new T.Mesh(new T.TubeGeometry(curve,24,.025,10,false),arm));
     const glass=mat(0xb9d3d8,.12,.16);glass.transparent=true;glass.opacity=.48;
     const capsule=new T.Mesh(new T.CylinderGeometry(.105,.105,.34,24),glass);capsule.position.set(.31,.37,.13);capsule.rotation.z=-.16;group.add(capsule);for(const y of [.2,.54]){const end=new T.Mesh(new T.SphereGeometry(.105,24,16),glass);end.position.set(.31,y,.13);group.add(end)}
     const bulb=sphere(.31,.37,.14,.055,.19,.055,mat(0xffe7b6,.18));bulb.material.emissive=new T.Color(0xffd58c);bulb.material.emissiveIntensity=.52;
     for(const y of [.18,.56]){const collar=new T.Mesh(new T.TorusGeometry(.105,.012,8,24),arm);collar.position.set(.31,y,.13);collar.rotation.z=Math.PI/2;group.add(collar)}
    }else if(variant==='黄铜双臂'){
     for(const side of [-1,1]){const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(side*.14,.04,.08),new T.Vector3(side*.28,.18,.12)]);group.add(new T.Mesh(new T.TubeGeometry(curve,18,.022,8,false),arm));const shade=new T.Mesh(new T.ConeGeometry(.15,.22,24,1,true),m.cream);shade.position.set(side*.28,.23,.13);shade.rotation.x=Math.PI;group.add(shade);cyl(side*.28,.1,.13,.025,.025,.18,arm,10)}
    }else{const shade=new T.Mesh(new T.ConeGeometry(.2,.28,24,1,true),m.cream);shade.position.set(0,.18,.12);shade.rotation.x=Math.PI;group.add(shade);cyl(0,.02,.12,.025,.025,.2,arm,10)}

   }else if(modelName==='落地灯'){

    width=.72;depth=.72;height=1.98;surfaceType='floor';surfaceY=.04;
    const base=mat(0x393b3b,.42,.48),brass=mat(0xb58d56,.3,.68),wood=mat(0x76543d,.58);cyl(0,.055,0,.32,.32,.11,base,32);cyl(0,.13,0,.25,.25,.035,brass,32);
    if(variant==='纸罩'){
     const paper=mat(0xe8dfd0,.98),rib=mat(0xbca98f,.82);cyl(0,.2,0,.11,.13,.18,wood,24);cyl(0,.94,0,.035,.045,1.42,wood,20);
     const lantern=new T.Mesh(new T.LatheGeometry([new T.Vector2(.2,0),new T.Vector2(.29,.08),new T.Vector2(.34,.22),new T.Vector2(.34,.48),new T.Vector2(.29,.63),new T.Vector2(.2,.7)],40),paper);lantern.position.y=1.2;group.add(lantern);
     for(const y of [1.2,1.28,1.85,1.92]){const ring=new T.Mesh(new T.TorusGeometry(.2,.018,8,40),rib);ring.position.y=y;group.add(ring)}
     for(let i=0;i<20;i++){const a=i*Math.PI*2/20,curve=new T.CatmullRomCurve3([new T.Vector3(Math.cos(a)*.2,1.2,Math.sin(a)*.2),new T.Vector3(Math.cos(a)*.34,1.55,Math.sin(a)*.34),new T.Vector3(Math.cos(a)*.2,1.9,Math.sin(a)*.2)]);group.add(new T.Mesh(new T.TubeGeometry(curve,18,.007,5,false),rib))}
     const glow=sphere(0,1.55,0,.12,.12,.12,mat(0xffe9bc,.2));glow.material.emissive=new T.Color(0xffd99b);glow.material.emissiveIntensity=.28;
    }else if(variant==='蘑菇罩'){
     const stem=mat(0x9b754c,.32,.38),cap=mat(0xd9b77f,.34),under=mat(0x8e6047,.58);const stemMesh=new T.Mesh(new T.CylinderGeometry(.075,.13,.88,32),stem);stemMesh.position.y=.64;group.add(stemMesh);
     const capMesh=new T.Mesh(new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.12,.015),new T.Vector2(.24,.045),new T.Vector2(.38,.12),new T.Vector2(.46,.2),new T.Vector2(.43,.27),new T.Vector2(.32,.3),new T.Vector2(.12,.29),new T.Vector2(0,.28)],48),cap);capMesh.position.y=1.12;group.add(capMesh);
     const underside=new T.Mesh(new T.LatheGeometry([new T.Vector2(.1,0),new T.Vector2(.36,.015),new T.Vector2(.42,.05),new T.Vector2(.32,.09),new T.Vector2(.1,.08)],40),under);underside.position.y=1.12;group.add(underside);
     for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const spot=sphere(Math.cos(a)*(.18+(i%2)*.11),1.36+((i%3)-1)*.018,Math.sin(a)*(.18+(i%2)*.11),.045,.012,.035,mat(0xf2e5c9,.7));spot.rotation.y=-a}
     const collar=new T.Mesh(new T.TorusGeometry(.13,.018,8,28),brass);collar.position.y=1.11;group.add(collar);
    }else if(variant==='黑色三脚'){
     for(let i=0;i<3;i++){const a=i*Math.PI*2/3,leg=box(Math.cos(a)*.16,.88,Math.sin(a)*.16,.045,1.72,.045,mat(0x343638,.55,.25));leg.rotation.z=Math.cos(a)*.08;leg.rotation.x=Math.sin(a)*.08}
     cyl(0,1.72,0,.045,.045,.12,m.dark,16);const shade=new T.Mesh(new T.CylinderGeometry(.3,.17,.42,24,1,true),m.cream);shade.position.y=1.52;group.add(shade);
    }else if(variant==='黄铜弧形'){
     const arc=new T.CatmullRomCurve3([new T.Vector3(0,.13,0),new T.Vector3(0,.72,0),new T.Vector3(.12,1.38,0),new T.Vector3(.42,1.76,0),new T.Vector3(.47,1.62,0)]);group.add(new T.Mesh(new T.TubeGeometry(arc,32,.035,10,false),brass));
     const shade=new T.Mesh(new T.ConeGeometry(.23,.28,24,1,true),m.cream);shade.position.set(.47,1.48,0);shade.rotation.z=Math.PI;group.add(shade);cyl(.47,1.33,0,.035,.035,.13,brass,12);
    }else{const pole=new T.Mesh(new T.CylinderGeometry(.025,.04,1.65,20),brass);pole.position.y=.98;group.add(pole);const shade=new T.Mesh(new T.CylinderGeometry(.27,.16,.38,32,1,true),m.cream);shade.position.y=1.58;group.add(shade);const diffuser=new T.Mesh(new T.CircleGeometry(.16,24),m.cream);diffuser.position.y=1.39;diffuser.rotation.x=-Math.PI/2;group.add(diffuser)}

   }else if(modelName==='成品食物'){
    const foodModel=window.ArdayFoodModels?.build({T,group,mat,m,cyl,variant});
    if(!foodModel){toast('料理模型模块尚未就绪');return null}
    width=foodModel.width;depth=foodModel.depth;height=foodModel.height;surfaceType=foodModel.surfaceType;surfaceY=foodModel.surfaceY;
   }else if(modelName==='吊灯'){

    width=.82;depth=.82;height=.72;surfaceType='ceiling';const canopy=mat(0x9a784e,.3,.62),cable=mat(0x34383a,.42,.55),brass=mat(0xb58d56,.28,.68);cyl(0,.3,0,.12,.12,.09,canopy,24);cyl(0,.06,0,.018,.018,.46,cable,12);
    if(variant==='锥形金属'){
     const shell=mat(0x77848a,.24,.78),inner=mat(0xc7b58e,.32,.55);const shade=new T.Mesh(new T.LatheGeometry([new T.Vector2(.07,0),new T.Vector2(.11,.035),new T.Vector2(.19,.12),new T.Vector2(.31,.32),new T.Vector2(.39,.4),new T.Vector2(.39,.43)],48),shell);shade.position.y=-.43;group.add(shade);
     const reflector=new T.Mesh(new T.CylinderGeometry(.12,.31,.04,32,1,true),inner);reflector.position.y=-.65;group.add(reflector);const diffuser=new T.Mesh(new T.CircleGeometry(.13,32),m.cream);diffuser.position.y=-.68;diffuser.rotation.x=-Math.PI/2;group.add(diffuser);
     for(let i=0;i<12;i++){const a=i*Math.PI/6,fin=box(Math.cos(a)*.34,-.25,Math.sin(a)*.34,.012,.13,.045,brass);fin.rotation.y=-a}
     cyl(0,-.21,0,.055,.055,.08,brass,16);
    }else if(variant==='乳白玻璃'){
     const globeMat=mat(0xe8eee9,.16,.12);globeMat.transparent=true;globeMat.opacity=.76;const globe=new T.Mesh(new T.SphereGeometry(.34,40,28),globeMat);globe.position.y=-.36;globe.scale.set(1,.9,1);group.add(globe);cyl(0,-.67,0,.09,.09,.045,brass,18);
    }else if(variant==='藤编圆罩'){
     const wicker=mat(0xb68d5e,.94),dark=mat(0x795638,.88);const shade=new T.Mesh(new T.SphereGeometry(.39,32,20,0,Math.PI*2,0,Math.PI/2),wicker);shade.position.y=-.18;shade.scale.set(1,.82,1);group.add(shade);
     for(let i=0;i<18;i++){const a=i*Math.PI/9,curve=new T.CatmullRomCurve3([new T.Vector3(0,-.16,0),new T.Vector3(Math.cos(a)*.22,-.2,Math.sin(a)*.22),new T.Vector3(Math.cos(a)*.38,-.48,Math.sin(a)*.38)]);group.add(new T.Mesh(new T.TubeGeometry(curve,16,.009,6,false),dark))}
     cyl(0,-.5,0,.16,.16,.035,m.cream,24);
    }else{const shade=new T.Mesh(new T.CylinderGeometry(.34,.16,.3,32,1,true),m.cream);shade.position.y=-.36;group.add(shade);cyl(0,-.53,0,.18,.18,.035,brass,12)}

   }else if(modelName==='衣柜'){
    if(variant==='藤编高柜'){
     width=1.52;depth=.76;height=2.38;const frame=mat(0x684a35,.66),cane=mat(0xc8a477,.96),shadow=mat(0x463328,.84),brass=mat(0xb58d56,.36,.62);
     box(0,1.15,0,1.44,2.18,.68,frame);box(0,2.3,0,1.58,.12,.78,m.oak);box(0,.1,0,1.48,.18,.74,frame);
     for(const x of [-.36,.36]){box(x,1.18,.355,.66,1.92,.055,shadow);box(x,1.18,.39,.6,1.82,.035,cane);for(let y=.34;y<=2.041;y+=.1){const a=box(x,y,.418,.59,.014,.014,frame);a.rotation.z=.58;const b=box(x,y+.035,.422,.59,.014,.014,mat(0xd8b88b,.96));b.rotation.z=-.58;}box(x,.22,.43,.58,.045,.035,frame);box(x,2.14,.43,.58,.045,.035,frame);cyl(x+(x<0?.25:-.25),1.18,.45,.024,.024,.065,brass,12)}
     box(0,1.18,.37,.035,1.98,.035,brass);
     for(const x of [-.58,.58])for(const z of [-.23,.23]){const leg=new T.Mesh(new T.CylinderGeometry(.055,.075,.22,12),frame);leg.position.set(x,.11,z);group.add(leg)}
     box(0,.42,.36,1.28,.24,.04,frame);box(0,.42,.39,1.18,.18,.025,cane);
    }else{
     width=1.85;depth=.78;height=2.45;const body=mat(0x76543d,.68),front=mat(0xd8c8b3,.76),inner=mat(0x4c382c,.82);
     box(0,1.2,0,1.78,2.3,.68,body);box(0,2.38,0,1.92,.12,.78,m.oak);box(0,.08,0,1.86,.16,.76,m.dark);
     for(const x of [-.45,.45]){box(x,1.22,.355,.84,2.12,.045,front);for(const dx of [-.38,.38])box(x+dx,1.22,.383,.025,1.98,.018,m.oak);for(const y of [.25,2.19])box(x,y,.383,.78,.025,.018,m.oak);box(x,1.22,.382,.72,1.78,.012,m.cream);cyl(x+(x<0?.3:-.3),1.2,.425,.025,.025,.08,m.gold,12)}
     box(0,1.22,.36,.025,2.12,.02,inner);box(0,.16,.02,1.78,.12,.7,body);box(0,2.46,0,2.0,.08,.82,m.oak);for(const x of [-.72,.72])box(x,.12,.02,.1,.2,.72,m.dark);
    }
   
   }else if(modelName==='卧室地毯'){
    width=variant==='卧室长绒'?3.5:3.4;depth=variant==='卧室长绒'?2.65:2.5;surfaceType='rug';
    box(0,.035,0,width,.07,depth,m.fabric);box(0,.075,0,width-.22,.012,depth-.22,m.sofa2);
    const rugTrim=mat(variant==='波斯绛红'?0xb78b4d:variant==='海盐蓝'?0xc2a66e:variant==='奶油棋盘'?0x9b8064:0x9a8876,.92);
    for(const x of [-width/2+.13,width/2-.13])box(x,.084,0,.025,.012,depth-.3,rugTrim);for(const z of [-depth/2+.13,depth/2-.13])box(0,.084,z,width-.3,.012,.025,rugTrim);
    if(variant==='波斯绛红'){const med=new T.Mesh(new T.TorusGeometry(.43,.025,8,48),rugTrim);med.rotation.x=Math.PI/2;med.position.y=.087;group.add(med);for(let i=0;i<8;i++){const a=i*Math.PI/4,petal=sphere(Math.cos(a)*.32,.09,Math.sin(a)*.32,.11,.012,.19,m.cream);petal.rotation.y=-a}}
    else if(variant==='奶油棋盘'){for(let x=-width/2+.42;x<width/2-.3;x+=.42)for(let z=-depth/2+.42;z<depth/2-.3;z+=.42)if((Math.round((x+width/2)/.42)+Math.round((z+depth/2)/.42))%2===0)box(x,.088,z,.36,.012,.36,rugTrim)}
    else if(variant==='卧室长绒'){for(let i=0;i<52;i++){const x=-width*.46+(i%13)*width*.076,z=-depth*.43+Math.floor(i/13)*depth*.28;sphere(x,.091,z,.045,.018,.045,i%3===0?m.cream:m.sofa2)}}
    else{for(let i=0;i<5;i++){const line=box(-width*.32+i*width*.16,.088,0,.012,.012,depth-.48,rugTrim);line.rotation.y=.18*(i-2)}}
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
    const wool=variant==='羊毛米白'||name==='羊毛地毯',bedroom=variant==='卧室长绒'||name==='卧室地毯';
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
    action=()=>openFurnitureActions('sofa',id);
    const isLinen=variant==='亚麻燕麦',isWool=variant==='暖灰羊毛'||name==='羊毛沙发',isVelvet=variant==='雾蓝绒布',isRetro=variant==='经典款'||name==='复古沙发';
    const fabric=mat(isLinen?0xc6b394:isWool?0xb1ada5:isVelvet?0x526f86:isRetro?0x725044:0xc9b8a3,.97),lightFabric=mat(isLinen?0xe4d8c4:isWool?0xd3cec4:isVelvet?0x8099ad:isRetro?0x986b56:0xe0d4c5,.98),darkFabric=mat(isLinen?0xa88f70:isWool?0x89877f:isVelvet?0x344c60:isRetro?0x4d342b:0x927e68,.92),wood=mat(isLinen?0x9b714b:isWool?0x63574b:isVelvet?0x354653:isRetro?0x4b3026:0x75563e,.62),metal=mat(isVelvet?0xb69a68:isRetro?0xb58b55:0x80684f,.42,.42),button=mat(isRetro?0xc3a36e:0x887866,.56,.24);
    applyPainterMap(fabric,fabricMap,.03);applyPainterMap(lightFabric,fabricMap,.024);applyPainterMap(darkFabric,fabricMap,.018);applyPainterMap(wood,woodMap,.012);
    const soft=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,32,22),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
    const seam=(points,r=.008,material=darkFabric)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(16,points.length*4),r,8,false),material);group.add(mesh);mesh.castShadow=true;return mesh};
    const leg=(x,z,h=.24)=>{const o=new T.Mesh(new T.CylinderGeometry(.045,.032,h,12),wood);o.position.set(x,h/2,z);o.rotation.z=x*.035;group.add(o);o.castShadow=true;return o};
    if(isLinen){
     // Scandinavian linen loveseat: compact two-seat form, exposed tapered oak legs and clean track arms.
     width=2.28;depth=1.16;height=.96;
     box(0,.28,0,2.05,.16,.88,wood);
     box(0,.39,.37,1.86,.13,.12,wood);
     for(const x of [-.49,.49]){
      soft(x,.51,-.08,.45,.145,.39,fabric);
      seam([[x-.39,.55,-.46],[x-.2,.57,-.47],[x+.2,.57,-.47],[x+.39,.55,-.46]],.009,lightFabric);
      const back=soft(x,.77,.31,.44,.27,.15,lightFabric);back.rotation.x=-.1;
      seam([[x-.37,.79,.16],[x-.18,.82,.15],[x+.18,.82,.15],[x+.37,.79,.16]],.008,darkFabric);
     }
     for(const x of [-.99,.99]){
      box(x,.57,-.015,.16,.54,.94,fabric);
      box(x,.84,-.015,.18,.08,.88,lightFabric);
      seam([[x,.33,-.43],[x,.78,-.43],[x,.88,-.28],[x,.88,.3]],.009,darkFabric);
     }
     for(const x of [-.86,.86])for(const z of [-.34,.34])leg(x,z,.28);
     box(0,.19,-.46,1.82,.045,.025,wood);
     // Loose lumbar pillows distinguish the relaxed linen silhouette.
     const pillowA=soft(-.45,.83,.02,.27,.13,.1,lightFabric);pillowA.rotation.z=-.12;
     const pillowB=soft(.45,.83,.02,.27,.13,.1,darkFabric);pillowB.rotation.z=.12;
    }else if(isWool){
     // Wool/boucle sofa: deep, oversized rounded body with three plush seat modules and pillowy arms.
     width=2.68;depth=1.38;height=1.02;
     soft(0,.38,0,1.25,.25,.62,darkFabric);
     soft(0,.48,-.03,1.13,.2,.55,fabric);
     for(const x of [-.82,0,.82]){
      const seat=soft(x,.59,-.12,.4,.2,.47,lightFabric);
      seat.rotation.x=-.035;
      const back=soft(x,.86,.37,.42,.31,.23,fabric);back.rotation.x=-.1;
      seam([[x-.33,.81,.19],[x-.18,.84,.16],[x,.85,.15],[x+.18,.84,.16],[x+.33,.81,.19]],.012,darkFabric);
     }
     for(const x of [-1.08,1.08]){
      soft(x,.68,-.015,.29,.39,.62,fabric);
      soft(x,.93,-.02,.25,.14,.54,lightFabric);
     }
     for(const x of [-.93,.93])for(const z of [-.43,.43])leg(x,z,.12);
     // Raised rounded seams and varied cushion loft make the wool surface read as thick pile.
     for(let i=0;i<18;i++){
      const x=-1.05+(i%6)*.42,z=-.48+Math.floor(i/6)*.42;
      const tuft=soft(x,.73+(i%2)*.012,z,.018,.014,.018,lightFabric);
     }
    }else if(isVelvet){
     // Deep-blue velvet sectional: long three-seat run plus a full chaise return and channel-tufted back.
     width=3.18;depth=2.18;height=1.08;
     box(0,.29,0,2.55,.18,.9,wood);
     box(0,.4,-.02,2.5,.16,.84,darkFabric);
     for(const x of [-.82,0,.82]){
      soft(x,.57,-.12,.42,.19,.43,fabric);
      const back=soft(x,.89,.32,.42,.34,.18,lightFabric);back.rotation.x=-.12;
      for(let channel=-2;channel<=2;channel++){
       const rib=soft(x+channel*.13,.9,.485,.045,.29,.035,fabric);
       rib.rotation.z=channel*.025;
      }
     }
     for(const x of [-1.2,1.2]){
      soft(x,.66,-.01,.2,.32,.52,fabric);
      box(x,.37,-.01,.09,.48,.78,wood);
     }
     // Chaise extends toward the room front-right, creating an unmistakable L footprint.
     box(.94,.28,.91,.92,.18,1.08,wood);
     soft(.94,.49,.9,.46,.18,.54,fabric);
     const chaiseBack=soft(.94,.83,1.35,.46,.32,.19,lightFabric);chaiseBack.rotation.x=-.1;
     soft(1.35,.62,.91,.18,.3,.54,fabric);
     for(const x of [-1.02,1.02])for(const z of [-.35,1.23])leg(x,z,.2);
     for(const x of [-.95,-.65,-.35,-.05,.25,.55,.85]){const stud=new T.Mesh(new T.SphereGeometry(.025,10,8),metal);stud.position.set(x,.38,-.47);group.add(stud)}
    }else if(isRetro){
     // Vintage Chesterfield: rolled arms, deep diamond button tufting, walnut plinth and brass nailheads.
     width=2.62;depth=1.34;height=1.18;
     box(0,.28,0,2.34,.2,.94,wood);
     box(0,.43,-.02,2.2,.18,.9,darkFabric);
     for(const x of [-.67,0,.67]){
      soft(x,.58,-.1,.35,.19,.43,fabric);
      seam([[x-.29,.61,-.48],[x,.64,-.5],[x+.29,.61,-.48]],.012,lightFabric);
     }
     const back=soft(0,.91,.35,1.04,.37,.2,fabric);back.rotation.x=-.08;
     for(let row=0;row<3;row++)for(let col=0;col<7;col++){
      const x=-.78+col*.26,y=.69+row*.19;
      const buttonMesh=new T.Mesh(new T.SphereGeometry(.035,12,8),button);buttonMesh.position.set(x,y,.54-Math.abs(x)*.025);buttonMesh.scale.set(.82,.82,.5);group.add(buttonMesh);
     }
     for(const x of [-1.02,1.02]){
      const arm=soft(x,.73,.02,.27,.32,.58,fabric);arm.rotation.z=x<0?-.08:.08;
      soft(x,.98,-.03,.27,.13,.53,lightFabric);
      const roll=soft(x,.99,.04,.29,.14,.55,fabric);roll.rotation.z=x<0?-.08:.08;
      for(let i=0;i<7;i++){const nail=new T.Mesh(new T.SphereGeometry(.018,8,6),metal);nail.position.set(x+(x<0?.22:-.22),.48+i*.055,.38);group.add(nail)}
     }
     for(const x of [-.98,.98])for(const z of [-.38,.38])leg(x,z,.23);
     box(0,.19,-.48,2.12,.08,.04,wood);
     for(let i=0;i<9;i++){const stud=new T.Mesh(new T.SphereGeometry(.022,8,6),metal);stud.position.set(-.96+i*.24,.36,-.495);group.add(stud)}
     for(const x of [-.92,.92]){const cushion=soft(x,.83,.08,.19,.11,.17,lightFabric);cushion.rotation.z=x*.08}
    }else{
     // Neutral contemporary three-seat sofa for legacy and generic catalog entries.
     width=2.42;depth=1.2;height=.98;
     box(0,.27,0,2.18,.16,.9,wood);
     for(const x of [-.7,0,.7]){
      soft(x,.51,-.08,.34,.15,.39,fabric);
      const back=soft(x,.79,.31,.34,.28,.16,lightFabric);back.rotation.x=-.1;
      seam([[x-.28,.78,.16],[x,.81,.14],[x+.28,.78,.16]],.008,darkFabric);
     }
     for(const x of [-1.04,1.04]){
      soft(x,.61,-.01,.18,.29,.48,fabric);
      box(x,.39,.01,.06,.38,.78,wood);
     }
     for(const x of [-.88,.88])for(const z of [-.34,.34])leg(x,z,.24);
    }
    if(isVelvet){group.children.forEach(child=>{child.position.z-=.55})}
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

    if(variant==='龟背竹'){
     width=1.55;depth=1.4;height=2.2;const potMat=mat(0x9b6b54,.42),leafDark=mat(0x28583c,.88),leafLight=mat(0x5f8b52,.9),vein=mat(0xa5b77d,.9);
     const pot=new T.Mesh(new T.CylinderGeometry(.29,.4,.5,32),potMat);pot.position.y=.25;group.add(pot);cyl(0,.51,0,.35,.35,.06,m.gold,24);const soil=new T.Mesh(new T.CircleGeometry(.31,32),mat(0x342a20,.96));soil.rotation.x=-Math.PI/2;soil.position.y=.54;group.add(soil);
     const stem=new T.CatmullRomCurve3([new T.Vector3(0,.52,0),new T.Vector3(.02,.9,0),new T.Vector3(-.04,1.38,0)]);group.add(new T.Mesh(new T.TubeGeometry(stem,24,.035,10,false),m.wood));
     for(let i=0;i<8;i++){
      const a=i*Math.PI*2/8,dx=Math.cos(a),dz=Math.sin(a),h=1.12+(i%3)*.19,petiole=new T.CatmullRomCurve3([new T.Vector3(0,.86+(i%2)*.1,0),new T.Vector3(dx*.25,1.06+(i%2)*.12,dz*.25),new T.Vector3(dx*.5,h,dz*.5)]);group.add(new T.Mesh(new T.TubeGeometry(petiole,18,.018,7,false),m.leaf2));
      const shape=new T.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(-.18,.12,-.28,.26);shape.quadraticCurveTo(-.17,.32,-.29,.43);shape.quadraticCurveTo(-.18,.55,-.16,.68);shape.quadraticCurveTo(0,.9,.16,.68);shape.quadraticCurveTo(.18,.55,.29,.43);shape.quadraticCurveTo(.17,.32,.28,.26);shape.quadraticCurveTo(.18,.12,0,0);
      for(const [hx,hy,rx,ry] of [[-.09,.43,.032,.055],[.09,.43,.032,.055],[-.07,.61,.028,.05],[.07,.61,.028,.05]]){const hole=new T.Path();hole.absellipse(hx,hy,rx,ry,0,Math.PI*2,true);shape.holes.push(hole)}
      const leafGroup=new T.Group();leafGroup.position.set(dx*.48,h,dz*.48);leafGroup.rotation.set(-.52,a,0);group.add(leafGroup);const leaf=new T.Mesh(new T.ShapeGeometry(shape,24),i%2?leafDark:leafLight);leaf.material.side=T.DoubleSide;leafGroup.add(leaf);
      const veinCurve=new T.CatmullRomCurve3([new T.Vector3(0,.02,.014),new T.Vector3(0,.24,.014),new T.Vector3(0,.5,.014),new T.Vector3(0,.86,.014)]);leafGroup.add(new T.Mesh(new T.TubeGeometry(veinCurve,20,.009,5,false),vein));
      for(const side of [-1,1])for(let n=1;n<4;n++){const y=n*.18,branch=new T.CatmullRomCurve3([new T.Vector3(0,y,.014),new T.Vector3(side*.08,y+.035,.014),new T.Vector3(side*.14,y+.08,.014)]);leafGroup.add(new T.Mesh(new T.TubeGeometry(branch,8,.004,4,false),vein))}
     }
     for(let i=0;i<4;i++){const a=i*1.57,shoot=new T.CatmullRomCurve3([new T.Vector3(0,.65,0),new T.Vector3(Math.cos(a)*.12,1.1,Math.sin(a)*.12),new T.Vector3(Math.cos(a)*.2,1.45,Math.sin(a)*.2)]);group.add(new T.Mesh(new T.TubeGeometry(shoot,18,.012,6,false),m.leaf2))}
    }else{
     width=1.05;depth=1.05;height=2.3;const pot=new T.Mesh(new T.CylinderGeometry(.23,.34,.48,24,1),m.clay);pot.position.y=.25;group.add(pot);cyl(0,.5,0,.31,.31,.055,m.gold,24);cyl(0,1.16,0,.055,.075,1.28,m.wood,14);
     for(let i=0;i<9;i++){const a=i*Math.PI*2/9,dx=Math.cos(a),dz=Math.sin(a),curve=new T.CatmullRomCurve3([new T.Vector3(0,1.7,0),new T.Vector3(dx*.24,2.05,dz*.24),new T.Vector3(dx*.52,1.98,dz*.52),new T.Vector3(dx*.72,1.72,dz*.72)]);group.add(new T.Mesh(new T.TubeGeometry(curve,14,.018,6,false),m.leaf2));for(let n=1;n<=5;n++){const p=curve.getPoint(n/6);for(const side of [-1,1]){const leaflet=sphere(p.x-dz*side*.095,p.y-.025,p.z+dx*side*.095,.11,.025,.045,(n+i)%2?m.leaf:m.leaf2);leaflet.rotation.y=a;leaflet.rotation.z=side*.35}}}
     sphere(0,1.77,0,.14,.16,.14,m.leaf);
    }

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
    surfaceType='table';
    if(variant==='黄铜圆桌'){
     width=.72;depth=.72;height=.68;surfaceY=.7;const brass=mat(0xb58c54,.32,.78),dark=mat(0x6c5946,.48,.55);
     cyl(0,.64,0,.34,.34,.075,brass,40);const inset=new T.Mesh(new T.TorusGeometry(.285,.012,8,48),dark);inset.rotation.x=Math.PI/2;inset.position.y=.682;group.add(inset);cyl(0,.34,0,.055,.075,.52,brass,24);
     for(let i=0;i<12;i++){const a=i*Math.PI/6,flute=box(Math.cos(a)*.047,.36,Math.sin(a)*.047,.012,.34,.012,dark);flute.rotation.y=-a}
     cyl(0,.07,0,.255,.255,.07,brass,32);const foot=new T.Mesh(new T.TorusGeometry(.22,.018,8,36),dark);foot.rotation.x=Math.PI/2;foot.position.y=.105;group.add(foot);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;cyl(Math.cos(a)*.18,.035,Math.sin(a)*.18,.035,.035,.045,m.dark,12)}
    }else if(variant==='圆形边几'){
     width=.92;depth=.92;height=.72;surfaceY=.74;const stone=mat(0xd8d0c2,.32,.08),oak=mat(0x806044,.58),brass=mat(0xb58d56,.34,.6);
     cyl(0,.68,0,.44,.44,.105,stone,48);const rim=new T.Mesh(new T.TorusGeometry(.425,.018,8,48),brass);rim.rotation.x=Math.PI/2;rim.position.y=.735;group.add(rim);cyl(0,.39,0,.16,.19,.48,oak,28);
     for(let i=0;i<3;i++){const a=i*Math.PI*2/3,leg=box(Math.cos(a)*.3,.2,Math.sin(a)*.3,.065,.36,.065,oak);leg.rotation.z=Math.cos(a)*.12;leg.rotation.x=-Math.sin(a)*.12}
     cyl(0,.16,0,.3,.3,.055,oak,32);const inlay=new T.Mesh(new T.TorusGeometry(.27,.012,8,40),brass);inlay.rotation.x=Math.PI/2;inlay.position.y=.19;group.add(inlay);
    }else if(variant==='玄关窄桌'){
     width=1.55;depth=.48;height=.84;surfaceY=.86;const walnut=mat(0x60432f,.58),top=mat(0xc7a77d,.52),brass=mat(0xb58d56,.34,.62);
     box(0,.78,0,1.52,.09,.44,top);box(0,.71,0,1.46,.06,.4,walnut);
     for(const x of [-.48,.48]){box(x,.53,0,.42,.28,.34,walnut);box(x,.55,.18,.38,.22,.025,top);cyl(x,.55,.205,.018,.018,.035,brass,12)}
     for(const x of [-.64,.64]){const leg=box(x,.34,-.02,.055,.68,.055,walnut);leg.rotation.z=x*.035;box(x,.045,0,.12,.055,.12,brass)}
     box(0,.22,0,1.26,.045,.28,walnut);box(0,.19,.12,1.16,.035,.025,top);box(0,.7,.228,.58,.025,.018,brass);
    }else if(variant==='深木方桌'||!variant){
     width=.72;depth=.72;height=.68;surfaceY=.7;const walnut=mat(0x62442f,.62),edge=mat(0x9a704b,.58),brass=mat(0xb28b58,.34,.65);
     box(0,.62,0,.72,.085,.72,walnut);box(0,.672,0,.68,.018,.68,edge);box(0,.42,.366,.52,.24,.025,edge);box(0,.42,.385,.46,.18,.018,walnut);
     for(const x of [-.13,.13])cyl(x,.42,.405,.018,.018,.035,brass,12);
     for(const x of [-.27,.27])for(const z of [-.27,.27]){const leg=new T.Mesh(new T.CylinderGeometry(.035,.055,.49,12),walnut);leg.position.set(x,.29,z);leg.rotation.z=-x*.12;leg.rotation.x=z*.12;group.add(leg)}
     box(0,.18,0,.58,.045,.58,edge);for(const x of [-.24,.24])for(const z of [-.24,.24])cyl(x,.045,z,.035,.035,.045,m.dark,10);
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

    width=1.52;depth=.7;height=1.78;surfaceType='table';surfaceY=.92;
    if(name==='复古妆台'){
     const walnut=mat(0x563b2b,.58),trim=mat(0x94704b,.52),ivory=mat(0xe6d7c2,.78);box(0,.86,0,1.48,.12,.66,walnut);box(0,.92,0,1.5,.035,.68,trim);
     for(const x of [-.45,0,.45]){box(x,.68,.34,.4,.23,.045,ivory);box(x,.68,.37,.36,.19,.018,walnut);cyl(x,.68,.405,.025,.025,.045,m.gold,12)}
     for(const x of [-.58,.58])for(const z of [-.22,.22]){const leg=box(x,.25,z,.075,.48,.075,walnut);leg.rotation.z=x<0?-.12:.12;sphere(x*1.08,.48,z,.075,.055,.075,trim)}
     box(0,.48,.04,1.12,.18,.48,walnut);box(0,1.18,-.22,.14,.5,.1,walnut);
     const frame=new T.Mesh(new T.SphereGeometry(.39,28,20),trim);frame.position.set(0,1.65,-.2);frame.scale.set(1,.82,.12);group.add(frame);const mirror=new T.Mesh(new T.SphereGeometry(.34,28,20),mat(0x9eafb0,.2,.16));mirror.position.set(0,1.65,-.185);mirror.scale.set(1,.82,.1);group.add(mirror);
     for(const x of [-.3,.3])sphere(x,1.98,-.18,.045,.07,.045,m.gold);sphere(0,2.02,-.18,.075,.075,.045,m.gold);width=1.55;height=2.12;
    }else{
     // Floating contemporary vanity: offset rectangular LED mirror, suspended drawer and steel trestle.
     const porcelain=mat(0xe7dfd2,.34),oak=mat(0xc2a078,.62),steel=mat(0x6f7779,.3,.72),mirrorMat=mat(0xaec0c1,.14,.18);
     box(0,.94,0,1.42,.1,.62,porcelain);box(0,.78,.24,1.22,.26,.045,oak);box(0,.78,.27,1.14,.2,.018,mat(0xe2d3be,.8));
     for(const x of [-.43,.43]){box(x,.78,.3,.025,.025,.018,steel);cyl(x,.78,.34,.018,.018,.025,m.gold,10)}
     for(const x of [-.56,.56]){const leg=box(x,.4,0,.035,.78,.035,steel);leg.rotation.z=x*.09;box(x,.06,.04,.12,.035,.3,steel)}
     box(0,.2,0,1.08,.025,.035,steel);const frame=new T.Mesh(new T.BoxGeometry(.72,1.08,.075),oak);frame.position.set(.16,1.55,-.24);group.add(frame);const mirror=new T.Mesh(new T.BoxGeometry(.64,1,.025),mirrorMat);mirror.position.set(.16,1.55,-.19);group.add(mirror);
     const halo=new T.Mesh(new T.TorusGeometry(.38,.018,8,48),mat(0xe6d8b8,.24,.25));halo.position.set(.16,1.55,-.14);group.add(halo);
     for(const x of [-.48,.78]){box(x,1.25,-.12,.28,.035,.28,oak);const perfume=new T.Mesh(new T.CylinderGeometry(.045,.055,.16,16),mat(0x9b7862,.2,.1));perfume.position.set(x,1.35,-.12);group.add(perfume);cyl(x,1.44,-.12,.025,.025,.035,m.gold,12)}
     const cup=new T.Mesh(new T.CylinderGeometry(.065,.055,.12,20),porcelain);cup.position.set(-.52,1.08,.02);group.add(cup);
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

    width=1.96;depth=.7;height=1.34;surfaceType='table';surfaceY=1.4;
    const carcass=mat(0x694a35,.64),stone=mat(0xe4ddd0,.38),brass=mat(0xb58d56,.34,.62),glass=mat(0xb8d0d0,.18,.16),inner=mat(0x302923,.86);
    if(variant==='双门款'){
     width=1.9;depth=.72;height=1.42;surfaceY=1.48;
     box(0,.67,0,1.84,1.26,.64,carcass);box(0,1.34,0,1.98,.12,.72,stone);box(0,.13,0,1.82,.16,.62,inner);box(0,.7,-.32,1.66,1.08,.025,inner);
     for(const y of [.34,.72,1.1])box(0,y,0,1.66,.035,.58,brass);
     for(const x of [-.83,.83])box(x,.72,.345,.045,1.18,.045,carcass);
     for(const x of [-.43,.43]){
      const pane=new T.Mesh(new T.BoxGeometry(.76,1.12,.025),glass);pane.position.set(x,.72,.36);group.add(pane);
      for(const dx of [-.37,.37])box(x+dx,.72,.385,.025,1.16,.045,brass);
      for(const y of [.16,1.28])box(x,y,.385,.75,.025,.045,brass);
     }
     box(0,.72,.4,.025,1.16,.05,carcass);for(const x of [-.055,.055]){const pull=new T.Mesh(new T.TorusGeometry(.035,.009,8,20),brass);pull.position.set(x,.7,.43);group.add(pull)}
     for(const y of [.43,.81,1.19])for(let i=0;i<3;i++){const x=-.53+i*.53,plate=new T.Mesh(new T.TorusGeometry(.09,.012,8,24),mat(0xe8e0d2,.42));plate.rotation.x=Math.PI/2;plate.position.set(x,y+.07,.13);group.add(plate);const bowl=new T.Mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),m.cream);bowl.scale.set(.12,.055,.12);bowl.position.set(x,y+.09,.13);group.add(bowl)}
     for(const y of [.47,.85,1.23])for(const x of [-.73,.73]){const cup=new T.Mesh(new T.CylinderGeometry(.04,.035,.08,16),m.cream);cup.position.set(x,y,.13);group.add(cup)}
     for(const x of [-.72,.72])for(const z of [-.22,.22]){const foot=new T.Mesh(new T.CylinderGeometry(.035,.05,.14,10),carcass);foot.position.set(x,.07,z);group.add(foot)}
    }else{
     box(0,.62,0,1.9,1.14,.64,carcass);box(0,1.22,0,2.02,.12,.74,stone);box(0,.12,0,1.88,.14,.64,inner);
     for(const x of [-.62,.62]){box(x,.68,.345,.56,.88,.035,mat(0xc8aa83,.76));for(const y of [.29,1.04])box(x,y,.37,.48,.018,.018,brass);const pull=new T.Mesh(new T.TorusGeometry(.028,.008,8,18),brass);pull.position.set(x,.68,.4);group.add(pull)}
     box(0,.65,.325,.58,.82,.04,inner);for(const y of [.34,.72,1.1]){box(0,y,.28,.52,.035,.24,carcass);const bowl=new T.Mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),m.cream);bowl.scale.set(.15,.07,.15);bowl.position.set(0,y+.04,.18);group.add(bowl)}
     for(const x of [-.88,.88])for(const z of [-.22,.22]){const foot=new T.Mesh(new T.CylinderGeometry(.04,.055,.16,10),carcass);foot.position.set(x,.08,z);group.add(foot)}
    }

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

    if(variant==='陶艺摆件'){
     width=.68;depth=.68;height=1;surfaceType='tabletop';surfaceY=.04;const glaze=mat(0x9c5944,.22),unglazed=mat(0xd5b28a,.94),gold=mat(0xc49b67,.3,.5);
     const body=new T.Mesh(new T.LatheGeometry([new T.Vector2(.09,0),new T.Vector2(.16,.035),new T.Vector2(.28,.16),new T.Vector2(.34,.34),new T.Vector2(.31,.5),new T.Vector2(.2,.62),new T.Vector2(.105,.69),new T.Vector2(.09,.82)],48),glaze);body.position.y=.06;group.add(body);
     const foot=new T.Mesh(new T.TorusGeometry(.14,.025,10,36),unglazed);foot.position.y=.09;group.add(foot);const lip=new T.Mesh(new T.TorusGeometry(.095,.018,10,32),gold);lip.position.y=.88;group.add(lip);
     const loop=new T.CatmullRomCurve3([new T.Vector3(.22,.59,0),new T.Vector3(.43,.78,.02),new T.Vector3(.53,.59,.02),new T.Vector3(.45,.37,.02),new T.Vector3(.29,.33,.02)]);group.add(new T.Mesh(new T.TubeGeometry(loop,40,.047,12,false),unglazed));
     const loop2=new T.CatmullRomCurve3([new T.Vector3(-.19,.61,0),new T.Vector3(-.34,.7,.02),new T.Vector3(-.39,.53,.02),new T.Vector3(-.26,.42,.02)]);group.add(new T.Mesh(new T.TubeGeometry(loop2,24,.025,9,false),gold));
     for(let i=0;i<18;i++){const a=i*Math.PI*2/18,curve=new T.CatmullRomCurve3([new T.Vector3(Math.cos(a)*.25,.19,Math.sin(a)*.25),new T.Vector3(Math.cos(a)*.32,.36,Math.sin(a)*.32),new T.Vector3(Math.cos(a)*.25,.52,Math.sin(a)*.25)]);group.add(new T.Mesh(new T.TubeGeometry(curve,12,.009,6,false),unglazed))}
     for(let i=0;i<5;i++){const a=i*1.256,p=sphere(Math.cos(a)*.23,.55,Math.sin(a)*.23,.018,.018,.018,gold)}
    }else{
     width=.5;depth=.5;height=.88;surfaceType='tabletop';surfaceY=.04;const ceramic=mat(0xc58d70,.3),lip=mat(0xe2bda0,.28);const vase=new T.Mesh(new T.LatheGeometry([new T.Vector2(.12,0),new T.Vector2(.16,.06),new T.Vector2(.23,.2),new T.Vector2(.25,.36),new T.Vector2(.19,.52),new T.Vector2(.105,.66),new T.Vector2(.11,.72)],32),ceramic);vase.position.y=.08;group.add(vase);cyl(0,.805,0,.115,.115,.025,lip,32);
     for(let rib=0;rib<12;rib++){const a=rib*Math.PI*2/12,curve=new T.CatmullRomCurve3([new T.Vector3(Math.cos(a)*.16,.19,Math.sin(a)*.16),new T.Vector3(Math.cos(a)*.23,.39,Math.sin(a)*.23),new T.Vector3(Math.cos(a)*.15,.61,Math.sin(a)*.15)]);group.add(new T.Mesh(new T.TubeGeometry(curve,12,.006,5,false),lip))}
     for(let i=0;i<5;i++){const a=i*1.25,curve=new T.CatmullRomCurve3([new T.Vector3(0,.76,0),new T.Vector3(Math.cos(a)*.12,.95,Math.sin(a)*.12),new T.Vector3(Math.cos(a)*.22,1.12+(i%2)*.08,Math.sin(a)*.22)]);group.add(new T.Mesh(new T.TubeGeometry(curve,14,.012,6,false),m.leaf));for(let n=0;n<3;n++){const p=curve.getPoint(.45+n*.15);sphere(p.x,p.y,p.z,.09,.025,.035,n%2?m.leaf:m.leaf2)}}
    }

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
    const cushion=new T.Mesh(new T.SphereGeometry(1,28,18),fabric);cushion.position.set(0,.67,.035);cushion.scale.set(.29,.13,.33);group.add(cushion);
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

    action=()=>openFurnitureActions('cushion',id);width=.92;depth=.92;height=.27;surfaceType='floor';
    const textile=mat(0xb9a1a0,.98),side=mat(0x97847f,.98),piping=mat(0xeee1cf,.92),button=mat(0x927e6b,.94);applyPainterMap(textile,fabricMap,.03);applyPainterMap(side,fabricMap,.025);
    const shape=new T.Shape();shape.moveTo(-.39,-.34);shape.quadraticCurveTo(-.46,-.43,-.34,-.43);shape.lineTo(.34,-.43);shape.quadraticCurveTo(.46,-.43,.43,-.31);shape.lineTo(.43,.31);shape.quadraticCurveTo(.46,.43,.34,.43);shape.lineTo(-.34,.43);shape.quadraticCurveTo(-.46,.43,-.39,.31);shape.closePath();
    const pad=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.19,bevelEnabled:true,bevelSegments:5,bevelThickness:.045,bevelSize:.045,curveSegments:12}),textile);pad.position.y=.06;group.add(pad);
    box(0,.1,0,.84,.12,.84,side);
    const seamPts=[];for(const [x,z] of [[-.34,-.34],[0,-.39],[.34,-.34],[.39,0],[.34,.34],[0,.39],[-.34,.34],[-.39,0]])seamPts.push(new T.Vector3(x,.265,z));
    group.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(seamPts,true),64,.012,8,true),piping));
    for(const x of [-.24,.24])for(const z of [-.24,.24]){sphere(x,.27,z,.03,.014,.03,button);const fold=new T.CatmullRomCurve3([new T.Vector3(x*.7,.25,z*.7),new T.Vector3(x*.9,.275,z*.9),new T.Vector3(x*1.12,.24,z*1.12)]);group.add(new T.Mesh(new T.TubeGeometry(fold,12,.006,5,false),piping))}
    for(const x of [-.38,.38])for(const z of [-.38,.38]){const tassel=new T.CatmullRomCurve3([new T.Vector3(x,.12,z),new T.Vector3(x*1.04,.08,z*1.04),new T.Vector3(x*1.06,.025,z*1.06)]);group.add(new T.Mesh(new T.TubeGeometry(tassel,8,.012,5,false),piping))}

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

    action=()=>openFurnitureActions('sofa',id);
    if(variant==='弧形休闲长凳'){
     width=2.42;depth=1.42;height=1.08;const timber=mat(0x76513a,.58),cushionMat=mat(0xcbbda9,.97),piping=mat(0x9b8068,.82),brass=mat(0x9b805f,.42,.55);
     const plan=new T.Shape();plan.moveTo(-1.13,.42);plan.quadraticCurveTo(-1.06,-.5,0,-.64);plan.quadraticCurveTo(1.06,-.5,1.13,.42);plan.quadraticCurveTo(.58,.13,0,.08);plan.quadraticCurveTo(-.58,.13,-1.13,.42);plan.closePath();
     const deck=new T.ExtrudeGeometry(plan,{depth:.16,bevelEnabled:true,bevelSegments:4,bevelThickness:.045,bevelSize:.045,curveSegments:24});deck.rotateX(Math.PI/2);deck.translate(0,.58,0);group.add(new T.Mesh(deck,timber));
     const pad=new T.Shape();pad.moveTo(-1.04,.34);pad.quadraticCurveTo(-.96,-.43,0,-.55);pad.quadraticCurveTo(.96,-.43,1.04,.34);pad.quadraticCurveTo(.53,.12,0,.1);pad.quadraticCurveTo(-.53,.12,-1.04,.34);pad.closePath();
     const padGeo=new T.ExtrudeGeometry(pad,{depth:.13,bevelEnabled:true,bevelSegments:5,bevelThickness:.055,bevelSize:.055,curveSegments:28});padGeo.rotateX(Math.PI/2);padGeo.translate(0,.7,0);group.add(new T.Mesh(padGeo,cushionMat));
     // Curved upholstered back follows the bench arc; five stitched cushions articulate its shape.
     const backCurve=new T.CatmullRomCurve3([new T.Vector3(-1.1,.74,.32),new T.Vector3(-.86,.9,-.35),new T.Vector3(-.42,1.02,-.57),new T.Vector3(0,1.05,-.62),new T.Vector3(.42,1.02,-.57),new T.Vector3(.86,.9,-.35),new T.Vector3(1.1,.74,.32)]);
     group.add(new T.Mesh(new T.TubeGeometry(backCurve,64,.075,16,false),cushionMat));
     const backTrim=new T.CatmullRomCurve3(backCurve.points.map(p=>new T.Vector3(p.x,p.y-.09,p.z+.015)));group.add(new T.Mesh(new T.TubeGeometry(backTrim,64,.014,8,false),piping));
     for(let i=0;i<7;i++){const x=-.9+i*.3,seatSeam=new T.CatmullRomCurve3([new T.Vector3(x-.1,.73,.16),new T.Vector3(x,.75,-.08),new T.Vector3(x+.1,.73,-.29)]);group.add(new T.Mesh(new T.TubeGeometry(seatSeam,14,.007,6,false),piping));sphere(x,.97,-.55,.018,.018,.018,brass)}
     for(const x of [-.88,.88])for(const z of [-.35,.25]){const leg=new T.Mesh(new T.CylinderGeometry(.045,.065,.46,14),timber);leg.position.set(x,.25,z);leg.rotation.z=x*.06;group.add(leg);cyl(x,.06,z,.06,.06,.025,brass,12)}
     for(const x of [-.7,-.35,0,.35,.7]){const support=box(x,.43,-.16,.045,.3,.045,timber);support.rotation.x=-.12}
     const frontTrim=new T.CatmullRomCurve3([new T.Vector3(-1.08,.59,.42),new T.Vector3(-.6,.58,.55),new T.Vector3(0,.58,.58),new T.Vector3(.6,.58,.55),new T.Vector3(1.08,.59,.42)]);group.add(new T.Mesh(new T.TubeGeometry(frontTrim,48,.025,8,false),brass));
    }else{
     width=1.05;depth=1.9;height=.95;const frame=mat(0x76543a,.62),canvas=mat(0xc5b49d,.94),webbing=mat(0x9c8b75,.9);
     for(const x of [-.43,.43]){const rail=box(x,.32,0,.065,.55,1.7,frame);rail.rotation.x=.02;for(const z of [-.64,-.3,.08,.46]){const pin=box(x,.56,z,.08,.06,.07,m.oak);pin.rotation.z=x*.12}for(const z of [-.64,-.3,.08,.46])box(x,.28,z,.07,.045,.055,brass)}
     box(0,.58,.22,.82,.12,1.16,canvas);const back=box(0,.82,-.55,.82,.12,.72,canvas);back.rotation.x=-.42;
     for(let x=-.3;x<=.301;x+=.2){const seam=box(x,.65,.22,.012,.012,1.05,webbing);const backSeam=box(x,.89,-.55,.012,.012,.66,webbing);backSeam.rotation.x=-.42}
     const head=sphere(0,.91,-.72,.34,.11,.18,m.cream);head.rotation.x=-.4;
     for(const x of [-.48,.48]){box(x,.7,-.03,.075,.08,.58,frame);box(x,.63,-.28,.06,.3,.06,frame)}
     for(const z of [-.72,-.3,.12,.54]){const cross=box(0,.31,z,.82,.035,.045,frame)}
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
    const isDefault=variant==='基础白橡木平板门',isGlass=variant==='白橡木玻璃门',isCream=variant==='奶油法式双线门',isRattan=variant==='藤编门',isSliding=variant==='深色格栅推拉门',isArch=variant==='复古拱顶门';
    const timber=mat(isDefault?0xd4bd98:isCream?0xe4d5bd:isGlass?0xb28d60:isRattan?0x9a7047:isSliding?0x554a42:isArch?0x876047:0x76513a,.66),panel=mat(isDefault?0xe9dfcf:isCream?0xf0e6d7:isRattan?0xc49a68:isSliding?0x75675b:isArch?0xb28a63:0xa9845e,.82),shadow=mat(0x4b3426,.86),glass=mat(0x9db9b7,.22,.12),brass=mat(0xc5a15d,.42,.45);
    box(-.62,1.2,0,.12,2.4,.2,timber);box(.62,1.2,0,.12,2.4,.2,timber);box(0,2.38,0,1.36,.14,.2,timber);box(0,1.2,.035,1.08,2.22,.075,shadow);box(0,1.2,.08,1.02,2.16,.055,panel);
    if(isDefault){
     // Plain white-oak slab with three fine shadow grooves, unlike the raised walnut panels.
     box(0,1.2,.12,.9,2.08,.025,panel);
     for(const y of [.48,1.2,1.92]){box(0,y,.145,.84,.012,.012,timber);box(0,y+.045,.146,.84,.012,.012,m.cream)}
     for(const x of [-.43,.43])box(x,1.2,.145,.018,1.98,.018,timber);
     const handle=new T.Mesh(new T.CylinderGeometry(.018,.018,.2,12),mat(0x42494a,.28,.7));handle.rotation.x=Math.PI/2;handle.position.set(.4,1.12,.19);group.add(handle);
    }else if(isGlass){
     box(0,1.58,.12,.76,1.08,.04,glass);box(0,2.16,.145,.84,.07,.055,timber);box(0,1.0,.145,.84,.07,.055,timber);for(const x of [-.39,0,.39])box(x,1.57,.16,.025,1.12,.035,timber);
    }else if(isRattan){
     box(0,1.2,.12,.82,1.58,.045,shadow);
     for(let y=.48;y<=1.92;y+=.1)for(let x=-.36;x<=.36;x+=.1){const a=box(x,y,.15,.018,.018,.025,brass);a.rotation.z=.68;const b=box(x,y,.155,.018,.018,.025,timber);b.rotation.z=-.68}
    }else if(isSliding){
     box(-.24,1.2,.14,.48,2.0,.04,timber);box(.24,1.2,.17,.48,2.0,.04,panel);for(let x=-.4;x<=.4;x+=.13)box(x,1.2,.205,.035,1.92,.025,shadow);box(0,2.27,.12,1.12,.08,.07,brass);
    }else{
     for(const y of [.53,1.18,1.86]){const ph=y===1.18?.42:.5,ww=isCream?.84:.78;box(0,y,.115,ww,ph,.045,isCream?brass:timber);box(0,y,.143,ww-.08,ph-.08,.018,panel);if(isCream)box(0,y,.158,ww-.17,ph-.17,.012,panel)}
     if(isArch){const arch=new T.Mesh(new T.TorusGeometry(.43,.045,8,28,Math.PI),timber);arch.position.set(0,2.13,.16);arch.rotation.z=Math.PI;group.add(arch)}
    }
    if(!isDefault){cyl(.39,1.18,.16,.065,.065,.025,brass,18);box(.47,1.18,.19,.19,.035,.035,brass);cyl(.39,.94,.16,.035,.035,.025,m.metal,14)}
    const labelCanvas=document.createElement('canvas');labelCanvas.width=640;labelCanvas.height=192;const labelTexture=new T.CanvasTexture(labelCanvas);labelTexture.encoding=T.sRGBEncoding;
    const labelMesh=new T.Mesh(new T.PlaneGeometry(.96,.29),new T.MeshBasicMaterial({map:labelTexture,transparent:true,side:T.DoubleSide,depthWrite:false}));labelMesh.position.set(0,2.32,.215);group.add(labelMesh);
    group.userData.doorDestinationCanvas=labelCanvas;group.userData.doorDestinationTexture=labelTexture;group.userData.doorDestinationLabel=labelMesh;group.userData.doorVariant=variant||'基础白橡木平板门';

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

    width=1.48;depth=.66;height=1.18;surfaceType='table';surfaceY=1.2;
    const carcass=mat(0x9a704d,.68),oak=mat(0xc39a70,.62),dark=mat(0x302923,.92),sole=mat(0xd8cfc0,.94),stitch=mat(0xe0d0b7,.9),leathers=[mat(0x493b34,.78),mat(0x263b46,.72),mat(0x8a5b43,.8),mat(0x6d6c62,.84)];
    // Open-front construction: separate panels replace the old solid cabinet block,
    // so the shoes and the interior remain visible from the room-facing side (+Z).
    box(0,1.13,0,1.5,.1,.68,oak);
    box(0,.045,0,1.44,.09,.64,dark);
    box(0,.59,-.292,1.34,1.02,.045,dark);
    for(const x of [-.69,.69])box(x,.59,0,.1,1.08,.66,carcass);
    for(const y of [.22,.54,.86]){
     box(0,y,0,1.28,.055,.59,oak);
     box(0,y+.033,.285,1.28,.022,.025,carcass);
     // A narrow dark reveal makes each open compartment read as a separate cubby.
     box(0,y+.07,-.263,1.24,.018,.012,mat(0x211d1a,.98));
    }
    function shoe(x,y,z,idx,side){
     const upper=leathers[idx%leathers.length];
     const soleMesh=new T.Mesh(new T.SphereGeometry(1,24,16),sole);
     soleMesh.position.set(x,y+.022,z);soleMesh.scale.set(.092,.026,.19);group.add(soleMesh);
     const vamp=sphere(x,y+.075,z-.018,.091,.068,.165,upper);vamp.rotation.x=-.08;
     sphere(x,y+.078,z+.105,.079,.052,.086,upper);
     box(x,y+.095,z-.145,.12,.078,.072,upper);
     const tongue=box(x,y+.139,z-.018,.052,.014,.105,stitch);tongue.rotation.x=-.12;
     for(let k=0;k<4;k++){
      const lace=box(x,y+.151,z+.035-k*.031,.066,.008,.012,stitch);
      lace.rotation.y=(k-1.5)*.12;
     }
     for(const sx of [-1,1])for(let k=0;k<2;k++)sphere(x+sx*.061,y+.128,z-.05+k*.045,.009,.009,.009,oak);
     // Contrasting heel tab and side stripe improve silhouette recognition at game-camera distance.
     box(x,y+.091,z+.158,.055,.018,.018,side?stitch:oak);
     const stripe=box(x+side*.066,y+.105,z-.005,.012,.012,.12,stitch);stripe.rotation.x=-.08;
    }
    // Three fully open shelves; two individually modeled shoes sit above each shelf.
    const shelfYs=[.22,.54,.86];
    for(let row=0;row<3;row++){
     const shoeY=shelfYs[row]+.055;
     shoe(-.31,shoeY,.095,row, -1);
     shoe(-.105,shoeY,.095,row+1,1);
     shoe(.105,shoeY,.095,row+2,-1);
     shoe(.31,shoeY,.095,row+3,1);
     for(const x of [-.57,.57]){
      const pin=cyl(x,shelfYs[row]+.105,.305,.012,.012,.025,m.gold,10);
      pin.rotation.x=Math.PI/2;
     }
    }
    for(const x of [-.55,.55])for(const z of [-.23,.23]){
     const foot=new T.Mesh(new T.CylinderGeometry(.045,.06,.13,12),dark);
     foot.position.set(x,.065,z);group.add(foot);
    }
    // No doors, opaque front fascia, or decorative objects cover the shoes.
   }else if(modelName==='沙发床'){

    width=2.42;depth=2.58;height=1.12;action=()=>openFurnitureActions('sofa',id);
    const frame=mat(0x604735,.62),upholstery=mat(0xb8a99a,.97),seatMat=mat(0xd8cbb9,.98),pillowMat=mat(0xe8dfd1,.98),piping=mat(0x8c7562,.86),metal=mat(0x786b5d,.48,.4);
    const plush=(x,y,z,sx,sy,sz,material,rz=0)=>{const o=new T.Mesh(new T.SphereGeometry(1,32,22),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.z=rz;group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
    box(0,.22,-.02,2.24,.2,1.48,frame);box(0,.35,.02,2.2,.1,1.43,metal);box(0,.48,.12,2.1,.2,1.08,seatMat);
    // The pull-out bed is visibly extended as a separate lower deck with its own mattress and piping.
    box(0,.31,1.02,2.1,.12,.72,frame);box(0,.43,1.02,2.04,.18,.68,seatMat);
    for(const x of [-.96,.96]){plush(x,.64,.02,.16,.34,.76,upholstery);plush(x,.83,.03,.15,.11,.64,seatMat);const seam=new T.CatmullRomCurve3([new T.Vector3(x,.35,-.34),new T.Vector3(x,.76,-.34),new T.Vector3(x,.88,-.12),new T.Vector3(x,.86,.22),new T.Vector3(x,.7,.4)]);group.add(new T.Mesh(new T.TubeGeometry(seam,28,.01,7,false),piping))}
    box(0,.62,-.61,2.18,.74,.2,frame);box(0,.7,-.49,2.08,.58,.16,upholstery);
    for(const x of [-.52,.52]){const back=plush(x,.88,-.34,.47,.25,.14,upholstery,x<0?-.05:.05);back.rotation.x=-.12;const seam=new T.CatmullRomCurve3([new T.Vector3(x-.39,.86,-.205),new T.Vector3(x-.2,.96,-.19),new T.Vector3(x,.98,-.19),new T.Vector3(x+.2,.96,-.19),new T.Vector3(x+.39,.86,-.205)]);group.add(new T.Mesh(new T.TubeGeometry(seam,24,.009,6,false),piping));plush(x,.98,-.08,.25,.09,.12,pillowMat,x<0?-.12:.12)}
    for(let i=0;i<6;i++){const x=-.82+i*.328,stitch=new T.CatmullRomCurve3([new T.Vector3(x,.59,.56),new T.Vector3(x,.61,.82),new T.Vector3(x,.59,1.24)]);group.add(new T.Mesh(new T.TubeGeometry(stitch,12,.006,5,false),piping))}
    for(const x of [-.94,.94])for(const z of [-.62,.62]){const foot=new T.Mesh(new T.CylinderGeometry(.045,.06,.2,12),frame);foot.position.set(x,.1,z);group.add(foot)}
    box(0,.27,1.38,1.86,.06,.035,frame);for(const x of [-.82,.82]){const wheel=new T.Mesh(new T.TorusGeometry(.055,.018,8,18),metal);wheel.rotation.y=Math.PI/2;wheel.position.set(x,.12,1.2);group.add(wheel)}
    for(const x of [-.72,-.36,0,.36,.72])box(x,.54,1.02,.012,.012,.52,piping);

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

    action=()=>openFurnitureActions('window',id);width=2.2;depth=.2;height=2.12;wallAxis='x';wallSide='back';anchor=[0,2.65];
    if(variant==='拱顶白橡木窗'){
     addWindowSun(parent,group,2.65);addWindowView(group,2.6,1.82,1.78);
     const frame=mat(0xd1b990,.58),inner=mat(0x8b704f,.64),glass=mat(0x9ebfc4,.16,.12);glass.transparent=true;glass.opacity=.46;
     const arch=new T.Shape();arch.moveTo(-1.02,-.88);arch.lineTo(-1.02,.48);arch.quadraticCurveTo(-1.02,1.02,0,1.02);arch.quadraticCurveTo(1.02,1.02,1.02,.48);arch.lineTo(1.02,-.88);arch.closePath();
     const geo=new T.ExtrudeGeometry(arch,{depth:.14,bevelEnabled:true,bevelSegments:3,bevelThickness:.025,bevelSize:.025,curveSegments:28});geo.translate(0,1.12,0);group.add(new T.Mesh(geo,frame));
     const paneShape=new T.Shape();paneShape.moveTo(-.88,-.78);paneShape.lineTo(-.88,.46);paneShape.quadraticCurveTo(-.88,.86,0,.86);paneShape.quadraticCurveTo(.88,.86,.88,.46);paneShape.lineTo(.88,-.78);paneShape.closePath();
     const pane=new T.Mesh(new T.ShapeGeometry(paneShape,32),glass);pane.position.set(0,1.12,.15);group.add(pane);
     box(0,.19,.2,2.16,.13,.34,frame);box(0,.27,.22,2.02,.035,.28,inner);box(0,1.1,.18,.035,1.82,.04,frame);
     for(const x of [-.43,.43])box(x,1.06,.19,.025,1.55,.035,frame);for(const y of [.62,1.15,1.68])box(0,y,.19,1.68,.025,.035,frame);
     const trim=new T.Mesh(new T.TorusGeometry(.88,.025,8,48,Math.PI),inner);trim.position.set(0,1.58,.2);trim.rotation.z=Math.PI;group.add(trim);
     for(const x of [-.96,.96]){box(x,1.1,.18,.07,1.92,.08,frame);for(const y of [.35,1.85])cyl(x,y,.24,.025,.025,.025,m.gold,10)}
    }else{addWindowSun(parent,group,2.65);addWindowView(group,2.6,2.1,1.85);const style=variant==='法式六格窗'?'french':variant==='日式障子窗'?'shoji':variant==='工业黑框窗'?'industrial':variant==='横向推拉窗'?'sliding':'casement';const frame=variant==='工业黑框窗'?mat(0x30383d,.38,.72):variant==='日式障子窗'?mat(0x9b7956,.7):m.oak;addOpenCasementWindow(group,frame,style);addWindowDressing(group,2.1,1.85,variant==='日式障子窗'?0xe5d8c1:0xc7b7a4,2.6)}

   }else if(modelName==='上床下桌'){
    // Full loft-bed workstation: four structural posts, guarded upper bunk, ladder,
    // mattress and bedding above a usable desk with drawers and task lighting.
    width=3.0;depth=2.22;height=2.92;anchor=[0,0,2.48];action=()=>openFurnitureActions('bed',id);
    const frame=mat(0x806044,.58),frameEdge=mat(0xb18a61,.56),darkMetal=mat(0x46515a,.42,.62),bedding=mat(0xd8d0c3,.98),sheet=mat(0xeee5d8,.98),deskTop=mat(0xc7a77e,.56),deskFront=mat(0x8a6848,.62),accent=mat(0xb99a69,.42,.48),fabricMat=mat(0xb7a7a0,.98);
    applyPainterMap(frame,woodMap,.012);applyPainterMap(frameEdge,woodMap,.012);applyPainterMap(bedding,fabricMap,.022);applyPainterMap(sheet,fabricMap,.018);applyPainterMap(deskTop,woodMap,.01);
    // Main posts and continuous perimeter beams.
    for(const x of [-1.36,1.36])for(const z of [-.91,.91]){
     box(x,1.43,z,.14,2.82,.14,frame);
     box(x,2.78,z,.2,.12,.2,frameEdge);
     box(x,.12,z,.2,.24,.2,darkMetal);
     box(x,2.58,z,.19,.12,.19,accent);
    }
    box(0,2.72,-.91,2.78,.16,.16,frameEdge);
    box(0,2.72,.91,2.78,.16,.16,frameEdge);
    box(-1.36,2.72,0,.16,.16,1.82,frameEdge);
    box(1.36,2.72,0,.16,.16,1.82,frameEdge);
    // Slatted bunk deck, mattress, fitted sheet, folded duvet and pillows.
    box(0,2.14,0,2.62,.14,1.78,frame);
    for(let z=-.78;z<=.781;z+=.18)box(0,2.23,z,2.52,.035,.12,frameEdge);
    box(0,2.34,-.02,2.52,.22,1.66,bedding);
    box(0,2.48,-.02,2.42,.08,1.58,sheet);
    box(0,2.56,.38,2.35,.12,.76,bedding);
    const pillow=new T.Mesh(new T.SphereGeometry(1,24,16),sheet);pillow.position.set(-.78,2.59,0);pillow.scale.set(.25,.1,.48);group.add(pillow);pillow.castShadow=true;
    // Guardrails with vertical balusters; a deliberate opening remains beside the ladder.
    box(0,2.65,-.91,2.62,.22,.1,frameEdge);
    for(const x of [-1.25,-.98,-.71,-.44,-.17,.1,.37,.64,.91,1.18])box(x,2.55,-.91,.045,.36,.045,frame);
    box(1.36,2.65,0,.1,.22,1.72,frameEdge);
    for(let z=-.72;z<=.721;z+=.24)box(1.36,2.55,z,.045,.36,.045,frame);
    // Front guardrail is split to keep a safe access gap at the ladder.
    box(-.62,2.65,.91,1.42,.22,.1,frameEdge);
    box(.91,2.65,.91,.82,.22,.1,frameEdge);
    for(const x of [-1.2,-.92,-.64,.64,.92,1.2])box(x,2.55,.91,.045,.36,.045,frame);
    // Angled ladder, broad anti-slip treads and metal fixing brackets.
    const ladderRail=(x)=>{const rail=box(x,.99,.86,.085,2.05,.1,frameEdge);rail.rotation.x=-.12;rail.rotation.z=x<0?.08:-.08;return rail};
    ladderRail(-1.18);ladderRail(-.62);
    for(let i=0;i<6;i++){
     const y=.32+i*.36,z=1.03-i*.025;
     const rung=box(-.9,y,z,.62,.075,.12,frame);
     for(let k=0;k<4;k++)box(-1.12+k*.15,y+.041,z+.066,.09,.012,.018,darkMetal);
    }
    // Lower workstation: full-width desk, two drawers, knee space and side shelving.
    for(const x of [-1.18,1.18])for(const z of [-.08,.68])box(x,.76,z,.085,1.42,.085,frame);
    box(0,1.48,.28,2.52,.14,.82,deskTop);
    box(0,1.39,.28,2.48,.045,.78,deskFront);
    for(const x of [-.78,.78]){
     box(x,1.16,.68,.72,.38,.08,deskFront);
     box(x,1.16,.73,.62,.27,.035,deskTop);
     for(const y of [1.08,1.24])box(x,y,.755,.42,.012,.012,accent);
     box(x,1.16,.79,.09,.025,.025,accent);
    }
    // Side book cubbies and a low foot rail.
    for(const x of [-1.27,1.27]){
     box(x,1.72,-.34,.12,.42,.58,frame);
     box(x,1.91,-.34,.13,.035,.58,frameEdge);
     for(let j=0;j<3;j++){const book=box(x+(j-1)*.025,1.78,-.5+j*.14,.035,.28,.09,[fabricMat,accent,deskTop][j]);book.rotation.z=(j-1)*.07}
    }
    box(0,.22,.84,1.18,.08,.08,frame);
    // Integrated task lamp and cable channel on the rear desk edge.
    box(.92,1.62,-.02,.045,.28,.045,darkMetal);
    const lampArm=box(.92,1.76,.04,.045,.045,.24,darkMetal);lampArm.rotation.x=.3;
    const shade=new T.Mesh(new T.CylinderGeometry(.12,.18,.12,20),accent);shade.position.set(.92,1.78,.16);group.add(shade);
    box(0,1.57,-.08,2.24,.025,.055,darkMetal);
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

    width=1.52;depth=.7;height=1.92;surfaceType='table';surfaceY=1.96;
    const walnut=mat(0x4b3024,.55),inner=mat(0x261d19,.86),trim=mat(0xb28b56,.34,.62),glass=mat(0xc8dfe0,.12,.18),labels=mat(0xe6d8bd,.86),bottles=[mat(0x244a39,.2,.22),mat(0x59352d,.2,.2),mat(0x314b50,.18,.2)];
    glass.transparent=true;glass.opacity=.42;
    box(0,.94,0,1.44,1.82,.62,walnut);box(0,1.86,0,1.56,.12,.72,trim);box(0,.08,0,1.46,.16,.66,walnut);box(0,.96,-.31,1.3,1.68,.025,inner);
    for(const y of [.22,.72,1.22])box(0,y,0,1.32,.045,.58,trim);
    for(const x of [-.67,.67])box(x,.98,.34,.045,1.76,.045,trim);
    for(const x of [-.32,.32]){const pane=new T.Mesh(new T.BoxGeometry(.62,1.58,.018),glass);pane.position.set(x,.98,.345);group.add(pane);for(const dx of [-.31,.31])box(x+dx,.98,.37,.018,1.62,.04,trim);for(const y of [.19,1.77])box(x,y,.37,.62,.018,.04,trim)}
    box(0,.98,.38,.025,1.62,.04,walnut);for(const x of [-.055,.055])cyl(x,.98,.41,.012,.012,.055,trim,10);
    function bottle(x,y,z,i){
     const bm=bottles[i%3],foil=mat(i%2?0x9b3937:0xb48b4d,.3,.5);
     const body=new T.Mesh(new T.CylinderGeometry(.065,.065,.23,20),bm);body.rotation.x=Math.PI/2;body.position.set(x,y,z-.025);group.add(body);
     sphere(x,y,z+.09,.065,.065,.055,bm);
     const neck=new T.Mesh(new T.CylinderGeometry(.026,.035,.12,16),bm);neck.rotation.x=Math.PI/2;neck.position.set(x,y,z+.18);group.add(neck);
     const cap=new T.Mesh(new T.CylinderGeometry(.029,.029,.025,16),foil);cap.rotation.x=Math.PI/2;cap.position.set(x,y,z+.245);group.add(cap);
     box(x,y,z+.055,.08,.07,.008,labels);box(x,y,z+.06,.04,.009,.004,foil);
     for(const side of [-1,1]){const rest=new T.Mesh(new T.TorusGeometry(.077,.008,6,18,Math.PI),trim);rest.rotation.x=Math.PI/2;rest.position.set(x,y-.025,z-.12);group.add(rest)}
    }
    // Bottles lie on three internal racks, labels facing the glass doors.
    for(let row=0;row<3;row++){const y=.34+row*.5;for(let i=0;i<3;i++)bottle(-.43+i*.43,y,.04,row+i)}
    // Stemware hangs below the top shelf, also inside the cabinet.
    for(let i=0;i<4;i++){const x=-.48+i*.32,stem=new T.Mesh(new T.CylinderGeometry(.008,.008,.13,8),glass);stem.position.set(x,1.74,.12);group.add(stem);const bowl=sphere(x,1.65,.12,.052,.07,.052,glass);const foot=new T.Mesh(new T.CylinderGeometry(.032,.032,.01,12),glass);foot.position.set(x,1.82,.12);group.add(foot)}
    for(const x of [-.58,.58])for(const z of [-.24,.24]){const foot=new T.Mesh(new T.CylinderGeometry(.045,.06,.12,12),walnut);foot.position.set(x,.06,z);group.add(foot)}

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
   }else if(modelName==='抽象几何装饰画'){
    action=()=>openFurnitureActions('wallArt',id);
    width=1.18;depth=.16;height=1.02;wallAxis='x';wallSide='back';anchor=[0,2.02];
    const frame=mat(0x584637,.58),matte=mat(0xe7ddca,.94),terracotta=mat(0xb86e53,.82),ink=mat(0x344b50,.78),ochre=mat(0xc29a57,.58,.18),sage=mat(0x899486,.9);
    box(0,0,0,1.18,1.02,.1,frame);box(0,0,.058,1.08,.92,.025,ochre);box(0,0,.075,1.02,.86,.018,matte);
    const circle=new T.Mesh(new T.CircleGeometry(.26,48),terracotta);circle.position.set(-.22,.18,.091);group.add(circle);
    const arc=new T.Mesh(new T.TorusGeometry(.31,.055,10,56,Math.PI*1.2),ink);arc.position.set(.16,-.04,.1);arc.rotation.z=.42;group.add(arc);
    const shape=new T.Shape();shape.moveTo(-.42,-.32);shape.lineTo(-.04,.34);shape.lineTo(.18,-.32);shape.closePath();
    const triangle=new T.Mesh(new T.ShapeGeometry(shape),sage);triangle.position.set(.12,-.05,.096);group.add(triangle);
    box(0,-.405,.1,.64,.018,.012,ink);
   }else if(modelName==='植物标本框画'){
    action=()=>openFurnitureActions('wallArt',id);
    width=.82;depth=.15;height=1.28;wallAxis='x';wallSide='back';anchor=[0,2.08];
    const frame=mat(0x76563d,.62),linen=mat(0xe9dfcf,.96),brass=mat(0xb99a68,.4,.55),stem=mat(0x667a58,.92),leafA=mat(0x78916b,.92),leafB=mat(0xa2a77b,.94);
    box(0,0,0,.82,1.28,.09,frame);box(0,0,.052,.72,1.18,.018,brass);box(0,0,.066,.66,1.12,.012,linen);
    for(let i=0;i<5;i++){
     const x=-.2+i*.1,lean=(i-2)*.035;
     const branch=box(x*.45,.02,.082,.012,.72,.012,stem);branch.rotation.z=lean;
     for(let j=0;j<4;j++){
      const side=j%2?1:-1,y=-.22+j*.13,leaf=sphere(x*.45+side*.09+lean*y,y,.09,.055,.13,.014,j%2?leafA:leafB);leaf.rotation.z=side*.62+lean;
     }
     sphere(x*.45,.39,.09,.026,.026,.014,mat(0xb98c72,.94));
    }
    box(0,.61,.06,.48,.018,.012,brass);
   }else if(modelName==='手工编织墙饰'){
    action=()=>openFurnitureActions('wallArt',id);
    width=1.12;depth=.2;height=1.48;wallAxis='x';wallSide='back';anchor=[0,2.12];
    const dowel=mat(0x79583c,.62),yarn=mat(0xd8c5a7,.98),yarnDark=mat(0xa98b69,.98),accent=mat(0x9b7467,.96);
    box(0,.64,0,1.02,.055,.065,dowel);
    for(let i=0;i<17;i++){
     const x=-.47+i*.059;
     const length=.68+(i%5)*.075,material=i%4===0?accent:(i%2?yarn:yarnDark);
     const strand=box(x,.28-length*.08,.045,.026,length,.024,material);strand.rotation.z=(i-8)*.012;
     if(i%3===0){const knot=sphere(x,.58,.055,.035,.035,.03,material);knot.rotation.z=.3}
    }
    for(let i=0;i<11;i++){
     const x=-.38+i*.076,drop=.22+(i%4)*.045;
     const tassel=box(x,-.32-drop*.28,.04,.035,drop,.03,i%2?yarnDark:yarn);tassel.rotation.z=(i-5)*.025;
     sphere(x,-.32-drop*.58,.04,.045,.055,.035,i%2?yarnDark:yarn);
    }
    for(const x of [-.48,.48])sphere(x,.64,.015,.035,.035,.035,dowel);
   }else if(modelName==='复古黄铜壁饰'){
    action=()=>openFurnitureActions('wallArt',id);
    width=1.18;depth=.17;height=.92;wallAxis='x';wallSide='back';anchor=[0,2.02];
    const brass=mat(0xb28a4f,.32,.72),aged=mat(0x806747,.48,.58),back=mat(0x3e4947,.76);
    box(0,0,0,1.12,.84,.07,back);
    const medallion=sphere(0,0,.07,.24,.24,.045,brass);
    const inner=new T.Mesh(new T.TorusGeometry(.31,.022,8,64),aged);inner.position.set(0,0,.08);group.add(inner);
    const outer=new T.Mesh(new T.TorusGeometry(.39,.016,8,64),brass);outer.position.set(0,0,.08);group.add(outer);
    for(let i=0;i<24;i++){
     const a=i*Math.PI*2/24,len=i%2?.23:.31;
     const ray=box(Math.cos(a)*(.39+len/2),Math.sin(a)*(.39+len/2),.075,.018,len,.018,i%3?brass:aged);ray.rotation.z=a-Math.PI/2;
     sphere(Math.cos(a)*.68,Math.sin(a)*.68,.075,.024,.024,.018,brass);
    }
    const hub=new T.Mesh(new T.TorusGeometry(.13,.012,7,40),brass);hub.position.set(0,0,.12);group.add(hub);
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
   }else if(modelName==='凳子'){

    width=variant==='软包脚凳'?.98:.66;depth=variant==='软包脚凳'?.82:.66;height=variant==='软包脚凳'?.5:.72;action=()=>openFurnitureActions('chair',id);
    const timber=mat(0x76543d,.62),seat=mat(0xc9b89f,.96),brass=mat(0x9b805f,.48,.55);
    if(variant==='软包脚凳'){
     const upholstery=mat(0xd8cbb9,.98),piping=mat(0x9f8972,.88),shadow=mat(0x493a30,.82);
     box(0,.16,0,.82,.2,.66,timber);box(0,.27,0,.86,.09,.7,shadow);
     const cushion=new T.Mesh(new T.SphereGeometry(1,32,20),upholstery);cushion.position.y=.39;cushion.scale.set(.49,.13,.41);group.add(cushion);
     const seam=new T.CatmullRomCurve3([new T.Vector3(-.44,.39,-.18),new T.Vector3(-.3,.48,-.34),new T.Vector3(0,.5,-.39),new T.Vector3(.3,.48,-.34),new T.Vector3(.44,.39,-.18),new T.Vector3(.44,.39,.18),new T.Vector3(.3,.48,.34),new T.Vector3(0,.5,.39),new T.Vector3(-.3,.48,.34),new T.Vector3(-.44,.39,.18)],true);group.add(new T.Mesh(new T.TubeGeometry(seam,48,.012,7,true),piping));
     for(const x of [-.18,.18])for(const z of [-.15,.15]){sphere(x,.51,z,.025,.012,.025,brass);const tuft=new T.CatmullRomCurve3([new T.Vector3(x-.06,.47,z),new T.Vector3(x,.49,z),new T.Vector3(x+.06,.47,z)]);group.add(new T.Mesh(new T.TubeGeometry(tuft,10,.005,5,false),piping))}
     for(const x of [-.34,.34])for(const z of [-.27,.27]){const leg=new T.Mesh(new T.CylinderGeometry(.045,.065,.25,12),timber);leg.position.set(x,.125,z);leg.rotation.z=x*.1;group.add(leg);cyl(x,.035,z,.055,.055,.025,brass,10)}
     box(0,.08,0,.68,.035,.52,brass);
    }else{
     cyl(0,.57,0,.34,.34,.13,timber,32);cyl(0,.655,0,.33,.33,.07,seat,32);const piping=new T.Mesh(new T.TorusGeometry(.315,.012,8,40),brass);piping.rotation.x=Math.PI/2;piping.position.y=.69;group.add(piping);
     for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a),z=Math.sin(a),leg=box(x*.19,.29,z*.19,.075,.58,.075,timber);leg.rotation.z=-x*.13;leg.rotation.x=z*.13;sphere(x*.29,.055,z*.29,.055,.045,.055,brass)}
     const ring=new T.Mesh(new T.TorusGeometry(.22,.025,8,32),timber);ring.rotation.x=Math.PI/2;ring.position.y=.29;group.add(ring);for(let i=0;i<8;i++){const a=i*Math.PI/4;sphere(Math.cos(a)*.29,.67,Math.sin(a)*.29,.018,.018,.018,brass)}
    }

   }else if(modelName==='空气净化器'){
    width=.68;depth=.62;height=1.48;
    const shell=mat(0xd9d7cc,.72),front=mat(0xece9df,.88),dark=mat(0x46545a,.72),metal=mat(0x9b9d94,.48,.35);
    // Tall quiet appliance with a curved crown, recessed intake and a readable control deck.
    box(0,.72,0,.58,1.34,.5,shell);
    box(0,1.39,-.015,.61,.08,.53,front);
    const crown=new T.Mesh(new T.CylinderGeometry(.29,.29,.08,40),front);crown.position.set(0,1.43,0);group.add(crown);
    box(0,.72,.257,.43,.82,.018,dark);
    for(let row=0;row<17;row++)box(0,.36+row*.044,.272,.37,.012,.012,metal);
    const display=box(0,1.19,.276,.18,.09,.014,mat(0x263e48,.3));
    display.material.emissive=new T.Color(0x315a63);display.material.emissiveIntensity=.22;
    for(let x=-1;x<=1;x++)sphere(x*.09,1.19,.29,.012,.012,.012,mat(0x9dc6b7,.35));
    for(const x of [-.2,.2])box(x,.18,0,.035,.12,.035,metal);
    cyl(0,.055,0,.2,.2,.07,dark,32);
    box(0,.68,-.257,.32,.56,.012,front);
    for(let row=0;row<12;row++)box(0,.43+row*.04,-.267,.26,.008,.008,metal);
   }else if(modelName==='智能音响'){
    width=.64;depth=.58;height=.78;
    const fabric=mat(0x6c7772,.98),top=mat(0x343e40,.42),trim=mat(0xb49a70,.42,.42);
    // Compact fabric-wrapped speaker, circular acoustic drivers and a tactile top ring.
    const body=new T.Mesh(new T.CylinderGeometry(.245,.27,.62,40,1,false),fabric);body.position.y=.37;group.add(body);
    cyl(0,.695,0,.25,.25,.045,top,40);
    const ring=new T.Mesh(new T.TorusGeometry(.19,.012,8,40),trim);ring.rotation.x=Math.PI/2;ring.position.y=.72;group.add(ring);
    for(let i=0;i<24;i++){const a=i*Math.PI*2/24;const dot=sphere(Math.cos(a)*.205,.725,Math.sin(a)*.205,.009,.008,.009,mat(0xd5c7a7,.6));}
    const face=new T.Mesh(new T.CircleGeometry(.155,40),top);face.position.set(0,.37,.246);group.add(face);
    const driver=new T.Mesh(new T.TorusGeometry(.105,.012,8,36),trim);driver.position.set(0,.37,.258);group.add(driver);
    sphere(0,.37,.258,.07,.07,.018,dark);
    for(let i=0;i<4;i++)box(-.09+i*.06,.08,.245,.018,.012,.012,trim);
   }else if(modelName==='拱形落地窗'){
    width=1.9;depth=.18;height=2.25;wallAxis='x';wallSide='back';anchor=[0,2.65];
    const frame=mat(0x765d43,.58),glass=mat(0x9ebbc0,.18,.12);
    box(0,1.05,0,1.82,2.1,.12,frame);
    box(0,.96,.068,1.64,1.72,.018,glass);
    const arch=new T.Mesh(new T.TorusGeometry(.82,.07,10,48,Math.PI),frame);arch.rotation.z=Math.PI;arch.position.set(0,1.82,0);group.add(arch);
    const archGlass=new T.Mesh(new T.CircleGeometry(.76,48,0,Math.PI),glass);archGlass.position.set(0,1.82,.07);group.add(archGlass);
    box(0,.96,.09,.045,1.72,.025,frame);box(0,.98,.09,1.64,.045,.025,frame);
    box(-.53,.98,.09,.025,1.7,.02,frame);box(.53,.98,.09,.025,1.7,.02,frame);
   }else if(modelName==='藤编折叠屏风'){
    width=2.24;depth=.42;height=1.92;surfaceType='floor';
    const frame=mat(0x76563d,.66),rattan=mat(0xb9956d,.92),darkRattan=mat(0x96734f,.92),brass=mat(0xb18a55,.42,.58);
    for(let panel=0;panel<3;panel++){
     const hinge=new T.Group();hinge.position.set((panel-1)*.72,0,0);hinge.rotation.y=panel===1?0:(panel===0?-.16:.16);group.add(hinge);
     const panelBox=(x,y,z,w,h,d,material)=>{const mesh=new T.Mesh(softBoxGeometry(w,h,d),material);mesh.position.set(x,y,z);hinge.add(mesh);mesh.castShadow=true;mesh.receiveShadow=true;return mesh};
     panelBox(0,.92,0,.68,1.72,.075,frame);
     panelBox(0,.92,.045,.57,1.58,.018,rattan);
     for(let i=0;i<9;i++){const x=-.25+i*.0625;panelBox(x,.92,.062,.018,1.55,.018,i%2?darkRattan:rattan)}
     for(let j=0;j<13;j++){const y=.2+j*.12;panelBox(0,y,.073,.57,.014,.014,j%2?darkRattan:rattan)}
     for(const x of [-.29,.29])panelBox(x,.92,.09,.018,1.65,.025,brass);
     panelBox(0,.12,.02,.7,.08,.2,frame);
     for(const x of [-.25,.25])panelBox(x,.045,.02,.06,.09,.08,brass);
    }
   }else if(modelName==='长虹玻璃屏风'){
    width=1.9;depth=.3;height=2.08;surfaceType='floor';
    const timber=mat(0x795a40,.58),glass=mat(0x9db8b5,.2,.08),brass=mat(0xb89a68,.38,.62);
    glass.transparent=true;glass.opacity=.38;glass.depthWrite=false;
    box(0,.08,0,1.96,.13,.34,timber);box(0,2.02,0,1.96,.1,.3,timber);
    for(const x of [-.91,.91])box(x,1.06,0,.09,1.98,.24,timber);
    for(let i=0;i<5;i++){
     const x=-.72+i*.36;box(x,1.06,.015,.325,1.78,.045,glass);
     for(let rib=0;rib<11;rib++)box(x-.145+rib*.029,1.06,.045,.009,1.74,.012,mat(0xd4e0d7,.24,.1));
     box(x+.17,1.06,.065,.018,1.8,.045,brass);
    }
    box(0,.17,.18,1.72,.035,.025,brass);
   }else if(modelName==='双面开放书架隔断'){
    width=1.82;depth=.52;height=2.02;surfaceType='floor';
    const oak=mat(0x98724e,.62),dark=mat(0x624a36,.64),back=mat(0xe3d4bd,.94);
    for(const x of [-.84,.84])box(x,1.0,0,.09,1.96,.48,oak);
    for(const y of [.12,.62,1.12,1.62,1.94])box(0,y,0,1.76,.075,.48,oak);
    for(const z of [-.205,.205])for(let level=0;level<4;level++){
     const y=.35+level*.5;
     if(level===0||level===2){
      for(let i=0;i<4;i++){const h=.24+(i%2)*.07,book=box(-.62+i*.19,y+h/2,z,.14,h,.28,[m.clay,m.cream,m.leaf,m.oak][i]);book.rotation.z=(i-1.5)*.025}
     }else{
      box(-.35,y+.12,z,.46,.24,.28,back);
      for(let i=0;i<3;i++){const pot=cyl(.43+i*.1,y+.1,z,.055,.065,.16,i===1?m.clay:m.cream,14);sphere(.43+i*.1,y+.22,z,.075,.1,.06,m.leaf)}
     }
    }
    for(const z of [-.18,.18])for(const x of [-.72,.72])box(x,1.02,z,.035,1.82,.025,dark);
   }else if(modelName==='拱形镂空隔断'){
    width=1.92;depth=.28;height=2.18;surfaceType='floor';
    const plaster=mat(0xd8c8b1,.92),inner=mat(0x9c8065,.78),brass=mat(0xb69a68,.42,.55);
    const arch=new T.Shape();arch.moveTo(-.94,0);arch.lineTo(-.94,1.52);arch.quadraticCurveTo(-.94,2.12,0,2.12);arch.quadraticCurveTo(.94,2.12,.94,1.52);arch.lineTo(.94,0);arch.closePath();
    const opening=new T.Path();opening.moveTo(-.55,.12);opening.lineTo(-.55,1.42);opening.quadraticCurveTo(-.55,1.83,0,1.83);opening.quadraticCurveTo(.55,1.83,.55,1.42);opening.lineTo(.55,.12);opening.closePath();arch.holes.push(opening);
    const archMesh=new T.Mesh(new T.ExtrudeGeometry(arch,{depth:.16,bevelEnabled:true,bevelSegments:3,bevelThickness:.025,bevelSize:.025,curveSegments:24}),plaster);archMesh.position.z=-.08;group.add(archMesh);
    for(const z of [-.105,.105]){const sill=box(0,.09,z,1.9,.14,.035,inner);const crown=new T.Mesh(new T.TorusGeometry(.55,.018,7,48,Math.PI),brass);crown.position.set(0,1.52,z);crown.rotation.z=Math.PI;group.add(crown)}
    for(const x of [-.83,.83])box(x,.18,.11,.04,.2,.05,brass);
   }else if(modelName==='落地陶瓷花器'){
    width=.72;depth=.72;height=1.12;surfaceType='floor';
    const ceramic=mat(0xb77e65,.32,.04),rim=mat(0xead9c3,.34),base=mat(0x725b4b,.72);
    const profile=[new T.Vector2(0,0),new T.Vector2(.2,.06),new T.Vector2(.28,.2),new T.Vector2(.34,.42),new T.Vector2(.29,.64),new T.Vector2(.18,.78),new T.Vector2(.15,.98),new T.Vector2(.2,1.02),new T.Vector2(.18,1.07),new T.Vector2(.12,1.07),new T.Vector2(.12,.98),new T.Vector2(.1,.88),new T.Vector2(0,.86)];
    const vase=new T.Mesh(new T.LatheGeometry(profile,40),ceramic);vase.position.y=.04;group.add(vase);vase.castShadow=true;vase.receiveShadow=true;
    const lip=new T.Mesh(new T.TorusGeometry(.16,.025,8,40),rim);lip.rotation.x=Math.PI/2;lip.position.y=1.11;group.add(lip);
    cyl(0,.07,0,.2,.2,.07,base,32);
    const stem=mat(0x647c59,.9);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,leaf=sphere(Math.cos(a)*.16,1.22+Math.sin(a)*.035,Math.sin(a)*.16,.055,.2,.035,m.leaf);leaf.rotation.z=Math.cos(a)*-.5}
   }else if(modelName==='黄铜地球仪'){
    width=.58;depth=.58;height=.82;surfaceType='tabletop';surfaceY=.82;
    const brass=mat(0xb28b50,.36,.72),dark=mat(0x55483c,.48,.38),ocean=mat(0x78949a,.3,.16),land=mat(0xc9ad7c,.82);
    cyl(0,.06,0,.2,.24,.12,dark,28);cyl(0,.14,0,.12,.13,.06,brass,28);
    const stem=cyl(0,.39,0,.025,.035,.48,brass,14);stem.rotation.z=-.18;
    const globe=new T.Mesh(new T.SphereGeometry(.24,36,24),ocean);globe.position.set(0,.58,0);globe.rotation.z=-.28;group.add(globe);
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7,patch=new T.Mesh(new T.SphereGeometry(.242,18,12, a,.45,.45,.45),land);patch.position.copy(globe.position);patch.rotation.copy(globe.rotation);group.add(patch)}
    const ring=new T.Mesh(new T.TorusGeometry(.29,.012,8,48),brass);ring.position.set(0,.58,0);ring.rotation.set(.32,0,.55);group.add(ring);
    cyl(0,.84,0,.12,.12,.035,brass,24);
   }else if(modelName==='抽象金属雕塑'){
    width=.56;depth=.5;height=.68;surfaceType='tabletop';surfaceY=.68;
    const brass=mat(0x9b7950,.32,.78),stone=mat(0x766d62,.88),accent=mat(0xc4b69f,.42,.48);
    box(0,.06,0,.42,.1,.36,stone);
    const loop=new T.Mesh(new T.TorusKnotGeometry(.17,.035,96,12,2,3),brass);loop.position.set(0,.39,0);loop.rotation.set(.25,.3,.1);group.add(loop);
    sphere(.12,.33,.08,.11,.11,.11,accent);
    for(const x of [-.13,.13])cyl(x,.15,0,.025,.035,.2,brass,10);
   }else if(modelName==='玻璃罩微景观'){
    width=.64;depth=.64;height=.52;surfaceType='tabletop';surfaceY=.52;
    const base=mat(0x987653,.62),soil=mat(0x6a5947,.98),glass=mat(0xc1d9d6,.12,.05);
    glass.transparent=true;glass.opacity=.22;glass.depthWrite=false;
    cyl(0,.055,0,.29,.31,.11,base,36);cyl(0,.12,0,.27,.27,.025,soil,36);
    const dome=new T.Mesh(new T.SphereGeometry(.255,36,24,0,Math.PI*2,0,Math.PI/2),glass);dome.position.y=.13;group.add(dome);
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7,x=Math.cos(a),z=Math.sin(a);const stem=box(x*.11,.24,z*.11,.018,.22,.018,mat(0x526e50,.9));stem.rotation.z=-x*.2;sphere(x*.13,.34,z*.13,.065,.095,.035,i%2?m.leaf:m.leaf2)}
    for(let i=0;i<12;i++){const a=i*Math.PI*2/12;sphere(Math.cos(a)*.18,.17,Math.sin(a)*.18,.025,.018,.025,mat(i%2?0xb49b76:0x8b806e,.98))}
    const knob=sphere(0,.395,0,.035,.025,.035,base);
   }else if(modelName==='木格栅隔断'){
    width=1.85;depth=.22;height=2.15;surfaceType='floor';
    const timber=mat(0x8b6748,.68),base=mat(0x5e4938,.58);
    box(0,.08,0,1.92,.14,.28,base);box(0,2.05,0,1.92,.1,.28,timber);
    for(let i=0;i<13;i++){const x=-.84+i*.14;box(x,1.08,0,.055,1.92,.16,timber);box(x+.035,1.08,.086,.012,1.72,.012,mat(0xb28b5e,.58))}
    for(const x of [-.91,.91])box(x,1.08,0,.09,2.05,.24,base);
   }else{toast('没有找到这种家具模型：'+name);return null}
   // Fine finish pass: small joinery, upholstery and hardware details for existing models.
   if(modelName==='床头柜'){for(const x of [-.31,.31])cyl(x,.075,-.27,.035,.035,.11,m.gold,12);box(0,.49,.414,.24,.025,.018,m.gold)}
   if(modelName==='椅子'||modelName==='餐桌椅'){const seatEdge=mat(0x9c8064,.9);for(const x of [-.29,.29]){box(x,.565,.34,.025,.025,.025,m.gold)}if(variant==='软包扶手椅'){for(const x of [-.3,.3]){const piping= new T.Mesh(new T.TorusGeometry(.27,.008,6,24,Math.PI),seatEdge);piping.position.set(x,.66,-.19);piping.rotation.y=Math.PI/2;group.add(piping)}}}
   if(modelName==='电脑'){const screenGlow=box(0,.49,-.112,.62,.012,.006,mat(0x6b9eb1,.28));screenGlow.material.emissive=new T.Color(0x23485b);screenGlow.material.emissiveIntensity=.28;for(let row=0;row<3;row++)for(let col=0;col<10;col++)box(-.27+col*.06,.104+row*.002,.105+row*.047,.035,.006,.025,m.metal)}
   const cabinetTopHeights={'床头柜':.94,'衣柜':2.52,'书架':2.16,'展示柜':2.08,'斗柜':1.22,'电视柜':.78,'橱柜':1.1,'鞋柜':1.18,'置物架':1.96,'酒柜':1.75,'餐边柜':1.26,'料理台':1.05,'吊柜':.55};
   // Any cabinet with a usable horizontal top can support dishes and decorations.
   // Explicit model heights take priority; newly added cabinet models fall back
   // to their modeled height instead of remaining non-supporting furniture.
   if(Object.prototype.hasOwnProperty.call(cabinetTopHeights,modelName)){surfaceType='table';surfaceY=cabinetTopHeights[modelName]}
   else if(modelName.endsWith('柜')){surfaceType='table';surfaceY=Number(surfaceY)>0?surfaceY:Number(height)||.8}
   return {variant,modelName,room,parent,id,group,restoring,width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action};
  }
  return {build};
 }
 return {create};
})();
