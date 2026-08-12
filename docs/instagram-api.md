# Instagram 포트폴리오 연동

`/vendors`의 공개 업체 포트폴리오는 **Instagram Graph API의 Business Discovery**로 가져오는 것을 기준으로 설계한다. 사용자명 검색은 일반 Instagram API나 웹 스크래핑으로 처리하지 않는다.

이 기능은 Veily가 연결한 기준 계정의 토큰으로 **다른 공개 Professional 계정**을 `username`으로 직접 조회한다. 조회 대상 업체는 Veily 앱에 로그인하거나 별도 권한을 부여할 필요가 없다.

## 사전 설정

1. Meta for Developers에서 Business 앱을 만들고 Instagram Graph API 제품을 추가한다.
2. Veily가 소유한 Facebook Page에 Instagram **Professional(비즈니스 또는 크리에이터)** 계정을 연결한다.
3. Facebook Login을 통해 관리자에게 권한을 받고, 서버에서 장기 토큰을 보관·갱신한다. 브라우저 환경변수나 localStorage에 토큰을 넣지 않는다.
4. 개발 중에는 앱 역할을 받은 테스트 사용자만, 운영에서는 필요한 권한의 App Review 및 Business Verification을 거친다.

대표 권한은 `instagram_basic`, `pages_show_list`, `pages_read_engagement`이며, 인사이트까지 저장할 때 `instagram_manage_insights`를 추가한다. 실제 필요한 권한과 심사 조건은 릴리스 전에 Meta 대시보드의 현재 안내를 다시 확인한다.

## 앱 검수 전 실제 검증

앱 검수 전에도 Development 모드에서 실제 외부 업체 계정 조회를 검증할 수 있다. 단, API 호출 주체인 Veily 쪽 계정은 필요하다.

1. 테스트용 Facebook 계정을 Meta 앱의 Admin, Developer 또는 Tester 역할로 등록한다.
2. 그 Facebook 계정이 관리하는 Facebook Page와 테스트용 Instagram Professional 계정을 연결한다.
3. Graph API Explorer에서 **Veily 앱을 선택**하고 해당 테스트 사용자로 User Access Token을 발급한다. 이후 `/me/accounts?fields=name,access_token,instagram_business_account`를 호출해 Page Access Token과 `ig-user-id`를 확인한다.
4. 확보한 `ig-user-id`와 Page Access Token으로 실제 외부의 공개 Professional 계정을 `business_discovery.username({account})`에 넣어 호출한다.
5. 단일 이미지, 릴스의 `thumbnail_url`, 캐러셀의 하위 이미지, 페이지네이션, 비공개·개인 계정 실패 응답까지 기록해 검수 영상과 오류 처리에 사용한다.

단기 User Token은 개발 확인에만 사용한다. 운영에서는 서버에서 장기 토큰으로 교환·갱신하며 토큰을 브라우저, 클라이언트 환경변수, localStorage에 저장하지 않는다.

## 서버 동기화 흐름

1. `POST /api/vendors/:vendorId/instagram/sync`가 서버 토큰으로 연결된 Instagram Business Account ID를 찾는다.
2. `/{ig-user-id}?fields=business_discovery.username({account}){username,name,profile_picture_url,followers_count,media_count,media.limit(24){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children}}` 형태로 Business Discovery를 요청한다. 이는 키워드 기반 전체 계정 검색이 아니라 **정확한 사용자명 조회**다.
3. 응답에서 이미지의 `media_url`, 릴스의 `thumbnail_url`, `permalink`, `timestamp`를 정규화해 저장한다. 캐러셀은 `children`에 들어 있는 미디어 ID를 추가 조회해 내부 이미지를 모두 수집한다. 실패·권한 없음·비공개 계정은 동기화 상태와 원인을 남긴다.
4. 워커/크론으로 6~24시간마다 갱신하고, 화면의 갱신 버튼은 이 서버 작업을 요청한다. Meta 호출 결과는 캐시해 레이트 리밋과 화면 지연을 줄인다.

## 가져올 수 있는 범위와 제약

- 공개 Professional 계정의 프로필 기본 정보, 미디어 목록, 캡션, 게시 시각, 미디어 유형, 썸네일/이미지 URL, 원본 게시물 permalink를 이용할 수 있다. 대상 계정의 별도 OAuth 연결은 필요 없다.
- `media` 목록은 커서 기반 페이지네이션으로 추가 조회할 수 있다. 그러나 삭제·비공개 전환·접근 권한 변경·일부 특수 미디어 유형은 포함되지 않을 수 있으므로, ‘전 게시물 영구 완전 백업’을 제품 보장으로 표현하지 않는다.
- 게시물의 좋아요·댓글·세부 인사이트는 권한과 **계정 소유/관리 관계**에 따라 제한된다. 제3자 업체의 통계를 기본 기능으로 가정하면 안 된다.
- 일반 개인 계정, 비공개 계정, 임의의 전체 Instagram 검색, 과거 모든 게시물 보장은 지원 범위가 아니다. 데이터 보관·표시는 Meta 플랫폼 정책과 미디어 URL 만료 정책을 따른다.

프론트엔드의 `InstagramPortfolio`와 `getInstagramPortfolioMock`은 이 서버 응답 계약을 먼저 표현한 것이다. 서버 연동 시 `source: 'instagram-api'`와 실제 `media` 배열을 반환하도록 바꾸면 화면 컴포넌트는 그대로 재사용한다.
