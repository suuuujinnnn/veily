# Instagram API 셋업 가이드

2026-08-13 · 근거는 Meta 공식 문서 원문 확인. Graph API **v25.0** 기준.

## 먼저 알아야 할 결론 3가지

**1. 경로가 두 개인데 우리는 하나만 쓸 수 있다.**
업체 계정을 username으로 조회하는 `business_discovery`는 **Facebook Login 경로에만 있다.** Instagram Login(페이지 불필요한 신규 경로)에는 없다. → **Facebook 페이지 생성은 피할 수 없다.**

**2. 받을 수 있는 건 게시물과 릴스뿐이다.**

| | 제3자 업체 계정 |
|---|---|
| 게시물 + 이미지 원본 | ⭕ |
| 캐러셀 내부 이미지 | ⭕ (`children{}` 중첩 확장만) |
| 릴스 | ⭕ |
| **스토리** | ❌ 우리가 관리하는 계정만, 24시간 이내만 |
| **하이라이트** | ❌ **공식 API 자체가 없음** |

**3. N+1 조회는 설계 자체가 불가능하다.**
> "performing a `GET` on any returned IG Media will **fail due to insufficient permissions**"

첫 호출의 `fields`에 필요한 걸 전부 적어야 한다. 하나 빠뜨리면 재조회가 아니라 **전체 재요청**이다.

---

## "Facebook Login인데 인스타를 조회한다고?"

**Facebook Login은 데이터 출처가 아니라 인증 수단이다.** Meta는 인스타를 소유하고 있고 Graph API는 하나의 통합 그래프다. Facebook 계정으로 받은 토큰에 `instagram_basic` 같은 **인스타 권한이 실려 있는** 것이다.

```
Facebook 사용자  →  Facebook 페이지  →  연결된 Instagram 프로 계정
   (로그인)          (권한 앵커)            (실제 조회 대상)
```

실제 호출을 보면 명확하다. 호스트는 `graph.facebook.com`인데 **노드 ID는 인스타그램 계정 ID**(`17841...`)다.

**이건 신기술이 아니라 원조다.** Instagram Graph API는 처음부터 페이지 연결을 요구했고, 페이지 없이 되는 Instagram Login이 오히려 2024년 신규 경로다.

> **업체들은 아무것도 안 해도 된다.** 페이지가 필요한 건 veily 계정 하나뿐이다. `business_discovery` 문서에 조회 *대상* 계정 요건은 "연령 제한 계정 제외" 단 하나뿐이다.

---

# 셋업 Step by Step

## STEP 1 — 계정 준비

1. **veily Instagram 계정을 프로페셔널(비즈니스 또는 크리에이터)로 전환**
   인스타 앱 → 설정 → 계정 유형 및 도구 → 프로페셔널 계정으로 전환
2. **Facebook 페이지 생성** (veily 공식 페이지)
3. **둘을 연결**
   Facebook 페이지 → 설정 → 연결된 계정 → Instagram

> ✅ 확인: 인스타 앱 → 설정 → 계정 센터에 Facebook 페이지가 보이면 성공

## STEP 2 — Meta 앱 생성

1. [developers.facebook.com](https://developers.facebook.com) → 내 앱 → 앱 만들기
2. 앱 유형 **Business** 선택 ← 중요
3. 제품 3개 추가:
   - `Instagram` → **API setup with Facebook login**
   - `Facebook Login for Business`
   - `Webhooks`
4. 앱 ID와 앱 시크릿을 기록 (시크릿은 서버 환경변수로만)

## STEP 3 — 권한 확인

요청할 scope 4개:

```
instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement
```

> ⚠️ `instagram_manage_insights`는 **선택이 아니라 필수다.** `business_discovery`가 요구한다.
> ⚠️ Business Manager를 통해 페이지 역할을 받은 계정이면 `ads_management` 또는 `ads_read`가 **추가로** 필요하다.

**흔한 오해:** `instagram_basic`이 `instagram_business_basic`으로 개명됐다는 이야기가 많은데 **사실이 아니다.** 2024-09 개명은 Instagram Login 경로에만 적용됐다. 두 이름은 개명 관계가 아니라 **서로 다른 API 구성의 별개 권한 집합**이다.

## STEP 4 — 토큰 받기

브라우저에 이 URL을 넣는다:

```
https://www.facebook.com/v25.0/dialog/oauth
  ?client_id={앱ID}
  &display=page
  &extras={"setup":{"channel":"IG_API_ONBOARDING"}}
  &redirect_uri=https://veily.example.com/auth/callback
  &response_type=token
  &scope=instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement
```

로그인·동의하면 리디렉션 URL 프래그먼트(`#`)에 토큰이 붙어 돌아온다:

```
...#access_token=EAAHm...&expires_in=4815&long_lived_token=ABAEs...
                ↑ 단기(1~2시간)              ↑ 장기(60일) ← 이걸 쓴다
```

> 💡 **이 경로의 이점** — 별도 교환 호출 없이 **60일 장기 토큰이 바로 나온다.** 일반 Facebook Login의 `fb_exchange_token` 단계를 건너뛸 수 있다.

## STEP 5 — ig-user-id 찾기

```
GET https://graph.facebook.com/v25.0/me/accounts
  ?fields=name,access_token,instagram_business_account
  &access_token={장기토큰}
```

응답의 `instagram_business_account.id` (`17841...`)가 앞으로 쓸 **ig-user-id**다.

## STEP 6 — 업체 조회 (스모크 테스트)

**본개발 전에 이걸 먼저 통과시켜라.** 30분이면 된다.

```
GET https://graph.facebook.com/v25.0/{ig-user-id}
  ?fields=business_discovery.username(eloon_official){
      followers_count,
      media_count,
      media.limit(25){
        id, media_type, media_product_type, media_url, thumbnail_url,
        permalink, caption, timestamp, like_count, comments_count,
        children{id, media_type, media_url}
      }
    }
  &access_token={장기토큰}
```

> ✅ 200 응답 + `followers_count`가 오면 성공. **이 호출은 나중에 Advanced Access 신청 요건("최소 1회 성공 호출")도 동시에 충족한다.**

**앱 검수 전에도 된다.** Development 모드 제약은 전부 "누가 앱에 권한을 부여하는가" 축이지 "어떤 데이터를 읽는가" 축이 아니다. 조회 대상은 앱에 로그인하지도 않는 제3자라 제약에 안 걸린다.

> 실패하면 개발 모드 탓으로 오진하지 마라. 진짜 원인은 대개 ① 대상이 개인 계정 ② 연령 제한 계정 ③ username 오타(에러 110 / subcode 2207013) ④ 레이트 리밋 넷 중 하나다.

## STEP 7 — 서버 구현 시 지킬 것

**① 절대 하지 말 것 — 실패가 보장된 코드**

```js
// ❌ 둘 다 반드시 실패한다
GET /{business_discovery로_받은_media_id}
GET /{media_id}/children     // 이 엔드포인트는 "자기 소유 미디어" 전용
```

**② 캐러셀**

`media_type === 'CAROUSEL_ALBUM'`이면 최상위 `media_url`이 없다고 가정하고 `children[].media_url`을 써라. (해시태그 API가 `media_url`에 대해 *"Not returned for Album IG Media"* 라고 명시한다)

**③ `media_url` 누락은 예외가 아니라 정상 경로**

저작권 플래그된 미디어는 `media_url`이 **응답에서 통째로 빠진다.** 공식 문서가 든 대표 사례가 **릴스 배경 음원**이다.

```
폴백 순서: media_url → children[0].media_url → thumbnail_url → permalink 링크카드 → 플레이스홀더
```

**④ 릴스 판별**

`media_type`의 값은 `IMAGE` / `VIDEO` / `CAROUSEL_ALBUM` **셋뿐이고 `REELS`는 없다.** 릴스는 `media_product_type === 'REELS'`로 판별한다. 별도 엔드포인트는 필요 없다 (IG User에 `reels` 엣지 자체가 없다).

**⑤ 페이지네이션**

`next`/`previous` 링크가 **안 온다.** `before`/`after` 커서만 오므로 `media.after({cursor}){...}` 로 직접 조립하고 무한루프 가드를 넣어라.

**⑥ 레이트 리밋**

`business_discovery`는 계정별이 아니라 **앱 단위 Platform Rate Limit**을 쓴다. 업체 수가 늘면 **앱 전체 쿼터가 병목**이 된다. `X-App-Usage` 헤더로 추적하고, 초과 시 에러 코드는 **80002**다.

**⑦ 토큰 갱신**

60일 만료다. **D-7 알림을 반드시 넣어라.** System User 토큰(만료 없음)은 앱 설치에 *Ads Management API Standard Access* 가 필요해 순수 Instagram 앱이 쓸 수 있는지 확인되지 않았다.

## STEP 8 — 운영 전환

| 단계 | 필요한 것 |
|---|---|
| 개발·검증 | Standard Access (Business 앱은 자동). App Review 불필요 |
| 실서비스 | Advanced Access → **Business Verification 필수** + 권한별 App Review |

판정 기준은 "**앱 역할이 없는 사람이 앱을 쓰는가**". 플래너·커플이 로그인하는 순간 Advanced Access가 필요하다.

App Review 제출물: **1080 이상 스크린 레코딩**(로그아웃 상태에서 시작해 로그인 전 과정), 신청한 **모든** 권한이 실제로 쓰이는 장면, 테스트 계정 자격증명. 권한 하나라도 시연이 빠지면 반려된다.

---

## 받을 수 있는 필드

**프로필** — 문서가 `Public`으로 표시한 건 6개뿐이다:
```
biography, followers_count, id, media_count, username, website
```
> ⚠️ 흔히 쓴다고 알려진 `profile_picture_url`, `name`, `follows_count`에는 **Public 마커가 없다.** 업체 프로필 사진을 UI에 쓸 계획이면 STEP 6에서 반드시 실측 확인할 것.

**미디어** — `business_discovery`로 확장 가능한 필드:
```
alt_text, caption, comments_count, id, is_shared_to_feed, like_count,
media_audio_type, media_product_type, media_type, media_url, owner,
permalink, shortcode, thumbnail_url, timestamp, username, view_count,
reposts_count, total_comments_count, total_like_count
```

명시적으로 **차단된** 필드: `saved_count`, `shares_count`, `total_views_count`

주의사항:
- `thumbnail_url`은 **VIDEO에만** 온다
- `owner`는 내가 만든 미디어에만 → 제3자 조회에서는 `username`을 써라
- `view_count`는 **유료(광고) 조회수가 섞여 있다.** 오가닉 지표로 쓰면 안 된다
- 폐기된 지표를 코드에 남기지 마라 — `video_views`(2025-01 종료), `plays`/`clips_replays_count`(v22.0+ 종료)

---

## 하이라이트가 정말 안 되는 이유

"권한 부족"이 아니라 **기능 자체가 없다.** 반증을 목표로 전방위 탐색했고 전부 실패했다.

| 확인한 곳 | 결과 |
|---|---|
| API Reference 노드 목록 | 하이라이트 노드 **없음** |
| IG User 엣지 19개 | `stories`는 있으나 `highlights` **없음** |
| `media_product_type` 허용값 | `AD`/`FEED`/`STORY`/`REELS` — **`HIGHLIGHT` 없음** |
| 체인지로그 전문 | "highlight" 본문 언급 **0건** |
| 문서 URL 직접 타격 | `/ig-user/highlights` 등 **전부 404** (대조군 `/ig-user/stories`는 200) |

즉 **하이라이트는 API 데이터 모델에 아예 표현되지 않는다.** "Graph API로 가져올 수 있다"는 블로그 주장은 사실이 아니다.

**대안:**
1. **24시간 폴링 아카이빙** — 업체 연동 후 `/{ig-user-id}/stories`를 12~18시간 주기로 복제해 veily 자체 하이라이트로 재구성. 단 **연동 이전 과거 하이라이트는 영구히 못 가져오고 놓친 24시간은 복구 불가**
2. **업체 수동 큐레이션** — 하이라이트 콘텐츠를 피드에도 올리게 유도
3. **온보딩 시 직접 업로드** — 초기 시딩용으로 가장 빠름

배제: oEmbed(스토리 미지원), 스크래핑 서비스(약관 위반·차단 리스크).

---

## ⚠️ 미디어를 우리 서버에 저장해도 되나 — 법무 검토 필요

조사 결과는 **부정적**이다.

- **Developer Policies 6.2** — 사전 허가 없이 콘텐츠를 **import/backup 하는 행위를 금지**
- **Platform Terms 3.d** — 보관 필요가 없어지면 **가능한 한 빨리 삭제**. 무기한 캐싱 금지
- **Platform Terms 2.a** — 미디어 복제·재호스팅 권리가 **명시적으로 포함되어 있지 않다**
- 현행 약관에 **캐싱을 허용하는 조항이 없다** (과거 "캐싱 가능하되 최신 유지" 문구는 현행에서 확인 안 됨)

CDN URL의 **만료 시간(TTL)은 공식 문서에 수치가 없다.** "2일" 같은 수치는 블로그에만 있다. → **TTL을 가정하지 말고 403/expired 발생 시 재조회하는 방어 로직**을 전제로 짜고, 미디어 영구 저장은 법무 판단 전까지 보류.

---

## 기존 `docs/instagram-api.md` 수정 항목

| 위치 | 현재 | 수정 |
|---|---|---|
| 동기화 흐름 3 | "캐러셀은 `children`의 미디어 ID를 **추가 조회**" | **작동 안 함.** `children{}` 중첩 확장으로 첫 호출에 포함 |
| 대표 권한 | 인사이트 시 `instagram_manage_insights` 추가 | `business_discovery`가 **필수로 요구**. 선택 아님 |
| 가져올 범위 | 릴스 `thumbnail_url` 중심 | VIDEO는 `media_url`도 온다. `thumbnail_url`은 폴백 |
| (누락) | — | **스토리·하이라이트 불가** 명시 |
| (누락) | — | `business_discovery`가 **Facebook Login 전용** |
| (누락) | — | 미디어 재호스팅 **약관 리스크** |

---

## 부록 — 실측 결과 (2026-08-14, v26.0)

STEP 6 스모크 테스트를 `eloon_official` 대상으로 통과시키고 확인한 내용이다.

| # | 확인할 것 | 결과 |
|---|---|---|
| 1 | `profile_picture_url`, `name`, `follows_count`가 실제로 오는가 | **전부 온다.** Public 마커가 없어도 `business_discovery`로는 반환된다 |
| 2 | 릴스에 `media_url`이 오는가, mp4인가 HLS인가 | 미확인 — 표본이 전부 캐러셀이었다 |
| 3 | `children{media_url}` 중첩 확장이 실제로 되는가 | **작동한다.** 폴백 분기는 제거해도 된다 |
| 4 | 캐러셀 최상위 `media_url`이 비어 오는가 | **비지 않는다.** 첫 자식과 동일한 URL이 온다. 다만 해시태그 API 문서와 어긋나므로 폴백은 남겨둔다 |
| 5 | `media.limit(n)` 최대값 (25/50/100) | 미확인 — `limit(5)`로만 호출 |
| 6 | `media.after()` 로 몇 건까지 거슬러 가는가 | 미확인. 다만 `media.paging.cursors`에 `after`만 오고 `before`는 없는 것을 확인 |
| 7 | 비공개·개인·없는 계정의 에러 응답 원문 | 미확인 |

### 계정 연결에서 실제로 막혔던 것

문서 STEP 3의 경고가 그대로 현실이 됐다. 페이지를 만들면 Meta가 **비즈니스 포트폴리오를 자동 생성**하고 그 포트폴리오가 페이지를 소유한다. 이 구조에서는 `pages_show_list`만으로 `/me/accounts`가 **빈 배열**을 반환하며, 권한 부족 에러조차 나지 않아 원인 파악이 어렵다.

```
최비성 (개인 프로필)
  └─ badger.1681230 (비즈니스 포트폴리오, ID 1560446189068598)  ← 페이지 소유자
       └─ veily 페이지 (1176654458874795)
            └─ Instagram (17841440033789899)
```

**최종적으로 필요했던 권한 6개:**

```
instagram_basic, instagram_manage_insights,
pages_show_list, pages_read_engagement,
ads_read, business_management          ← 포트폴리오 소유 구조에서 추가로 필요
```

진단 시 주의할 점 두 가지:

- `me/permissions`가 `granted`로 나와도 **비즈니스 통합 화면의 개별 토글이 꺼져 있으면** 데이터가 안 온다. 스코프 부여와 실제 게이트가 별개다
- 앱에 권한을 추가해도 **기존 토큰에는 실리지 않는다.** 비즈니스 통합에서 앱 연결을 삭제한 뒤 토큰을 재발급해야 동의 팝업이 처음부터 뜬다

`children` 확장은 **방어적으로 배포하라** — 포함 쿼리를 먼저 던지고 `OAuthException`/`(#100)` 계열 에러가 오면 `children` 없는 쿼리로 자동 폴백하고 에러 원문을 로깅. 실응답을 한 번 확인한 뒤 폴백을 제거하면 된다.
