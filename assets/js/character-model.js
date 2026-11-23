(()=>{
  const create=(T,scene,stylizeMaterial)=>{
    const CM=(color,roughness=.82)=>stylizeMaterial(new T.MeshStandardMaterial({color,roughness,metalness:0,flatShading:false}));
    const skin=CM(0xe8b99d,.9),skinWarm=CM(0xd99c87,.9),hair=CM(0xc99a42,.78),hairLight=CM(0xe8bf70,.72),shirt=CM(0xeee4d6,.94),shirtShade=CM(0xcdbba7,.94),pants=CM(0x55515a,.96),shoe=CM(0x51443f,.88),sole=CM(0x342e30,.9),eyeWhite=CM(0xfff8ef,.7),iris=CM(0x806d61,.55),pupil=CM(0x302827,.5),brow=CM(0x9a7040,.9);
    const person=new T.Group();scene.add(person);
    const rig=new T.Group();person.add(rig);
    const body=new T.Group();rig.add(body);
    const mesh=(parent,geometry,material)=>{const o=new T.Mesh(geometry,material);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
    const lathe=(parent,profile,material,segments=32,scaleZ=1)=>{
      const points=profile.map(p=>new T.Vector2(p[0],p[1]));
      const geo=new T.LatheGeometry(points,segments);geo.computeVertexNormals();
      const o=mesh(parent,geo,material);o.scale.z=scaleZ;return o;
    };
    const tube=(parent,points,radius,material,segments=24,tubular=8)=>{
      const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
      return mesh(parent,new T.TubeGeometry(curve,segments,radius,tubular,false),material);
    };
    const ellipsoid=(parent,x,y,z,sx,sy,sz,material)=>{
      const o=lathe(parent,[[0,-1],[.28,-.94],[.62,-.76],[.88,-.48],[1,-.12],[.98,.28],[.78,.65],[.42,.9],[0,1]],material,24,.92);
      o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;
    };
    // A single continuous loft forms the waist, abdomen, chest, shoulders and neck.
    // Its silhouette is sculpted by the radial profile rather than assembled primitives.
    const torso=lathe(body,[
      [.13,.72],[.18,.75],[.225,.82],[.235,.94],[.225,1.08],[.25,1.22],
      [.295,1.39],[.345,1.53],[.355,1.61],[.31,1.68],[.205,1.72],
      [.125,1.77],[.112,1.9],[.13,1.94],[0,1.95]
    ],shirt,40,.78);
    // Soft tailored panels follow the torso surface; they are details, not structural blocks.
    tube(body,[[0,1.67,.238],[0,1.47,.272],[0,1.22,.205],[0,.96,.19]],.006,shirtShade,28,6);
    for(const side of [-1,1]){
      tube(body,[[side*.12,1.68,.205],[side*.18,1.58,.225],[side*.145,1.47,.231]],.009,shirtShade,18,6);
      for(const y of [1.42,1.2,.99])ellipsoid(body,side*.012,y,.198,.012,.012,.008,shirtShade);
    }
    // Head: softly tapered jaw and full cheeks, built as a smooth lathed surface.
    const head=new T.Group();head.position.set(0,2.06,.015);body.add(head);
    const face=lathe(head,[
      [0,-.43],[.085,-.415],[.15,-.36],[.205,-.27],[.238,-.14],
      [.252,.02],[.242,.18],[.205,.32],[.13,.415],[0,.445]
    ],skin,40,.91);face.position.z=.008;
    for(const side of [-1,1]){
      const ear=ellipsoid(head,side*.244,-.005,-.005,.047,.073,.052,skin);ear.rotation.z=side*.12;
      ellipsoid(head,side*.145,-.13,.178,.075,.052,.018,skinWarm);
    }
    const eyeGroups=[];
    for(const side of [-1,1]){
      const eye=new T.Group();eye.position.set(side*.108,.075,.207);head.add(eye);
      ellipsoid(eye,0,0,0,.052,.039,.018,eyeWhite);
      ellipsoid(eye,side*.002,-.002,.016,.027,.031,.012,iris);
      ellipsoid(eye,side*.002,-.003,.025,.014,.023,.008,pupil);
      ellipsoid(eye,side*.011,.01,.032,.006,.008,.004,eyeWhite);
      tube(head,[[side*.17,.158,.178],[side*.135,.177,.205],[side*.09,.172,.205]],.006,brow,10,6);
      eyeGroups.push(eye);
    }
    // Layered hair cap and tapered locks replace the old spherical helmet silhouette.
    lathe(head,[[0,.31],[.09,.32],[.18,.36],[.235,.43],[.25,.53],[.22,.61],[.15,.66],[0,.67]],hair,36,.94).position.z=-.035;
    lathe(head,[[0,-.06],[.12,-.055],[.205,-.02],[.238,.06],[.22,.19],[.14,.27],[0,.29]],hair,32,.52).position.z=-.205;
    for(const side of [-1,1]){
      const lock=tube(head,[[side*.19,.39,.06],[side*.235,.22,.09],[side*.23,.015,.055],[side*.205,-.17,.075]],.043,hair,24,10);
      lock.scale.set(1,1,1);
    }
    // Curved fringe pieces sit over the crown without hiding the eyes.
    tube(head,[[-.19,.39,.12],[-.14,.48,.17],[-.04,.49,.18],[.035,.43,.19]],.055,hairLight,22,10);
    tube(head,[[.01,.46,.17],[.12,.49,.14],[.19,.43,.1],[.21,.35,.12]],.048,hair,20,10);
    tube(head,[[-.035,-.19,.205],[0,-.207,.214],[.035,-.19,.205]],.004,skinWarm,12,6);
    for(const side of [-1,1]){
      const blush=ellipsoid(head,side*.165,-.12,.187,.039,.015,.007,skinWarm);blush.material.transparent=true;blush.material.opacity=.32;
    }
    // Arms retain hierarchical pivots for the existing animation system.
    const arms=[];
    for(const side of [-1,1]){
      const shoulder=new T.Group();shoulder.position.set(side*.29,1.56,0);body.add(shoulder);
      // Shoulder cap and upper sleeve are custom tapered lofts with overlapping soft transitions.
      lathe(shoulder,[[0,-.49],[.045,-.47],[.072,-.4],[.084,-.27],[.11,-.12],[.105,-.035],[.07,.045],[0,.06]],shirt,24,.9);
      const elbow=new T.Group();elbow.position.set(0,-.43,0);shoulder.add(elbow);
      ellipsoid(elbow,0,0,0,.068,.066,.067,shirtShade);
      lathe(elbow,[[0,-.36],[.025,-.35],[.043,-.29],[.052,-.19],[.049,-.09],[.056,-.025],[.045,.035],[0,.04]],skin,22,.92);
      // Palm is a softly tapered, slightly flattened form; fingers are curved tapered tubes.
      lathe(elbow,[[0,-.49],[.035,-.485],[.052,-.45],[.06,-.405],[.055,-.36],[.035,-.33],[0,-.325]],skin,20,.8);
      for(let f=0;f<4;f++){
        const x=-.034+f*.022;
        tube(elbow,[[x,-.445,.035],[x-.004,-.475,.045],[x-.009,-.493,.043]],.008,skin,8,6);
      }
      tube(elbow,[[side*.045,-.39,.045],[side*.071,-.415,.06],[side*.073,-.45,.06]],.011,skin,10,6);
      arms.push({shoulder,elbow,side});
    }
    // A continuous hip/shorts loft gives both legs a shared pelvis silhouette.
    lathe(rig,[[0,.65],[.13,.65],[.22,.69],[.25,.77],[.245,.88],[.22,.96],[.16,.99],[0,1]],pants,32,.82);
    const legs=[];
    for(const side of [-1,1]){
      const hip=new T.Group();hip.position.set(side*.145,.78,0);rig.add(hip);
      lathe(hip,[[0,-.49],[.055,-.48],[.092,-.42],[.105,-.31],[.11,-.18],[.12,-.08],[.115,.02],[.09,.09],[0,.1]],pants,24,.9);
      const knee=new T.Group();knee.position.set(0,-.43,0);hip.add(knee);
      ellipsoid(knee,0,0,0,.083,.07,.075,pants);
      lathe(knee,[[0,-.39],[.04,-.38],[.067,-.31],[.075,-.2],[.071,-.1],[.075,-.025],[.06,.045],[0,.05]],pants,24,.92);
      // Foot shape is a short sculpted shoe with a distinct curved sole, not a box.
      const foot=new T.Group();foot.position.set(0,-.34,.065);knee.add(foot);
      const shoeMesh=lathe(foot,[[0,-.085],[.055,-.083],[.095,-.055],[.11,-.005],[.105,.055],[.075,.105],[.035,.12],[0,.12]],shoe,24,.72);
      shoeMesh.rotation.x=Math.PI/2;shoeMesh.scale.z=.72;shoeMesh.position.z=.035;
      const soleMesh=lathe(foot,[[0,-.092],[.06,-.09],[.098,-.07],[.105,-.048],[.08,-.034],[0,-.032]],sole,24,.75);
      soleMesh.rotation.x=Math.PI/2;soleMesh.scale.z=.72;soleMesh.position.z=.035;
      legs.push({hip,knee,side});
    }
    const shadow=new T.Mesh(new T.CircleGeometry(.62,32),new T.MeshBasicMaterial({color:0x40362d,transparent:true,opacity:.2,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=.022;person.add(shadow);
    return {person,rig,body,head,eyeGroups,arms,legs,shadow};
  };
  window.ArdayCharacterModel={create};
})();