/* Furniture model builders: furniture-models-office */
window.ArdayFurnitureModelCategories = window.ArdayFurnitureModelCategories || Object.create(null);
Object.assign(window.ArdayFurnitureModelCategories, {
 "电脑": function(ctx) { with(ctx) {

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
   
 } return true; },
 "哑铃架": function(ctx) { with(ctx) {

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
   
 } return true; },
 "钢琴": function(ctx) { with(ctx) {

    action=()=>openFurnitureActions('piano',id);
    width=1.62;depth=.92;height=1.42;
    const caseMat=mat(0x292a2b,.28,.46),wood=mat(0x62452f,.56),ivory=mat(0xf0eadc,.35),ebony=mat(0x18191b,.24);
    // Upright piano cabinet with fallboard, keyboard cheeks, music desk and pedals.
    box(0,.68,0,1.56,1.18,.76,caseMat);
    box(0,1.29,-.02,1.62,.12,.82,wood);
    box(0,.51,.405,1.42,.16,.12,wood);
    box(0,.57,.47,1.38,.055,.1,ebony);
    for(let i=0;i<52;i++){
     const x=-.665+i*.026;
     box(x,.59,.535,.024,.12,.045,ivory);
     if(i%7!==2&&i%7!==6&&i%7!==1&&i%7!==4){const black=box(x+.013,.66,.56,.014,.075,.035,ebony)}
    }
    box(0,.82,.34,1.36,.035,.08,wood);
    box(0,1.02,-.24,.96,.42,.06,caseMat);
    box(0,1.04,-.195,.86,.32,.018,wood);
    for(let i=0;i<5;i++)box(-.34+i*.17,1.04,-.18,.012,.24,.012,m.gold);
    for(const x of [-.62,.62])box(x,.08,-.22,.1,.16,.1,caseMat);
    for(const x of [-.22,0,.22]){const pedal=box(x,.055,.42,.045,.035,.18,m.metal);pedal.rotation.x=-.18}
    box(0,.16,.22,.62,.055,.22,caseMat);
   
 } return true; },
 "跑步机": function(ctx) { with(ctx) {

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
   
 } return true; },
 "游戏机": function(ctx) { with(ctx) {

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
   
 } return true; }
});
