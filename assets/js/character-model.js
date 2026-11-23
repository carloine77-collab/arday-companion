(()=>{
  const create=(T,scene,stylizeMaterial)=>{
    let person=null;
    const madeGeometries=new Set(),madeMaterials=new Set();
    try{
      const mat=(color,roughness=.84)=>{const m=stylizeMaterial(new T.MeshStandardMaterial({color,roughness,metalness:0,flatShading:false}));madeMaterials.add(m);return m};
      const skin=mat(0xe8b99d,.9),hair=mat(0xc99a42,.78),hairLight=mat(0xe8bf70,.72),shirt=mat(0xeee4d6,.94),pants=mat(0x55515a,.96),shoe=mat(0x51443f,.88),sole=mat(0x342e30,.9),eyeWhite=mat(0xfff8ef,.7),iris=mat(0x806d61,.55),pupil=mat(0x302827,.5),blush=mat(0xd99c87,.9);
      person=new T.Group();person.name="ArdayChibiCharacter";person.scale.set(.92,.88,.92);scene.add(person);
      const rig=new T.Group();rig.name="character-rig";person.add(rig);
      const body=new T.Group();body.name="character-body";rig.add(body);
      const boneRoot=new T.Bone();boneRoot.name="pelvis-root";body.add(boneRoot);
      const bones=[],bonePoints=[];
      const addBone=(name,parent,local,world)=>{const b=new T.Bone();b.name=name;b.position.set(...local);parent.add(b);bones.push(b);bonePoints.push({bone:b,point:new T.Vector3(...world)});return b};
      const pelvis=boneRoot;
      bones.push(pelvis);bonePoints.push({bone:pelvis,point:new T.Vector3(0,.70,0)});
      const spine=addBone("spine",pelvis,[0,.27,0],[0,.97,0]);
      const neck=addBone("neck",spine,[0,.28,0],[0,1.25,0]);
      const head=addBone("head",neck,[0,.20,0],[0,1.45,0]);
      const arms=[],legs=[];
      for(const side of [-1,1]){
        const shoulder=addBone(side<0?"shoulder.L":"shoulder.R",spine,[side*.24,.12,0],[side*.24,1.09,0]);
        const elbow=addBone(side<0?"elbow.L":"elbow.R",[shoulder][0],[side*.12,-.25,0],[side*.36,.84,0]);
        const wrist=addBone(side<0?"wrist.L":"wrist.R",elbow,[side*.035,-.22,0],[side*.395,.62,0]);
        arms.push({shoulder,elbow,wrist,side});
        const hip=addBone(side<0?"hip.L":"hip.R",pelvis,[side*.13,.13,0],[side*.13,.83,0]);
        const knee=addBone(side<0?"knee.L":"knee.R",hip,[0,-.29,0],[side*.13,.54,0]);
        const ankle=addBone(side<0?"ankle.L":"ankle.R",knee,[0,-.27,0],[side*.13,.27,0]);
        legs.push({hip,knee,ankle,side});
      }
      const smoothMin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25};
      const ellipsoidSdf=(x,y,z,cx,cy,cz,rx,ry,rz)=>{
        const qx=(x-cx)/rx,qy=(y-cy)/ry,qz=(z-cz)/rz;
        const k0=Math.hypot(qx,qy,qz),k1=Math.hypot(qx/(rx/Math.min(rx,ry,rz)),qy/(ry/Math.min(rx,ry,rz)),qz/(rz/Math.min(rx,ry,rz)));
        return k0*(k0-1)/(Math.max(k1,1e-5))*Math.min(rx,ry,rz);
      };
      const forms=[
        [0,.98,0,.255,.34,.17],[0,.72,0,.235,.19,.17],[0,1.43,0,.285,.30,.245],[0,1.235,0,.105,.17,.105],
        [-.29,1.015,0,.12,.205,.115],[.29,1.015,0,.12,.205,.115],
        [-.365,.82,0,.083,.19,.085],[.365,.82,0,.083,.19,.085],
        [-.405,.625,0,.067,.105,.07],[.405,.625,0,.067,.105,.07],
        [-.13,.56,0,.118,.255,.12],[.13,.56,0,.118,.255,.12],
        [-.13,.29,0,.092,.205,.098],[.13,.29,0,.092,.205,.098],
        [-.13,.105,.065,.12,.075,.19],[.13,.105,.065,.12,.075,.19],
        [-.455,.59,.045,.04,.065,.052],[.455,.59,.045,.04,.065,.052]
      ];
      const field=(x,y,z)=>{
        let d=1e4;
        for(const f of forms)d=smoothMin(d,ellipsoidSdf(x,y,z,...f),.105);
        return d;
      };
      const nx=47,ny=70,nz=31,x0=-.62,y0=.015,z0=-.39,dx=.026,dy=.026,dz=.026;
      const values=new Float32Array((nx+1)*(ny+1)*(nz+1));
      const index=(i,j,k)=>(i*(ny+1)+j)*(nz+1)+k;
      for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++)for(let k=0;k<=nz;k++)values[index(i,j,k)]=field(x0+i*dx,y0+j*dy,z0+k*dz);
      const positions=[],skinIndices=[],skinWeights=[],triangles=[[],[],[]],vertexMap=new Map();
      const corner=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
      const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
      const edgePairs=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
      const interp=(a,b,va,vb)=>{const t=Math.max(0,Math.min(1,va/(va-vb)));return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]};
      const vertexId=p=>{
        const key=p.map(v=>v.toFixed(5)).join(",");
        if(vertexMap.has(key))return vertexMap.get(key);
        const id=positions.length/3;vertexMap.set(key,id);positions.push(...p);
        const v=new T.Vector3(...p),near=bonePoints.map((entry,i)=>({i,d:v.distanceToSquared(entry.point)})).sort((u,w)=>u.d-w.d).slice(0,4);
        let sum=0;const ws=near.map(n=>{const w=1/Math.pow(n.d+.002,1.25);sum+=w;return w});
        for(let q=0;q<4;q++){skinIndices.push(near[q].i);skinWeights.push(ws[q]/sum)}
        return id;
      };
      const emit=(a,b,c)=>{
        const center=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],eps=.0025;
        const grad=new T.Vector3(field(center[0]+eps,center[1],center[2])-field(center[0]-eps,center[1],center[2]),field(center[0],center[1]+eps,center[2])-field(center[0],center[1]-eps,center[2]),field(center[0],center[1],center[2]+eps)-field(center[0],center[1],center[2]-eps));
        const normal=new T.Vector3().crossVectors(new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),new T.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2]));
        if(normal.dot(grad)<0)[b,c]=[c,b];
        const cy=center[1],group=cy<.77?2:cy<1.25?1:0;
        triangles[group].push(vertexId(a),vertexId(b),vertexId(c));
      };
      for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)for(let k=0;k<nz;k++){
        const cp=corner.map(([a,b,c])=>[x0+(i+a)*dx,y0+(j+b)*dy,z0+(k+c)*dz]);
        const cv=corner.map(([a,b,c])=>values[index(i+a,j+b,k+c)]);
        if(cv.every(v=>v>0)||cv.every(v=>v<=0))continue;
        for(const tet of tetra){
          const points=tet.map(n=>cp[n]),vals=tet.map(n=>cv[n]),cross=[];
          for(const [a,b] of edgePairs)if((vals[a]<0)!==(vals[b]<0))cross.push(interp(points[a],points[b],vals[a],vals[b]));
          if(cross.length===3)emit(cross[0],cross[1],cross[2]);
          else if(cross.length===4){emit(cross[0],cross[1],cross[2]);emit(cross[0],cross[2],cross[3]);}
        }
      }
      const geo=new T.BufferGeometry();madeGeometries.add(geo);
      geo.setAttribute("position",new T.Float32BufferAttribute(positions,3));
      geo.setAttribute("skinIndex",new T.Uint16BufferAttribute(skinIndices,4));
      geo.setAttribute("skinWeight",new T.Float32BufferAttribute(skinWeights,4));
      let offset=0;for(let m=0;m<3;m++){geo.addGroup(offset,triangles[m].length,m);offset+=triangles[m].length}
      geo.setIndex(triangles.flat());geo.computeVertexNormals();geo.computeBoundingSphere();
      const bodyMesh=new T.SkinnedMesh(geo,[skin,shirt,pants]);bodyMesh.name="unified-skinned-body";bodyMesh.userData.characterSurface=true;bodyMesh.castShadow=true;bodyMesh.receiveShadow=false;body.add(bodyMesh);
      const skeleton=new T.Skeleton(bones);body.updateMatrixWorld(true);bodyMesh.bind(skeleton);bodyMesh.normalizeSkinWeights();
      const mesh=(parent,g,m,name)=>{madeGeometries.add(g);const o=new T.Mesh(g,m);o.name=name||"";o.castShadow=true;o.receiveShadow=false;parent.add(o);return o};
      const ellipsoid=(parent,x,y,z,sx,sy,sz,material,name)=>{
        const g=new T.SphereGeometry(1,24,16);const o=mesh(parent,g,material,name);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;
      };
      const lathe=(parent,profile,material,segments=32,scaleZ=1,name="")=>{
        const g=new T.LatheGeometry(profile.map(p=>new T.Vector2(p[0],p[1])),segments);g.computeVertexNormals();const o=mesh(parent,g,material,name);o.scale.z=scaleZ;return o;
      };
      const eyeGroups=[];
      for(const side of [-1,1]){
        const eye=new T.Group();eye.position.set(side*.105,.015,.221);head.add(eye);
        ellipsoid(eye,0,0,0,.047,.035,.018,eyeWhite,"eye-white");
        ellipsoid(eye,side*.002,-.002,.016,.024,.028,.011,iris,"iris");
        ellipsoid(eye,side*.002,-.003,.025,.012,.021,.007,pupil,"pupil");
        ellipsoid(eye,side*.009,.009,.031,.005,.007,.003,eyeWhite,"eye-glint");
        eyeGroups.push(eye);
        const browCurve=new T.CatmullRomCurve3([new T.Vector3(side*.16,.095,.19),new T.Vector3(side*.12,.115,.22),new T.Vector3(side*.075,.105,.22)]);
        mesh(head,new T.TubeGeometry(browCurve,12,.005,6,false),hair,"eyebrow");
        const cheek=ellipsoid(head,side*.15,-.085,.19,.035,.014,.006,blush,"cheek");cheek.material.transparent=true;cheek.material.opacity=.28;
      }
      const mouthCurve=new T.CatmullRomCurve3([new T.Vector3(-.025,-.115,.226),new T.Vector3(0,-.124,.23),new T.Vector3(.025,-.115,.226)]);
      mesh(head,new T.TubeGeometry(mouthCurve,10,.0035,6,false),blush,"mouth");
      const hairCap=lathe(head,[[0,.19],[.09,.205],[.18,.24],[.245,.31],[.27,.40],[.23,.49],[.15,.535],[0,.55]],hair,36,.94,"hair-cap");hairCap.position.z=-.025;hairCap.userData.characterOutline=true;
      const backHair=lathe(head,[[0,-.17],[.12,-.16],[.21,-.11],[.25,-.02],[.24,.15],[.16,.25],[0,.29]],hair,32,.62,"back-hair");backHair.position.z=-.17;backHair.userData.characterOutline=true;
      for(const side of [-1,1]){
        const curve=new T.CatmullRomCurve3([new T.Vector3(side*.21,.30,.055),new T.Vector3(side*.255,.13,.075),new T.Vector3(side*.235,-.04,.07),new T.Vector3(side*.20,-.18,.05)]);
        const lock=mesh(head,new T.TubeGeometry(curve,24,.038,10,false),hair,"side-lock");lock.userData.characterOutline=true;
      }
      const fringe1=new T.CatmullRomCurve3([new T.Vector3(-.21,.30,.12),new T.Vector3(-.13,.39,.17),new T.Vector3(-.045,.35,.20),new T.Vector3(.015,.27,.21)]);
      const fringe2=new T.CatmullRomCurve3([new T.Vector3(.005,.35,.19),new T.Vector3(.11,.39,.16),new T.Vector3(.205,.31,.12),new T.Vector3(.22,.22,.11)]);
      [fringe1,fringe2].forEach((c,i)=>{const h=mesh(head,new T.TubeGeometry(c,22,.047,10,false),i?hair:hairLight,"fringe");h.userData.characterOutline=true});
      for(const l of legs){
        const foot=new T.Group();foot.position.set(0,-.01,.06);l.ankle.add(foot);
        const upper=lathe(foot,[[0,-.09],[.055,-.085],[.09,-.05],[.105,.005],[.095,.06],[.065,.105],[.025,.115],[0,.115]],shoe,28,.78,"shoe-upper");upper.rotation.x=Math.PI/2;upper.scale.z=.78;upper.position.z=.025;upper.userData.characterOutline=true;
        const base=lathe(foot,[[0,-.098],[.06,-.095],[.095,-.075],[.105,-.05],[.08,-.032],[0,-.03]],sole,28,.8,"shoe-sole");base.rotation.x=Math.PI/2;base.scale.z=.78;base.position.z=.025;base.userData.characterOutline=true;
      }
      const shadow=new T.Mesh(new T.CircleGeometry(.48,32),new T.MeshBasicMaterial({color:0x40362d,transparent:true,opacity:.18,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;person.add(shadow);
      bodyMesh.updateMatrixWorld(true);skeleton.update();
      const weightArray=geo.attributes.skinWeight.array;let invalidWeights=0;for(let i=0;i<weightArray.length;i+=4){const total=weightArray[i]+weightArray[i+1]+weightArray[i+2]+weightArray[i+3];if(!Number.isFinite(total)||Math.abs(total-1)>.001)invalidWeights++}if(invalidWeights)throw new Error("Invalid skin weights: "+invalidWeights);
      const report={vertices:geo.attributes.position.count,triangles:geo.index.count/3,bones:bones.length,skinned:bodyMesh.isSkinnedMesh,materials:geo.groups.length};
      if(!report.skinned||report.vertices<1000||report.bones<12||report.triangles<1000)throw new Error("Unified skinned character validation failed: "+JSON.stringify(report));
      return {person,rig,body,head,eyeGroups,arms,legs,shadow,skeleton,bodyMesh,report};
    }catch(error){
      if(person){person.parent?.remove(person);person.traverse(o=>{if(o.geometry&&!madeGeometries.has(o.geometry))o.geometry.dispose?.()})}
      madeGeometries.forEach(g=>g.dispose?.());madeMaterials.forEach(m=>m.dispose?.());
      console.error("Arday unified chibi character build failed",error);return null;
    }
  };
  window.ArdayCharacterModel={create};
})();