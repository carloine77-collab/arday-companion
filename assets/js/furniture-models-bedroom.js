/* Furniture model builders: furniture-models-bedroom */
window.ArdayFurnitureModelCategories = window.ArdayFurnitureModelCategories || Object.create(null);
Object.assign(window.ArdayFurnitureModelCategories, {
 "床": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "床头柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "衣柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "卧室地毯": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    width=3.4;depth=2.5;surfaceType='rug';box(0,.035,0,3.4,.07,2.5,m.fabric);box(0,.075,0,3.18,.012,2.28,m.sofa2);
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "梳妆台": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "全身镜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "阅读椅": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "办公椅": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "坐垫": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "躺椅": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "沙发床": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "榻榻米": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "上床下桌": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


    width=3.0;depth=2.0;height=2.75;action=()=>openFurnitureActions('bed',id);for(const x of [-1.35,1.35]){box(x,1.35,0,.12,2.65,.12,m.wood);box(x,2.63,0,.18,.12,1.9,m.oak)}box(0,2.18,-.72,2.7,.16,.78,m.wood);box(0,2.3,-.72,2.65,.22,.72,m.fabric);box(0,2.55,-1.58,2.7,.5,.12,m.cream);for(const x of [-1.25,1.25])box(x,.82,.35,.1,1.6,.1,m.wood);box(0,.92,0,2.55,.12,.82,m.oak);box(0,.99,0,2.5,.04,.78,m.cream);for(const x of [-1.1,1.1])box(x,.45,0,.08,.88,.72,m.wood);for(let i=0;i<6;i++)box(-.22+i*.09,.18,.18,.045,.012,.3,m.gold);for(let i=0;i<5;i++){const step=box(-1.5,.22+i*.36,.65-i*.28,.38,.06,.24,m.oak);step.rotation.z=.0}
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "凳子": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 }
});
