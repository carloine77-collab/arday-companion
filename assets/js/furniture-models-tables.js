/* Restored original desk, dining-table and chair builders omitted during category extraction. */
window.ArdayFurnitureModelCategories = window.ArdayFurnitureModelCategories || Object.create(null);
const buildDeskDiningTable = function(ctx) {
const {T,group,mat,m,variant,modelName,id,openFurnitureActions,box,cyl,sphere,legs}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});

};
const buildChairDiningChair = function(ctx) {
const {T,group,mat,m,variant,modelName,id,openFurnitureActions,box,cyl,sphere,legs}=ctx;
  let {width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action}=ctx;


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
   
Object.assign(ctx,{width,depth,height,surfaceType,surfaceY,supportId,wallAxis,wallSide,anchor,action});

};
Object.assign(window.ArdayFurnitureModelCategories,{
 "书桌":buildDeskDiningTable,
 "餐桌":buildDeskDiningTable,
 "椅子":buildChairDiningChair,
 "餐桌椅":buildChairDiningChair
});