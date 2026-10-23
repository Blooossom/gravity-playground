# 맘대로 — 중력 놀이터 · macOS 앱

브라우저나 서버 없이 실행하는 macOS 13+ 앱입니다. AppKit 창과 macOS 내장 WebKit으로 기존 놀이터를 실행하며, HTML·CSS·JavaScript를 앱 안에 포함합니다. 외부 글꼴·네트워크 요청·Node.js 설치가 필요 없습니다. 현재 Mac의 CPU 아키텍처로 빌드합니다.

## 실행

`~/Applications/맘대로 중력 놀이터.app`을 더블클릭합니다. 빌드 원본은 `build/맘대로 중력 놀이터.app`입니다. 앱을 다른 폴더로 옮겨도 작동합니다.

- 중력: 0–30 g, 흡인력: 0.2–10×
- 환경: 지구, 달, 무중력, 목성, 태양, 수중, 태풍, 뒤죽박죽
- 수중: 높은 저항과 완만한 흐름 / 태풍: 중앙을 회전하는 힘
- 블랙홀·화이트홀, 공 비, 궤적, 감상 모드 포함
- `F`: 감상 모드 / `Esc`: 돌아오기 / `Space`: 멈춤
- `⌘S`: 배치 저장 / `⌘O`: 불러오기 / `⌃⌘F`: macOS 전체 화면
- `⌘Q`: 종료

배치는 `~/Library/Application Support/com.blooossom.gravity-playground/scene.json`에 저장합니다. 앱을 다시 열어 **불러오기**로 복원하세요. 브라우저에 저장했던 배치와는 별도입니다. 앱은 창 크기와 위치도 기억합니다.

행성 환경의 중력은 놀이용 근사값이며, 실제 크기·공기·온도·천체 표면을 재현하지 않습니다. 목성 2.4g 및 태양 28g의 참고 자료:
- https://nssdc.gsfc.nasa.gov/planetary/factsheet/
- https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html

## 빌드

macOS Command Line Tools와 Swift 6, Python 3을 사용합니다. 외부 패키지는 없습니다.

```sh
./scripts/build.sh
```

번들 생성기는 `../dist`의 모듈들을 한 HTML 파일로 묶고 온라인 글꼴을 시스템 글꼴로 바꿉니다. 네이티브 저장은 WebKit 메시지 응답으로 처리하며, 인터넷 연결·localhost 서버·브라우저 로그인 없이 작동합니다.

## 검사

```sh
node --test ../tests/*.test.mjs
'build/맘대로 중력 놀이터.app/Contents/MacOS/GravityPlayground' --smoke-test
'build/맘대로 중력 놀이터.app/Contents/MacOS/GravityPlayground' --persistence-test
```

실제 앱의 WebKit에서 번들 로드, 8개 환경, 범위 조절, 감상 모드, 화이트홀 재방출, 네이티브 파일 저장을 검사합니다. 두 번째 프로세스가 첫 번째 프로세스의 저장 내용을 읽어 재실행 후 유지 여부도 검사합니다. 테스트는 `Application Support/com.blooossom.gravity-playground/Tests`를 사용하며 사용자 배치를 덮어쓰지 않습니다.

현재 테스트는 통과했습니다. 컴퓨터 제어 연결 장애로 마우스를 이용한 수동 시각 검증은 완료하지 못했습니다.
