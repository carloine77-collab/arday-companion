/* Furniture model builders: furniture-models-lighting */
window.ArdayFurnitureModelCategories = window.ArdayFurnitureModelCategories || Object.create(null);
Object.assign(window.ArdayFurnitureModelCategories, {
 "台灯": function(ctx) { with(ctx) {

    width=.48;depth=.48;height=.92;surfaceType='tabletop';surfaceY=.9;
    if(variant==='蘑菇'){cyl(0,.12,0,.19,.22,.2,m.gold,16);cyl(0,.43,0,.055,.075,.48,m.cream,16);const dome=new T.Mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),m.cream);dome.scale.set(.31,.2,.31);dome.position.y=.72;group.add(dome)}else if(variant==='琥珀玻璃'){cyl(0,.12,0,.18,.2,.18,m.gold,20);cyl(0,.36,0,.07,.09,.38,m.metal,16);const globe=new T.Mesh(new T.SphereGeometry(.25,24,16),mat(0xc68b4f,.22,.12));globe.scale.set(1,.82,1);globe.position.y=.65;group.add(globe)}else if(variant==='陶瓷折线'){cyl(0,.12,0,.2,.22,.2,m.clay,16);const stem=new T.Mesh(new T.CylinderGeometry(.09,.16,.48,8),m.cream);stem.position.y=.43;group.add(stem);const shade=new T.Mesh(new T.CylinderGeometry(.28,.12,.28,12),m.cream);shade.position.y=.82;group.add(shade)}else{cyl(0,.12,0,.18,.2,.2,m.dark,16);cyl(0,.48,0,.045,.07,.58,m.gold,12);const shade=new T.Mesh(new T.CylinderGeometry(.27,.12,.3,16),m.cream);shade.position.y=.88;group.add(shade)}
   
 } return true; },
 "壁灯": function(ctx) { with(ctx) {

    width=.72;depth=.22;height=.78;wallAxis='x';wallSide='back';anchor=[0,3.15];box(0,0,-.04,.22,.42,.09,m.gold);cyl(0,-.16,.08,.045,.045,.28,m.gold,12);
    if(variant==='黄铜双臂'){for(const side of [-1,1]){const arm=box(side*.2,.06,.02,.34,.045,.045,m.gold);arm.rotation.z=side*.3;const shade=new T.Mesh(new T.ConeGeometry(.15,.2,12,1,true),m.cream);shade.position.set(side*.34,.22,.1);shade.rotation.x=Math.PI;group.add(shade);cyl(side*.34,.11,.1,.025,.025,.2,m.gold,10)}}else{const shade=new T.Mesh(new T.ConeGeometry(.2,.28,16,1,true),m.cream);shade.position.set(0,.16,.12);shade.rotation.x=Math.PI;group.add(shade);cyl(0,.02,.12,.025,.025,.2,m.gold,10)}
   
 } return true; },
 "落地灯": function(ctx) { with(ctx) {

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
   
 } return true; },
 "吊灯": function(ctx) { with(ctx) {

    width=.78;depth=.78;height=.56;surfaceType='ceiling';cyl(0,.28,0,.07,.07,.12,m.gold,12);cyl(0,.04,0,.025,.025,.42,m.gold,10);if(variant==='藤编圆罩'){const shade=new T.Mesh(new T.SphereGeometry(.38,24,16,0,Math.PI*2,0,Math.PI/2),mat(0xb68d5e,.94));shade.position.y=-.12;shade.scale.set(1,.82,1);group.add(shade);cyl(0,-.31,0,.16,.16,.035,m.cream,24)}else if(variant==='乳白玻璃'){const globe=new T.Mesh(new T.SphereGeometry(.3,20,14),m.cream);globe.position.y=-.22;group.add(globe);cyl(0,-.48,0,.12,.12,.045,m.gold,12)}else{const shade=new T.Mesh(new T.CylinderGeometry(.34,.16,.28,20),m.cream);shade.position.y=-.25;group.add(shade);cyl(0,-.41,0,.18,.18,.035,m.gold,12)}
   
 } return true; }
});
