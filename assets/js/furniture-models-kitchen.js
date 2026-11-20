/* Furniture model builders: furniture-models-kitchen */
window.ArdayFurnitureModelCategories = window.ArdayFurnitureModelCategories || Object.create(null);
Object.assign(window.ArdayFurnitureModelCategories, {
 "成品食物": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "橱柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "吊柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "冰箱": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "灶台": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "水槽": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "餐边柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "酒柜": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 },
 "料理台": function(ctx) {
  const {T,group,mat,m,fabricMap,woodMap,ceramicMap,applyPainterMap,variant,modelName,name,id,room,parent,openFurnitureActions,openKitchenPanel,document,addWindowSun,addWindowView,addOpenCasementWindow,addWindowDressing,box,cyl,sphere,legs,restoring,toast}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
 
  Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});
  return true;
 }
});
