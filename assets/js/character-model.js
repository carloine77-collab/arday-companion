(()=>{
  const create=(T,scene,stylizeMaterial)=>{
    let person=null;
    try{
    const CM=(color,roughness=.82)=>stylizeMaterial(new T.MeshStandardMaterial({color,roughness,metalness:0,flatShading:false}));
    const skin=CM(0xe8b99d,.9),skinWarm=CM(0xd99c87,.9),hair=CM(0xc99a42,.78),hairLight=CM(0xe8bf70,.72),shirt=CM(0xeee4d6,.94),shirtShade=CM(0xcdbba7,.94),pants=CM(0x55515a,.96),shoe=CM(0x51443f,.88),sole=CM(0x342e30,.9),eyeWhite=CM(0xfff8ef,.7),iris=CM(0x806d61,.55),pupil=CM(0x302827,.5),brow=CM(0x9a7040,.9);
    person=new T.Group();person.name="ArdayChibiCharacter";scene.add(person);
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
    const sweep=(parent,points,profile,material,segments=28,radial=18)=>{
      const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,"catmullrom",.35);
      const frames=curve.computeFrenetFrames(segments,false),positions=[],uvs=[],indices=[];
      const radiusAt=t=>{
        let k=0;while(k<profile.length-2&&t>profile[k+1][0])k++;
        const a=profile[k],b=profile[k+1],u=Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0])));
        const smooth=u*u*(3-2*u);
        return [a[1]+(b[1]-a[1])*smooth,a[2]+(b[2]-a[2])*smooth];
      };
      for(let i=0;i<=segments;i++){
        const t=i/segments,p=curve.getPointAt(t),r=radiusAt(t),n=frames.normals[i],b=frames.binormals[i];
        for(let j=0;j<radial;j++){
          const a=j/radial*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
          positions.push(p.x+n.x*ca*r[0]+b.x*sa*r[1],p.y+n.y*ca*r[0]+b.y*sa*r[1],p.z+n.z*ca*r[0]+b.z*sa*r[1]);
          uvs.push(j/radial,t);
          if(i<segments){const v=i*radial+j,vn=i*radial+(j+1)%radial,nn=(i+1)*radial+j,nnn=(i+1)*radial+(j+1)%radial;indices.push(v,vn,nn,vn,nnn,nn);}
        }
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute("position",new T.Float32BufferAttribute(positions,3));
      geo.setAttribute("uv",new T.Float32BufferAttribute(uvs,2));
      geo.setIndex(indices);geo.computeVertexNormals();
      return mesh(parent,geo,material);
    };
    const ellipsoid=(parent,x,y,z,sx,sy,sz,material)=>{
      const o=lathe(parent,[[0,-1],[.28,-.94],[.62,-.76],[.88,-.48],[1,-.12],[.98,.28],[.78,.65],[.42,.9],[0,1]],material,24,.92);
      o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;
    };
    // A single continuous loft forms the waist, abdomen, chest, shoulders and neck.
    // Its silhouette is sculpted by the radial profile rather than assembled primitives.
    const torso=lathe(body,[
      [.13,.72],[.18,.75],[.225,.82],[.235,.94],[.225,1.08],[.25,1.22],
      [.295,1.39],[.345,1.53],[.355,1.61],[.31,1.66],[.235,1.70],
      [.15,1.73],[0,1.74]
    ],shirt,40,.78);
    // Exposed neck surface bridges the collar and jaw; it is buried at both ends to avoid a hard seam.
    lathe(body,[[0,1.63],[.075,1.65],[.095,1.7],[.10,1.82],[.095,1.94],[.075,2.0],[0,2.01]],skin,32,.86);
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
    const hairCap=lathe(head,[[0,.31],[.09,.32],[.18,.36],[.235,.43],[.25,.53],[.22,.61],[.15,.66],[0,.67]],hair,36,.94);
    hairCap.position.z=-.035;hairCap.userData.characterOutline=true;
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
    // Arms: tapered swept surfaces provide continuous, organic contours from shoulder to cuff.
    // Animation pivots remain at the shoulder and elbow so all existing activity poses still work.
    const arms=[];
    for(const side of [-1,1]){
      const shoulder=new T.Group();shoulder.position.set(side*.29,1.56,0);body.add(shoulder);
      sweep(shoulder,[[0,.13,0],[0,.055,.008],[0,-.09,.025],[0,-.25,.035],[0,-.43,.025]],
        [[0,.105,.095],[.2,.13,.11],[.48,.105,.09],[.78,.08,.07],[1,.067,.061]],shirt,30,20);
      // A narrow turned cuff is integrated into the sleeve silhouette.
      sweep(shoulder,[[0,-.385,.027],[0,-.415,.027],[0,-.438,.025]],
        [[0,.069,.062],[.5,.071,.063],[1,.064,.058]],shirtShade,10,18);
      const elbow=new T.Group();elbow.position.set(0,-.43,0);shoulder.add(elbow);
      // The forearm begins inside the sleeve and tapers naturally toward the wrist.
      sweep(elbow,[[0,.075,.02],[0,-.035,.028],[0,-.17,.035],[0,-.305,.03]],
        [[0,.061,.057],[.28,.059,.054],[.68,.043,.041],[1,.031,.03]],skin,24,18);
      // Palm and fingers are shaped as one tapered hand silhouette with individually curved digits.
      sweep(elbow,[[0,-.285,.03],[0,-.34,.045],[0,-.405,.05],[0,-.445,.045]],
        [[0,.035,.031],[.34,.052,.027],[.76,.047,.019],[1,.026,.014]],skin,18,16);
      for(let f=0;f<4;f++){
        const x=-.032+f*.021;
        sweep(elbow,[[x,-.386,.066],[x-.003,-.423,.07],[x-.008,-.448,.066]],
          [[0,.010,.009],[.55,.008,.007],[1,.002,.002]],skin,10,10);
      }
      sweep(elbow,[[side*.035,-.345,.04],[side*.058,-.37,.055],[side*.068,-.405,.06]],
        [[0,.014,.012],[.6,.011,.01],[1,.003,.003]],skin,10,10);
      arms.push({shoulder,elbow,side});
    }
    // A continuous hip/shorts loft gives both legs a shared pelvis silhouette.
    lathe(rig,[[0,.65],[.13,.65],[.22,.69],[.25,.77],[.245,.88],[.22,.96],[.16,.99],[0,1]],pants,32,.82);
    const legs=[];
    for(const side of [-1,1]){
      const hip=new T.Group();hip.position.set(side*.145,.78,0);rig.add(hip);
      // Upper leg is a curved, tapered loft that grows out of the pelvis; no spherical hip cap.
      sweep(hip,[[0,.12,0],[0,.025,.012],[0,-.14,.018],[0,-.30,.012],[0,-.43,0]],
        [[0,.128,.112],[.2,.126,.11],[.52,.112,.098],[.82,.091,.083],[1,.082,.075]],pants,30,20);
      const knee=new T.Group();knee.position.set(0,-.43,0);hip.add(knee);
      // Knee volume is formed by the continuous radius profile, not an attached ball.
      sweep(knee,[[0,.07,.005],[0,.015,.012],[0,-.11,.018],[0,-.25,.025],[0,-.35,.035]],
        [[0,.083,.077],[.2,.086,.079],[.58,.071,.068],[.88,.054,.052],[1,.048,.046]],pants,28,20);
      const foot=new T.Group();foot.position.set(0,-.34,.065);knee.add(foot);
      const shoeMesh=lathe(foot,[[0,-.085],[.055,-.083],[.095,-.055],[.11,-.005],[.105,.055],[.075,.105],[.035,.12],[0,.12]],shoe,28,.72);
      shoeMesh.rotation.x=Math.PI/2;shoeMesh.scale.z=.72;shoeMesh.position.z=.035;
      const soleMesh=lathe(foot,[[0,-.092],[.06,-.09],[.098,-.07],[.105,-.048],[.08,-.034],[0,-.032]],sole,28,.75);
      soleMesh.rotation.x=Math.PI/2;soleMesh.scale.z=.72;soleMesh.position.z=.035;
      legs.push({hip,knee,side});
    }
    const shadow=new T.Mesh(new T.CircleGeometry(.62,32),new T.MeshBasicMaterial({color:0x40362d,transparent:true,opacity:.2,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=.022;person.add(shadow);
    let meshCount=0;person.traverse(o=>{if(o.isMesh)meshCount++});
    if(meshCount<20||arms.length!==2||legs.length!==2)throw new Error("Character model is incomplete");
    return {person,rig,body,head,eyeGroups,arms,legs,shadow};
    }catch(error){
      if(person){
        const geometries=new Set(),materials=new Set();
        person.traverse(o=>{
          if(o.geometry&&!geometries.has(o.geometry)){geometries.add(o.geometry);o.geometry.dispose?.()}
          const list=Array.isArray(o.material)?o.material:[o.material];
          list.forEach(mat=>{if(mat&&!materials.has(mat)){materials.add(mat);mat.dispose?.()}});
        });
        person.parent?.remove(person);
      }
      console.error("Arday chibi character model build failed",error);
      return null;
    }
  };
  window.ArdayCharacterModel={create};
})();