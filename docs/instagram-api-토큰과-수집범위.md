# Instagram API — 토큰 발급과 수집 가능 범위

작성일 2026-08-12 · 근거는 전부 Meta 공식 문서(developers.facebook.com) 원문 확인. Graph API 예시 버전 **v25.0**.

이 문서는 두 가지 쟁점에 답한다.

1. 인스타그램 토큰을 어떻게 발급받는가
2. 업체(프로페셔널) 계정의 **게시물 전체 / 스토리 / 하이라이트 / 릴스**를 이미지·영상까지 받을 수 있는가

---

## 0. 결론 먼저

| 항목 | 결론 |
|---|---|
| 토큰 경로 | **Instagram API with Facebook Login for Business 로 확정.** Instagram Login 경로는 `business_discovery`를 지원하지 않아 veily 용도에 쓸 수 없다 |
| 필요 권한 | `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement` |
| 장기 토큰 | 60일. 로그인 리디렉션에서 **단기·장기 토큰이 동시에** 내려와 별도 교환 호출이 필요 없다 |
| 게시물 전체 조회 | **가능** (커서 페이지네이션, 최근 1만 건 상한 추정) |
| 이미지 원본 | **가능** (`media_url`) |
| 캐러셀 내부 이미지 | **가능하되 `children{}` 중첩 확장으로만.** ID로 재조회하면 반드시 실패 |
| 릴스 | **가능** (`media_product_type=REELS`, `media_type=VIDEO`) |
| 릴스 영상 파일 | 문서상 `media_url` 반환이 정상. **단 실측 필요** (아래 §5) |
| 스토리 | **제3자 업체 계정은 불가.** 우리가 관리하는 계정만, 그것도 24시간 이내만 |
| 하이라이트 | **공식 API 자체가 존재하지 않음.** 엔드포인트·노드·엣지·필드값 어느 층위에도 없다 |

가장 중요한 두 가지:

> **하이라이트는 설계에서 빼야 한다.** 우회로가 없다.
> **N+1 조회 파이프라인은 설계 자체가 불가능하다.** 첫 호출의 `fields`에 필요한 모든 것을 다 적어야 한다.

---

## 1. 쟁점 1 — 토큰 발급

### 1-1. 경로가 두 개인데, 우리는 하나만 쓸 수 있다

2026년 8월 현재 Instagram Platform은 두 갈래다.

| | **Facebook Login for Business** | Instagram Login |
|---|---|---|
| 로그인 자격증명 | Facebook 계정 | Instagram 계정 |
| Facebook 페이지 | **필수** | 불필요 |
| API 호스트 | `graph.facebook.com` | `graph.instagram.com` |
| 권한 네임스페이스 | `instagram_basic` 계열 | `instagram_business_*` 계열 |
| 토큰 타입 | Facebook User 토큰 / Page 토큰 | Instagram User 토큰 |
| **business_discovery** | **지원** | **미지원** |
| 해시태그 검색 | 지원 | 미지원 |

`business_discovery`가 없으면 "업체 계정을 username으로 조회한다"는 veily의 핵심 동작이 불가능하다. 따라서 **Facebook Login for Business 경로가 강제**된다. Facebook 페이지를 만들어야 하는 비용은 피할 수 없는 전제조건이다.

### 1-1-1. "Facebook Login인데 인스타그램을 조회한다고?"

이름 때문에 반드시 나오는 질문이라 따로 적는다. **된다. 그리고 이게 원래부터 표준 방식이다.**

핵심은 **Facebook Login이 데이터 출처가 아니라 인증 수단**이라는 점이다.

- **Facebook Login** = "너 누구야, 뭘 허용했어" (인증·동의)
- **조회 대상** = 인스타그램 데이터

Meta는 인스타그램을 소유하고 있고 Graph API는 **하나의 통합 그래프**다. 인스타 프로페셔널 계정도 그 그래프 안의 노드다. Facebook 계정으로 로그인해 받은 토큰에 `instagram_basic` 같은 **인스타그램 권한이 실려 있는** 것이지, Facebook 데이터를 보는 게 아니다.

연결 고리는 **Facebook 페이지**다.

```
Facebook 사용자  →  Facebook 페이지  →  연결된 Instagram 프로 계정
   (로그인)          (권한 앵커)            (실제 조회 대상)
```

Meta가 페이지를 끼워넣은 이유는 인스타 프로 계정의 소유·권한 체계를 **페이지의 역할 시스템**(`MANAGE` / `CREATE_CONTENT` / `MODERATE` / `ADVERTISE`)으로 관리하기 때문이다.

실제 호출 체인을 보면 명확하다.

```
① 로그인 → Facebook User 토큰 (scope: instagram_basic, instagram_manage_insights, ...)

② GET /me/accounts?fields=name,access_token,instagram_business_account
   → { "instagram_business_account": { "id": "17841400000000000" } }   ← ig-user-id

③ GET /v25.0/17841400000000000
     ?fields=business_discovery.username(eloon_official){media{media_url,...}}
   → 업체 인스타 데이터
```

③번을 보라. 호스트는 `graph.facebook.com`인데 **노드 ID는 인스타그램 계정 ID**다(`17841...`은 인스타그램 ID 네임스페이스). Facebook은 문 역할만 하고, 안에서 다루는 건 전부 인스타다.

순서도 헷갈리기 쉬운데 — **이건 신기술이 아니라 원조다.** Instagram Graph API는 처음부터 Facebook 페이지 연결을 요구했고, 페이지 없이 되는 Instagram Login 경로가 오히려 **2024년에 나온 신규 경로**다. 그런데 그 신규 경로에 아직 `business_discovery`가 없어서 우리는 원조 경로를 써야 한다.

> **업체들은 아무것도 안 해도 된다.** Facebook 페이지가 필요한 건 **veily 쪽 계정 하나뿐**이다. `business_discovery` 공식 문서에 조회 *대상* 계정의 요건은 "연령 제한 계정 제외" 단 하나뿐이고, 페이지 연결·앱 로그인·권한 부여 요건은 어디에도 없다.

### 1-1-2. 권한 이름에 대한 흔한 오해

> `instagram_basic` → `instagram_business_basic` 으로 이름이 바뀌었다는 이야기가 많은데 **사실이 아니다.** 2024-09-17 공지된 scope 개명(`business_basic` → `instagram_business_basic`, 구 값 2025-01-27 폐기)은 **Instagram Login 경로에만** 적용됐다. Facebook Login 경로의 `instagram_basic`은 그대로 살아 있고 폐기 예고도 없다. 두 이름은 개명 관계가 아니라 **서로 다른 API 구성에 속한 별개 권한 집합**이다.

### 1-2. 사전 준비물

1. Meta **Business 타입** 앱 생성
2. 앱 대시보드에 제품 3개 추가 — `Instagram > API setup with Facebook login`, `Facebook Login for Business`, `Webhooks`
3. veily 소유 **Instagram Business 또는 Creator 계정**
4. 그 계정에 연결된 **Facebook 페이지**
5. 그 페이지에서 `MANAGE` / `CREATE_CONTENT` / `MODERATE` / `ADVERTISE` 중 하나 이상을 수행할 수 있는 Facebook 개발자 계정

> 조회 **대상** 업체 계정은 아무 준비도 필요 없다. 우리 앱에 로그인하거나 권한을 줄 필요가 없다. 준비물은 전부 **우리 쪽(토큰 소유자)** 축이다.

### 1-3. 토큰 발급 절차

**① 로그인 다이얼로그 호출**

```
https://www.facebook.com/v25.0/dialog/oauth
  ?client_id={app-id}
  &display=page
  &extras={"setup":{"channel":"IG_API_ONBOARDING"}}
  &redirect_uri=https://veily.example.com/auth/callback
  &response_type=token
  &scope=instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement
```

**② 리디렉션 프래그먼트에서 토큰 수거**

```
https://veily.example.com/auth/callback/?#access_token=EAAHm...
  &data_access_expiration_time=1658889585
  &expires_in=4815
  &long_lived_token=ABAEs...
```

여기가 이 경로의 이점이다. 공식 문서 원문:

> "We will also append a URL fragment (`#`) with the user's short-lived User access token, some metadata about the token, and the user's **long-lived access token**"

즉 **별도 교환 호출 없이 60일짜리 장기 토큰이 즉시 나온다.** 일반 Facebook Login에서 하던 `grant_type=fb_exchange_token` 교환 단계를 건너뛸 수 있다.

**③ ig-user-id 와 Page 토큰 확보**

```
GET /me/accounts?fields=name,access_token,instagram_business_account
```

**④ 토큰 수명**

| 토큰 | 수명 |
|---|---|
| 단기 User 토큰 | 약 1~2시간 |
| 장기 User 토큰 | 약 60일 |
| Page 토큰 | 장기 User 토큰에서 파생되면 만료 없음 |

공식 문서는 이 수명이 **예고 없이 바뀔 수 있다**고 명시한다. 코드에 60일을 하드코딩하지 말고 `expires_in`을 읽어라.

### 1-4. System User 토큰은 기대하지 말 것

서버 운영용으로 "만료 없는 토큰"을 쓰고 싶겠지만, 조사 결과 **현실적 장벽이 있다.**

- `POST /{SYSTEM-USER-ID}/access_tokens` 로 발급하며 기본값이 만료 없음인 것은 맞다
- 그러나 시스템 사용자에게 앱을 설치하려면 **Ads Management API Standard Access 이상**을 가진 앱이어야 한다
- veily처럼 광고 API를 쓰지 않는 순수 Instagram 앱이 이 요건을 충족할 수 있는지는 **공식 문서로 확인되지 않았다**

→ 일단 **60일 장기 토큰 + 갱신 스케줄러**로 설계하고, System User는 나중에 별도 검증 과제로 남긴다. 만료 D-7 알림을 반드시 넣어라.

### 1-5. 앱 검수 전에 실측할 수 있는가 — 가능하다

이게 팀에서 가장 헷갈릴 지점이라 따로 검증했다. **결론: Development / Standard Access 상태에서도 제3자 공개 업체 계정 조회가 가능하다.**

근거는 제약이 걸리는 **위치**다. Development 모드 제약은 전부 "**누가 앱에 권한을 부여하는가**" 축이지, "**어떤 데이터를 읽는가**" 축이 아니다.

> "An app's mode determines **who can use the app**. App users can be broadly split into two groups: users who have a role on the app itself (role users) and those who do not."
> "Permissions with Standard Access can only be **requested from app users** who have a role on the requesting app."

`business_discovery`의 조회 대상은 앱에 로그인하지도, 권한을 부여하지도 않는 **제3자 데이터 주체**라 이 제약에 걸리지 않는다. 보강 근거:

- `business_discovery` 문서의 Limitations는 **연령 제한 계정 미반환 단 하나**뿐이다. 대상 계정의 앱 역할·테스터 요건은 어디에도 없다
- Meta는 "내가 관리하지 않는 계정의 공개 콘텐츠"에 심사 게이트를 거는 수단(`Instagram Public Content Access` feature)을 갖고 있는데, 그 적용 범위는 **해시태그 검색 4개 엔드포인트뿐**이고 `business_discovery`는 포함되지 않는다. 걸 수단이 있었는데 걸지 않았다
- Meta 스스로 이 데이터를 public으로 규정한다 — 2025-04-08 체인지로그: *"when looking up another user's **public media** via the Business Discovery API"*

> 반대 근거로 도는 "sandbox 모드에서는 본인 계정과 초대한 10명만 조회 가능"이라는 이야기는 **2018년 폐기된 레거시 Instagram API(`api.instagram.com/v1`)의 개념**이다. 현행 Instagram Platform에 Sandbox 모드는 존재하지 않는다(Development/Live 2종뿐).

다만 Meta가 "가능하다"고 긍정 명시한 문장도 없으므로, **본개발 착수 전 스모크 테스트를 게이트로 두는 것을 강력히 권장한다**(§5). 어차피 Advanced Access 신청 요건인 "최소 1회 성공 호출"도 이 테스트로 충족된다.

### 1-6. 운영 전환 시점의 요건

| 단계 | 필요한 것 |
|---|---|
| 개발·검증 | Standard Access (Business 앱은 자동 승인). App Review 불필요 |
| 실서비스 | Advanced Access → **Business Verification 필수** + 권한별 App Review |

판정 기준은 "**앱 역할이 없는 사람이 앱을 쓰는가**"다. veily 플래너/커플이 로그인해 쓰는 순간 Advanced Access가 필요하다.

App Review 제출물: 1080 이상 스크린 레코딩(로그아웃 상태에서 시작해 로그인 전 과정 포함), 신청한 **모든** 권한이 실제로 쓰이는 장면, 단계별 테스트 지침, 테스트 계정 자격증명. 권한 하나라도 시연 장면이 빠지면 반려된다.

---

## 2. 쟁점 2 — 무엇을 어디까지 받을 수 있는가

### 2-1. 한눈에 보는 가부표

| 콘텐츠 | 제3자 업체 계정 (business_discovery) | 우리가 관리하는 계정 |
|---|---|---|
| 프로필 기본 정보 | ⭕ 제한적 (§2-2) | ⭕ |
| 피드 게시물 목록 | ⭕ | ⭕ |
| 이미지 원본 URL | ⭕ `media_url` | ⭕ |
| 캐러셀 내부 이미지 | ⭕ **`children{}` 중첩 확장만** | ⭕ |
| 릴스 | ⭕ `media_product_type=REELS` | ⭕ |
| 릴스 영상 파일 | 🔶 문서상 ⭕, **실측 필요** | 🔶 실측 필요 |
| 좋아요·댓글 수 | ⭕ | ⭕ |
| 상세 인사이트(도달·저장) | ❌ | ⭕ |
| **스토리** | ❌ **불가** | ⭕ 24시간 이내만 |
| **하이라이트** | ❌ **API 부재** | ❌ **API 부재** |

### 2-2. 프로필 — 문서와 통념이 어긋나는 지점

IG User 필드 중 문서가 `Public` 마커를 붙인 것은 **6개뿐**이다.

```
biography, followers_count, id, media_count, username, website
```

`business_discovery`로 흔히 가져온다고 알려진 **`profile_picture_url`, `name`, `follows_count` 에는 현행 문서상 Public 마커가 없다.** `ig_id`는 필드 표에 아예 존재하지 않는다.

→ 업체 프로필 사진을 UI에 쓸 계획이라면 **반드시 실측으로 확인하라.** 문서대로면 못 받는다.

### 2-3. 미디어 — 받을 수 있는 필드

IG Media 중 `Public` 마커가 붙어 `business_discovery`로 확장 가능한 필드:

```
alt_text, caption, comments_count, id, is_shared_to_feed, like_count,
media_audio_type, media_product_type, media_type, media_url, owner,
permalink, shortcode, thumbnail_url, timestamp, username, view_count,
reposts_count, total_comments_count, total_like_count
```

명시적으로 **차단된** 필드 (문서에 직접 "Not accessible through Business Discovery" 기재):

```
saved_count, shares_count, total_views_count
```

주의사항:

- `thumbnail_url`은 **VIDEO 타입에만** 온다. IMAGE/CAROUSEL에 요청해도 값이 없다
- `caption`은 앨범 자식 미디어를 제외한다. `like_count`/`comments_count`도 마찬가지
- `like_count`는 대상 계정이 좋아요 수를 숨기면 응답에서 빠진다
- `owner`는 내가 만든 미디어일 때만 온다 → 제3자 조회에서는 `username`을 써라
- `view_count`는 **business_discovery 전용** 필드이며 **유료(광고) 조회수가 섞여 있다.** 오가닉 성과 지표로 그대로 쓰면 안 된다
- 폐기된 지표를 코드에 남기지 마라 — `video_views`(2025-01-08 종료), `plays`/`clips_replays_count`(v22.0+, 2025-01-21 종료)

### 2-4. 릴스 — 별도 엔드포인트가 없다

- `media_type`의 값은 **`CAROUSEL_ALBUM` / `IMAGE` / `VIDEO` 셋뿐이다. `REELS`라는 값은 없다**
- 릴스는 `media_type=VIDEO`로 오고, **릴스 판별은 `media_product_type`으로 해야 한다** (`AD` / `FEED` / `STORY` / `REELS`)
- IG User에 `reels` 엣지는 **존재하지 않는다.** 릴스는 `media` 엣지에 통합되어 있으므로 별도 호출이 필요 없다
- `is_shared_to_feed`가 `true`면 피드+릴스 탭 양쪽, `false`면 릴스 탭에만 노출

**`media_url` 누락은 예외가 아니라 정상 경로다.** 저작권 자료를 포함하거나 저작권 위반으로 플래그된 미디어는 `media_url`이 응답에서 **통째로 빠진다.** 공식 문서가 든 대표 사례가 **릴스의 배경 음원**이다. 릴스 비중이 높은 업체일수록 이 케이스가 잦을 것이다.

권장 폴백 순서: `media_url` → `children[0].media_url` → `thumbnail_url` → `permalink` 링크 카드 → 플레이스홀더.

### 2-5. 스토리 — 제3자는 불가

`GET /{ig-user-id}/stories` 엔드포인트는 **실재한다.** 하지만:

- 경로 표기가 `<YOUR_APP_USERS_INSTAGRAM_USER_ID>` 로, **앱 사용자 본인이 관리하는 계정 전용**임을 문서가 못박는다
- 필요 권한 `instagram_basic` + `pages_read_engagement` 자체가 "내가 관리하는 계정과 페이지"에만 적용되는 권한이라, **권한 모델 차원에서 제3자 스토리가 원천 차단**된다
- `business_discovery`가 노출하는 유일한 미디어 통로인 `media` 엣지는 **스토리를 명시적으로 제외**한다
- 추가 제약: **24시간만 조회 가능**, 라이브 비디오 스토리 미포함, 리셰어 스토리 미반환, 스토리당 캡션 1개만
- 기본 반환 필드가 **`id` 하나뿐**이다

→ 업체가 우리 앱에 자기 계정을 연동해야만, 그것도 24시간 안에 폴링해야만 스토리를 얻는다.

### 2-6. 하이라이트 — 공식 API가 존재하지 않는다

이건 "권한이 부족하다"가 아니라 **기능 자체가 없다.** 반증을 목표로 전방위 탐색했고 전부 실패했다.

| 확인 층위 | 결과 |
|---|---|
| API Reference 노드 목록 | IG Comment, IG Container, IG Hashtag, IG Media, IG User, Page — **하이라이트 노드 없음** |
| IG User 엣지 목록 (19개) | `stories`는 있으나 **`highlights` / `story_highlights` 없음** |
| IG Media 필드 목록 (29개) | `highlight_id`, `is_highlighted` 등 **소속 표시 필드 없음** |
| `media_product_type` 허용값 | `AD` / `FEED` / `STORY` / `REELS` — **`HIGHLIGHT` 값 없음** |
| Instagram Platform 체인지로그 전문 | "highlight" 본문 언급 **0건** (검출된 20건은 전부 `--fds-highlight` 등 CSS 변수명) |
| Content Publishing API | `media_type` 허용값에 하이라이트 없음 — **읽기뿐 아니라 쓰기도 비노출** |
| oEmbed | 지원 URL은 `/p/`, `/reel/`, 프로필 3종. **"Stories are not supported"** 명시 |
| 문서 URL 직접 타격 | `/ig-user/highlights`, `/ig-user/story_highlights` 등 **전부 404** (대조군 `/ig-user/stories`는 200) |

즉 **하이라이트는 API 데이터 모델에 아예 표현되지 않는다.**

> "하이라이트를 Graph API로 가져올 수 있다"는 블로그 주장이 돌아다니는데 **사실이 아니다.** 조사 중 실제로 그런 주장을 하는 SEO 문서를 만났고, 전부 근거가 없었다. 반대로 Apify·ScrapeCreators 같은 업체가 "Instagram Story Highlights" 전용 **상용 스크래핑 엔드포인트를 판매 중**이라는 사실 자체가 공식 API 부재의 정황 증거다.

**대안** (실현 가능성 순):

1. **24시간 폴링 아카이빙** — 업체 연동 후 `/{ig-user-id}/stories`를 12~18시간 주기로 돌려 우리 스토리지에 복제하고, veily 자체 "하이라이트" 컬렉션으로 재구성. 단 **연동 이전 시점의 과거 하이라이트는 영구히 못 가져오고, 놓친 24시간은 복구 불가**다
2. **업체 수동 큐레이션** — 하이라이트에 넣을 콘텐츠를 피드에도 올리게 유도하고 `media`로 수집
3. **온보딩 시 직접 업로드** — 초기 시딩용으로는 이게 가장 빠르다

배제할 선택지: oEmbed 임베드(스토리 미지원), `i.instagram.com` 내부 엔드포인트·스크래핑 서비스(약관 위반 및 예고 없는 차단 리스크).

---

## 3. 실제 호출 형태

**제3자 업체 계정 수집 — 이게 유일한 합법 경로다.**

```
GET https://graph.facebook.com/v25.0/{veily-ig-user-id}
  ?fields=business_discovery.username({vendor_username}){
      followers_count,
      media_count,
      media.limit(25){
        id, media_type, media_product_type, media_url, thumbnail_url,
        permalink, caption, timestamp, like_count, comments_count,
        children{id, media_type, media_url}
      }
    }
  &access_token={facebook-user-or-page-token}
```

### 절대 하지 말 것 — 문서가 실패를 보장한 코드

> "Note that this does not grant you permission to access media objects directly — **performing a `GET` on any returned IG Media will fail due to insufficient permissions.**"

- ❌ `GET /{business_discovery로_받은_media_id}` → 반드시 실패
- ❌ `GET /{media_id}/children` → 같은 이유로 실패. 이 엔드포인트가 문서에 존재하는 것은 맞지만 **자기 소유 미디어 전용**이다

→ **"목록 받고 → 각 미디어 상세 조회" 식의 N+1 파이프라인은 설계 자체가 불가능하다.** 첫 호출의 `fields` 문자열에 필요한 모든 것을 적어야 하고, 필드 하나 빠뜨리면 재조회가 아니라 **전체 재요청**이다.

### 캐러셀 처리

`media_type === 'CAROUSEL_ALBUM'`이면 최상위 `media_url`이 없다고 가정하고 `children[].media_url`을 이미지 소스로 써라. 동종 제3자 미디어 표면인 해시태그 API가 `media_url`에 대해 **"Not returned for Album IG Media"**라고 명시하고 있어, `business_discovery`도 같은 동작일 가능성이 높다.

> `children{media_url}` 중첩 확장은 **규격상 지원되지만 공식 리터럴 예시가 없다.** 근거는 세 규칙의 합성이다 — (a) "Public fields can be read via field expansion"이고 `media_url`은 Public, (b) "Public edges can be returned through field expansion"이고 `children`은 Public 표기가 붙은 유일한 엣지, (c) field expansion은 "no limitation to the amount of nesting". 배제법도 강한 방증이다 — 문서는 `saved_count`·`shares_count`·`total_views_count`에 대해 BD 미지원을 **일일이 낙인찍는데** `children`과 `media_url`에는 그런 문구가 없다.
>
> 그래도 **초기 배포는 방어적으로 하라.** `children` 포함 쿼리를 먼저 던지고 `OAuthException`/`(#100)` 계열 에러가 오면 `children` 없는 쿼리로 자동 폴백하고 에러 코드·서브코드·message를 원문 그대로 로깅. 실응답을 한 번 확인한 뒤 폴백을 제거하면 된다.

### 페이지네이션

`business_discovery`의 `media` 엣지는 **`next`/`previous` 링크를 주지 않는다.** `before`/`after` 커서만 오므로 다음 페이지 쿼리를 직접 조립해야 한다.

```
media.after({cursor}){...}
```

- `media.limit(n)`의 **최대 허용값은 어느 문서에도 명시되어 있지 않다.** 실측으로 경계를 찾아라
- IG User `/media` 엣지 자체는 "최근 생성된 미디어 최대 1만 건" 상한이 있다. `business_discovery`도 같은 엣지를 타므로 동일 상한일 가능성이 높지만 재기술되어 있지는 않다
- 무한루프 방지 가드를 반드시 넣어라

### 레이트 리밋

**`business_discovery`는 Instagram Business Use Case 리밋이 아니라 앱 단위 Platform Rate Limits를 따른다.** 이게 중요하다 — 타사 계정 조회량은 우리 계정 노출수와 **무관하게** 앱 전체 한도로 제한된다. 업체 수를 늘릴수록 앱 전체 쿼터가 병목이 된다.

- 추적 헤더: `X-App-Usage` (BUC는 `X-Business-Use-Case-Usage`)
- Instagram 레이트 리밋 초과 시 에러 코드 **80002**
- 참고: BUC 계산식은 `4800 × 노출수`다. 흔히 인용되는 `200 × impressions`는 현행 문서에서 확인되지 않았다

---

## 4. 정책 리스크 — 미디어를 우리 서버에 저장해도 되는가

**이 부분은 법무 검토가 필요하다.** 조사 결과는 부정적이다.

- **Meta Developer Policies 6.2** — 사전 허가 없이 Instagram Platform으로 User Content를 단순 표시하거나 콘텐츠를 **import/backup 하는 행위를 금지**한다. 미디어 파일을 내려받아 재호스팅하는 것은 "import or backup content"에 해당할 소지가 크다
- **Platform Terms 3.d** — 정당한 사업 목적상 보관이 더 이상 필요 없으면 **가능한 한 빨리 삭제**하고, Meta나 사용자 요청 시 신속히 갱신·삭제해야 한다. **무기한 캐싱은 금지**된다
- **Platform Terms 2.a** — 부여되는 라이선스는 "플랫폼을 사용·접근·연동"하는 제한적 라이선스일 뿐이며, 미디어 복제·재호스팅 권리는 **명시적으로 포함되어 있지 않다**
- 현행 Platform Terms 본문에는 캐싱을 명시적으로 허용하는 조항이 **없다.** 과거 Facebook Platform Policy의 "캐싱은 가능하되 최신 상태를 유지하라" 문구는 현행 약관에서 확인되지 않았다
- oEmbed 문서는 콘텐츠를 "프론트엔드 뷰 제공" 외의 목적으로 쓰는 것을 **엄격히 금지**한다 — Meta가 재호스팅이 아니라 임베드를 전제하고 있다는 방증

한편 CDN URL의 **구체적 만료 시간(TTL)은 공식 문서에 수치로 명시된 곳이 없다.** "2일 후 만료" 같은 수치는 커뮤니티 스레드와 블로그에만 있고 공식 근거가 없다. 문서는 "CDN URL은 privacy-aware이며 콘텐츠가 삭제·만료되면 미디어를 반환하지 않는다"고만 서술한다.

→ **TTL을 가정하지 마라.** 403 / URL Signature expired 발생 시 재조회하는 방어 로직을 전제로 설계하고, 미디어 파일 영구 저장은 법무 판단 전까지 보류한다.

---

## 5. 착수 전 실측 체크리스트

Graph API Explorer로 30분이면 끝난다. **이걸 통과하기 전에 본개발에 들어가지 마라.**

| # | 확인할 것 | 왜 |
|---|---|---|
| 1 | role user 토큰으로 무관한 공개 업체 계정 1건 조회 → 200 + `followers_count` 반환 | §1-5 결론의 유일한 미확정 지점. Advanced Access 신청 요건도 동시 충족 |
| 2 | `profile_picture_url`, `name`, `follows_count` 가 실제로 오는가 | 문서상 Public 마커가 없다. 안 오면 UI 설계를 바꿔야 한다 |
| 3 | `media_product_type=REELS` 미디어에 `media_url`이 오는가, mp4인가 HLS인가 | 문서에 출력 포맷 명시가 없다. `Content-Type` 헤더로 확인 |
| 4 | `children{media_url}` 중첩 확장이 실제로 동작하는가 | 규격상 지원이나 리터럴 예시가 없다 |
| 5 | 캐러셀 최상위 `media_url` 이 실제로 비어 오는가 | 폴백 로직 분기 결정 |
| 6 | `media.limit(n)` 최대값 (25 / 50 / 100 경계) | 문서에 숫자가 없다 |
| 7 | `media.after(cursor)` 로 몇 건까지 거슬러 올라가는가 | 1만 건 상한 적용 여부 |
| 8 | `media_product_type` 을 business_discovery 하위 필드로 요청 가능한가 | 공식 예시에 없다 |
| 9 | 비공개·개인·존재하지 않는 계정의 에러 응답 원문 | 에러 110 / subcode 2207013 케이스 보고됨 |

PoC가 실패하면 **개발 모드 탓으로 오진하지 마라.** 실제 원인은 대개 (a) 대상이 프로페셔널이 아닌 개인 계정, (b) age-gated 계정, (c) username 조회 실패(에러 110/2207013), (d) Platform Rate Limit 넷 중 하나다.

---

## 6. 기존 `docs/instagram-api.md` 수정 필요 항목

| 위치 | 현재 서술 | 수정 |
|---|---|---|
| 서버 동기화 흐름 3 | "캐러셀은 `children`에 들어 있는 미디어 ID를 **추가 조회**해 내부 이미지를 모두 수집한다" | **작동하지 않는다.** ID 재조회는 권한 부족으로 반드시 실패. `children{}` 중첩 확장으로 첫 호출에 포함시켜야 한다 |
| 대표 권한 | `instagram_basic`, `pages_show_list`, `pages_read_engagement` / 인사이트 시 `instagram_manage_insights` 추가 | `business_discovery` 자체가 **`instagram_manage_insights`를 필수로 요구**한다. 선택이 아니다 |
| 사전 설정 3 | "서버에서 장기 토큰을 보관·갱신한다" | 방향은 맞다. 다만 이 경로는 **로그인 리디렉션에서 장기 토큰이 바로 나오므로** 교환 단계를 따로 두지 않아도 된다 |
| 가져올 수 있는 범위 | 릴스의 `thumbnail_url` 중심 서술 | 문서상 VIDEO는 `media_url`도 온다. `thumbnail_url`은 폴백이지 기본이 아니다. 단 실측 필요 |
| (누락) | — | **스토리·하이라이트 불가**를 명시할 것. 특히 하이라이트는 공식 API 부재 |
| (누락) | — | `business_discovery`가 **Facebook Login 경로 전용**이라는 점 |
| (누락) | — | 미디어 재호스팅의 **약관 리스크**(§4) |

---

## 부록 — 확정하지 못한 것

정직하게 남긴다. 아래는 문서로 확정할 수 없어 실측이 필요한 항목이다.

- Meta가 "Development 모드에서 임의 공개 계정 조회 가능"이라고 **긍정 명시한 문장은 없다.** §1-5 결론은 제약 문서의 스코프 문언 + 대상 제약 부재 + feature 게이트 부재를 결합한 추론이다
- `business_discovery`가 Instagram Login에서 불가하다는 **명시적 부정문도 없다.** 문서 경로 404 + 요구 토큰 타입 + 권한 네임스페이스 + 호스트 4가지 정황의 종합이다
- System User 토큰에 Instagram 권한을 실제로 부여해 이 API를 호출할 수 있는지
- VIDEO `media_url`의 실제 출력 포맷(mp4 / HLS)
- CDN URL의 구체적 TTL
- `children` 하위에서 실제 반환되는 필드 집합 (문서 샘플은 `id`만 보여주고, `permalink`는 앨범 내 사진에 쓸 수 없다고만 명시)
