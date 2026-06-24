# SwingLab V3 · Three.js 3D Golfer

이 프로젝트는 골프 스윙 교육용 3D 웹페이지 프로토타입입니다.

## 실행 방법

1. 압축을 풉니다.
2. `index.html`을 브라우저에서 엽니다.
3. 인터넷 연결이 필요합니다. Three.js 모듈을 CDN에서 불러옵니다.

브라우저 보안 정책 때문에 로컬 파일에서 모듈 로딩이 막히면 아래처럼 로컬 서버로 실행하세요.

```bash
python -m http.server 8000
```

그리고 브라우저에서 아래 주소를 엽니다.

```text
http://localhost:8000
```

## 실제 GLB 모델 연결

`assets/` 폴더에 아래 파일을 넣으면 페이지가 실제 모델 로드를 시도합니다.

```text
assets/golfer.glb
assets/iron7.glb
```

현재는 `golfer.glb`가 없으면 내장된 절차형 3D 골퍼가 자동으로 표시됩니다.

## GLB 모델 조건

- GLB 또는 GLTF
- 리깅된 사람 모델
- 스윙 애니메이션 클립 1개 이상 포함
- 권장 본 구조:
  - pelvis
  - spine
  - chest
  - neck
  - head
  - upperArm / foreArm / hand
  - upperLeg / lowerLeg / foot

## 다음 업그레이드

1. Blender에서 골퍼 모델 리깅
2. Adam Scott 스타일 7번 아이언 모션 클립 제작
3. GLB로 내보내기
4. `assets/golfer.glb`로 저장
5. 페이지에서 내장 프로토타입 골퍼 대신 실제 모델 재생


## GitHub Pages 안정버전 안내

이번 버전은 `importmap`, `type="module"`, `esm.sh`를 사용하지 않습니다.
브라우저 호환성을 위해 아래 일반 script 방식을 사용합니다.

```html
<script src="https://unpkg.com/three@0.128.0/build/three.min.js"></script>
<script src="https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="./app.js?v=5"></script>
```

업로드 후 `Ctrl + F5`로 강력 새로고침하세요.
