// 데모 시나리오 — 설계된 데이터입니다.
// 의도: "전원 참석 가능한 슬롯은 존재하되, 선호 침해가 0인 완벽한 슬롯은 없다."
// 1위(화 10:00)는 전원 참석이지만 민수의 비선호를 건드리고,
// 2위(목 15:00)는 지연(선택)의 외근 요일이라 참석이 불확실하다.
// 검증: scripts/verify-ranking.mjs

export const MEETING = {
  title: '3분기 신규 기능 킥오프',
  duration: 60, // 분
  weekLabel: '다음 주 · 7월 13일(월) – 17일(금)',
  deadline: '7월 17일(금)까지',
}

export const DAYS = [
  { key: '월', date: '7/13' },
  { key: '화', date: '7/14' },
  { key: '수', date: '7/15' },
  { key: '목', date: '7/16' },
  { key: '금', date: '7/17' },
]

// 업무 시간 10–17시, 12시는 점심으로 제외. 슬롯은 1시간 단위.
export const HOURS = [10, 11, 13, 14, 15, 16]

// responded: 소프트 선호에 응답했는지. 준호는 미응답 —
// 하드(캘린더)는 자동 수집되므로 미응답이어도 랭킹에 반영된다는 걸 보여주는 장치.
export const PEOPLE = [
  { id: 'jimin',   name: '지민', initial: '지', required: true,  responded: true,  isHost: true },
  { id: 'seoyeon', name: '서연', initial: '서', required: true,  responded: true,  isYou: true },
  { id: 'junho',   name: '준호', initial: '준', required: true,  responded: false },
  { id: 'minsu',   name: '민수', initial: '민', required: true,  responded: true },
  { id: 'haeun',   name: '하은', initial: '하', required: false, responded: true },
  { id: 'jiyeon',  name: '지연', initial: '연', required: false, responded: true },
]

// 하드 제약 — 사내 캘린더 free/busy에서 자동 수집됐다고 가정하는 데이터.
// { day, start, end } : start시부터 end시 직전까지 바쁨.
export const BUSY = {
  jimin: [
    { day: '월', start: 10, end: 12, title: '주간 스프린트 리뷰' },
    { day: '화', start: 13, end: 15, title: '디자인 크리틱' },
    { day: '수', start: 10, end: 11, title: '1:1 미팅' },
    { day: '금', start: 13, end: 17, title: '분기 전략 워크숍' },
  ],
  seoyeon: [
    { day: '월', start: 13, end: 17, title: '사용자 인터뷰 3건' },
    { day: '수', start: 11, end: 12, title: '데이터 리뷰' },
    { day: '수', start: 15, end: 17, title: 'QA 온보딩' },
    { day: '금', start: 10, end: 11, title: '팀 스탠드업' },
  ],
  junho: [
    { day: '월', start: 15, end: 17, title: '서버 마이그레이션' },
    { day: '화', start: 11, end: 12, title: '코드 리뷰' },
    { day: '수', start: 13, end: 15, title: '아키텍처 논의' },
    { day: '목', start: 10, end: 15, title: '채용 인터뷰 3건' },
    { day: '금', start: 13, end: 14, title: '장애 회고' },
  ],
  minsu: [
    { day: '월', start: 14, end: 16, title: '마케팅 싱크' },
    { day: '화', start: 15, end: 17, title: '콘텐츠 촬영' },
    { day: '목', start: 16, end: 17, title: '외부 미팅' },
  ],
  haeun: [
    { day: '월', start: 10, end: 11, title: 'CS 주간 리포트' },
    { day: '금', start: 10, end: 12, title: '오전 반차' },
  ],
  jiyeon: [
    { day: '화', start: 14, end: 15, title: '파트너사 콜' },
    { day: '수', start: 16, end: 17, title: '계약 검토' },
  ],
}

// 소프트 제약 — 캘린더가 모르는 것. 응답 화면에서 칩으로 수집된다.
// kind: 'avoid'(비선호, 감점) | 'prefer'(선호, 가점)
// match(day, hour): 이 슬롯이 해당 조건에 걸리는지.
export const SOFT_CHIPS = {
  minsu: [
    { id: 'minsu-am', kind: 'avoid', label: '오전은 집중 업무 시간이에요', short: '오전 비선호', match: (d, h) => h < 12 },
  ],
  jiyeon: [
    { id: 'jiyeon-thu', kind: 'avoid', label: '목요일은 외근이 많아요', short: '목요일 외근', match: (d) => d === '목' },
  ],
  haeun: [
    { id: 'haeun-late', kind: 'avoid', label: '16시 이후는 피하고 싶어요', short: '늦은 오후 비선호', match: (d, h) => h >= 16 },
  ],
  jimin: [],
  junho: [], // 미응답
  // 서연(=데모의 '나')의 칩은 응답 화면에서 직접 선택한다.
}

// 응답 화면에서 서연에게 보여줄 칩 후보.
export const YOUR_CHIP_OPTIONS = [
  { id: 'seoyeon-lunch', kind: 'avoid',  label: '점심 직후는 피하고 싶어요',  short: '점심 직후 비선호', match: (d, h) => h === 13 },
  { id: 'seoyeon-am',    kind: 'prefer', label: '오전이 좋아요',             short: '오전 선호',       match: (d, h) => h < 12 },
  { id: 'seoyeon-mon',   kind: 'avoid',  label: '월요일은 피하고 싶어요',     short: '월요일 비선호',   match: (d) => d === '월' },
]

// 데모 기본값: 서연이 실제로 선택하는 칩 (응답 화면에서 미리 켜두지 않고, 탭하도록 유도)
export const YOUR_DEFAULT_CHIPS = ['seoyeon-lunch', 'seoyeon-am']
