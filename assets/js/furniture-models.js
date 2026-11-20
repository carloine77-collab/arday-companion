/*
 * Three.js owned-furniture model factory.
 * Geometry, materials, texture setup and per-model construction live here.
 * Placement, persistence, registration and interaction lifecycle stay in game.js.
 */
window.ArdayFurnitureModels = (() => {
 function create(context) {
  const {T,getRoomMode,rooms,furnitureModelAliases,stylizeMaterial,recolorFurniture,createPainterTexture,applyPainterMap,roomWallMap,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,toast}=context;
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
   const modelContext={T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,box,cyl,sphere,legs,restoring,width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action,toast};
   const modelBuilder=window.ArdayFurnitureModelCategories?.[modelName];
   if(!modelBuilder){toast('没有找到这种家具模型：'+name);return null}
   modelBuilder(modelContext);
   ({width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=modelContext);
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
