/* Furniture model builders: furniture-models-bathroom */
window.ArdayFurnitureModelCategories = window.ArdayFurnitureModelCategories || Object.create(null);
Object.assign(window.ArdayFurnitureModelCategories, {
 "洗衣机": function(ctx) { with(ctx) {

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
   
 } return true; },
 "洗手台": function(ctx) { with(ctx) {

    action=()=>openFurnitureActions('sink',id);width=1.28;depth=.82;height=1.72;
    const porcelain=mat(0xe8e5dc,.22),cabinet=mat(0x9b8064,.82),brass=mat(0xb18b58,.34,.58),mirror=mat(0xa9bdc0,.16,.42);
    box(0,.42,0,1.22,.82,.76,cabinet);box(0,.86,0,1.32,.12,.84,m.cream);box(0,.96,.02,1.12,.1,.66,porcelain);box(0,1.015,.04,.78,.035,.43,m.cream);
    const bowl=new T.Mesh(new T.TorusGeometry(.29,.045,10,32),porcelain);bowl.rotation.x=Math.PI/2;bowl.position.set(0,1.04,.04);group.add(bowl);
    const faucet=new T.CatmullRomCurve3([new T.Vector3(0,1.02,-.25),new T.Vector3(0,1.28,-.25),new T.Vector3(0,1.4,-.08),new T.Vector3(0,1.4,.05)]);group.add(new T.Mesh(new T.TubeGeometry(faucet,20,.024,8,false),brass));
    for(const x of [-.42,.42])cyl(x,1.04,-.22,.035,.035,.055,brass,12);
    box(0,1.58,-.37,1.12,.58,.045,m.wood);box(0,1.58,-.34,1.02,.48,.018,mirror);
    for(const x of [-.55,.55])box(x,.42,.39,.045,.7,.045,m.oak);
   
 } return true; },
 "马桶": function(ctx) { with(ctx) {

    width=.78;depth=1.12;height=.82;const ceramic=mat(0xe9e6de,.24),shadow=mat(0xb8b9b2,.55),seat=mat(0x59636a,.32);
    box(0,.55,-.34,.68,.72,.42,ceramic);box(0,.83,-.34,.72,.12,.46,m.cream);
    const pedestal=new T.Mesh(new T.CylinderGeometry(.27,.31,.43,28),ceramic);pedestal.position.set(0,.25,.13);group.add(pedestal);
    const bowl=new T.Mesh(new T.SphereGeometry(1,28,18),ceramic);bowl.scale.set(.38,.19,.48);bowl.position.set(0,.43,.2);group.add(bowl);
    const opening=new T.Mesh(new T.TorusGeometry(.245,.035,10,32),seat);opening.rotation.x=Math.PI/2;opening.position.set(0,.57,.2);group.add(opening);
    const inner=new T.Mesh(new T.CircleGeometry(.21,32),shadow);inner.rotation.x=-Math.PI/2;inner.position.set(0,.555,.2);group.add(inner);
    box(0,.93,-.35,.42,.035,.025,m.metal);box(.25,.97,-.34,.08,.06,.045,m.gold);
   
 } return true; },
 "淋浴间": function(ctx) { with(ctx) {

    action=()=>openFurnitureActions('sink',id);width=1.48;depth=1.42;height=2.32;
    const glass=mat(0xc8d9d8,.12,.08);glass.transparent=true;glass.opacity=.25;glass.depthWrite=false;const frame=mat(0x9b8064,.38,.52),stone=mat(0xc9c8c0,.42);
    box(0,.12,0,1.42,.18,1.36,stone);box(0,.22,0,1.26,.045,1.2,m.cream);
    for(const x of [-.68,.68])box(x,1.15,-.55,.045,2.1,.045,frame);
    for(const z of [-.55,.62])box(.68,1.15,z,.045,2.1,.045,frame);
    box(.68,1.15,.035,.025,2.0,1.12,glass);box(0,1.15,-.55,1.35,2.0,.025,glass);
    const pipe=new T.CatmullRomCurve3([new T.Vector3(-.5,2.05,-.45),new T.Vector3(-.5,2.18,-.45),new T.Vector3(-.5,2.2,-.22)]);group.add(new T.Mesh(new T.TubeGeometry(pipe,12,.025,8,false),m.metal));
    const head=new T.Mesh(new T.CylinderGeometry(.16,.2,.055,24),m.metal);head.rotation.x=Math.PI/2;head.position.set(-.5,2.17,-.18);group.add(head);
    cyl(-.48,1.08,-.42,.055,.055,.09,m.gold,12);box(-.48,1.2,-.42,.24,.035,.035,m.metal);
   
 } return true; },
 "浴缸": function(ctx) { with(ctx) {

    action=()=>openFurnitureActions('sink',id);width=2.25;depth=1.12;height=.72;const enamel=mat(0xe8e4dc,.26),outer=mat(0xd2c7b7,.72),metal=mat(0xaeb5b4,.28,.58);
    box(0,.34,0,2.16,.56,1.02,outer);box(0,.57,0,2.22,.16,1.1,enamel);box(0,.62,0,1.82,.035,.74,mat(0xb9c7c5,.3));
    for(const x of [-.9,.9])for(const z of [-.39,.39])sphere(x,.38,z,.12,.2,.12,enamel);
    cyl(.82,.78,-.37,.035,.035,.16,metal,12);cyl(.82,.87,-.37,.055,.055,.045,m.gold,12);
   
 } return true; }
});
