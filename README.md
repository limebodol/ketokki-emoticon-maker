# 🐰 케토끼 이모티콘 메이커

> Spring Boot + React로 만든  
> **OGQ 이모티콘 제작 보조 MVP 프로젝트**

이미지를 업로드하면 OGQ 제출 규격에 맞게 변환하고,  
대표 이미지 생성, 제출 전 검수, ZIP 다운로드까지 한 번에 진행할 수 있는  
**이모티콘 제작 보조 서비스**입니다.

<br />

---

## 🌷 프로젝트 한 줄 소개

**케토끼 이모티콘 메이커**는 이모티콘 이미지를 업로드하면  
OGQ 제출용 이미지로 변환하고, 검수 후 ZIP 파일로 다운로드할 수 있도록 만든  
작은 웹 서비스입니다.

```text
이미지 업로드
→ OGQ 규격 변환
→ 대표 이미지 생성
→ 제출 전 검수
→ ZIP 다운로드
```

<br />
## 🧸 개발 목적

이 프로젝트는 단순 예제 프로젝트가 아니라,
실제로 필요하다고 느낀 기능을 직접 기획하고 구현해보기 위해 시작했습니다.

특히 다음 목표를 가지고 개발했습니다.

목표 설명
Spring Boot + React 연동 프론트엔드와 백엔드 API 통신 경험
이미지 업로드 처리 파일 업로드, 저장 경로 관리, DB 저장
이미지 리사이징 OGQ 규격에 맞는 이미지 변환
MySQL 데이터 저장 프로젝트, 업로드 이미지, 변환 이미지 정보 저장
오류 메시지 개선 사용자가 이해할 수 있는 오류 표시
QA 관점 검증 정상/예외/경계값 테스트 경험
MVP 완성 핵심 기능이 작동하는 최소 서비스 구현
<br />

## ✨ 주요 기능

1. 프로젝트 생성

사용자가 프로젝트명, 캐릭터명, 플랫폼 정보를 입력하면
새로운 이모티콘 프로젝트가 생성됩니다.

프로젝트명
캐릭터명
플랫폼: OGQ
업로드 방식: 개별 이미지 업로드
<br /> 2. 이미지 업로드

PNG, JPG, JPEG 이미지를 업로드할 수 있습니다.

업로드된 이미지는 서버 폴더에 저장되고,
이미지 정보는 MySQL DB에 저장됩니다.

저장되는 정보는 다음과 같습니다.

원본 파일명
저장 경로
가로 크기
세로 크기
파일 용량
파일 형식
정렬 순서
<br /> 3. OGQ 24칸 업로드 보드

OGQ 이모티콘 기준인 24칸 보드를 화면에 표시합니다.

선택한 이미지가 1번부터 순서대로 들어가며,
현재 업로드 상태를 한눈에 확인할 수 있습니다.

1~23장 선택: 테스트 모드
24장 선택: 최종 제출 준비 가능
25장 이상 선택: 파일 개수 초과
<br /> 4. 대표컷 선택

24칸 보드에서 이미지를 클릭하면 대표컷 번호가 자동으로 선택됩니다.

2번 이미지 클릭
→ 대표컷 번호 2번 선택
→ main.png / tab.png 생성 기준 이미지로 사용

잘못된 대표컷 번호를 입력하면 백엔드에서 검증 후
사용자에게 오류 메시지를 보여줍니다.

대표컷 번호가 변환된 이미지 개수를 초과했습니다.
현재 변환된 이미지 수: 2개, 입력한 번호: 3
<br /> 5. OGQ 규격 변환

업로드된 이미지를 OGQ 스티커 규격으로 변환합니다.

스티커 이미지: 740 x 640
파일 형식: PNG

원본 이미지 비율은 유지하고,
투명 배경 캔버스 중앙에 배치되도록 처리했습니다.

<br />
6. 대표 이미지 생성

선택한 대표컷을 기준으로 OGQ 대표 이미지를 생성합니다.

main.png: 240 x 240
tab.png: 96 x 74

이미 생성된 대표 이미지가 있으면 중복 저장하지 않고 업데이트합니다.

<br />
7. 제출 전 검수

OGQ 제출 전 필요한 조건을 자동으로 검사합니다.

검수 항목은 다음과 같습니다.

스티커 개수
파일 존재 여부
이미지 크기
파일 용량
파일 형식
main.png 존재 여부
tab.png 존재 여부

검수 결과는 통과/미통과와 함께 상세 메시지로 표시됩니다.

<br />
8. ZIP 다운로드

검수 후 OGQ 제출용 파일을 ZIP으로 다운로드할 수 있습니다.

ZIP 구조 예시:

OGQ/
ogq_01.png
ogq_02.png
main.png
tab.png
<br />

## 🛠 사용 기술

Backend
기술 사용 목적
Java 백엔드 개발 언어
Spring Boot REST API 서버 구현
Spring Data JPA DB 저장 및 조회
MySQL 프로젝트 및 이미지 정보 저장
Maven 의존성 관리
<br />
Frontend
기술 사용 목적
React 사용자 화면 구현
Vite React 개발 환경 구성
JavaScript 프론트엔드 로직 구현
<br />
Tools
도구 사용 목적
Eclipse Spring Boot 개발
VS Code React 및 문서 작업
MySQL 데이터베이스
Git / GitHub 버전 관리
curl / Thunder Client API 테스트
<br />
##🗂 폴더 구조
ketokki-sticker-maker
├─ backend
│ ├─ src
│ │ └─ main
│ │ ├─ java
│ │ │ └─ com.ketokki.stickermaker
│ │ │ ├─ config
│ │ │ ├─ controller
│ │ │ ├─ domain
│ │ │ ├─ dto
│ │ │ ├─ exception
│ │ │ ├─ repository
│ │ │ ├─ service
│ │ │ └─ util
│ │ └─ resources
│ │ └─ application.properties
│ └─ pom.xml
│
├─ frontend
│ └─ ketokki-emoticon-maker
│ ├─ src
│ │ └─ App.jsx
│ ├─ package.json
│ └─ vite.config.js
│
├─ storage
│ ├─ uploads
│ ├─ converted
│ └─ zips
│
├─ docs
├─ .gitignore
└─ README.md
<br />

## 🔌 API 목록

기능 Method URL
프로젝트 생성 POST /api/projects
이미지 업로드 POST /api/projects/{projectId}/images
OGQ 변환 POST /api/projects/{projectId}/convert/ogq
대표 이미지 생성 POST /api/projects/{projectId}/representatives/ogq?selectedOrder=1
OGQ 검수 POST /api/projects/{projectId}/validate/ogq
ZIP 다운로드 GET /api/projects/{projectId}/download/ogq
<br />
프로젝트 생성 Request 예시
{
"projectName": "케로 캠핑 이모티콘",
"characterName": "케로",
"targetPlatform": "OGQ",
"uploadType": "INDIVIDUAL"
}
<br />

## 🚀 실행 방법

1. MySQL DB 생성
   CREATE DATABASE ketokki_db;
   <br />
2. Backend 설정

backend/src/main/resources/application.properties 파일에서
본인 환경에 맞게 DB 정보를 수정합니다.

spring.datasource.url=jdbc:mysql://localhost:3306/ketokki_db?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

파일 저장 경로:

file.upload-dir=C:/dev/ketokki-sticker-maker/storage/uploads
file.converted-dir=C:/dev/ketokki-sticker-maker/storage/converted
file.zip-dir=C:/dev/ketokki-sticker-maker/storage/zips
<br /> 3. Backend 실행

Eclipse에서 Spring Boot 애플리케이션을 실행합니다.

KetokkiStickerMakerApplication.java
→ Run As
→ Spring Boot App

정상 실행 시 콘솔에 다음 문구가 출력됩니다.

Tomcat started on port 8080
Started KetokkiStickerMakerApplication
<br /> 4. Frontend 실행

VS Code 터미널에서 React 프로젝트 폴더로 이동합니다.

cd C:\dev\ketokki-sticker-maker\frontend\ketokki-emoticon-maker
npm install
npm run dev

브라우저에서 접속합니다.

http://localhost:5173
<br />

## 🧪 QA 테스트 관점

이번 프로젝트는 기능 구현뿐만 아니라
QA 테스트 관점으로도 정상 케이스와 예외 케이스를 확인했습니다.

<br />
1. 기능 테스트

정상적인 기능 흐름이 동작하는지 확인했습니다.

프로젝트 생성
이미지 업로드
OGQ 변환
대표 이미지 생성
검수
ZIP 다운로드
<br /> 2. 예외 테스트

잘못된 입력값을 넣었을 때 서비스가 안전하게 처리되는지 확인했습니다.

대표컷 번호가 실제 이미지 개수보다 큰 경우
이미지가 없는 상태에서 변환을 시도하는 경우
대표 이미지 생성 전 검수를 시도하는 경우
<br /> 3. 경계값 테스트

OGQ 기준인 24장을 중심으로 테스트했습니다.

0장
1장
23장
24장
25장

결과:

0장: 이미지 선택 대기
1~23장: 테스트 모드
24장: 최종 제출 준비 가능
25장 이상: 파일 개수 초과
<br /> 4. 입력값 검증 테스트

업로드 파일에 대한 검증을 추가했습니다.

빈 파일 여부
파일명 존재 여부
확장자 PNG/JPG/JPEG 여부
content-type 이미지 여부
파일 개수 24개 초과 여부
파일 용량 제한 여부
<br /> 5. 연동 테스트

React, Spring Boot, MySQL, 로컬 파일 저장소가 정상적으로 연결되는지 확인했습니다.

React → Spring Boot API
Spring Boot → MySQL
Spring Boot → storage 폴더
storage 파일 → React 미리보기
<br /> 6. 회귀 테스트

코드를 수정한 뒤 기존 기능이 깨지지 않았는지 다시 확인했습니다.

예를 들어 플랫폼 필터를 추가한 뒤에도 다음 기능을 다시 테스트했습니다.

OGQ 변환
OGQ 검수
ZIP 다운로드
<br /> 7. 사용성 테스트

사용자가 현재 상태와 오류 원인을 이해할 수 있도록 화면을 개선했습니다.

테스트 모드 / 최종 제출 모드 안내
대표컷 선택 배지 표시
검수 결과 요약 박스
서버 오류 메시지 화면 표시
<br />

## 🧯 트러블슈팅 기록

CORS 오류

React는 localhost:5173, Spring Boot는 localhost:8080에서 실행되어
CORS 문제가 발생했습니다.

해결 방법:

WebConfig에서 CORS 설정 추가
<br />
변환된 이미지가 브라우저에서 보이지 않는 문제

파일은 로컬 폴더에 저장되었지만
브라우저에서 접근할 수 있는 URL이 없었습니다.

해결 방법:

/files/converted/\*\* 정적 파일 경로 설정
<br />
대표컷 번호 오류

변환된 이미지가 2장인데 대표컷 번호를 3으로 입력하면 오류가 발생했습니다.

해결 방법:

백엔드에서 selectedOrder 검증 추가
GlobalExceptionHandler로 오류 메시지 JSON 반환
React에서 서버 오류 메시지 표시
<br />

## 🌱 앞으로 개선할 기능

이미지 순서 변경 기능
드래그 앤 드롭 업로드
업로드 이미지 개별 삭제
프로젝트 목록 조회
기존 프로젝트 다시 열기
카카오톡 / LINE / BAND 규격 추가
플랫폼별 자동 검수
실제 배포
로그인 기능
클라우드 저장소 연동
<br />

## 💡 프로젝트를 통해 배운 점

이번 프로젝트를 통해 단순히 기능을 만드는 것과
실제 서비스처럼 동작하게 만드는 것은 다르다는 것을 배웠습니다.

특히 다음 부분을 경험했습니다.

프론트엔드와 백엔드 연동
파일 업로드와 저장 처리
이미지 변환 처리
DB 저장과 조회
정적 파일 접근 설정
오류 메시지 개선
QA 테스트 관점의 검증

개발은 코드를 작성하는 것뿐만 아니라,
계속 확인하고 개선하는 과정이라는 것을 알게 되었습니다.

또한 QA 관점에서 정상 케이스와 예외 케이스를 함께 확인하는 것이
서비스 완성도를 높이는 데 중요하다는 것을 배웠습니다.

<br />
## 🐾 한 줄 정리

케토끼 이모티콘 메이커는
Spring Boot와 React를 사용해 이미지 업로드부터 OGQ 규격 변환, 검수, ZIP 다운로드까지 구현한
이모티콘 제작 보조 MVP 프로젝트입니다.

```

```
