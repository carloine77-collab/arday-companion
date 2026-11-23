(()=>{
  const create=(T,scene,stylizeMaterial)=>{
    let person=null;
    const madeGeometries=new Set(),madeMaterials=new Set();
    try{
      const mat=(color,roughness=.84)=>{const m=stylizeMaterial(new T.MeshStandardMaterial({color,roughness,metalness:0,flatShading:false}));madeMaterials.add(m);return m};
      const skin=mat(0xe8b99d,.9),hair=mat(0xc99a42,.78),hairLight=mat(0xe8bf70,.72),shirt=mat(0xeee4d6,.94),pants=mat(0x55515a,.96),shoe=mat(0x51443f,.88),sole=mat(0x342e30,.9),eyeWhite=mat(0xfff8ef,.7),iris=mat(0x806d61,.55),pupil=mat(0x302827,.5),blush=mat(0xd99c87,.9);
      person=new T.Group();person.name="ArdayChibiCharacter";person.scale.set(1,.90,1);scene.add(person);
      const rig=new T.Group();rig.name="character-rig";person.add(rig);
      const body=new T.Group();body.name="character-body";rig.add(body);
      const boneRoot=new T.Bone();boneRoot.name="pelvis-root";boneRoot.position.y=.70;body.add(boneRoot);
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
      // One lofted SDF trunk gives the chest, waist and pelvis a continuous silhouette.
      // The torso, visible neck and shaped head are designed as one continuous silhouette.
      // A tapered chin keeps the neck readable instead of letting an ellipsoid head swallow it.
      const loftSdf=(profile,x,y,z)=>{
        let i=0;
        if(y<=profile[0][0])i=0;
        else if(y>=profile[profile.length-1][0])i=profile.length-2;
        else for(let q=0;q<profile.length-1;q++)if(y>=profile[q][0]&&y<=profile[q+1][0]){i=q;break}
        const a=profile[i],b=profile[i+1],span=Math.max(1e-5,b[0]-a[0]),t=Math.max(0,Math.min(1,(y-a[0])/span)),t2=t*t,t3=t2*t;
        const interpolate=axis=>{
          const p0=profile[Math.max(0,i-1)],p3=profile[Math.min(profile.length-1,i+2)];
          const m1=(b[axis]-p0[axis])/Math.max(1e-5,b[0]-p0[0])*span;
          const m2=(p3[axis]-a[axis])/Math.max(1e-5,p3[0]-a[0])*span;
          return Math.max(.012,(2*t3-3*t2+1)*a[axis]+(t3-2*t2+t)*m1+(-2*t3+3*t2)*b[axis]+(t3-t2)*m2);
        };
        const rx=interpolate(1),rz=interpolate(2),radial=(Math.hypot(x/rx,z/rz)-1)*Math.min(rx,rz);
        const vertical=Math.max(profile[0][0]-y,y-profile[profile.length-1][0]);
        return Math.hypot(Math.max(radial,0),Math.max(vertical,0))+Math.min(Math.max(radial,vertical),0);
      };
      const torsoProfile=[
        [.59,.17,.12],[.66,.185,.132],[.75,.182,.13],
        [.84,.174,.122],[.92,.174,.122],[1.00,.19,.135],
        [1.09,.205,.145],[1.14,.185,.13],[1.18,.125,.09],[1.205,.075,.065]
      ];
      const headProfile=[
        [1.26,.018,.018],[1.285,.075,.065],[1.32,.14,.12],
        [1.38,.22,.185],[1.45,.29,.24],[1.53,.33,.265],
        [1.61,.31,.25],[1.68,.24,.20],[1.73,.14,.12],
        [1.765,.055,.05],[1.78,.012,.012]
      ];
      const torsoSdf=(x,y,z)=>loftSdf(torsoProfile,x,y,z);
      const headSdf=(x,y,z)=>loftSdf(headProfile,x,y,z);
      const neckSdf=(x,y,z)=>ellipsoidSdf(x,y,z,0,1.265,0,.046,.12,.048);
      const forms=[
        [-.245,1.055,0,.075,.145,.072],[.245,1.055,0,.075,.145,.072],
        [-.345,.82,0,.066,.17,.064],[.345,.82,0,.066,.17,.064],
        [-.38,.625,0,.057,.095,.058],[.38,.625,0,.057,.095,.058],
        [-.125,.56,0,.096,.225,.09],[.125,.56,0,.096,.225,.09],
        [-.125,.29,0,.078,.185,.078],[.125,.29,0,.078,.185,.078],
        [-.125,.105,.065,.105,.068,.17],[.125,.105,.065,.105,.068,.17],
        [-.425,.59,.04,.038,.06,.045],[.425,.59,.04,.038,.06,.045]
      ];
      const field=(x,y,z)=>{
        let d=torsoSdf(x,y,z);
        d=smoothMin(d,neckSdf(x,y,z),.018);
        d=smoothMin(d,headSdf(x,y,z),.022);
        for(const f of forms)d=smoothMin(d,ellipsoidSdf(x,y,z,...f),.042);
        return d;
      };
      const nx=78,ny=116,nz=48,x0=-.58,y0=.015,z0=-.36,dx=.015,dy=.015,dz=.015;
      const values=new Float32Array((nx+1)*(ny+1)*(nz+1));
      const index=(i,j,k)=>(i*(ny+1)+j)*(nz+1)+k;
      for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++)for(let k=0;k<=nz;k++)values[index(i,j,k)]=field(x0+i*dx,y0+j*dy,z0+k*dz);
      const positions=[],skinIndices=[],skinWeights=[],triangles=[[],[],[]],vertexMap=new Map();
      const corner=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
      const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
      const edgePairs=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
      const boneIndexByObject=new Map(bones.map((bone,index)=>[bone,index]));
      const bonePointByObject=new Map(bonePoints.map(entry=>[entry.bone,entry.point]));
      const boneSegments=bones.slice(1).map(bone=>({a:bonePointByObject.get(bone.parent),b:bonePointByObject.get(bone),parentIndex:boneIndexByObject.get(bone.parent),childIndex:boneIndexByObject.get(bone)})).filter(segment=>segment.a&&segment.b);
      const interp=(a,b,va,vb)=>{const t=Math.max(0,Math.min(1,va/(va-vb)));return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]};
      const vertexId=p=>{
        const key=p.map(v=>v.toFixed(5)).join(",");
        if(vertexMap.has(key))return vertexMap.get(key);
        const id=positions.length/3;vertexMap.set(key,id);positions.push(...p);
        const v=new T.Vector3(...p),influences=new Map();
        for(const segment of boneSegments){
          const axis=new T.Vector3().subVectors(segment.b,segment.a),offset=new T.Vector3().subVectors(v,segment.a);
          const t=Math.max(0,Math.min(1,offset.dot(axis)/Math.max(axis.lengthSq(),1e-8)));
          const nearest=segment.a.clone().addScaledVector(axis,t),distanceSq=v.distanceToSquared(nearest),weight=1/Math.pow(distanceSq+.002,1.25);
          influences.set(segment.parentIndex,(influences.get(segment.parentIndex)||0)+weight*(1-t));
          influences.set(segment.childIndex,(influences.get(segment.childIndex)||0)+weight*t);
        }
        const near=[...influences.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=near.reduce((total,item)=>total+item[1],0);
        for(let q=0;q<4;q++){const influence=near[q];skinIndices.push(influence?influence[0]:0);skinWeights.push(influence?influence[1]/sum:0)}
        return id;
      };
      const emit=(polygon)=>{
        const center=[polygon.reduce((sum,p)=>sum+p[0],0)/polygon.length,polygon.reduce((sum,p)=>sum+p[1],0)/polygon.length,polygon.reduce((sum,p)=>sum+p[2],0)/polygon.length],eps=.002;
        const grad=new T.Vector3(field(center[0]+eps,center[1],center[2])-field(center[0]-eps,center[1],center[2]),field(center[0],center[1]+eps,center[2])-field(center[0],center[1]-eps,center[2]),field(center[0],center[1],center[2]+eps)-field(center[0],center[1],center[2]-eps)).normalize();
        const reference=Math.abs(grad.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0);
        const u=new T.Vector3().crossVectors(reference,grad).normalize(),v=new T.Vector3().crossVectors(grad,u).normalize();
        polygon.sort((a,b)=>{
          const ax=a[0]-center[0],ay=a[1]-center[1],az=a[2]-center[2],bx=b[0]-center[0],by=b[1]-center[1],bz=b[2]-center[2];
          return Math.atan2(ax*v.x+ay*v.y+az*v.z,ax*u.x+ay*u.y+az*u.z)-Math.atan2(bx*v.x+by*v.y+bz*v.z,bx*u.x+by*u.y+bz*u.z);
        });
        const normal=new T.Vector3().crossVectors(new T.Vector3(polygon[1][0]-polygon[0][0],polygon[1][1]-polygon[0][1],polygon[1][2]-polygon[0][2]),new T.Vector3(polygon[2][0]-polygon[0][0],polygon[2][1]-polygon[0][1],polygon[2][2]-polygon[0][2]));
        if(normal.dot(grad)<0)polygon.reverse();
        const group=center[1]<.70?2:center[1]<1.18?1:0,root=polygon[0];
        for(let i=1;i<polygon.length-1;i++)triangles[group].push(vertexId(root),vertexId(polygon[i]),vertexId(polygon[i+1]));
      };
      for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)for(let k=0;k<nz;k++){
        const cp=corner.map(([a,b,c])=>[x0+(i+a)*dx,y0+(j+b)*dy,z0+(k+c)*dz]);
        const cv=corner.map(([a,b,c])=>values[index(i+a,j+b,k+c)]);
        if(cv.every(v=>v>0)||cv.every(v=>v<=0))continue;
        for(const tet of tetra){
          const points=tet.map(n=>cp[n]),vals=tet.map(n=>cv[n]),cross=[];
          for(const [a,b] of edgePairs)if((vals[a]<0)!==(vals[b]<0))cross.push(interp(points[a],points[b],vals[a],vals[b]));
          if(cross.length>=3)emit(cross);
        }
      }
      const geo=new T.BufferGeometry();madeGeometries.add(geo);
      geo.setAttribute("position",new T.Float32BufferAttribute(positions,3));
      geo.setAttribute("skinIndex",new T.Uint16BufferAttribute(skinIndices,4));
      geo.setAttribute("skinWeight",new T.Float32BufferAttribute(skinWeights,4));
      let offset=0;for(let m=0;m<3;m++){geo.addGroup(offset,triangles[m].length,m);offset+=triangles[m].length}
      geo.setIndex(triangles.flat());geo.computeVertexNormals();geo.computeBoundingSphere();
      const bodyMaterials=[skin,shirt,pants];bodyMaterials.forEach(material=>{material.transparent=false;material.opacity=1;material.depthWrite=true;material.wireframe=false;material.side=T.FrontSide});
      const bodyMesh=new T.SkinnedMesh(geo,bodyMaterials);bodyMesh.name="unified-skinned-body";bodyMesh.userData.characterSurface=true;bodyMesh.castShadow=true;bodyMesh.receiveShadow=false;body.add(bodyMesh);
      body.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);bodyMesh.bind(skeleton,bodyMesh.matrixWorld);bodyMesh.normalizeSkinWeights();
      const mesh=(parent,g,m,name)=>{madeGeometries.add(g);const o=new T.Mesh(g,m);o.name=name||"";o.castShadow=true;o.receiveShadow=false;parent.add(o);return o};
      const ellipsoid=(parent,x,y,z,sx,sy,sz,material,name)=>{
        const g=new T.SphereGeometry(1,24,16);const o=mesh(parent,g,material,name);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;
      };
      const lathe=(parent,profile,material,segments=32,scaleZ=1,name="")=>{
        const g=new T.LatheGeometry(profile.map(p=>new T.Vector2(p[0],p[1])),segments);g.computeVertexNormals();const o=mesh(parent,g,material,name);o.scale.z=scaleZ;return o;
      };
      const eyeGroups=[];
      for(const side of [-1,1]){
        const ear=ellipsoid(head,side*.292,-.005,.006,.062,.073,.046,skin,"ear");ear.rotation.z=side*-.10;
        const innerEar=ellipsoid(head,side*.326,-.008,.035,.019,.041,.009,blush,"inner-ear");innerEar.rotation.z=side*-.10;
        const eye=new T.Group();eye.position.set(side*.12,.035,.245);head.add(eye);
        ellipsoid(eye,0,0,0,.049,.038,.018,eyeWhite,"eye-white");
        ellipsoid(eye,side*.002,-.002,.016,.024,.029,.011,iris,"iris");
        ellipsoid(eye,side*.002,-.003,.025,.012,.021,.007,pupil,"pupil");
        ellipsoid(eye,side*.009,.010,.031,.005,.007,.003,eyeWhite,"eye-glint");
        eyeGroups.push(eye);
        const browCurve=new T.CatmullRomCurve3([new T.Vector3(side*.17,.13,.225),new T.Vector3(side*.125,.145,.242),new T.Vector3(side*.075,.13,.25)]);
        mesh(head,new T.TubeGeometry(browCurve,12,.0045,6,false),hair,"eyebrow");
        const cheek=ellipsoid(head,side*.155,-.075,.145,.032,.014,.006,blush,"cheek");cheek.material.transparent=true;cheek.material.opacity=.25;
      }
      const mouthCurve=new T.CatmullRomCurve3([new T.Vector3(-.026,-.112,.137),new T.Vector3(0,-.122,.145),new T.Vector3(.026,-.112,.137)]);
      mesh(head,new T.TubeGeometry(mouthCurve,10,.0032,6,false),blush,"mouth");
      const hairCap=lathe(head,[[0,-.025],[.16,-.025],[.25,-.005],[.30,.035],[.325,.09],[.30,.145],[.255,.20],[.18,.25],[.09,.285],[0,.30]],hair,40,.94,"hair-cap");hairCap.position.z=-.012;hairCap.userData.characterOutline=true;
      const backHair=lathe(head,[[0,-.17],[.12,-.16],[.21,-.11],[.25,-.02],[.24,.15],[.16,.25],[0,.29]],hair,32,.62,"back-hair");backHair.position.z=-.17;backHair.userData.characterOutline=true;
      for(const side of [-1,1]){
        const curve=new T.CatmullRomCurve3([new T.Vector3(side*.23,.29,.065),new T.Vector3(side*.27,.12,.08),new T.Vector3(side*.245,-.04,.075),new T.Vector3(side*.21,-.18,.055)]);
        const lock=mesh(head,new T.TubeGeometry(curve,24,.038,10,false),hair,"side-lock");lock.userData.characterOutline=true;
      }
      const fringe1=new T.CatmullRomCurve3([new T.Vector3(-.25,.10,.17),new T.Vector3(-.15,.22,.22),new T.Vector3(-.045,.20,.255),new T.Vector3(.015,.11,.265)]);
      const fringe2=new T.CatmullRomCurve3([new T.Vector3(.005,.20,.255),new T.Vector3(.12,.23,.23),new T.Vector3(.23,.12,.16),new T.Vector3(.235,.06,.12)]);
      [fringe1,fringe2].forEach((c,i)=>{const h=mesh(head,new T.TubeGeometry(c,22,.036,10,false),i?hair:hairLight,"fringe");h.userData.characterOutline=true});
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