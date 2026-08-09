import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Bell, Check, X, Calendar, Link2, Building2,
  Bot, Plus, ChevronLeft, ChevronRight, Send, Home,
  MessageSquare, Star, Heart, AlertCircle, CheckCircle,
  CreditCard, Trash2, ChevronDown, Edit3, RefreshCw,
  Upload, Instagram, UserPlus, Car, Bus, MapPin, Clock,
  Sparkles, Share2, LayoutGrid, Rows3, Menu,
  PanelRightOpen, PanelRightClose, PanelLeftClose,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewState =
  | { kind: "ai" }
  | { kind: "scheduler" }
  | { kind: "vendor" }
  | { kind: "couple"; coupleId: number; sub: number };

type Couple = {
  id: number; groom: string; bride: string; venue: string;
  weddingDate: string; dday: number; progress: number; color: string;
  groomPhone: string; bridePhone: string; memo: string;
};
type BudgetItem = {
  id: number; name: string; vendor: string;
  estimated: number; deposit: number; balance: number;
  status: "미계약" | "계약금납부" | "완납";
};
type BudgetCat = { category: string; items: BudgetItem[] };
type TLItem = { id: number; period: string; task: string; done: boolean };
type CkItem = { id: number; category: string; text: string; done: boolean };
type DmSummary = {
  id: number; coupleId: number; sender: string; time: string;
  message: string; requests: string[]; decisions: string[]; unresolved: string[];
  done: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const COLORS = ["#C4779B", "#7B68C8", "#5BA4CF", "#72B582", "#E8904A"];

const INIT_COUPLES: Couple[] = [
  { id: 1, groom: "김지훈", bride: "박서연", venue: "그랜드 워커힐", weddingDate: "2026-10-23", dday: 82, progress: 72, color: "#C4779B", groomPhone: "010-1234-5678", bridePhone: "010-9876-5432", memo: "드레스 핏 꼼꼼히 체크 필요" },
  { id: 2, groom: "이민준", bride: "최유나", venue: "롯데호텔 월드", weddingDate: "2026-09-16", dday: 45, progress: 85, color: "#7B68C8", groomPhone: "010-2345-6789", bridePhone: "010-8765-4321", memo: "" },
  { id: 3, groom: "박준혁", bride: "김하은", venue: "파라다이스 시티", weddingDate: "2026-12-07", dday: 127, progress: 55, color: "#5BA4CF", groomPhone: "010-3456-7890", bridePhone: "010-7654-3210", memo: "허니문 해외 희망" },
  { id: 4, groom: "정태양", bride: "오지수", venue: "신라호텔", weddingDate: "2027-02-28", dday: 210, progress: 30, color: "#72B582", groomPhone: "010-4567-8901", bridePhone: "010-6543-2109", memo: "" },
];

const VENDORS_DATA = [
  { id: 1, name: "세인트 드레스", category: "드레스", price: 2200000, partnerPrice: 1980000, increaseDate: "2026-09-01", stock: 3 },
  { id: 2, name: "브라이덜톤 스튜디오", category: "스튜디오", price: 880000, partnerPrice: 660000, increaseDate: "2026-10-15", stock: 8 },
  { id: 3, name: "라뷰티 메이크업", category: "메이크업", price: 700000, partnerPrice: 550000, increaseDate: "2026-11-01", stock: 12 },
  { id: 4, name: "유로웨딩밴드", category: "예물", price: 1800000, partnerPrice: 1500000, increaseDate: "2027-01-01", stock: 5 },
  { id: 5, name: "그린포레스트 플라워", category: "부케", price: 380000, partnerPrice: 310000, increaseDate: "2026-12-01", stock: 20 },
  { id: 6, name: "뷰포레 영상", category: "영상", price: 1200000, partnerPrice: 950000, increaseDate: "2027-02-01", stock: 4 },
];

const INIT_SUMMARIES: DmSummary[] = [
  { id: 1, coupleId: 1, sender: "박서연", time: "오전 9:14", message: "플래너님~ 8월 15일 오전 10시에 세인트 드레스 계약하러 가도 될까요?", requests: ["드레스 계약 일정 요청 (8/15 오전 10:00)"], decisions: [], unresolved: [], done: false },
  { id: 2, coupleId: 2, sender: "최유나", time: "오전 10:33", message: "22일 스튜디오 촬영 9시에 남편이랑 같이 갈게요ㅎㅎ 남편 수트 입고 가면 되나요?", requests: ["스튜디오 촬영 참석 확인 (8/22 09:00)"], decisions: ["남편 수트 착용으로 확정"], unresolved: [], done: false },
  { id: 3, coupleId: 1, sender: "김지훈", time: "오전 11:05", message: "웨딩홀 식대를 A코스에서 B코스로 바꾸면 얼마나 더 나와요?", requests: [], decisions: [], unresolved: ["식대 코스 변경 시 추가 비용 확인 필요 (A→B코스)"], done: false },
  { id: 4, coupleId: 3, sender: "박준혁", time: "오후 1:07", message: "메이크업 샵 이번주 화요일에 예약 가능한지 확인 부탁드려요!", requests: ["라뷰티 메이크업 예약 요청 (8/5, 시간 미정)"], decisions: [], unresolved: ["방문 시간 확인 필요"], done: false },
  { id: 5, coupleId: 4, sender: "오지수", time: "오후 3:22", message: "예물 예산을 180만원으로 올리고 싶어요 가능할까요?", requests: ["예물 예산 증액 요청 (150만원->180만원)"], decisions: [], unresolved: [], done: false },
  { id: 6, coupleId: 2, sender: "이민준", time: "오후 4:10", message: "청첩장 발송일 다음 달 10일로 잡으면 될까요? 답례품은 꿀 어때요?", requests: [], decisions: ["청첩장 발송일: 9월 10일 확정"], unresolved: ["답례품 최종 확정 필요"], done: false },
];

const TL_TEMPLATE: TLItem[] = [
  { id: 1, period: "결혼 12개월 전", task: "웨딩홀 투어 및 예약", done: true },
  { id: 2, period: "결혼 12개월 전", task: "웨딩 플래너 계약", done: true },
  { id: 3, period: "결혼 12개월 전", task: "전체 예산 설정", done: true },
  { id: 4, period: "결혼 9개월 전", task: "스튜디오 계약", done: true },
  { id: 5, period: "결혼 9개월 전", task: "드레스 숍 투어 및 계약", done: true },
  { id: 6, period: "결혼 9개월 전", task: "헤어메이크업 상담", done: true },
  { id: 7, period: "결혼 9개월 전", task: "예복 예약", done: false },
  { id: 8, period: "결혼 6개월 전", task: "청첩장 디자인 결정", done: false },
  { id: 9, period: "결혼 6개월 전", task: "예물 쇼핑", done: false },
  { id: 10, period: "결혼 6개월 전", task: "신혼집 결정", done: false },
  { id: 11, period: "결혼 3개월 전", task: "청첩장 발송", done: false },
  { id: 12, period: "결혼 3개월 전", task: "드레스 1차 피팅", done: false },
  { id: 13, period: "결혼 3개월 전", task: "웨딩홀 메뉴 확정", done: false },
  { id: 14, period: "결혼 1개월 전", task: "드레스 최종 피팅", done: false },
  { id: 15, period: "결혼 1개월 전", task: "헤어 테스트", done: false },
  { id: 16, period: "결혼 1주일 전", task: "웨딩홀 최종 미팅", done: false },
  { id: 17, period: "결혼 1주일 전", task: "부케 최종 확인", done: false },
  { id: 18, period: "결혼 당일", task: "헤어 & 메이크업", done: false },
  { id: 19, period: "결혼 당일", task: "본식 진행", done: false },
];

const CK_TEMPLATE: CkItem[] = [
  { id: 1, category: "예식장", text: "홀 계약 완료", done: true },
  { id: 2, category: "예식장", text: "식사 메뉴 결정", done: false },
  { id: 3, category: "예식장", text: "좌석 배치도 작성", done: false },
  { id: 4, category: "예식장", text: "주차 안내문 준비", done: false },
  { id: 5, category: "스드메", text: "드레스 계약 완료", done: true },
  { id: 6, category: "스드메", text: "헤어메이크업 스타일 확정", done: false },
  { id: 7, category: "스드메", text: "스튜디오 촬영 완료", done: false },
  { id: 8, category: "스드메", text: "드레스 최종 피팅", done: false },
  { id: 9, category: "청첩장/답례품", text: "청첩장 디자인 결정", done: false },
  { id: 10, category: "청첩장/답례품", text: "청첩장 발송 완료", done: false },
  { id: 11, category: "청첩장/답례품", text: "답례품 구매", done: false },
  { id: 12, category: "혼수/이사", text: "신혼집 계약", done: false },
  { id: 13, category: "혼수/이사", text: "가전제품 구매", done: false },
  { id: 14, category: "신혼여행", text: "항공권 예약", done: false },
  { id: 15, category: "신혼여행", text: "숙소 예약", done: false },
  { id: 16, category: "신혼여행", text: "여행 보험 가입", done: false },
];

// 웨딩 실무 업무 종류 — 상위 탭(카테고리) → 세부 일정 구조.
// dur: 기본 소요시간(분). 플래너가 일정 등록 시 자동 반영됩니다.
const WEDDING_TASKS: { type: string; group: string; dur: number }[] = [
  { type: "웨딩홀 투어", group: "웨딩홀", dur: 90 },
  { type: "웨딩홀 계약", group: "웨딩홀", dur: 60 },
  { type: "본식 최종 미팅", group: "웨딩홀", dur: 60 },
  { type: "드레스 투어", group: "스드메", dur: 120 },
  { type: "드레스 가봉(촬영)", group: "스드메", dur: 90 },
  { type: "드레스 가봉(본식)", group: "스드메", dur: 90 },
  { type: "스튜디오 촬영", group: "스드메", dur: 240 },
  { type: "헤어메이크업 상담", group: "스드메", dur: 60 },
  { type: "헤어 리허설", group: "스드메", dur: 90 },
  { type: "부케 상담", group: "부가", dur: 45 },
  { type: "예물 상담", group: "부가", dur: 60 },
  { type: "예복 상담", group: "부가", dur: 60 },
  { type: "청첩장 상담", group: "부가", dur: 45 },
  { type: "상견례", group: "부가", dur: 120 },
  { type: "첫 상담", group: "부가", dur: 60 },
];

const TASK_GROUPS = ["웨딩홀", "스드메", "부가"];

type CalEvent = {
  id: number; coupleId: number; date: number; time: string;
  title: string; color: string;
  category: string; location: string;
  durationMin: number; travelMin: number; travelMode: "car" | "transit";
};

const INIT_EVENTS: CalEvent[] = [
  { id: 1, coupleId: 1, date: 2, time: "10:00", title: "드레스 가봉(본식)", color: "#C4779B", category: "드레스 가봉(본식)", location: "세인트 드레스 (청담)", durationMin: 90, travelMin: 25, travelMode: "car" },
  { id: 2, coupleId: 2, date: 3, time: "14:00", title: "헤어메이크업 상담", color: "#7B68C8", category: "헤어메이크업 상담", location: "라뷰티 메이크업 (강남)", durationMin: 60, travelMin: 35, travelMode: "transit" },
  { id: 3, coupleId: 1, date: 5, time: "15:00", title: "부케 상담", color: "#C4779B", category: "부케 상담", location: "그린포레스트 플라워 (신사)", durationMin: 45, travelMin: 20, travelMode: "car" },
  { id: 4, coupleId: 2, date: 7, time: "11:00", title: "예복 상담", color: "#7B68C8", category: "예복 상담", location: "롯데호텔 (잠실)", durationMin: 60, travelMin: 40, travelMode: "car" },
  { id: 5, coupleId: 1, date: 5, time: "17:30", title: "헤어 리허설", color: "#C4779B", category: "헤어 리허설", location: "라뷰티 메이크업 (강남)", durationMin: 90, travelMin: 30, travelMode: "car" },
  { id: 6, coupleId: 3, date: 12, time: "15:00", title: "웨딩홀 투어", color: "#5BA4CF", category: "웨딩홀 투어", location: "파라다이스 시티 (영종도)", durationMin: 90, travelMin: 55, travelMode: "car" },
  { id: 7, coupleId: 2, date: 15, time: "10:00", title: "드레스 투어", color: "#7B68C8", category: "드레스 투어", location: "세인트 드레스 (청담)", durationMin: 120, travelMin: 25, travelMode: "transit" },
  { id: 8, coupleId: 4, date: 18, time: "14:00", title: "첫 상담", color: "#72B582", category: "첫 상담", location: "PLANIT 사무실 (성수)", durationMin: 60, travelMin: 15, travelMode: "car" },
  { id: 9, coupleId: 1, date: 20, time: "11:00", title: "스튜디오 촬영", color: "#C4779B", category: "스튜디오 촬영", location: "브라이덜톤 스튜디오 (합정)", durationMin: 240, travelMin: 45, travelMode: "car" },
  { id: 10, coupleId: 2, date: 22, time: "09:00", title: "스튜디오 촬영", color: "#7B68C8", category: "스튜디오 촬영", location: "브라이덜톤 스튜디오 (합정)", durationMin: 240, travelMin: 45, travelMode: "car" },
  { id: 11, coupleId: 3, date: 26, time: "14:00", title: "드레스 가봉(촬영)", color: "#5BA4CF", category: "드레스 가봉(촬영)", location: "세인트 드레스 (청담)", durationMin: 90, travelMin: 30, travelMode: "transit" },
  { id: 12, coupleId: 4, date: 29, time: "15:00", title: "웨딩홀 투어", color: "#72B582", category: "웨딩홀 투어", location: "신라호텔 (장충동)", durationMin: 90, travelMin: 20, travelMode: "car" },
];

function makeBudget(id: number): BudgetCat[] {
  const v = INIT_COUPLES.find(c => c.id === id);
  const n = id * 200;
  return [
    { category: "예식장", items: [
      { id: n+1, name: "홀 이용료", vendor: v?.venue || "", estimated: 5800000, deposit: id <= 2 ? 1000000 : 0, balance: id <= 2 ? 4800000 : 5800000, status: id <= 2 ? "계약금납부" : "미계약" },
      { id: n+2, name: "식사비 (200명)", vendor: "", estimated: 3200000, deposit: 0, balance: 3200000, status: "미계약" },
    ]},
    { category: "스드메", items: [
      { id: n+3, name: "드레스", vendor: "세인트 드레스", estimated: 1980000, deposit: id === 1 ? 500000 : 0, balance: id === 1 ? 1480000 : 1980000, status: id === 1 ? "계약금납부" : "미계약" },
      { id: n+4, name: "헤어메이크업", vendor: "라뷰티 메이크업", estimated: 550000, deposit: 0, balance: 550000, status: "미계약" },
      { id: n+5, name: "스튜디오 촬영", vendor: "브라이덜톤 스튜디오", estimated: 660000, deposit: id <= 2 ? 200000 : 0, balance: id <= 2 ? 460000 : 660000, status: id <= 2 ? "계약금납부" : "미계약" },
    ]},
    { category: "예복", items: [{ id: n+6, name: "신랑 예복", vendor: "", estimated: 350000, deposit: 0, balance: 350000, status: "미계약" }]},
    { category: "예물", items: [{ id: n+7, name: "예물 반지", vendor: "유로웨딩밴드", estimated: 1500000, deposit: id === 1 ? 1500000 : 0, balance: 0, status: id === 1 ? "완납" : "미계약" }]},
    { category: "청첩장/답례품", items: [
      { id: n+8, name: "청첩장 제작", vendor: "", estimated: 150000, deposit: 0, balance: 150000, status: "미계약" },
      { id: n+9, name: "답례품", vendor: "", estimated: 400000, deposit: 0, balance: 400000, status: "미계약" },
    ]},
    { category: "허니문", items: [{ id: n+10, name: "항공 + 숙박", vendor: "", estimated: 2500000, deposit: 0, balance: 2500000, status: "미계약" }]},
  ];
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function won(n: number) {
  return n === 0 ? "0원" : n >= 10000 ? (n / 10000).toFixed(0) + "만원" : n.toLocaleString() + "원";
}
function cx(...a: (string | boolean | undefined | null)[]) { return a.filter(Boolean).join(" "); }
function calcDday(d: string) {
  return Math.max(0, Math.ceil((new Date(d).getTime() - new Date("2026-08-02").getTime()) / 86400000));
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Av({ i, color, size = 40 }: { i: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: color, borderRadius: "50%", fontSize: size * 0.3, flexShrink: 0 }}
      className="flex items-center justify-center text-white font-bold">{i}</div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}>
      <div className="w-9 h-5 rounded-full flex items-center px-0.5 transition-all"
        style={{ background: on ? "#C4779B" : "#D0D0D8", justifyContent: on ? "flex-end" : "flex-start" }}>
        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
      </div>
    </button>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.18 }}
        className="relative bg-white rounded-3xl shadow-2xl border border-border z-10 max-h-[90vh] overflow-y-auto">
        {children}
      </motion.div>
    </div>
  );
}

// ─── My Page Modal (카톡 업로드 포함) ────────────────────────────────────────

function MyPageModal({ couples, onClose }: { couples: Couple[]; onClose: () => void }) {
  const [igState, setIgState] = useState<"off" | "loading" | "on">("off");
  const [agents, setAgents] = useState([
    { id: 1, name: "DM 파싱", desc: "인스타 DM 자동 분석", on: true },
    { id: 2, name: "일정 초안", desc: "일정 자동 생성 제안", on: true },
    { id: 3, name: "누락 약속", desc: "언급된 약속 추적", on: true },
    { id: 4, name: "견적 업데이트", desc: "금액 변경 자동 감지", on: false },
  ]);
  const [autonomy, setAutonomy] = useState(0);
  const [kakaoCouple, setKakaoCouple] = useState(couples[0]?.id || 0);
  const [kakaoStep, setKakaoStep] = useState<"idle" | "uploading" | "done">("idle");
  const [kakaoPct, setKakaoPct] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function startKakaoUpload() {
    setKakaoStep("uploading");
    setKakaoPct(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setKakaoStep("done"), 300); }
      setKakaoPct(Math.min(p, 100));
    }, 130);
  }

  const selCouple = couples.find(c => c.id === kakaoCouple);

  return (
    <Overlay onClose={onClose}>
      <div className="w-[520px] p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-xl">마이페이지 · 설정</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"><X size={16} /></button>
        </div>

        {/* 카카오톡 대화 가져오기 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md bg-[#FEE500] flex items-center justify-center flex-shrink-0">
              <MessageSquare size={11} className="text-[#3A1D1D]" />
            </div>
            <p className="text-xs font-black uppercase tracking-wider">카카오톡 대화 가져오기</p>
            <span className="text-[10px] bg-pink-50 text-[#C4779B] px-2 py-0.5 rounded-full font-bold">온보딩</span>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
            <p className="text-xs font-bold text-amber-800 mb-1">카카오톡 내보내기 방법</p>
            <p className="text-xs text-amber-700">대화방 메뉴(≡) → 채팅방 설정 → 대화 내용 내보내기 → .txt 저장 후 업로드</p>
          </div>
          {kakaoStep === "idle" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">부부 선택</label>
                  <select value={kakaoCouple} onChange={e => setKakaoCouple(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]">
                    {couples.map(c => <option key={c.id} value={c.id}>{c.groom} · {c.bride}</option>)}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <input ref={fileRef} type="file" accept=".txt" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) startKakaoUpload(); }} />
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-bold border-2 border-dashed border-gray-200 text-muted-foreground hover:border-[#C4779B] hover:text-[#C4779B] transition-all">
                    <Upload size={14} />.txt 업로드
                  </button>
                </div>
              </div>
              <button onClick={startKakaoUpload}
                className="w-full py-2 rounded-xl text-xs font-semibold text-muted-foreground bg-gray-50 hover:bg-gray-100 border border-border">
                샘플로 미리 보기
              </button>
            </div>
          )}
          {kakaoStep === "uploading" && (
            <div className="bg-gray-50 rounded-xl border border-border p-4 text-center">
              <p className="text-sm font-bold mb-1">대화 분석 중...</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden my-3">
                <div className="h-full rounded-full transition-all" style={{ width: kakaoPct + "%", background: "#C4779B" }} />
              </div>
              <p className="text-xs text-muted-foreground">{Math.round(kakaoPct)}%</p>
            </div>
          )}
          {kakaoStep === "done" && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <p className="font-bold text-sm">{selCouple?.groom} · {selCouple?.bride} 분석 완료</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[["일정", "31건", "#C4779B"], ["결정사항", "12건", "#72B582"], ["미해결", "3건", "#E8904A"]].map(([l, v, c]) => (
                  <div key={l} className="bg-white rounded-xl p-2.5 text-center border border-green-100">
                    <p className="text-base font-black" style={{ color: c }}>{v}</p>
                    <p className="text-[10px] text-muted-foreground">{l}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90" style={{ background: "#C4779B" }}>
                  AI 요약에서 확인 →
                </button>
                <button onClick={() => { setKakaoStep("idle"); setKakaoPct(0); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-border hover:bg-gray-50">다시</button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border my-4" />

        {/* 인스타그램 DM */}
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-wider mb-3">인스타그램 DM 연동</p>
          <div className="bg-gray-50 rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Instagram size={15} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Instagram Messaging API</p>
                <p className="text-xs text-muted-foreground">{igState === "on" ? "연결됨 — DM 자동 수신 중" : "연결 전"}</p>
              </div>
              {igState === "off" && <button onClick={() => { setIgState("loading"); setTimeout(() => setIgState("on"), 1800); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ background: "#C4779B" }}>연결</button>}
              {igState === "loading" && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><RefreshCw size={12} className="animate-spin" />인증 중...</div>}
              {igState === "on" && <button onClick={() => setIgState("off")} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-200">해제</button>}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-800">프로페셔널(비즈니스·크리에이터) 계정 필요. 개인 계정은 API 접근 불가.</p>
            </div>
          </div>
        </div>

        {/* AI 에이전트 */}
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-wider mb-3">AI 에이전트</p>
          <div className="space-y-1.5">
            {agents.map(ag => (
              <div key={ag.id} className="bg-gray-50 rounded-xl border border-border px-3.5 py-2.5 flex items-center justify-between">
                <div><p className="text-sm font-semibold">{ag.name}</p><p className="text-xs text-muted-foreground">{ag.desc}</p></div>
                <Toggle on={ag.on} onChange={() => setAgents(p => p.map(a => a.id === ag.id ? { ...a, on: !a.on } : a))} />
              </div>
            ))}
          </div>
        </div>

        {/* AI 자율성 */}
        <div>
          <p className="text-xs font-black uppercase tracking-wider mb-3">AI 자율성 수준</p>
          <div className="bg-gray-50 rounded-2xl border border-border p-2 space-y-0.5">
            {["승인 후 실행 (기본)", "초안 자동 생성 후 확인", "완전 자동 처리"].map((label, i) => (
              <button key={i} onClick={() => setAutonomy(i)}
                className={cx("w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2.5",
                  autonomy === i ? "font-bold" : "text-muted-foreground hover:bg-white")}
                style={autonomy === i ? { background: "#C4779B18", color: "#C4779B" } : {}}>
                <div className={cx("w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                  autonomy === i ? "border-[#C4779B]" : "border-gray-300")}>
                  {autonomy === i && <div className="w-2 h-2 rounded-full bg-[#C4779B]" />}
                </div>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ─── New Couple Modal ─────────────────────────────────────────────────────────

function NewCoupleModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Couple) => void }) {
  const [f, setF] = useState({ groom: "", bride: "", venue: "", weddingDate: "", groomPhone: "", bridePhone: "", memo: "" });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  function submit() {
    if (!f.groom || !f.bride || !f.weddingDate) return;
    const id = Date.now();
    onCreate({ id, ...f, dday: calcDday(f.weddingDate), progress: 0, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    onClose();
  }
  return (
    <Overlay onClose={onClose}>
      <div className="w-[480px] p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-xl">새 부부 그룹</h2>
            <p className="text-sm text-muted-foreground mt-0.5">날짜 입력 시 D-day가 자동 계산됩니다</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            {[["신랑 이름 *", "groom", "홍길동"], ["신부 이름 *", "bride", "김영희"]].map(([l, k, ph]) => (
              <div key={k}><label className="text-xs font-bold text-muted-foreground block mb-1.5">{l}</label>
                <input value={(f as any)[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                  className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C4779B]" /></div>
            ))}
          </div>
          <div><label className="text-xs font-bold text-muted-foreground block mb-1.5">웨딩홀</label>
            <input value={f.venue} onChange={e => set("venue", e.target.value)} placeholder="예) 그랜드 워커힐"
              className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C4779B]" /></div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">결혼식 날짜 *</label>
            <input type="date" value={f.weddingDate} onChange={e => set("weddingDate", e.target.value)}
              className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C4779B]" />
            {f.weddingDate && <p className="text-xs mt-1.5 font-black" style={{ color: "#C4779B" }}>D-{calcDday(f.weddingDate)}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["신랑 연락처", "groomPhone", "010-0000-0000"], ["신부 연락처", "bridePhone", "010-0000-0000"]].map(([l, k, ph]) => (
              <div key={k}><label className="text-xs font-bold text-muted-foreground block mb-1.5">{l}</label>
                <input value={(f as any)[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                  className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C4779B]" /></div>
            ))}
          </div>
          <div><label className="text-xs font-bold text-muted-foreground block mb-1.5">메모</label>
            <textarea value={f.memo} onChange={e => set("memo", e.target.value)} placeholder="특이사항 등" rows={2}
              className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C4779B] resize-none" /></div>
          <div className="flex gap-2 pt-1">
            <button onClick={submit} className="flex-1 py-3 rounded-xl font-black text-sm text-white hover:opacity-90"
              style={{ background: (!f.groom || !f.bride || !f.weddingDate) ? "#D0D0D8" : "#C4779B" }}>그룹 만들기</button>
            <button onClick={onClose} className="px-5 py-3 rounded-xl font-semibold text-sm bg-gray-100 hover:bg-gray-200">취소</button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
// 사이드바가 전체 내비게이션을 담당합니다. 클릭하면 메인 콘텐츠가 연동됩니다.

function Sidebar({ couples, view, setView, onNewCouple, open, onClose }: {
  couples: Couple[];
  view: ViewState;
  setView: (v: ViewState) => void;
  onNewCouple: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const filtered = couples.filter(c => (c.groom + c.bride + c.venue).includes(q));

  const activeGlobal = view.kind !== "couple" ? view.kind : null;
  const activeCoupleId = view.kind === "couple" ? view.coupleId : null;

  function selectCouple(id: number) {
    // 부부 선택 시 현재 서브탭 유지, 처음이면 개요(0)
    const sub = view.kind === "couple" ? view.sub : 0;
    setView({ kind: "couple", coupleId: id, sub });
    if (window.innerWidth < 768) onClose(); // 모바일에서 선택 시 드로어 닫기
  }

  const globalNav = [
    { label: "AI 요약", icon: Bot, kind: "ai" as const },
    { label: "스케줄러", icon: Calendar, kind: "scheduler" as const },
    { label: "업체 관리", icon: Building2, kind: "vendor" as const },
  ];

  return (
    <>
      {/* 모바일 백드롭 */}
      {open && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onClose} />}

      <aside className={cx(
        "w-64 flex flex-col border-r border-border bg-[#FAFAFA] flex-shrink-0 h-full",
        // 모바일: 고정 드로어(오버레이). 데스크톱(md+): 정적 배치(콘텐츠를 밀어냄).
        "fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:static md:z-auto",
        open ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full md:hidden"
      )}>
      {/* 로고 */}
      <div className="px-5 py-4 border-b border-border flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#C4779B" }}>
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight leading-none">PLANIT</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">웨딩 플래너 어시스턴트</p>
          </div>
        </div>
        {/* 사이드바 접기 */}
        <button onClick={onClose} title="사이드바 접기"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 flex-shrink-0">
          <PanelLeftClose size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* 글로벌 내비게이션 */}
      <div className="px-3 py-3 border-b border-border flex-shrink-0">
        <div className="space-y-0.5">
          {globalNav.map(({ label, icon: Icon, kind }) => (
            <button key={kind} onClick={() => setView({ kind })}
              className={cx(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
                activeGlobal === kind ? "text-white" : "text-muted-foreground hover:bg-white hover:text-foreground"
              )}
              style={activeGlobal === kind ? { background: "#C4779B" } : {}}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* 부부 그룹 목록 */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between flex-shrink-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">부부 그룹</p>
        <button onClick={onNewCouple}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-90"
          style={{ background: "#C4779B" }} title="새 부부 그룹">
          <Plus size={13} className="text-white" />
        </button>
      </div>
      <div className="px-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-border">
          <Search size={12} className="text-muted-foreground flex-shrink-0" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="검색..."
            className="flex-1 text-xs outline-none bg-transparent placeholder:text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        <AnimatePresence>
          {filtered.map(c => {
            const isActive = activeCoupleId === c.id;
            return (
              <motion.button key={c.id} layout initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => selectCouple(c.id)}
                className={cx(
                  "w-full text-left p-3 rounded-2xl transition-all border",
                  isActive ? "bg-white shadow-sm border-border" : "border-transparent hover:bg-white/70 hover:border-border"
                )}>
                <div className="flex items-start gap-2.5">
                  <Av i={c.groom[0] + c.bride[0]} color={c.color} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-xs truncate">{c.groom} · {c.bride}</p>
                      <span className="text-[10px] font-black flex-shrink-0" style={{ color: c.color }}>D-{c.dday}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{c.venue || "웨딩홀 미정"}</p>
                    <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div style={{ width: c.progress + "%", background: c.color }} className="h-full rounded-full transition-all duration-500" />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      {/* 설정 버튼 없음 — 마이페이지(P)에서 접근 */}
    </aside>
    </>
  );
}

// ─── AI View ──────────────────────────────────────────────────────────────────

function AIView({ summaries, setSummaries, couples, showToast }: {
  summaries: DmSummary[];
  setSummaries: React.Dispatch<React.SetStateAction<DmSummary[]>>;
  couples: Couple[];
  showToast: (m: string) => void;
}) {
  const [filter, setFilter] = useState<"전체" | "요청" | "결정" | "미해결">("전체");
  const visible = summaries.filter(s => !s.done && (
    filter === "전체" ||
    (filter === "요청" && s.requests.length > 0) ||
    (filter === "결정" && s.decisions.length > 0) ||
    (filter === "미해결" && s.unresolved.length > 0)
  ));
  const done = summaries.filter(s => s.done);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-black text-xl flex items-center gap-2">
            <Instagram size={19} style={{ color: "#C4779B" }} />인스타그램 DM AI 요약
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">전체 부부 · 미처리 {visible.length}건</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["전체", "요청", "결정", "미해결"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cx("px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                filter === f ? "bg-white shadow-sm text-foreground" : "text-muted-foreground")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 max-w-3xl">
        <AnimatePresence mode="popLayout">
          {visible.map(s => {
            const couple = couples.find(c => c.id === s.coupleId);
            return (
              <motion.div key={s.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-[#FAFAFA]">
                  <Av i={(couple?.groom[0] || "") + (couple?.bride[0] || "")} color={couple?.color || "#aaa"} size={26} />
                  <div className="flex-1">
                    <span className="font-bold text-sm">{s.sender}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">({couple?.groom} · {couple?.bride})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.time}</span>
                  {s.unresolved.length > 0 && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">확인 필요</span>}
                </div>
                <div className="px-4 pt-3 pb-1">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100/50 rounded-xl px-3 py-2.5 mb-3 text-sm italic text-foreground/80">"{s.message}"</div>
                  <div className="space-y-2">
                    {s.requests.length > 0 && <div>
                      <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: "#C4779B" }}>요청</p>
                      {s.requests.map((r, i) => (
                        <div key={i} className="flex items-start justify-between gap-2 py-1">
                          <div className="flex items-start gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#C4779B] mt-1.5 flex-shrink-0" /><p className="text-xs">{r}</p></div>
                          <button onClick={() => showToast("일정 추가됨")}
                            className="text-[10px] font-bold border px-2 py-0.5 rounded-lg flex-shrink-0 hover:bg-pink-50 whitespace-nowrap"
                            style={{ color: "#C4779B", borderColor: "#C4779B44" }}>일정 추가</button>
                        </div>
                      ))}
                    </div>}
                    {s.decisions.length > 0 && <div>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-1.5">결정</p>
                      {s.decisions.map((d, i) => <div key={i} className="flex items-center gap-1.5 py-1"><CheckCircle size={11} className="text-green-500 flex-shrink-0" /><p className="text-xs">{d}</p></div>)}
                    </div>}
                    {s.unresolved.length > 0 && <div>
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1.5">미해결</p>
                      {s.unresolved.map((u, i) => <div key={i} className="flex items-center gap-1.5 py-1"><AlertCircle size={11} className="text-amber-500 flex-shrink-0" /><p className="text-xs">{u}</p></div>)}
                    </div>}
                  </div>
                </div>
                <div className="flex gap-2 px-4 py-3 border-t border-border">
                  <button onClick={() => setSummaries(p => p.map(x => x.id === s.id ? { ...x, done: true } : x))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90" style={{ background: "#C4779B" }}>
                    <Check size={12} />처리 완료
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200">
                    <Edit3 size={12} />메모
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <CheckCircle size={44} className="mb-3 text-green-400" />
            <p className="font-bold">모두 처리했어요!</p>
          </div>
        )}
        {done.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-muted-foreground mb-2">처리 완료 ({done.length}건)</p>
            {done.map(s => {
              const c = couples.find(x => x.id === s.coupleId);
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl mb-1 opacity-60">
                  <Av i={(c?.groom[0] || "") + (c?.bride[0] || "")} color={c?.color || "#aaa"} size={22} />
                  <p className="text-xs flex-1 truncate">{s.message}</p>
                  <CheckCircle size={13} className="text-green-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scheduler View ───────────────────────────────────────────────────────────
// 웨딩 실무에 맞춘 캘린더. 월간 그리드 + 일간 타임라인(이동시간 시각화) + 가능
// 시간대 조율 플로우를 제공합니다.

// 타임라인 상수
const DAY_START = 8;   // 08:00
const DAY_END = 22;    // 22:00
const PXM = 0.9;       // 1분당 픽셀
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const minToStr = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const topOf = (m: number) => (m - DAY_START * 60) * PXM;

// 이동시간 추정 (Mock). 실제 서비스에서는 지도 API 또는 LLM으로 대체합니다.
// TODO: 지도 API(예: 카카오/네이버 길찾기) 또는 LLM 호출로 실제 이동시간 계산.
function estimateTravel(from: string, to: string, mode: "car" | "transit") {
  if (!from || !to || from === to) return 0;
  let h = 0; for (const ch of from + "→" + to) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const base = 15 + (h % 40);                          // 15~54분
  return mode === "transit" ? Math.round(base * 1.4) : base;
}

type Coord = {
  active: boolean; coupleId: number; type: string; location: string;
  slots: { id: number; start: number; dur: number }[];
  sent: boolean; chosen: number | null;
};

function SchedulerView({ couples, events, setEvents, showToast }: {
  couples: Couple[]; events: CalEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalEvent[]>>;
  showToast: (m: string) => void;
}) {
  const [sel, setSel] = useState(5);
  const [mode, setMode] = useState<"month" | "day">("day");
  const [panel, setPanel] = useState<"add" | "coord">("add");
  const [rightOpen, setRightOpen] = useState(true); // 우측 패널 열림/닫힘
  const [form, setForm] = useState({
    coupleId: "1", type: WEDDING_TASKS[0].type, time: "10:00",
    location: "", mode: "car" as "car" | "transit", memo: "",
  });

  const initCoord = (): Coord => ({
    active: false, coupleId: couples[0]?.id ?? 1, type: WEDDING_TASKS[0].type,
    location: "", slots: [], sent: false, chosen: null,
  });
  const [coord, setCoord] = useState<Coord>(initCoord);

  const cells: (number | null)[] = [...Array(6).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const selCouple = couples.find(c => c.id === parseInt(form.coupleId)) || couples[0];
  const coordCouple = couples.find(c => c.id === coord.coupleId) || couples[0];
  const dayEvs = events.filter(e => e.date === sel).sort((a, b) => toMin(a.time) - toMin(b.time));

  function addEvent() {
    const task = WEDDING_TASKS.find(t => t.type === form.type);
    const prev = dayEvs[dayEvs.length - 1];
    const travel = estimateTravel(prev?.location || "", form.location, form.mode);
    setEvents(p => [...p, {
      id: Date.now(), coupleId: parseInt(form.coupleId), date: sel, time: form.time,
      title: form.memo || form.type, category: form.type, location: form.location,
      durationMin: task?.dur || 60, travelMin: travel, travelMode: form.mode,
      color: selCouple?.color || "#C4779B",
    }]);
    showToast("일정이 추가되었습니다");
    setForm(p => ({ ...p, memo: "", location: "" }));
  }

  // 타임라인 빈 영역 클릭 → 가능 시간대 후보 추가
  function trackClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!coord.active || coord.sent) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    let m = Math.round((y / PXM + DAY_START * 60) / 30) * 30;
    const dur = WEDDING_TASKS.find(t => t.type === coord.type)?.dur || 60;
    m = Math.max(DAY_START * 60, Math.min(DAY_END * 60 - dur, m));
    setCoord(c => ({ ...c, slots: [...c.slots, { id: Date.now(), start: m, dur }] }));
  }

  function sendProposal() {
    if (coord.slots.length === 0) { showToast("가능한 시간대를 먼저 선택하세요"); return; }
    setCoord(c => ({ ...c, sent: true }));
    showToast("부부에게 가능 시간대를 전송했어요");
    // 부부 응답 시뮬레이션
    setTimeout(() => {
      setCoord(c => {
        if (!c.slots.length) return c;
        const pick = c.slots[Math.floor(Math.random() * c.slots.length)].id;
        return { ...c, chosen: pick };
      });
      showToast("부부가 시간대를 선택했어요!");
    }, 2200);
  }

  function confirmChosen() {
    const slot = coord.slots.find(s => s.id === coord.chosen);
    if (!slot) return;
    const task = WEDDING_TASKS.find(t => t.type === coord.type);
    setEvents(p => [...p, {
      id: Date.now(), coupleId: coord.coupleId, date: sel, time: minToStr(slot.start),
      title: coord.type, category: coord.type, location: coord.location,
      durationMin: slot.dur, travelMin: 0, travelMode: "car",
      color: coordCouple?.color || "#C4779B",
    }]);
    setCoord(initCoord());
    setPanel("add");
    showToast("조율 완료 — 일정이 확정되었습니다");
  }

  const hours = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-gray-100"><ChevronLeft size={17} /></button>
            <h2 className="font-black text-xl">2026년 8월 {mode === "day" ? `${sel}일` : ""}</h2>
            <button className="p-2 rounded-xl hover:bg-gray-100"><ChevronRight size={17} /></button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setMode("month")}
                className={cx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  mode === "month" ? "bg-white shadow-sm" : "text-muted-foreground")}>
                <LayoutGrid size={13} />월간
              </button>
              <button onClick={() => setMode("day")}
                className={cx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  mode === "day" ? "bg-white shadow-sm" : "text-muted-foreground")}>
                <Rows3 size={13} />일간
              </button>
            </div>
            <span className="text-xs text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-full">총 {events.length}건</span>
            {!rightOpen && (
              <button onClick={() => setRightOpen(true)} title="입력 패널 열기"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:opacity-90" style={{ background: "#C4779B" }}>
                <PanelRightOpen size={13} />패널 열기
              </button>
            )}
          </div>
        </div>

        {/* 월간 그리드 */}
        {mode === "month" && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 border-b border-border">
              {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                <div key={d} className={cx("text-center py-3 text-xs font-bold",
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground")}>{d}</div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-border last:border-0">
                {week.map((day, di) => {
                  const evs = day ? events.filter(e => e.date === day).sort((a, b) => toMin(a.time) - toMin(b.time)) : [];
                  return (
                    <div key={di} onClick={() => { if (day) { setSel(day); setMode("day"); } }}
                      className={cx("min-h-[88px] p-2 border-r border-border last:border-0 cursor-pointer transition-colors",
                        !day ? "bg-gray-50/40 cursor-default" : sel === day ? "bg-pink-50" : "hover:bg-gray-50")}>
                      {day && <>
                        <div className={cx("w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1",
                          di === 0 ? "text-red-500" : di === 6 ? "text-blue-500" : "")}
                          style={sel === day ? { background: "#C4779B", color: "white" } : {}}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {evs.slice(0, 3).map((ev, ei) => (
                            <div key={ei} className="text-[9px] rounded-md px-1.5 py-0.5 truncate font-semibold text-white" style={{ background: ev.color }}>
                              {ev.time} {ev.title}
                            </div>
                          ))}
                          {evs.length > 3 && <div className="text-[9px] text-muted-foreground px-1.5">+{evs.length - 3}건</div>}
                        </div>
                      </>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* 일간 타임라인 */}
        {mode === "day" && (
          <div>
            {/* 범례 */}
            <div className="flex items-center gap-4 mb-3 text-[11px] text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: "#C4779B" }} />일정</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border border-dashed border-gray-400 bg-gray-200/50" />이동 시간(반투명)</div>
              <div className="flex items-center gap-1.5"><Car size={12} /> 차량</div>
              <div className="flex items-center gap-1.5"><Bus size={12} /> 대중교통</div>
              {coord.active && <div className="flex items-center gap-1.5 font-bold" style={{ color: coordCouple?.color }}><Sparkles size={12} />조율 중 — 빈 곳을 클릭해 가능 시간대 추가</div>}
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex">
                {/* 시간축 */}
                <div className="w-14 flex-shrink-0 border-r border-border pt-2">
                  {hours.map(h => (
                    <div key={h} style={{ height: 60 * PXM }} className="relative">
                      <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground font-semibold">{String(h).padStart(2, "0")}:00</span>
                    </div>
                  ))}
                </div>
                {/* 트랙 */}
                <div className="flex-1 relative pt-2 cursor-copy"
                  style={{ height: (DAY_END - DAY_START) * 60 * PXM + 16 }}
                  onClick={trackClick}>
                  {/* 시간 눈금 */}
                  {hours.map((h, i) => (
                    <div key={h} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: topOf(h * 60) + 8 }}>
                      {i < hours.length - 1 && <div className="absolute left-0 right-0 border-t border-gray-50" style={{ top: 30 * PXM }} />}
                    </div>
                  ))}

                  {/* 확정 일정 + 이동시간 블록 */}
                  {dayEvs.map(ev => {
                    const c = couples.find(x => x.id === ev.coupleId);
                    const s = toMin(ev.time);
                    const TravelIcon = ev.travelMode === "transit" ? Bus : Car;
                    return (
                      <div key={ev.id}>
                        {ev.travelMin > 0 && (
                          <div className="absolute left-2 right-2 rounded-lg border border-dashed flex items-center gap-1 px-2 overflow-hidden"
                            style={{
                              top: topOf(s - ev.travelMin) + 8, height: ev.travelMin * PXM,
                              background: ev.color + "1A", borderColor: ev.color + "66",
                            }}>
                            <TravelIcon size={11} style={{ color: ev.color }} />
                            <span className="text-[10px] font-bold" style={{ color: ev.color }}>이동 {ev.travelMin}분</span>
                          </div>
                        )}
                        <div className="absolute left-2 right-2 rounded-lg px-2.5 py-1 text-white overflow-hidden shadow-sm"
                          style={{ top: topOf(s) + 8, height: ev.durationMin * PXM - 2, background: ev.color }}
                          onClick={ev2 => ev2.stopPropagation()}>
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[11px] font-black truncate">{ev.title}</p>
                            <span className="text-[9px] font-bold opacity-90 flex-shrink-0">{ev.time}~{minToStr(s + ev.durationMin)}</span>
                          </div>
                          <p className="text-[10px] opacity-90 truncate">{c?.groom}·{c?.bride}</p>
                          {ev.location && ev.durationMin > 60 && (
                            <p className="text-[10px] opacity-80 truncate flex items-center gap-1 mt-0.5"><MapPin size={9} />{ev.location}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 가능 시간대 후보 (조율) */}
                  {coord.active && coord.slots.map(slot => {
                    const isChosen = coord.chosen === slot.id;
                    const dimmed = coord.chosen !== null && !isChosen;
                    return (
                      <div key={slot.id}
                        onClick={e => { e.stopPropagation(); if (!coord.sent) setCoord(c => ({ ...c, slots: c.slots.filter(s => s.id !== slot.id) })); }}
                        className={cx("absolute left-2 right-2 rounded-lg border-2 flex flex-col justify-center px-2.5 transition-all",
                          !coord.sent && "cursor-pointer hover:opacity-80", dimmed && "opacity-30")}
                        style={{
                          top: topOf(slot.start) + 8, height: slot.dur * PXM - 2,
                          borderStyle: isChosen ? "solid" : "dashed",
                          borderColor: coordCouple?.color, background: (coordCouple?.color || "#C4779B") + (isChosen ? "33" : "14"),
                        }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black" style={{ color: coordCouple?.color }}>
                            {isChosen ? "✓ 부부 선택" : "가능 시간대"}
                          </span>
                          <span className="text-[10px] font-bold" style={{ color: coordCouple?.color }}>
                            {minToStr(slot.start)}~{minToStr(slot.start + slot.dur)}
                          </span>
                        </div>
                        {!coord.sent && <span className="text-[9px] text-muted-foreground">클릭하면 삭제</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 우측 패널 */}
      {rightOpen && (
      <div className="w-72 border-l border-border overflow-y-auto p-4 bg-[#FAFAFA] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">일정 입력</p>
          <button onClick={() => setRightOpen(false)} title="패널 접기"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200">
            <PanelRightClose size={15} className="text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          <button onClick={() => setPanel("add")}
            className={cx("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", panel === "add" ? "bg-white shadow-sm" : "text-muted-foreground")}>
            일정 추가
          </button>
          <button onClick={() => { setPanel("coord"); if (!coord.active) setCoord(c => ({ ...c, active: true })); }}
            className={cx("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1", panel === "coord" ? "bg-white shadow-sm" : "text-muted-foreground")}>
            <Sparkles size={11} />시간대 조율
          </button>
        </div>

        <h3 className="font-bold text-sm mb-3">8월 {sel}일 · 화 {mode === "month" && <span className="text-xs text-muted-foreground font-normal">(날짜를 클릭해 선택)</span>}</h3>

        {/* 일정 추가 패널 */}
        {panel === "add" && (
          <div className="space-y-2.5 mb-4">
            <div><label className="text-xs font-bold text-muted-foreground block mb-1">부부</label>
              <select value={form.coupleId} onChange={e => setForm(p => ({ ...p, coupleId: e.target.value }))}
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]">
                {couples.map(c => <option key={c.id} value={c.id}>{c.groom} · {c.bride}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-bold text-muted-foreground block mb-1">업무 종류</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]">
                {TASK_GROUPS.map(g => (
                  <optgroup key={g} label={g}>
                    {WEDDING_TASKS.filter(t => t.group === g).map(t => <option key={t.type} value={t.type}>{t.type} ({t.dur}분)</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div><label className="text-xs font-bold text-muted-foreground block mb-1">장소</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="예) 세인트 드레스 (청담)"
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]" />
            </div>
            <div><label className="text-xs font-bold text-muted-foreground block mb-1">이동 수단</label>
              <div className="flex gap-1.5">
                {(["car", "transit"] as const).map(m => {
                  const Icon = m === "car" ? Car : Bus;
                  return (
                    <button key={m} onClick={() => setForm(p => ({ ...p, mode: m }))}
                      className={cx("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all",
                        form.mode === m ? "text-white border-transparent" : "bg-white border-border text-muted-foreground")}
                      style={form.mode === m ? { background: "#C4779B" } : {}}>
                      <Icon size={13} />{m === "car" ? "차량" : "대중교통"}
                    </button>
                  );
                })}
              </div>
            </div>
            <div><label className="text-xs font-bold text-muted-foreground block mb-1">시간</label>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]" />
            </div>
            <div><label className="text-xs font-bold text-muted-foreground block mb-1">메모(표시명)</label>
              <input value={form.memo} onChange={e => setForm(p => ({ ...p, memo: e.target.value }))} placeholder="비우면 업무 종류로 표시"
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]" />
            </div>
            <button onClick={addEvent} className="w-full py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90" style={{ background: "#C4779B" }}>일정 추가</button>
          </div>
        )}

        {/* 시간대 조율 패널 */}
        {panel === "coord" && (
          <div className="space-y-2.5 mb-4">
            <div className="bg-white rounded-xl border border-border p-3 text-xs text-muted-foreground leading-relaxed">
              가능한 시간대를 여러 개 골라 부부에게 보내면, 부부가 편한 시간을 선택해요. 왼쪽 <span className="font-bold text-foreground">일간 타임라인</span>의 빈 곳을 클릭해 후보를 추가하세요.
            </div>
            <div><label className="text-xs font-bold text-muted-foreground block mb-1">부부</label>
              <select value={coord.coupleId} disabled={coord.sent} onChange={e => setCoord(c => ({ ...c, coupleId: Number(e.target.value) }))}
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B] disabled:opacity-60">
                {couples.map(c => <option key={c.id} value={c.id}>{c.groom} · {c.bride}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-bold text-muted-foreground block mb-1">업무 종류</label>
              <select value={coord.type} disabled={coord.sent} onChange={e => setCoord(c => ({ ...c, type: e.target.value }))}
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B] disabled:opacity-60">
                {TASK_GROUPS.map(g => (
                  <optgroup key={g} label={g}>
                    {WEDDING_TASKS.filter(t => t.group === g).map(t => <option key={t.type} value={t.type}>{t.type} ({t.dur}분)</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div><label className="text-xs font-bold text-muted-foreground block mb-1">장소</label>
              <input value={coord.location} disabled={coord.sent} onChange={e => setCoord(c => ({ ...c, location: e.target.value }))} placeholder="예) 세인트 드레스 (청담)"
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B] disabled:opacity-60" />
            </div>

            <div className="bg-white rounded-xl border border-border p-3">
              <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Clock size={12} />후보 시간대 ({coord.slots.length})</p>
              {coord.slots.length === 0 && <p className="text-xs text-muted-foreground">타임라인에서 빈 곳을 클릭하세요</p>}
              <div className="space-y-1">
                {coord.slots.sort((a, b) => a.start - b.start).map(s => (
                  <div key={s.id} className={cx("flex items-center justify-between text-xs rounded-lg px-2 py-1.5",
                    coord.chosen === s.id ? "font-black" : "bg-gray-50")}
                    style={coord.chosen === s.id ? { background: (coordCouple?.color || "#C4779B") + "22", color: coordCouple?.color } : {}}>
                    <span>{minToStr(s.start)} ~ {minToStr(s.start + s.dur)}</span>
                    {coord.chosen === s.id ? <span className="flex items-center gap-1"><Check size={11} />부부 선택</span>
                      : !coord.sent && <button onClick={() => setCoord(c => ({ ...c, slots: c.slots.filter(x => x.id !== s.id) }))}><Trash2 size={11} className="text-red-400" /></button>}
                  </div>
                ))}
              </div>
            </div>

            {!coord.sent && (
              <button onClick={sendProposal}
                className="w-full py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ background: coord.slots.length ? (coordCouple?.color || "#C4779B") : "#D0D0D8" }}>
                <Share2 size={14} />부부에게 전송
              </button>
            )}
            {coord.sent && coord.chosen === null && (
              <div className="bg-white rounded-xl border border-border p-3 flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw size={13} className="animate-spin" />부부 응답 대기 중...
              </div>
            )}
            {coord.chosen !== null && (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                  <p className="text-xs font-bold">{coordCouple?.groom}·{coordCouple?.bride}님이 시간을 선택했어요</p>
                </div>
                <button onClick={confirmChosen}
                  className="w-full py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90"
                  style={{ background: coordCouple?.color || "#C4779B" }}>일정 확정하기</button>
              </div>
            )}
            <button onClick={() => setCoord({ ...initCoord(), active: true })}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-white border border-border hover:bg-gray-50">초기화</button>
          </div>
        )}

        {/* 당일 일정 목록 */}
        <p className="text-xs font-bold text-muted-foreground mb-2">당일 일정 ({dayEvs.length})</p>
        <div className="space-y-1.5">
          {dayEvs.map(ev => {
            const c = couples.find(x => x.id === ev.coupleId);
            const TravelIcon = ev.travelMode === "transit" ? Bus : Car;
            return (
              <div key={ev.id} className="bg-white rounded-xl border border-border p-2.5">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: ev.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{ev.title}</p>
                    <p className="text-[11px] text-muted-foreground">{ev.time}~{minToStr(toMin(ev.time) + ev.durationMin)} · {c?.groom}·{c?.bride}</p>
                    {ev.location && <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5"><MapPin size={9} />{ev.location}</p>}
                    {ev.travelMin > 0 && <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: ev.color }}><TravelIcon size={10} />이동 {ev.travelMin}분</p>}
                  </div>
                </div>
              </div>
            );
          })}
          {dayEvs.length === 0 && <p className="text-xs text-muted-foreground">일정 없음</p>}
        </div>
      </div>
      )}
    </div>
  );
}

// ─── Vendor View ──────────────────────────────────────────────────────────────

function VendorView({ showToast }: { showToast: (m: string) => void }) {
  const [vendors, setVendors] = useState(VENDORS_DATA);
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ name: "", category: "드레스", price: "", partnerPrice: "", stock: "" });
  const catColors: Record<string, string> = {
    드레스: "#C4779B", 스튜디오: "#7B68C8", 메이크업: "#E8904A",
    예물: "#72B582", 부케: "#5BA4CF", 영상: "#E87070",
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-black text-xl">업체 관리</h2>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
          style={{ background: "#C4779B" }}><Plus size={14} />업체 등록</button>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className="text-xs font-bold text-muted-foreground block mb-1.5">업체명</label>
                  <input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="업체명"
                    className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]" /></div>
                <div><label className="text-xs font-bold text-muted-foreground block mb-1.5">카테고리</label>
                  <select value={f.category} onChange={e => setF(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]">
                    {Object.keys(catColors).map(c => <option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="text-xs font-bold text-muted-foreground block mb-1.5">정가 (만원)</label>
                  <input value={f.price} onChange={e => setF(p => ({ ...p, price: e.target.value }))} type="number" placeholder="220"
                    className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]" /></div>
                <div><label className="text-xs font-bold text-muted-foreground block mb-1.5">제휴가 (만원)</label>
                  <input value={f.partnerPrice} onChange={e => setF(p => ({ ...p, partnerPrice: e.target.value }))} type="number" placeholder="198"
                    className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]" /></div>
                <div><label className="text-xs font-bold text-muted-foreground block mb-1.5">잔여 물량</label>
                  <input value={f.stock} onChange={e => setF(p => ({ ...p, stock: e.target.value }))} type="number" placeholder="3"
                    className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C4779B]" /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => {
                  if (!f.name || !f.price) return;
                  setVendors(p => [...p, { id: Date.now(), name: f.name, category: f.category, price: parseInt(f.price) * 10000, partnerPrice: parseInt(f.partnerPrice || f.price) * 10000, increaseDate: "미정", stock: parseInt(f.stock || "0") }]);
                  setShowForm(false); showToast("업체가 등록되었습니다");
                }} className="px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90" style={{ background: "#C4779B" }}>등록</button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200">취소</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-3 gap-4">
        {vendors.map(v => {
          const color = catColors[v.category] || "#C4779B";
          const days = v.increaseDate !== "미정" ? Math.ceil((new Date(v.increaseDate).getTime() - new Date("2026-08-02").getTime()) / 86400000) : null;
          return (
            <div key={v.id} className="bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: color }}>{v.category[0]}</div>
                  <div className="min-w-0"><p className="font-bold text-sm truncate">{v.name}</p><p className="text-xs text-muted-foreground">{v.category}</p></div>
                </div>
                <Star size={13} className="text-amber-400 flex-shrink-0" fill="currentColor" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">정가</span><span className="text-sm line-through text-muted-foreground">{won(v.price)}</span></div>
                <div className="flex justify-between"><span className="text-xs font-bold">제휴가</span><span className="text-lg font-black" style={{ color }}>{won(v.partnerPrice)}</span></div>
                {days !== null && days > 0 && days <= 90 && (
                  <div className="bg-amber-50 rounded-xl px-2.5 py-2"><p className="text-[11px] text-amber-700 font-bold">인상까지 D-{days}</p></div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-50">
                  <span className="text-xs text-muted-foreground">잔여</span>
                  <span className={cx("text-xs font-black", v.stock <= 2 ? "text-red-500" : "")}>{v.stock}건</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Couple Workspace ──────────────────────────────────────────────────────────
// 부부 선택 시 메인에 표시되는 워크스페이스. 부부상세/고객링크/견적정산 통합.

const SUB_TABS = ["개요", "타임라인", "체크리스트", "고객 링크", "견적·정산"];

function CoupleWorkspace({ couple, sub, setSub, summaries, setSummaries, tlItems, setTlItems, ckItems, setCkItems, budget, setBudget, showToast }: {
  couple: Couple; sub: number; setSub: (s: number) => void;
  summaries: DmSummary[];
  setSummaries: React.Dispatch<React.SetStateAction<DmSummary[]>>;
  tlItems: TLItem[]; setTlItems: (fn: (p: TLItem[]) => TLItem[]) => void;
  ckItems: CkItem[]; setCkItems: (fn: (p: CkItem[]) => CkItem[]) => void;
  budget: BudgetCat[]; setBudget: (fn: (p: BudgetCat[]) => BudgetCat[]) => void;
  showToast: (m: string) => void;
}) {
  const coupleSummaries = summaries.filter(s => s.coupleId === couple.id);
  const periods = Array.from(new Set(tlItems.map(t => t.period)));
  const categories = Array.from(new Set(ckItems.map(c => c.category)));
  const [openPeriods, setOpenPeriods] = useState<Set<string>>(new Set(periods.slice(0, 3)));
  const tlDone = tlItems.filter(t => t.done).length;
  const ckDone = ckItems.filter(c => c.done).length;

  // Budget editing
  type EC = { itemId: number; field: string } | null;
  const [editCell, setEditCell] = useState<EC>(null);
  const [editVal, setEditVal] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");

  // Phone mockup
  const [phoneTab, setPhoneTab] = useState(0);
  const [chat, setChat] = useState([
    { from: "planner", text: "안녕하세요! 다음 미팅 준비해드렸어요" },
    { from: "couple", text: "드레스 피팅 날짜 언제예요?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  function saveCell(itemId: number, field: string, val: string) {
    setBudget(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => {
        if (item.id !== itemId) return item;
        const num = parseInt(val.replace(/[^0-9]/g, "")) || 0;
        if (field === "name") return { ...item, name: val };
        if (field === "vendor") return { ...item, vendor: val };
        if (field === "estimated") return { ...item, estimated: num * 10000 };
        if (field === "deposit") {
          const dep = num * 10000;
          const bal = Math.max(0, item.estimated - dep);
          const status: BudgetItem["status"] = dep === 0 ? "미계약" : bal === 0 ? "완납" : "계약금납부";
          return { ...item, deposit: dep, balance: bal, status };
        }
        if (field === "balance") {
          const bal = num * 10000;
          const status: BudgetItem["status"] = item.deposit === 0 && bal > 0 ? "미계약" : bal === 0 ? "완납" : "계약금납부";
          return { ...item, balance: bal, status };
        }
        return item;
      }),
    })));
    setEditCell(null);
  }

  const allItems = budget.flatMap(c => c.items);
  const totalEst = allItems.reduce((s, i) => s + i.estimated, 0);
  const totalDep = allItems.reduce((s, i) => s + i.deposit, 0);
  const totalBal = allItems.reduce((s, i) => s + i.balance, 0);
  const paidPct = totalEst ? Math.round((totalDep / totalEst) * 100) : 0;
  const statusCls = (s: BudgetItem["status"]) =>
    ({ 미계약: "bg-gray-100 text-gray-500", 계약금납부: "bg-amber-50 text-amber-700", 완납: "bg-green-50 text-green-700" })[s];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 부부 헤더 + 서브탭 */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border bg-white flex-shrink-0">
        <Av i={couple.groom[0] + couple.bride[0]} color={couple.color} size={32} />
        <div className="mr-2 flex-shrink-0">
          <p className="font-black text-sm leading-tight">{couple.groom} · {couple.bride}</p>
          <p className="text-[10px] text-muted-foreground">{couple.venue} · <span className="font-bold" style={{ color: couple.color }}>D-{couple.dday}</span></p>
        </div>
        <div className="flex items-center gap-1 flex-1">
          {SUB_TABS.map((t, i) => (
            <button key={t} onClick={() => setSub(i)}
              className={cx("px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                sub === i ? "text-white" : "text-muted-foreground hover:bg-gray-100")}
              style={sub === i ? { background: couple.color } : {}}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div style={{ width: couple.progress + "%", background: couple.color }} className="h-full rounded-full" />
          </div>
          <span className="text-xs font-black" style={{ color: couple.color }}>{couple.progress}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* 개요 */}
        {sub === 0 && (
          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-border p-4">
                <h3 className="font-bold text-sm mb-3">기본 정보</h3>
                {[
                  ["신랑", couple.groom + " · " + couple.groomPhone],
                  ["신부", couple.bride + " · " + couple.bridePhone],
                  ["웨딩홀", couple.venue || "미정"],
                  ["결혼식", couple.weddingDate],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-start py-1.5 border-b border-gray-50 last:border-0 gap-2">
                    <span className="text-xs text-muted-foreground w-12 flex-shrink-0">{l}</span>
                    <span className="text-xs font-semibold">{v}</span>
                  </div>
                ))}
                {couple.memo && <p className="text-xs text-muted-foreground italic mt-2 pt-2 border-t border-gray-50">{couple.memo}</p>}
              </div>
              <div className="bg-white rounded-2xl border border-border p-4">
                <h3 className="font-bold text-sm mb-3">진행 현황</h3>
                <p className="text-4xl font-black mb-3" style={{ color: couple.color }}>{couple.progress}%</p>
                {[["타임라인", tlDone, tlItems.length], ["체크리스트", ckDone, ckItems.length]].map(([l, d, t]) => (
                  <div key={l as string} className="mb-2">
                    <div className="flex justify-between text-xs mb-1"><span className="font-semibold">{l}</span><span className="text-muted-foreground">{d}/{t}</span></div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div style={{ width: (t ? (d as number) / (t as number) * 100 : 0) + "%", background: couple.color }} className="h-full rounded-full transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Instagram size={15} style={{ color: "#C4779B" }} />
                  <h3 className="font-bold text-sm">DM AI 요약</h3>
                  <span className="text-xs text-muted-foreground">({coupleSummaries.filter(s => !s.done).length}건 미처리)</span>
                </div>
                {coupleSummaries.length === 0
                  ? <p className="text-sm text-muted-foreground">대화 내역 없음</p>
                  : coupleSummaries.slice(0, 3).map(s => (
                    <div key={s.id} className={cx("border border-border rounded-xl p-3 mb-2 last:mb-0", s.done ? "opacity-50" : "")}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold">{s.sender}</span>
                        <span className="text-xs text-muted-foreground">{s.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic mb-1.5">"{s.message}"</p>
                      {s.requests.map((r, i) => <div key={i} className="text-xs flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#C4779B]" />{r}</div>)}
                      {s.decisions.map((d, i) => <div key={i} className="text-xs flex items-center gap-1.5 text-green-600"><CheckCircle size={10} />{d}</div>)}
                      {s.unresolved.map((u, i) => <div key={i} className="text-xs flex items-center gap-1.5 text-amber-600"><AlertCircle size={10} />{u}</div>)}
                    </div>
                  ))}
              </div>
              <div className="bg-white rounded-2xl border border-border p-4">
                <h3 className="font-bold text-sm mb-3">계약 업체</h3>
                <div className="grid grid-cols-2 gap-2">
                  {VENDORS_DATA.slice(0, 4).map(v => (
                    <div key={v.id} className="flex items-center gap-2 border border-border rounded-xl p-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: couple.color }}>{v.category[0]}</div>
                      <div className="min-w-0"><p className="text-xs font-bold truncate">{v.name}</p><p className="text-xs font-black" style={{ color: couple.color }}>{won(v.partnerPrice)}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 타임라인 */}
        {sub === 1 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div><h3 className="font-black text-lg">웨딩 타임라인</h3><p className="text-sm text-muted-foreground">{tlDone}/{tlItems.length}개 완료</p></div>
              <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div style={{ width: (tlItems.length ? (tlDone / tlItems.length) * 100 : 0) + "%", background: couple.color }} className="h-full rounded-full transition-all duration-500" />
              </div>
            </div>
            <div className="space-y-3 max-w-2xl">
              {periods.map(period => {
                const items = tlItems.filter(t => t.period === period);
                const pdone = items.filter(t => t.done).length;
                const isOpen = openPeriods.has(period);
                return (
                  <div key={period} className="bg-white rounded-2xl border border-border overflow-hidden">
                    <button onClick={() => setOpenPeriods(p => { const n = new Set(p); n.has(period) ? n.delete(period) : n.add(period); return n; })}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: pdone === items.length ? couple.color : "#D0D0D8" }} />
                        <span className="font-bold text-sm">{period}</span>
                        <span className="text-xs text-muted-foreground">{pdone}/{items.length}</span>
                      </div>
                      <ChevronDown size={15} className={cx("text-muted-foreground transition-transform", isOpen ? "rotate-180" : "")} />
                    </button>
                    {isOpen && <div className="border-t border-border">
                      {items.map(item => (
                        <div key={item.id} onClick={() => setTlItems(p => p.map(t => t.id === item.id ? { ...t, done: !t.done } : t))}
                          className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                          <div className={cx("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all", item.done ? "border-transparent" : "border-gray-300")}
                            style={item.done ? { background: couple.color } : {}}>
                            {item.done && <Check size={10} className="text-white" />}
                          </div>
                          <span className={cx("text-sm flex-1", item.done ? "line-through text-muted-foreground" : "")}>{item.task}</span>
                        </div>
                      ))}
                    </div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 체크리스트 */}
        {sub === 2 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div><h3 className="font-black text-lg">웨딩 체크리스트</h3><p className="text-sm text-muted-foreground">{ckDone}/{ckItems.length}개 완료</p></div>
              <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div style={{ width: (ckItems.length ? (ckDone / ckItems.length) * 100 : 0) + "%", background: couple.color }} className="h-full rounded-full transition-all duration-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              {categories.map(cat => {
                const items = ckItems.filter(c => c.category === cat);
                const cdone = items.filter(c => c.done).length;
                return (
                  <div key={cat} className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2"><span className="font-bold text-sm">{cat}</span><span className="text-xs text-muted-foreground">{cdone}/{items.length}</span></div>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div style={{ width: (items.length ? (cdone / items.length) * 100 : 0) + "%", background: couple.color }} className="h-full rounded-full transition-all" />
                      </div>
                    </div>
                    {items.map(item => (
                      <div key={item.id} onClick={() => setCkItems(p => p.map(c => c.id === item.id ? { ...c, done: !c.done } : c))}
                        className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 border-2 transition-all"
                          style={{ borderRadius: 6, background: item.done ? couple.color : "white", borderColor: item.done ? couple.color : "#D0D0D8" }}>
                          {item.done && <Check size={10} className="text-white" />}
                        </div>
                        <span className={cx("text-sm flex-1", item.done ? "line-through text-muted-foreground" : "")}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 고객 링크 */}
        {sub === 3 && (
          <div className="flex h-full p-6 gap-6 overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <div><h3 className="font-black text-lg mb-1">고객 링크 공유</h3><p className="text-sm text-muted-foreground">링크 하나로 부부가 일정·견적·메시지를 모두 확인해요</p></div>
              <div className="bg-white rounded-2xl border border-border p-4">
                <p className="text-xs font-bold text-muted-foreground mb-2">{couple.groom} · {couple.bride} 전용 링크</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-muted-foreground font-mono border border-border truncate">
                    https://planit.kr/couple/{couple.id}
                  </div>
                  <button className="px-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 hover:opacity-90 flex-shrink-0" style={{ background: couple.color }}>
                    <Link2 size={13} />복사
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-border p-4">
                <h3 className="font-bold text-sm mb-3">링크 설정</h3>
                {[["일정 공개", true], ["견적 전체 공개", true], ["메시지 수신", true], ["체크리스트", false]].map(([l, on]) => (
                  <div key={l as string} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <p className="text-sm font-semibold">{l}</p>
                    <div className="w-9 h-5 rounded-full flex items-center px-0.5" style={{ background: on ? couple.color : "#D0D0D8", justifyContent: on ? "flex-end" : "flex-start" }}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 폰 목업 */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <p className="text-xs text-muted-foreground mb-3 font-bold">부부가 보는 화면</p>
              <div className="relative" style={{ width: 260, height: 530 }}>
                <div className="absolute inset-0 rounded-[38px] shadow-2xl" style={{ background: "#1A1A2E" }} />
                <div className="absolute inset-[5px] rounded-[33px] bg-white overflow-hidden flex flex-col">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full z-10" style={{ background: "#1A1A2E" }} />
                  <div className="flex-shrink-0 px-4 pt-5 pb-1 text-[10px] font-bold">9:41</div>
                  <div className="flex-shrink-0 flex items-center gap-2 px-4 pb-2 border-b border-gray-100">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: couple.color }}>
                      <Heart size={9} className="text-white" fill="white" />
                    </div>
                    <p className="text-[10px] font-black">PLANIT</p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {phoneTab === 0 && <div className="h-full overflow-y-auto p-4">
                      <div className="text-center mb-4">
                        <p className="text-[9px] text-muted-foreground">결혼식까지</p>
                        <p className="text-5xl font-black" style={{ color: couple.color }}>D-{couple.dday}</p>
                        <p className="text-[9px] text-muted-foreground mt-1">{couple.weddingDate}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] font-bold mb-1.5">다음 일정</p>
                        <div className="flex gap-2 items-center">
                          <div className="w-2 h-2 rounded-full" style={{ background: couple.color }} />
                          <div><p className="text-[10px] font-semibold">드레스 피팅</p><p className="text-[9px] text-muted-foreground">8.2 오전 10:00</p></div>
                        </div>
                      </div>
                    </div>}
                    {phoneTab === 1 && <div className="h-full overflow-y-auto p-4 space-y-2">
                      {[["8.5", "스드메 미팅"], ["8.10", "헤어 테스트"], ["8.20", "부케 상담"]].map(([d, t]) => (
                        <div key={t} className="bg-gray-50 rounded-xl p-2.5 flex gap-2">
                          <p className="text-[10px] font-black w-8" style={{ color: couple.color }}>{d}</p>
                          <p className="text-[10px] font-semibold">{t}</p>
                        </div>
                      ))}
                    </div>}
                    {phoneTab === 2 && <div className="h-full overflow-y-auto p-4">
                      {[["웨딩홀", 5800000], ["드레스", 1980000], ["스튜디오", 660000]].map(([l, v]) => (
                        <div key={l as string} className="flex justify-between py-1.5 border-b border-gray-100 text-[10px]">
                          <span>{l}</span><span className="font-bold">{won(v as number)}</span>
                        </div>
                      ))}
                    </div>}
                    {phoneTab === 3 && (
                      <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                          {chat.map((m, i) => (
                            <div key={i} className={cx("flex", m.from === "couple" ? "justify-end" : "justify-start")}>
                              <div className="max-w-[75%] rounded-2xl px-3 py-1.5 text-[10px] leading-relaxed"
                                style={{ background: m.from === "couple" ? couple.color : "#F0F0F4", color: m.from === "couple" ? "white" : "#1A1A2E" }}>{m.text}</div>
                            </div>
                          ))}
                        </div>
                        <div className="p-2.5 border-t border-gray-100 flex gap-2 flex-shrink-0">
                          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && chatInput.trim()) { setChat(p => [...p, { from: "couple", text: chatInput }]); setChatInput(""); } }}
                            placeholder="메시지..." className="flex-1 bg-gray-100 rounded-full px-3 py-1 text-[10px] outline-none" />
                          <button onClick={() => { if (chatInput.trim()) { setChat(p => [...p, { from: "couple", text: chatInput }]); setChatInput(""); } }}
                            className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: couple.color }}>
                            <Send size={11} className="text-white" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex border-t border-gray-100 bg-white">
                    {[Home, Calendar, CreditCard, MessageSquare].map((Icon, i) => (
                      <button key={i} onClick={() => setPhoneTab(i)} className="flex-1 flex flex-col items-center py-2 gap-0.5"
                        style={{ color: phoneTab === i ? couple.color : "#A0A0B0" }}>
                        <Icon size={13} /><span className="text-[8px] font-bold">{["홈", "일정", "견적", "대화"][i]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 견적·정산 */}
        {sub === 4 && (
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div><h3 className="font-black text-lg">견적 · 정산</h3><p className="text-sm text-muted-foreground">셀 클릭으로 금액 수정 · 계약금 입력 시 잔금 자동 계산</p></div>
              <div className="text-right"><p className="text-xs text-muted-foreground">총 예상 예산</p><p className="text-3xl font-black" style={{ color: couple.color }}>{won(totalEst)}</p></div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {([
                ["총 예산", totalEst, couple.color],
                ["계약금", totalDep, "#7B68C8"],
                ["잔금", totalBal, "#E8904A"],
                ["완납", allItems.filter(i => i.status === "완납").length + "건", "#72B582"],
              ] as [string, number | string, string][]).map(([l, v, c]) => (
                <div key={l} className="bg-white rounded-2xl border border-border p-3.5 shadow-sm">
                  <p className="text-xs text-muted-foreground">{l}</p>
                  <p className="text-xl font-black mt-1" style={{ color: c }}>{typeof v === "number" ? won(v) : v}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-border p-3.5 mb-5 shadow-sm">
              <div className="flex justify-between text-xs mb-2 font-bold">
                <span>납부 진행률</span><span style={{ color: couple.color }}>{paidPct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div style={{ width: paidPct + "%", background: couple.color }} className="h-full rounded-full transition-all duration-500" />
              </div>
            </div>
            <div className="space-y-3">
              {budget.map(cat => {
                const catTotal = cat.items.reduce((s, i) => s + i.estimated, 0);
                return (
                  <div key={cat.category} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm">{cat.category}</span>
                        <span className="text-xs text-muted-foreground">{cat.items.length}개</span>
                      </div>
                      <span className="font-black text-sm" style={{ color: couple.color }}>{won(catTotal)}</span>
                    </div>
                    <div className="grid grid-cols-12 px-5 py-2 bg-gray-50/50 text-[10px] font-bold text-muted-foreground border-b border-gray-50">
                      <div className="col-span-3">항목</div><div className="col-span-2">업체</div>
                      <div className="col-span-2 text-right">예상금액</div><div className="col-span-2 text-right">계약금</div>
                      <div className="col-span-2 text-right">잔금</div><div className="col-span-1 text-center">상태</div>
                    </div>
                    {cat.items.map((item, idx) => {
                      const isEdit = (f: string) => editCell?.itemId === item.id && editCell?.field === f;
                      function cell(field: string, val: string | number, isNum?: boolean) {
                        if (isEdit(field)) return (
                          <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                            onBlur={() => saveCell(item.id, field, editVal)}
                            onKeyDown={e => { if (e.key === "Enter") saveCell(item.id, field, editVal); if (e.key === "Escape") setEditCell(null); }}
                            className="w-full bg-white border border-[#C4779B] rounded-lg px-2 py-0.5 text-xs outline-none text-right" />
                        );
                        return (
                          <span onClick={() => { setEditCell({ itemId: item.id, field }); setEditVal(isNum ? String((val as number) / 10000) : val as string); }}
                            className={cx("cursor-pointer hover:bg-pink-50 rounded px-1 py-0.5 transition-colors text-xs block",
                              isNum && val === 0 ? "text-muted-foreground" : "")}>
                            {isNum ? ((val as number) === 0 ? "—" : won(val as number)) : ((val as string) || "—")}
                          </span>
                        );
                      }
                      return (
                        <div key={item.id} className={cx("grid grid-cols-12 px-5 py-2.5 items-center hover:bg-gray-50/50 group",
                          idx < cat.items.length - 1 ? "border-b border-gray-50" : "")}>
                          <div className="col-span-3 font-semibold text-sm">{cell("name", item.name)}</div>
                          <div className="col-span-2">{cell("vendor", item.vendor)}</div>
                          <div className="col-span-2 text-right">{cell("estimated", item.estimated, true)}</div>
                          <div className="col-span-2 text-right">{cell("deposit", item.deposit, true)}</div>
                          <div className="col-span-2 text-right">{cell("balance", item.balance, true)}</div>
                          <div className="col-span-1 flex items-center justify-center gap-1">
                            <span className={cx("text-[10px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap", statusCls(item.status))}>{item.status}</span>
                            <button onClick={() => setBudget(p => p.map(c2 => c2.category === cat.category ? { ...c2, items: c2.items.filter(i => i.id !== item.id) } : c2))}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={11} className="text-red-400" /></button>
                          </div>
                        </div>
                      );
                    })}
                    {addingTo === cat.category ? (
                      <div className="px-5 py-2.5 border-t border-gray-50 flex gap-2">
                        <input autoFocus value={newItemName} onChange={e => setNewItemName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter" && newItemName.trim()) {
                              setBudget(p => p.map(c2 => c2.category === cat.category
                                ? { ...c2, items: [...c2.items, { id: Date.now(), name: newItemName, vendor: "", estimated: 0, deposit: 0, balance: 0, status: "미계약" as const }] }
                                : c2));
                              setNewItemName(""); setAddingTo(null);
                            }
                            if (e.key === "Escape") { setAddingTo(null); setNewItemName(""); }
                          }}
                          placeholder="항목명 입력 후 Enter"
                          className="flex-1 bg-gray-50 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#C4779B]" />
                        <button onClick={() => { setAddingTo(null); setNewItemName(""); }} className="text-xs text-muted-foreground px-2">취소</button>
                      </div>
                    ) : (
                      <div className="px-5 py-2 border-t border-gray-50">
                        <button onClick={() => setAddingTo(cat.category)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          <Plus size={11} />항목 추가
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  // 단일 view 상태가 사이드바와 메인을 모두 제어합니다
  const [view, setView] = useState<ViewState>({ kind: "ai" });
  const [couples, setCouples] = useState<Couple[]>(INIT_COUPLES);
  const [summaries, setSummaries] = useState(INIT_SUMMARIES);
  const [events, setEvents] = useState(INIT_EVENTS);
  const [budgets, setBudgets] = useState<Record<number, BudgetCat[]>>({
    1: makeBudget(1), 2: makeBudget(2), 3: makeBudget(3), 4: makeBudget(4),
  });
  const [timelines, setTimelines] = useState<Record<number, TLItem[]>>({
    1: TL_TEMPLATE.map(t => ({ ...t })),
    2: TL_TEMPLATE.map(t => ({ ...t, id: t.id + 100, done: false })),
    3: TL_TEMPLATE.map(t => ({ ...t, id: t.id + 200, done: false })),
    4: TL_TEMPLATE.map(t => ({ ...t, id: t.id + 300, done: false })),
  });
  const [checklists, setChecklists] = useState<Record<number, CkItem[]>>({
    1: CK_TEMPLATE.map(c => ({ ...c })),
    2: CK_TEMPLATE.map(c => ({ ...c, id: c.id + 100, done: false })),
    3: CK_TEMPLATE.map(c => ({ ...c, id: c.id + 200, done: false })),
    4: CK_TEMPLATE.map(c => ({ ...c, id: c.id + 300, done: false })),
  });
  const [showMyPage, setShowMyPage] = useState(false);
  const [showNewCouple, setShowNewCouple] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // 사이드바 열림/닫힘 — 데스크톱은 기본 열림, 모바일은 기본 닫힘
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function createCouple(c: Couple) {
    setCouples(p => [...p, c]);
    setBudgets(p => ({ ...p, [c.id]: makeBudget(c.id) }));
    setTimelines(p => ({ ...p, [c.id]: TL_TEMPLATE.map(t => ({ ...t, id: t.id + c.id * 1000, done: false })) }));
    setChecklists(p => ({ ...p, [c.id]: CK_TEMPLATE.map(x => ({ ...x, id: x.id + c.id * 1000, done: false })) }));
    setView({ kind: "couple", coupleId: c.id, sub: 0 });
    showToast(c.groom + " · " + c.bride + " 그룹이 만들어졌습니다");
  }

  // 현재 선택된 부부 (couple 뷰일 때만 사용)
  const couple = view.kind === "couple"
    ? (couples.find(c => c.id === view.coupleId) ?? couples[0])
    : couples[0];

  const breadcrumb = view.kind === "ai" ? "AI 요약"
    : view.kind === "scheduler" ? "스케줄러"
    : view.kind === "vendor" ? "업체 관리"
    : couple.groom + " · " + couple.bride + "  /  " + SUB_TABS[view.sub];

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* ── 사이드바: 내비게이션 허브 ── */}
      <Sidebar
        couples={couples}
        view={view}
        setView={setView}
        onNewCouple={() => setShowNewCouple(true)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── 메인 영역: view에 따라 콘텐츠 변경 ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-white flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} title="사이드바 펼치기"
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 flex-shrink-0">
                <Menu size={18} />
              </button>
            )}
            <p className="text-sm text-muted-foreground font-semibold truncate">{breadcrumb}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 relative">
              <Bell size={17} className="text-muted-foreground" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <button onClick={() => setShowMyPage(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white hover:opacity-90"
              style={{ background: "#C4779B" }} title="마이페이지 · 설정">
              P
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {view.kind === "ai" && (
            <AIView summaries={summaries} setSummaries={setSummaries} couples={couples} showToast={showToast} />
          )}
          {view.kind === "scheduler" && (
            <SchedulerView couples={couples} events={events} setEvents={setEvents} showToast={showToast} />
          )}
          {view.kind === "vendor" && (
            <VendorView showToast={showToast} />
          )}
          {view.kind === "couple" && (
            <CoupleWorkspace
              couple={couple}
              sub={view.sub}
              setSub={s => setView({ kind: "couple", coupleId: couple.id, sub: s })}
              summaries={summaries}
              setSummaries={setSummaries}
              tlItems={timelines[couple.id] ?? []}
              setTlItems={fn => setTimelines(p => ({ ...p, [couple.id]: fn(p[couple.id] ?? []) }))}
              ckItems={checklists[couple.id] ?? []}
              setCkItems={fn => setChecklists(p => ({ ...p, [couple.id]: fn(p[couple.id] ?? []) }))}
              budget={budgets[couple.id] ?? []}
              setBudget={fn => setBudgets(p => ({ ...p, [couple.id]: fn(p[couple.id] ?? []) }))}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* ── 모달 ── */}
      <AnimatePresence>
        {showMyPage && (
          <MyPageModal couples={couples} onClose={() => setShowMyPage(false)} />
        )}
        {showNewCouple && (
          <NewCoupleModal onClose={() => setShowNewCouple(false)} onCreate={createCouple} />
        )}
        {toast && (
          <motion.div key="toast"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl z-50 whitespace-nowrap"
            style={{ background: "#1A1A2E" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
