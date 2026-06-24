
if (!window.THREE) {
  const loading = document.querySelector('#loading');
  if (loading) {
    loading.innerHTML = '<b>Three.js 로드 실패</b><span>인터넷 연결 또는 CDN 차단 문제입니다. 새로고침하거나 다른 네트워크에서 확인해주세요.</span>';
  }
  throw new Error('THREE global not loaded');
}

const canvas = document.querySelector('#scene');
const loading = document.querySelector('#loading');

const stages = [
  {id:'address', t:0.000, name:'어드레스', sub:'셋업', desc:'스윙 전 균형 잡힌 준비 자세입니다. 손과 클럽이 몸 앞에 안정적으로 놓입니다.',
   checks:[['정렬','척추각과 팔, 클럽이 자연스럽게 연결됩니다.'],['균형','발 압력은 거의 50:50에 가깝습니다.'],['손목','과도하게 꺾지 않고 부드럽게 시작합니다.']]},
  {id:'takeaway', t:0.130, name:'테이크어웨이', sub:'한 덩어리 출발', desc:'손만 뒤로 빼지 않고 가슴, 팔, 클럽이 함께 움직이기 시작합니다.',
   checks:[['몸통 출발','어깨와 가슴 회전이 클럽을 움직입니다.'],['클럽 위치','헤드가 몸 뒤로 급하게 빠지지 않습니다.'],['리듬','천천히 넓게 출발합니다.']]},
  {id:'p3', t:0.270, name:'하프 백스윙', sub:'손목 코킹', desc:'클럽이 허리 높이를 지나고 손목 코킹이 만들어지며 클럽이 위로 세워집니다.',
   checks:[['손 위치','손이 가슴 앞에서 올라갑니다.'],['클럽 플레인','샤프트가 과하게 눕지 않습니다.'],['오른무릎','오른쪽 지지축이 유지됩니다.']]},
  {id:'top', t:0.430, name:'백스윙 탑', sub:'높은 손 / 완성된 회전', desc:'손과 클럽이 가장 높은 위치에 도달합니다. 이후 전환에서 클럽이 바로 던져지면 안 됩니다.',
   checks:[['상체 회전','팔만 드는 탑이 아니라 몸통 회전으로 만들어집니다.'],['클럽 위치','클럽이 등 뒤에서 정돈됩니다.'],['균형','오른발 안쪽 지지감이 남아 있습니다.']]},
  {id:'transition', t:0.540, name:'전환', sub:'하체 먼저', desc:'왼발 압력과 골반이 먼저 움직이고, 클럽헤드는 아직 뒤에 남습니다.',
   checks:[['왼발 압력','다운스윙 전환 직후 압력이 리드발로 이동합니다.'],['클럽 지연','손은 내려오지만 클럽헤드는 아직 위/뒤에 남아야 합니다.'],['던지기 준비','여기서 바로 손으로 던지면 캐스팅이 됩니다.']]},
  {id:'delivery', t:0.660, name:'딜리버리', sub:'래그 유지', desc:'손이 먼저 내려오고 클럽헤드는 뒤늦게 따라오는 구간입니다. 던짐감의 핵심입니다.',
   checks:[['손이 먼저','손은 오른허벅지 부근으로 내려옵니다.'],['클럽은 뒤에','클럽헤드가 손보다 뒤늦게 내려옵니다.'],['스피드 축적','아직 헤드 스피드가 완전히 풀리지 않았습니다.']]},
  {id:'impact', t:0.780, name:'임팩트', sub:'풀림 / 통과', desc:'손이 먼저 지나간 뒤 클럽헤드가 빠르게 풀리며 공을 통과합니다.',
   checks:[['손이 공보다 앞','아이언은 손이 클럽헤드보다 살짝 먼저 지나갑니다.'],['헤드 스피드','이 구간에서 클럽헤드 잔상이 가장 길어집니다.'],['체중','리드발 압력이 크게 올라갑니다.']]},
  {id:'release', t:0.880, name:'릴리즈', sub:'던져짐', desc:'공을 지난 뒤 클럽이 몸을 추월하듯 풀립니다. 채를 던진다는 느낌이 보이는 구간입니다.',
   checks:[['클럽 추월','헤드가 손을 따라잡고 왼쪽 위로 빠르게 지나갑니다.'],['몸통 회전','손목만 뒤집는 것이 아니라 몸통 회전과 함께 갑니다.'],['팔로우','클럽을 억지로 멈추지 않습니다.']]},
  {id:'finish', t:1.000, name:'피니시', sub:'균형', desc:'클럽이 어깨 뒤로 넘어가고 체중은 리드발 위에 남습니다.',
   checks:[['균형','왼발 위에서 안정적으로 서 있습니다.'],['회전 완료','가슴과 골반이 타깃 방향으로 돌아갑니다.'],['결과 확인','피니시가 무너지면 이전 리듬을 점검합니다.']]}
];

const clubs = {
  driver:{name:'드라이버', len:1.18, stance:1.22, ball:.36, lift:1.10, handAhead:.02, upper:true},
  wood:{name:'우드', len:1.10, stance:1.12, ball:.29, lift:1.03, handAhead:.07},
  hybrid:{name:'유틸', len:1.04, stance:1.05, ball:.24, lift:1.00, handAhead:.10},
  iron7:{name:'7번 아이언', len:1.00, stance:1.00, ball:.18, lift:.96, handAhead:.15},
  wedge:{name:'웨지', len:.86, stance:.86, ball:.10, lift:.74, handAhead:.16},
  putter:{name:'퍼터', len:.62, stance:.72, ball:.08, lift:.14, handAhead:.02, putter:true}
};

const state = {
  t: .78,
  playing: true,
  speed: .5,
  club: 'iron7',
  view: 'front',
  overlays: {
    fallbackGolfer: true,
    clubTrail: true,
    handTrail: true,
    pressure: true,
    lagGuide: true,
    impactGuide: true
  }
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8fbff);
scene.fog = new THREE.Fog(0xf8fbff, 9, 18);

const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
camera.position.set(0, 2.2, 6.0);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, .95, 0);
controls.enableDamping = true;
controls.dampingFactor = .08;
controls.minDistance = 2.0;
controls.maxDistance = 9.5;

const hemi = new THREE.HemisphereLight(0xffffff, 0xb7c5d8, 2.0);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffffff, 2.1);
key.position.set(4, 6, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048,2048);
key.shadow.camera.left = -5;
key.shadow.camera.right = 5;
key.shadow.camera.top = 5;
key.shadow.camera.bottom = -5;
scene.add(key);

const fill = new THREE.DirectionalLight(0xdbeafe, .85);
fill.position.set(-5, 3, -4);
scene.add(fill);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(4.2, 96),
  new THREE.MeshStandardMaterial({ color:0xeaf2ff, roughness:.95, metalness:0 })
);
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(8, 16, 0xb7c5d8, 0xd9e2ee);
grid.position.y = .002;
scene.add(grid);

const labelCanvas = document.createElement('canvas');
labelCanvas.width = 1024;
labelCanvas.height = 256;
const labelCtx = labelCanvas.getContext('2d');
const labelTexture = new THREE.CanvasTexture(labelCanvas);
const labelPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(3.4, .85),
  new THREE.MeshBasicMaterial({ map: labelTexture, transparent:true })
);
labelPlane.position.set(0, 3.15, -1.8);
scene.add(labelPlane);

const materials = {
  skin: new THREE.MeshStandardMaterial({ color:0xd9b38c, roughness:.65 }),
  shirt: new THREE.MeshStandardMaterial({ color:0xf8fafc, roughness:.72 }),
  pants: new THREE.MeshStandardMaterial({ color:0x263244, roughness:.8 }),
  shoe: new THREE.MeshStandardMaterial({ color:0x111827, roughness:.7 }),
  club: new THREE.MeshStandardMaterial({ color:0x111827, roughness:.45, metalness:.45 }),
  grip: new THREE.MeshStandardMaterial({ color:0x334155, roughness:.65 }),
  ball: new THREE.MeshStandardMaterial({ color:0xffffff, roughness:.35 }),
  orange: new THREE.MeshBasicMaterial({ color:0xf97316, transparent:true, opacity:.95 }),
  purple: new THREE.MeshBasicMaterial({ color:0x7c3aed, transparent:true, opacity:.9 }),
  red: new THREE.MeshBasicMaterial({ color:0xef4444, transparent:true, opacity:.85 }),
  green: new THREE.MeshBasicMaterial({ color:0x16a34a, transparent:true, opacity:.45, depthWrite:false }),
  blue: new THREE.MeshBasicMaterial({ color:0x2563eb, transparent:true, opacity:.85 })
};

const fallback = new THREE.Group();
scene.add(fallback);

const externalGroup = new THREE.Group();
scene.add(externalGroup);
let externalMixer = null;
let externalAction = null;
let externalDuration = 1;
let externalLoaded = false;

const segmentData = [
  ['rUpperLeg','rHip','rKnee',.115,'pants'],['rLowerLeg','rKnee','rAnkle',.105,'pants'],
  ['lUpperLeg','lHip','lKnee',.115,'pants'],['lLowerLeg','lKnee','lAnkle',.105,'pants'],
  ['rShoe','rAnkle','rToe',.075,'shoe'],['lShoe','lAnkle','lToe',.075,'shoe'],
  ['neck','neck','head',.075,'skin'],
  ['rUpperArm','rShoulder','rElbow',.085,'skin'],['rForeArm','rElbow','hands',.075,'skin'],
  ['lUpperArm','lShoulder','lElbow',.085,'skin'],['lForeArm','lElbow','hands',.075,'skin']
];

const segments = {};
for(const [name,, , radius, mat] of segmentData){
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 1, 16), materials[mat]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  fallback.add(mesh);
  segments[name] = mesh;
}

const torso = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 18), materials.shirt);
torso.scale.set(.58, .72, .36);
torso.castShadow = true;
torso.receiveShadow = true;
fallback.add(torso);

const headMesh = new THREE.Mesh(new THREE.SphereGeometry(.16, 32, 18), materials.skin);
headMesh.castShadow = true;
fallback.add(headMesh);

const hat = new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.05,32), materials.shoe);
hat.castShadow = true;
fallback.add(hat);

const handMesh = new THREE.Mesh(new THREE.SphereGeometry(.075, 24, 14), materials.skin);
handMesh.castShadow = true;
fallback.add(handMesh);

const clubShaft = new THREE.Mesh(new THREE.CylinderGeometry(.018,.014,1,12), materials.club);
clubShaft.castShadow = true;
fallback.add(clubShaft);

const clubGrip = new THREE.Mesh(new THREE.CylinderGeometry(.027,.023,.27,12), materials.grip);
clubGrip.castShadow = true;
fallback.add(clubGrip);

const clubHead = new THREE.Mesh(new THREE.BoxGeometry(.28,.08,.12), materials.club);
clubHead.castShadow = true;
fallback.add(clubHead);

const ball = new THREE.Mesh(new THREE.SphereGeometry(.045,32,18), materials.ball);
ball.castShadow = true;
scene.add(ball);

const impactRing = new THREE.Mesh(
  new THREE.TorusGeometry(.18,.008,12,80),
  materials.red
);
impactRing.rotation.x = Math.PI/2;
scene.add(impactRing);

const leadPressure = new THREE.Mesh(
  new THREE.CircleGeometry(.38,48),
  materials.green
);
leadPressure.rotation.x = -Math.PI/2;
leadPressure.position.y = .012;
scene.add(leadPressure);

const trailPressure = leadPressure.clone();
scene.add(trailPressure);

const handTrail = createTrail(90, 0x7c3aed);
const clubTrail = createTrail(110, 0xf97316);
scene.add(handTrail.line, clubTrail.line);

const lagArc = new THREE.Mesh(
  new THREE.TorusGeometry(.22,.007,8,48,Math.PI*1.15),
  materials.purple
);
scene.add(lagArc);

function createTrail(count, color){
  const positions = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color, transparent:true, opacity:.85 });
  const line = new THREE.Line(geometry, material);
  return { line, positions, count };
}

function resize(){
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function v(x,y,z=0){ return new THREE.Vector3(x,y,z); }
function lerp(a,b,u){ return a + (b-a)*u; }
function smooth(u){ return u*u*(3-2*u); }
function easeIn(u){ return u*u*u; }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function mixVec(a,b,u){ return new THREE.Vector3(lerp(a.x,b.x,u), lerp(a.y,b.y,u), lerp(a.z,b.z,u)); }
function clonePose(p){
  const out = {};
  for(const k in p) out[k] = p[k].isVector3 ? p[k].clone() : p[k];
  return out;
}

function basePose(c){
  const s = c.stance;
  return {
    head:v(-.05,1.58,0), neck:v(0,1.44,0), chest:v(.01,1.22,0), pelvis:v(.03,.91,0),
    lShoulder:v(.02,1.36,.25), rShoulder:v(.01,1.36,-.25),
    lHip:v(.07,.89,.16), rHip:v(.00,.89,-.16),
    lKnee:v(.17*s,.52,.14), rKnee:v(-.20*s,.53,-.14),
    lAnkle:v(.36*s,.05,.15), rAnkle:v(-.43*s,.05,-.14),
    lToe:v(.50*s,.04,.17), rToe:v(-.29*s,.04,-.14),
    lElbow:v(.06,1.02,.18), rElbow:v(0,1.00,-.18),
    hands:v(.08,.76,0),
    clubHead:v(c.ball,.07,0),
    ball:v(c.ball,.045,0),
    chestOpen:0, pelvisOpen:0
  };
}

const bodyKeys = [
  [0, (p,c)=>p],
  [.13,(p,c)=>{p.head.x-=.015;p.neck.x-=.03;p.chest.x-=.06;p.pelvis.x-=.02;p.lShoulder.x-=.10;p.rShoulder.x-=.10;p.lShoulder.z+=.04;p.rShoulder.z-=.04;p.hands=v(-.22*c.len,.86,-.03);p.lElbow=v(-.05,1.04,.18);p.rElbow=v(-.18,1.03,-.13);p.chestOpen=-22;p.pelvisOpen=-8;return p;}],
  [.27,(p,c)=>{p.head.x-=.035;p.neck.x-=.075;p.chest.x-=.13;p.pelvis.x-=.04;p.lShoulder=v(-.11,1.40,.30);p.rShoulder=v(-.23,1.33,-.25);p.lHip.x-=.05;p.rHip.x-=.08;p.hands=v(-.48*c.len,1.23,-.04);p.lElbow=v(-.22,1.22,.20);p.rElbow=v(-.40,1.16,-.10);p.chestOpen=-48;p.pelvisOpen=-18;return p;}],
  [.43,(p,c)=>{p.head.x-=.05;p.neck.x-=.12;p.chest.x-=.20;p.pelvis.x-=.05;p.lShoulder=v(-.19,1.42,.32);p.rShoulder=v(-.30,1.33,-.27);p.lHip.x-=.07;p.rHip.x-=.10;p.lKnee.x-=.06;p.rKnee.x-=.03;p.hands=v(-.37*c.len,1.67*c.lift,-.10);p.lElbow=v(-.06,1.54,.23);p.rElbow=v(-.42,1.42,-.09);p.chestOpen=-82;p.pelvisOpen=-34;return p;}],
  [.54,(p,c)=>{p.head.x-=.04;p.neck.x-=.08;p.chest.x-=.12;p.pelvis.x+=.06;p.lHip.x+=.08;p.rHip.x+=.05;p.lKnee.x+=.05;p.rKnee.x+=.08;p.lShoulder=v(-.09,1.40,.29);p.rShoulder=v(-.18,1.34,-.24);p.hands=v(-.30*c.len,1.47*c.lift,-.10);p.lElbow=v(-.02,1.41,.20);p.rElbow=v(-.34,1.30,-.10);p.chestOpen=-55;p.pelvisOpen=8;return p;}],
  [.66,(p,c)=>{p.head.x-=.02;p.neck.x-=.025;p.chest.x-=.02;p.pelvis.x+=.13;p.lHip.x+=.15;p.rHip.x+=.11;p.lKnee.x+=.13;p.rKnee.x+=.13;p.lShoulder=v(.05,1.37,.26);p.rShoulder=v(-.08,1.35,-.22);p.hands=v(-.07*c.len,1.03,-.04);p.lElbow=v(.11,1.16,.17);p.rElbow=v(-.13,1.09,-.11);p.chestOpen=-10;p.pelvisOpen=32;return p;}],
  [.78,(p,c)=>{p.head.x+=.00;p.neck.x+=.04;p.chest.x+=.08;p.pelvis.x+=.18;p.lHip.x+=.20;p.rHip.x+=.16;p.lKnee.x+=.18;p.rKnee.x+=.18;p.lShoulder=v(.16,1.35,.24);p.rShoulder=v(.02,1.37,-.21);p.hands=v(c.ball-c.handAhead,.75,-.02);p.lElbow=v(c.ball-c.handAhead+.04,.98,.14);p.rElbow=v(-.02,.94,-.12);p.chestOpen=20;p.pelvisOpen=44;return p;}],
  [.88,(p,c)=>{p.head.x+=.06;p.neck.x+=.14;p.chest.x+=.24;p.pelvis.x+=.22;p.lHip.x+=.23;p.rHip.x+=.21;p.lKnee.x+=.18;p.rKnee.x+=.23;p.rAnkle.x+=.12;p.rToe.x+=.18;p.lShoulder=v(.32,1.35,.19);p.rShoulder=v(.18,1.40,-.19);p.hands=v(.58*c.len,1.08,.04);p.lElbow=v(.41,1.32,.12);p.rElbow=v(.28,1.18,-.12);p.chestOpen=58;p.pelvisOpen=68;return p;}],
  [1,(p,c)=>{p.head.x+=.10;p.neck.x+=.22;p.chest.x+=.36;p.pelvis.x+=.26;p.lHip.x+=.26;p.rHip.x+=.25;p.lKnee.x+=.15;p.rKnee.x+=.30;p.rAnkle.x+=.24;p.rToe.x+=.32;p.lShoulder=v(.44,1.38,.16);p.rShoulder=v(.30,1.45,-.14);p.hands=v(.24*c.len,1.63*c.lift,.12);p.lElbow=v(.50,1.50,.08);p.rElbow=v(.30,1.33,-.10);p.chestOpen=86;p.pelvisOpen=92;return p;}]
];

const clubHeadKeys = [
  [0,(p,c)=>v(c.ball,.07,0)],
  [.13,(p,c)=>v(-.65*c.len,.54,-.06)],
  [.27,(p,c)=>v(-.72*c.len,1.68*c.lift,-.08)],
  [.43,(p,c)=>v(.42*c.len,1.90*c.lift,-.18)],
  [.54,(p,c)=>v(.53*c.len,1.78*c.lift,-.22)],
  [.66,(p,c)=>v(-.56*c.len,.80,-.14)],
  [.74,(p,c)=>v(-.26*c.len,.34,-.06)],
  [.78,(p,c)=>v(c.ball,.07,0)],
  [.84,(p,c)=>v(.54*c.len,.70,.06)],
  [.88,(p,c)=>v(.08*c.len,1.76*c.lift,.10)],
  [1,(p,c)=>v(-.46*c.len,1.45*c.lift,.14)]
];

function putterPose(t,c){
  const p = basePose(c);
  const a = Math.sin(t*Math.PI*2)*.11;
  p.head.y=1.50;p.neck.y=1.38;p.chest.y=1.20;p.pelvis.y=.88;
  p.lShoulder=v(.04,1.30,.22);p.rShoulder=v(.04,1.30,-.22);
  p.lElbow=v(.04+a*.25,.98,.15);p.rElbow=v(.04+a*.25,.98,-.15);
  p.hands=v(.06+a,.72,0);p.clubHead=v(c.ball+a*1.1,.07,0);p.ball=v(c.ball,.045,0);
  return p;
}

function interpolateKey(keys, t, p, c){
  let i=0; while(i<keys.length-1 && t>keys[i+1][0]) i++;
  const [ta,fa] = keys[i];
  const [tb,fb] = keys[Math.min(i+1,keys.length-1)];
  const A = fa(clonePose(p), c);
  const B = fb(clonePose(p), c);
  let u = (t-ta)/(tb-ta || 1);
  u = (ta>=.66 && tb<=.84) ? u*u*u : smooth(u);
  return mixVec(A,B,u);
}

function poseAt(t, clubKey=state.club){
  const c = clubs[clubKey];
  if(c.putter) return putterPose(t,c);

  let i=0; while(i<bodyKeys.length-1 && t>bodyKeys[i+1][0]) i++;
  const [ta,fa] = bodyKeys[i];
  const [tb,fb] = bodyKeys[Math.min(i+1,bodyKeys.length-1)];
  const A = fa(clonePose(basePose(c)), c);
  const B = fb(clonePose(basePose(c)), c);
  const u = smooth((t-ta)/(tb-ta || 1));

  const p = {};
  for(const k in A){
    if(A[k]?.isVector3) p[k] = mixVec(A[k],B[k],u);
    else p[k] = lerp(A[k],B[k],u);
  }
  p.clubHead = interpolateKey(clubHeadKeys, t, basePose(c), c);
  p.club = c;
  return p;
}

function updateSegment(mesh, a, b, radiusScale=1){
  const mid = new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);
  const dir = new THREE.Vector3().subVectors(b,a);
  const len = dir.length();
  mesh.position.copy(mid);
  mesh.scale.set(radiusScale, len, radiusScale);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
}

function updateMeshFromPose(p){
  fallback.visible = state.overlays.fallbackGolfer && !externalLoaded;

  if(!fallback.visible) return;

  for(const [name,a,b] of segmentData){
    updateSegment(segments[name], p[a], p[b]);
  }

  torso.position.copy(p.chest.clone().add(p.pelvis).multiplyScalar(.5));
  torso.rotation.set(
    THREE.MathUtils.degToRad(10),
    THREE.MathUtils.degToRad(p.chestOpen*.15),
    THREE.MathUtils.degToRad(-12)
  );

  headMesh.position.copy(p.head);
  hat.position.copy(p.head.clone().add(v(.02,.16,0)));
  hat.rotation.set(0,0,THREE.MathUtils.degToRad(8));

  handMesh.position.copy(p.hands);

  updateSegment(clubShaft, p.hands, p.clubHead);
  const gripEnd = p.hands.clone().lerp(p.clubHead, .16);
  updateSegment(clubGrip, p.hands, gripEnd);

  clubHead.position.copy(p.clubHead);
  const clubDir = new THREE.Vector3().subVectors(p.clubHead, p.hands).normalize();
  clubHead.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0), clubDir);
}

function updateObjects(p){
  ball.position.copy(p.ball);
  impactRing.visible = state.overlays.impactGuide;
  impactRing.position.copy(p.ball).add(v(0,.015,0));

  const lead = pressureValue(state.t);
  leadPressure.visible = state.overlays.pressure;
  trailPressure.visible = state.overlays.pressure;
  leadPressure.position.set(p.lAnkle.x, .015, p.lAnkle.z);
  trailPressure.position.set(p.rAnkle.x, .015, p.rAnkle.z);
  leadPressure.scale.setScalar(.7 + lead/100*.9);
  trailPressure.scale.setScalar(.7 + (100-lead)/100*.9);
  leadPressure.material.opacity = .18 + lead/100*.45;
  trailPressure.material.opacity = .18 + (100-lead)/100*.45;

  lagArc.visible = state.overlays.lagGuide;
  lagArc.position.copy(p.hands);
  lagArc.rotation.set(Math.PI/2,0,THREE.MathUtils.degToRad(lagStatus(state.t).angle));
  lagArc.material.color.set(lagStatus(state.t).color);

  updateTrail(handTrail, state.overlays.handTrail, 'hands', 1);
  updateTrail(clubTrail, state.overlays.clubTrail, 'clubHead', 1);
}

function updateTrail(trail, visible, key, zOffset=0){
  trail.line.visible = visible;
  if(!visible) return;
  for(let i=0;i<trail.count;i++){
    const t = i/(trail.count-1);
    const p = poseAt(t, state.club);
    const point = p[key];
    trail.positions[i*3+0] = point.x;
    trail.positions[i*3+1] = point.y;
    trail.positions[i*3+2] = point.z;
  }
  trail.line.geometry.attributes.position.needsUpdate = true;
}

function clubSpeedAt(t){
  const a = poseAt(clamp(t-.012,0,1),state.club).clubHead;
  const b = poseAt(clamp(t+.012,0,1),state.club).clubHead;
  return clamp(a.distanceTo(b)*10,0,1);
}

function pressureValue(t){
  if(clubs[state.club].putter) return Math.round(50 + Math.sin(t*Math.PI*2)*2);
  if(t < .20) return Math.round(52 + t/.20*6);
  if(t < .54) return Math.round(58 + (t-.20)/.34*8);
  if(t < .78) return Math.round(66 + (t-.54)/.24*18);
  return Math.round(84 + (t-.78)/.22*8);
}

function lagStatus(t){
  if(clubs[state.club].putter) return {label:'손목 고정', color:0x2563eb, angle:20};
  if(t < .54) return {label:'코킹 형성', color:0x7c3aed, angle:-30};
  if(t < .72) return {label:'래그 유지', color:0x7c3aed, angle:-65};
  if(t < .84) return {label:'릴리즈 폭발', color:0xef4444, angle:5};
  return {label:'던져짐', color:0xf97316, angle:46};
}

function currentStage(){
  return stages.reduce((best,s)=>Math.abs(s.t-state.t)<Math.abs(best.t-state.t)?s:best, stages[0]);
}

function setView(view){
  state.view = view;
  const p = poseAt(state.t, state.club);
  const views = {
    front: { pos:[0,1.95,5.4], target:[0,.95,0] },
    side: { pos:[5.3,1.95,0], target:[0,.95,0] },
    rear: { pos:[0,1.95,-5.4], target:[0,.95,0] },
    top: { pos:[0,6.2,.05], target:[0,.65,0] },
    wrist: { pos:[p.hands.x+1.0,p.hands.y+.45,p.hands.z+1.15], target:[p.hands.x,p.hands.y,p.hands.z] },
    impact: { pos:[p.ball.x+1.2,.55,p.ball.z+1.15], target:[p.ball.x,.18,p.ball.z] }
  };
  const v = views[view] || views.front;
  camera.position.set(...v.pos);
  controls.target.set(...v.target);
  controls.update();
}

function drawLabel(){
  const st = currentStage();
  labelCtx.clearRect(0,0,labelCanvas.width,labelCanvas.height);
  labelCtx.fillStyle = 'rgba(255,255,255,.82)';
  roundRect2d(labelCtx, 18, 18, 988, 220, 36);
  labelCtx.fill();

  labelCtx.fillStyle = '#071c3a';
  labelCtx.font = '900 58px system-ui, sans-serif';
  labelCtx.textAlign = 'center';
  labelCtx.fillText(st.name, 512, 98);

  labelCtx.fillStyle = '#475569';
  labelCtx.font = '700 28px system-ui, sans-serif';
  labelCtx.fillText(st.sub + ' · ' + clubs[state.club].name, 512, 146);

  labelCtx.fillStyle = '#2563eb';
  labelCtx.font = '800 24px system-ui, sans-serif';
  labelCtx.fillText('손 → 클럽헤드 → 임팩트 순서를 확인하세요', 512, 188);
  labelTexture.needsUpdate = true;
}

function roundRect2d(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

async function tryLoadGLB(){
  if (!THREE.GLTFLoader) { throw new Error('GLTFLoader not available'); }
    const loader = new THREE.GLTFLoader();
  try{
    const gltf = await loader.loadAsync('./assets/golfer.glb');
    externalGroup.add(gltf.scene);
    gltf.scene.traverse(obj=>{
      if(obj.isMesh){
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    gltf.scene.position.set(0,0,0);
    gltf.scene.scale.setScalar(1);
    if(gltf.animations && gltf.animations.length){
      externalMixer = new THREE.AnimationMixer(gltf.scene);
      externalAction = externalMixer.clipAction(gltf.animations[0]);
      externalAction.play();
      externalDuration = gltf.animations[0].duration || 1;
      externalAction.paused = true;
    }
    externalLoaded = true;
    state.overlays.fallbackGolfer = false;
    const sw = document.querySelector('[data-toggle="fallbackGolfer"]');
    sw?.classList.remove('on');
    console.log('golfer.glb loaded');
  }catch(err){
    console.info('golfer.glb not found. Using built-in procedural golfer.');
  }finally{
    loading.classList.add('hidden');
  }
}
tryLoadGLB();

function updateExternalMixer(){
  if(!externalMixer || !externalAction) return;
  externalAction.time = state.t * externalDuration;
  externalMixer.update(0);
}

function updateUI(){
  const st = currentStage();
  const lead = pressureValue(state.t);
  const speed = clubSpeedAt(state.t);
  const lag = lagStatus(state.t);
  let speedText = speed>.70 ? 'MAX' : speed>.45 ? '빠름' : speed>.22 ? '축적' : '느림';
  let handText = '중앙';
  if(state.t>.18 && state.t<.54) handText='상승';
  else if(state.t>=.54 && state.t<.75) handText='하강';
  else if(state.t>=.75 && state.t<.84) handText='공 앞';
  else if(state.t>=.84) handText='릴리즈';

  document.querySelector('#stageBadge').textContent = st.name;
  document.querySelector('#clubBadge').textContent = clubs[state.club].name;
  document.querySelector('#stageTitle').textContent = st.name;
  document.querySelector('#stageDesc').textContent = st.desc;
  document.querySelector('#footerTitle').textContent = st.name;
  document.querySelector('#footerMsg').textContent = st.desc;

  document.querySelector('#leadMetric').textContent = lead;
  document.querySelector('#leadFeel').textContent = lead;
  document.querySelector('#leadBar').style.width = lead + '%';

  document.querySelector('#speedMetric').textContent = speedText;
  document.querySelector('#speedFeel').textContent = speedText;
  document.querySelector('#lagMetric').textContent = lag.label.replace('릴리즈 폭발','릴리즈');
  document.querySelector('#lagFeel').textContent = lag.label.replace('릴리즈 폭발','폭발');
  document.querySelector('#handMetric').textContent = handText;
  document.querySelector('#progress').value = Math.round(state.t*1000);

  document.querySelectorAll('.dot').forEach(d=>d.classList.toggle('active', d.dataset.id===st.id));
  document.querySelectorAll('.stageList button').forEach(b=>b.classList.toggle('active', b.dataset.id===st.id));

  document.querySelector('#checks').innerHTML = st.checks.map(c=>`
    <div class="check">
      <div class="icon">✓</div>
      <div><b>${c[0]}</b><small>${c[1]}</small></div>
    </div>
  `).join('');
}

function initUI(){
  document.querySelector('#stageList').innerHTML = stages.map(s=>`
    <button data-t="${s.t}" data-id="${s.id}">
      <span>${s.name}<small>${s.sub}</small></span>
      <em>${Math.round(s.t*100)}%</em>
    </button>
  `).join('');

  document.querySelector('#timeline').innerHTML = stages.map(s=>`
    <div class="dot" data-t="${s.t}" data-id="${s.id}">${s.name}</div>
  `).join('');

  document.querySelectorAll('[data-t]').forEach(el=>{
    el.addEventListener('click',()=>{
      state.t = parseFloat(el.dataset.t);
      state.playing = false;
      document.querySelector('#playBtn').textContent = '재생';
      setView(state.view);
    });
  });

  document.querySelectorAll('[data-view]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      setView(btn.dataset.view);
    });
  });

  document.querySelectorAll('[data-club]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-club]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.club = btn.dataset.club;
      setView(state.view);
    });
  });

  document.querySelectorAll('[data-toggle]').forEach(sw=>{
    sw.addEventListener('click',()=>{
      sw.classList.toggle('on');
      state.overlays[sw.dataset.toggle] = sw.classList.contains('on');
    });
  });

  document.querySelector('#playBtn').addEventListener('click', e=>{
    state.playing = !state.playing;
    e.target.textContent = state.playing ? '일시정지' : '재생';
  });

  document.querySelector('#resetBtn').addEventListener('click', ()=>{
    state.t = 0;
    state.playing = false;
    document.querySelector('#playBtn').textContent = '재생';
    setView(state.view);
  });

  document.querySelector('#speed').addEventListener('change', e=>{
    state.speed = parseFloat(e.target.value);
  });

  document.querySelector('#progress').addEventListener('input', e=>{
    state.t = parseInt(e.target.value,10)/1000;
    state.playing = false;
    document.querySelector('#playBtn').textContent = '재생';
    setView(state.view);
  });
}
initUI();

let last = performance.now();
function loop(now){
  const dt = (now-last)/1000;
  last = now;

  if(state.playing){
    state.t += dt * .16 * state.speed;
    if(state.t > 1) state.t -= 1;
  }

  const p = poseAt(state.t, state.club);
  updateMeshFromPose(p);
  updateObjects(p);
  updateExternalMixer();
  drawLabel();
  updateUI();

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
setView('front');
requestAnimationFrame(loop);
