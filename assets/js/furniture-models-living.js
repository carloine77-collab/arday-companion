/* Furniture model builders: furniture-models-living */
window.ArdayFurnitureModelCategories = window.ArdayFurnitureModelCategories || Object.create(null);
Object.assign(window.ArdayFurnitureModelCategories, {
 "地毯": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    width=3.7;depth=2.7;surfaceType='rug';surfaceY=.075;
    const wool=name==='羊毛地毯',bedroom=name==='卧室地毯';
    box(0,.035,0,width,.07,depth,m.fabric);
    const base=box(0,.074,0,3.48,.012,2.48,m.cream);
    box(0,.083,0,3.25,.012,2.25,m.fabric);
    for(const x of [-1.7,1.7])for(const z of [-1.2,1.2])box(x,.092,z,.14,.012,.14,m.gold);
    if(wool){
     // Thick wool pile: raised irregular tufts and short fringe make this visibly softer than the flat bedroom rug.
     const pile=mat(0xe9e1d4,.98),shade=mat(0xc8bca9,.98);
     for(let row=0;row<8;row++)for(let col=0;col<17;col++){
      const x=-1.48+col*.185+(row%2)*.045,z=-.98+row*.28;
      const tuft=sphere(x,.104,z,.075,.018,.075,(row+col)%4===0?shade:pile);
      tuft.scale.y=.55;
     }
     for(const z of [-1.28,1.28])for(let x=-1.58;x<=1.581;x+=.12){
      const fringe=box(x,.07,z,.018,.025,.14,pile);fringe.rotation.y=(Math.round(x*10)%2)*.12;
     }
     for(const x of [-1.68,1.68])for(let z=-1.15;z<=1.151;z+=.12)box(x,.07,z,.14,.025,.018,pile);
    }else if(bedroom){
     // Bedroom rug: a restrained central medallion, double inset border and corner rosettes.
     const border=mat(0xb69b78,.72),motif=mat(0x9c8064,.82);
     for(const z of [-1.13,1.13])box(0,.105,z,3.28,.018,.035,border);
     for(const x of [-1.58,1.58])box(x,.105,0,.035,.018,2.28,border);
     for(const x of [-1.42,1.42])for(const z of [-.98,.98]){
      const rosette=new T.Mesh(new T.OctahedronGeometry(.16,1),motif);rosette.position.set(x,.12,z);rosette.scale.set(1,.12,1);group.add(rosette);
      const center=sphere(x,.14,z,.045,.018,.045,m.gold);
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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "沙发": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    width=2.35;depth=1.12;height=.94;action=()=>openFurnitureActions('sofa',id);
    const fabric=mat(variant==='雾蓝绒布'?0x657f94:variant==='亚麻燕麦'?0xc4ad91:variant==='暖灰羊毛'?0xaaa69d:0xe4d9c7,.96),fabricShade=mat(variant==='雾蓝绒布'?0x91a4b2:variant==='亚麻燕麦'?0xe1d3bd:variant==='暖灰羊毛'?0xd1cbc0:0xd3c5b1,.98),welt=mat(variant==='雾蓝绒布'?0x526b80:variant==='亚麻燕麦'?0xb69c7d:variant==='暖灰羊毛'?0x8d887f:0xc2b39e,.92),walnut=mat(variant==='雾蓝绒布'?0x594b43:variant==='亚麻燕麦'?0x76543a:variant==='暖灰羊毛'?0x71665a:0x67452f,.62),walnutEdge=mat(variant==='雾蓝绒布'?0x71808a:variant==='亚麻燕麦'?0x987451:variant==='暖灰羊毛'?0x938a7e:0x8a6344,.58);
    applyPainterMap(fabric,fabricMap,.026);applyPainterMap(fabricShade,fabricMap,.022);applyPainterMap(welt,fabricMap,.016);
    applyPainterMap(walnut,woodMap,.014);applyPainterMap(walnutEdge,woodMap,.012);
    const soft=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,32,22),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
    const seam=(points,r=.008,material=welt)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(16,points.length*3),r,8,false),material);group.add(mesh);mesh.castShadow=true};
    if(variant!=='雾蓝绒布'){
     box(0,.27,0,2.08,.16,.82,walnut);box(0,.31,-.425,1.98,.19,.055,walnutEdge);box(0,.35,.39,1.98,.16,.06,walnut);
     for(const x of [-.62,0,.62]){soft(x,.49,-.105,.345,.145,.405,fabric);seam([[x-.29,.53,-.48],[x-.15,.55,-.49],[x,.55,-.49],[x+.15,.55,-.49],[x+.29,.53,-.48]],.009)}
     for(const x of [-.62,0,.62]){const back=soft(x,.755,.295,.34,.315,.16,fabricShade);back.rotation.x=-.13;seam([[x-.28,.73,.13],[x-.16,.72,.125],[x,.72,.12],[x+.16,.72,.125],[x+.28,.73,.13]],.007)}
     for(const x of [-1.015,1.015]){soft(x,.59,-.015,.17,.285,.49,fabric);soft(x,.855,-.045,.19,.085,.43,fabricShade);box(x,.39,.02,.055,.43,.79,walnut);seam([[x,.91,-.34],[x,.925,-.18],[x,.925,0],[x,.925,.18],[x,.91,.31]],.007)}
     for(const x of [-.86,.86])for(const z of [-.32,.32]){const leg=new T.Mesh(new T.CylinderGeometry(.035,.052,.25,12),walnut);leg.position.set(x,.125,z);group.add(leg);leg.castShadow=true}
     box(0,.19,-.423,1.86,.07,.035,walnutEdge);
    }
    if(variant==='亚麻燕麦'){
     // Compact loveseat: tapered exposed legs, channel back and two broad cushions.
     box(0,.25,-.02,1.82,.12,.78,walnut);
     for(const x of [-.46,.46]){const cushion=soft(x,.49,-.09,.43,.14,.36,fabric);cushion.rotation.x=-.04}
     for(let x=-.72;x<=.721;x+=.24){const channel=box(x,.79,.405,.035,.43,.035,welt);channel.rotation.z=-.06}
     for(const x of [-.94,.94]){const arm=soft(x,.62,.02,.13,.24,.43,fabricShade);arm.rotation.z=-.08}
     width=2.2;depth=1.15;
    }else if(variant==='雾蓝绒布'){
     // Purpose-built L sectional: one continuous upholstered seat pad wraps the corner into the chaise.
     const lShape=(left,front,back,returnX,returnBack,radius=.12)=>{
      const shape=new T.Shape();
      shape.moveTo(left+radius,-front);
      shape.lineTo(1.525-radius,-front);shape.quadraticCurveTo(1.525,-front,1.525,-front+radius);
      shape.lineTo(1.525,-back-radius);shape.quadraticCurveTo(1.525,-back,1.525-radius,-back);
      shape.lineTo(returnX+radius,-back);shape.quadraticCurveTo(returnX,-back,returnX,-back+radius);
      shape.lineTo(returnX,-.2-radius);shape.quadraticCurveTo(returnX,-.2,returnX-radius,-.2);
      shape.lineTo(left+radius,-.2);shape.quadraticCurveTo(left,-.2,left,-.2-radius);
      shape.lineTo(left,-front+radius);shape.quadraticCurveTo(left,-front,left+radius,-front);
      const geometry=new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.025,curveSegments:8});
      geometry.rotateX(-Math.PI/2);
      const mesh=new T.Mesh(geometry,material);mesh.position.y=.39;group.add(mesh);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
     };
     // Broad single-piece L-shaped plinth; no separate corner chaise block.
     box(0,.25,0,3.0,.2,1.78,walnut);
     box(.93,.25,.72,1.18,.2,.72,walnut);
     const seatShape=new T.Shape();
     seatShape.moveTo(-1.42,.82);seatShape.lineTo(1.42,.82);seatShape.quadraticCurveTo(1.5,.82,1.5,.74);
     seatShape.lineTo(1.5,-1.0);seatShape.quadraticCurveTo(1.5,-1.08,1.42,-1.08);
     seatShape.lineTo(.42,-1.08);seatShape.quadraticCurveTo(.34,-1.08,.34,-1.0);
     seatShape.lineTo(.34,-.27);seatShape.quadraticCurveTo(.34,-.19,.26,-.19);
     seatShape.lineTo(-1.42,-.19);seatShape.quadraticCurveTo(-1.5,-.19,-1.5,-.27);
     seatShape.lineTo(-1.5,.74);seatShape.quadraticCurveTo(-1.5,.82,-1.42,.82);
     const seatGeometry=new T.ExtrudeGeometry(seatShape,{depth:.19,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.045,bevelThickness:.035,curveSegments:10});
     seatGeometry.rotateX(-Math.PI/2);
     const seatPad=new T.Mesh(seatGeometry,fabric);seatPad.position.y=.36;group.add(seatPad);seatPad.castShadow=true;seatPad.receiveShadow=true;
     // Two broad back cushions and one continuous return cushion; the corner is physically joined.
     const backA=soft(-.55,.77,.19,.88,.31,.19,fabricShade);backA.rotation.x=-.08;
     const backB=soft(.82,.77,.19,.62,.31,.19,fabricShade);backB.rotation.x=-.08;
     const returnBack=soft(.88,.77,.77,.58,.31,.19,fabricShade);returnBack.rotation.y=Math.PI/2;
     const corner=soft(.35,.75,.2,.28,.29,.24,fabricShade);
     // One restrained seam across the main run; no four-way cushion grid.
     seam([[-.92,.565,-.2],[-.45,.57,-.2],[0,.57,-.2],[.35,.57,-.2]],.008);
     for(const x of [-1.39,1.39]){
      const arm=soft(x,.59,-.04,.13,.27,.78,fabric);arm.rotation.z=-.035;
      const cap=soft(x,.86,-.04,.15,.07,.72,fabricShade);
     }
     // The chaise has a single uninterrupted outer rail and the feet support the full L footprint.
     box(1.43,.39,.48,.07,.42,1.12,walnut);
     for(const [x,z] of [[-1.25,-.72],[0,-.72],[1.25,-.72],[-1.25,.72],[1.25,.92],[.48,.92]]){
      const foot=new T.Mesh(new T.CylinderGeometry(.035,.045,.2,12),walnut);
      foot.position.set(x,.11,z);group.add(foot);foot.castShadow=true;
     }
     width=3.05;depth=2.15;height=.94;
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
    if(variant!=='雾蓝绒布'){
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
 
    }
     const ferrule=new T.Mesh(new T.CylinderGeometry(.054,.052,.045,16),walnutEdge);
     ferrule.position.set(x,.035,z);group.add(ferrule);
    }
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "壁画": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    action=()=>openFurnitureActions('wallArt',id);
    width=1.5;depth=.14;height=1.18;wallAxis='x';wallSide='back';anchor=[0,1.9];
    box(0,0,0,1.52,1.18,.13,m.wood);box(0,0,.075,1.4,1.06,.035,m.gold);box(0,0,.098,1.32,.98,.018,m.cream);
    const arch=new T.Mesh(new T.CircleGeometry(.36,32,0,Math.PI),m.wall);arch.position.set(0,.17,.112);group.add(arch);box(0,-.19,.115,.72,.72,.012,m.wall);
    const stemA=new T.CatmullRomCurve3([new T.Vector3(-.22,-.34,.135),new T.Vector3(-.13,-.08,.145),new T.Vector3(-.16,.2,.14),new T.Vector3(-.32,.37,.135)]);
    const stemB=new T.CatmullRomCurve3([new T.Vector3(.1,-.36,.14),new T.Vector3(.19,-.08,.15),new T.Vector3(.12,.17,.14),new T.Vector3(.31,.35,.135)]);
    for(const curve of [stemA,stemB])group.add(new T.Mesh(new T.TubeGeometry(curve,20,.012,6,false),m.clay));
    for(const [x,y,rot] of [[-.27,-.08,-.6],[-.12,.12,.65],[-.3,.3,-.7],[.2,-.08,.65],[.14,.17,-.65],[.29,.3,.7]]){const leaf=sphere(x,y,.15,.12,.045,.018,m.leaf);leaf.rotation.z=rot}
    cyl(0,-.39,.145,.18,.18,.018,m.gold,16);
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "隔断": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "棕榈树绿植": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "书架": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    action=()=>openFurnitureActions('bookshelf',id);width=1.45;depth=.58;height=2.12;
    const open=variant==='开放格架',woodGrid=variant==='白蜡木开放格';
    if(!open){surfaceType='table';surfaceY=variant==='深胡桃木书柜'?2.18:2.12;}
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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "电视": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "唱片机": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    action=()=>openFurnitureActions('recordPlayer',id);width=.92;depth=.78;height=.92;surfaceType='floor';surfaceY=.04;
    box(0,.48,0,.88,.2,.72,m.wood);box(0,.59,-.01,.9,.055,.74,m.oak);
    for(const x of [-.34,.34])for(const z of [-.25,.25])box(x,.13,z,.065,.24,.065,m.dark);
    cyl(0,.64,-.035,.27,.27,.045,m.metal,32);cyl(0,.672,-.035,.235,.235,.018,m.dark,40);
    for(let r=.07;r<.22;r+=.035){const groove=new T.Mesh(new T.TorusGeometry(r,.003,4,48),m.metal);groove.rotation.x=Math.PI/2;groove.position.set(0,.684,-.035);group.add(groove)}
    cyl(0,.686,-.035,.035,.035,.012,m.gold,20);
    const arm=box(.22,.71,-.02,.025,.025,.34,m.metal);arm.rotation.x=-.08;arm.rotation.y=-.24;
    sphere(.22,.72,-.19,.035,.025,.035,m.gold);
    box(0,.79,.27,.72,.025,.08,m.cream);
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "捧花摆件": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    action=()=>openFurnitureActions('bouquet',id);
    width=.42;depth=.42;height=.72;surfaceType='floor';surfaceY=.04;
    const vase=new T.Mesh(new T.LatheGeometry([new T.Vector2(.11,0),new T.Vector2(.17,.08),new T.Vector2(.2,.28),new T.Vector2(.13,.42),new T.Vector2(.085,.48)],18),m.clay);vase.position.y=.08;group.add(vase);
    cyl(0,.56,0,.11,.11,.035,m.gold,16);
    for(let i=0;i<7;i++){const angle=i*Math.PI*2/7,x=Math.cos(angle),z=Math.sin(angle),stem=new T.CatmullRomCurve3([new T.Vector3(x*.035,.55,z*.035),new T.Vector3(x*.07,.75,z*.07),new T.Vector3(x*.14,.91+(i%2)*.05,z*.14)]);group.add(new T.Mesh(new T.TubeGeometry(stem,12,.012,6,false),m.leaf));const flower=new T.Group();flower.position.set(x*.14,.91+(i%2)*.05,z*.14);group.add(flower);for(let petal=0;petal<6;petal++){const a=petal*Math.PI/3,p=sphere(Math.cos(a)*.065,0,Math.sin(a)*.065,.06,.075,.045,[m.cream,m.clay,m.gold][i%3]);p.position.add(flower.position)}sphere(flower.position.x,flower.position.y+.015,flower.position.z,.035,.035,.035,m.gold,12)}

   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "茶几": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    width=variant==='圆形浅橡木'?1.12:1.42;depth=variant==='圆形浅橡木'?1.12:.88;height=.48;surfaceType='table';surfaceY=.52;
    if(variant==='圆形浅橡木'){cyl(0,.43,0,.56,.56,.1,m.oak,40);cyl(0,.22,0,.12,.16,.42,m.wood,20);cyl(0,.06,0,.42,.42,.08,m.oak,32)}
    else if(variant==='米白石材'){box(0,.43,0,1.44,.11,.9,mat(0xe5dfd4,.34));for(const x of [-.54,.54])for(const z of [-.3,.3])box(x,.21,z,.075,.42,.075,m.dark)}
    else{box(0,.4,0,1.42,.12,.86,m.wood);box(0,.47,0,1.38,.035,.82,m.oak);for(const x of [-.58,.58])for(const z of [-.32,.32])box(x,.2,z,.075,.38,.075,m.wood);for(const x of [-.36,.36]){box(x,.27,.44,.48,.19,.035,m.oak);cyl(x,.27,.47,.025,.025,.045,m.gold,10)}}
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "边桌": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "电视柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "斗柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    const cream=variant==='奶油三抽';width=1.28;depth=.68;height=1.18;surfaceType='table';surfaceY=1.22;
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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "花瓶": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    width=.5;depth=.5;height=.88;surfaceType='tabletop';surfaceY=.04;
    const ceramic=mat(0xc58d70,.3),lip=mat(0xe2bda0,.28),inside=mat(0x805d4b,.82);
    const vase=new T.Mesh(new T.LatheGeometry([new T.Vector2(.12,0),new T.Vector2(.16,.06),new T.Vector2(.23,.2),new T.Vector2(.25,.36),new T.Vector2(.19,.52),new T.Vector2(.105,.66),new T.Vector2(.11,.72)],32),ceramic);vase.position.y=.08;group.add(vase);
    cyl(0,.805,0,.115,.115,.025,lip,32);
    for(let rib=0;rib<12;rib++){const a=rib*Math.PI*2/12,curve=new T.CatmullRomCurve3([new T.Vector3(Math.cos(a)*.16,.19,Math.sin(a)*.16),new T.Vector3(Math.cos(a)*.23,.39,Math.sin(a)*.23),new T.Vector3(Math.cos(a)*.15,.61,Math.sin(a)*.15)]);group.add(new T.Mesh(new T.TubeGeometry(curve,12,.006,5,false),lip))}
    for(let i=0;i<5;i++){const a=i*1.25,curve=new T.CatmullRomCurve3([new T.Vector3(0,.76,0),new T.Vector3(Math.cos(a)*.12,.95,Math.sin(a)*.12),new T.Vector3(Math.cos(a)*.22,1.12+(i%2)*.08,Math.sin(a)*.22)]);group.add(new T.Mesh(new T.TubeGeometry(curve,14,.012,6,false),m.leaf));for(let n=0;n<3;n++){const p=curve.getPoint(.45+n*.15);const leaf=sphere(p.x,p.y,p.z,.09,.025,.035,n%2?m.leaf:m.leaf2);leaf.rotation.y=a}}
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "挂钟": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    width=.58;depth=.16;height=.68;wallAxis='x';wallSide='back';anchor=[0,2.0];
    const clockBody=cyl(0,0,.02,.29,.29,.07,m.wood,40);clockBody.rotation.x=Math.PI/2;const clockFace=cyl(0,0,.07,.245,.245,.018,m.cream,40);clockFace.rotation.x=Math.PI/2;
    cyl(0,0,.09,.012,.012,.02,m.gold,16);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;const dot=sphere(Math.sin(a)*.19,Math.cos(a)*.19,.105,.012,.012,.012,m.dark)}
    const hand=box(.04,.055,.11,.012,.13,.008,m.dark);hand.rotation.z=-.35;
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "窗帘": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "伞架": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "展示柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "海报": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "门": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "懒人沙发": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "鞋柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "窗": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    action=()=>openFurnitureActions('window',id);
    width=2.2;depth=.2;height=1.95;wallAxis='x';wallSide='back';anchor=[0,2.65];
    // Reuse the exact built-in room-window assembly: outdoor canvas, timed
    // sunlight, hinged open casements, curtain fabric, rings and brass rod.
    addWindowSun(parent,group,2.65);
    addWindowView(group,2.6,2.1,1.85);
    addOpenCasementWindow(group,m.oak);
    addWindowDressing(group,2.1,1.85,0xc7b7a4,2.6);
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "任务板": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "照片墙": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "置物架": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "衣帽架": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 }
});
