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
// 주최자 — 명단의 시작점이자 항상 필수.
export const HOST = { id: 'jimin', name: '지민', initial: '지', required: true, responded: true, isHost: true }

// 동료 풀 — 참석자 화면의 브라우즈 리스트.
// lastRole: 지난 회의에서의 역할 기억 — 추가되는 순간 필수/선택 기본값이 된다.
// concessions: 양보 원장 — 원장이 있는 사람의 비선호는 랭킹에서 ×1.5로 무겁게.
export const COLLEAGUES = [
  { id: 'seoyeon', name: '서연', initial: '서', responded: true,  lastRole: 'required', isYou: true },
  { id: 'junho',   name: '준호', initial: '준', responded: false, lastRole: 'required' },
  { id: 'minsu',   name: '민수', initial: '민', responded: true,  lastRole: 'required' },
  { id: 'haeun',   name: '하은', initial: '하', responded: true,  lastRole: 'optional' },
  { id: 'jiyeon',  name: '지연', initial: '연', responded: true,  lastRole: 'optional', concessions: 1, concessionNote: '지난달 양보 1회' },
  { id: 'dahye',   name: '다혜', initial: '다', responded: true,  lastRole: null },
  { id: 'taeo',    name: '태오', initial: '태', responded: true,  lastRole: null },
]

// 그룹 — 팀 단위로 한 번에 추가. 회사에서 사람을 부르는 실제 단위.
export const GROUPS = [
  { id: 'product', name: '프로덕트팀', memberIds: ['seoyeon', 'junho', 'minsu', 'haeun', 'jiyeon'] },
  { id: 'growth',  name: '그로스팀',   memberIds: ['dahye', 'taeo'] },
]

// 지난 킥오프 멤버 — 시나리오 명단 구성용.
export const LAST_MEETING_IDS = ['seoyeon', 'junho', 'minsu', 'haeun', 'jiyeon']

// 시나리오 완성 상태의 6인 명단 — 검증 스크립트와 데모 점프(도트 이동)용.
export const PEOPLE = [
  HOST,
  ...COLLEAGUES.filter((c) => LAST_MEETING_IDS.includes(c.id)).map((c) => ({
    ...c,
    required: c.lastRole !== 'optional',
  })),
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

// 서연의 프로필 — 별도 설정 화면에서 만든 게 아니라, 지난 회의들의 응답이 쌓여
// 기본값이 된 것. 조정 화면에 미리 켜진 상태로 나타나고, 끄면 '이번 주만' 꺼진다.
export const YOUR_PROFILE = [
  { id: 'seoyeon-lunch', kind: 'avoid',  label: '점심 직후는 피하고 싶어요', short: '점심 직후 비선호', source: '지난 응답 3회', match: (d, h) => h === 13 },
  { id: 'seoyeon-am',    kind: 'prefer', label: '오전이 좋아요',            short: '오전 선호',       source: '지난 응답 2회', match: (d, h) => h < 12 },
]

// '이번 주만 달라요' 예외 문법 — 요일 × 시간대. 탭하면 이번 주 한정 감점으로 반영.
export const EXCEPTION_OPTIONS = [
  { id: 'ex-mon', group: 'day', label: '월', full: '월요일', match: (d) => d === '월' },
  { id: 'ex-tue', group: 'day', label: '화', full: '화요일', match: (d) => d === '화' },
  { id: 'ex-wed', group: 'day', label: '수', full: '수요일', match: (d) => d === '수' },
  { id: 'ex-thu', group: 'day', label: '목', full: '목요일', match: (d) => d === '목' },
  { id: 'ex-fri', group: 'day', label: '금', full: '금요일', match: (d) => d === '금' },
  { id: 'ex-am',    group: 'time', label: '오전',      full: '오전',      match: (d, h) => h < 12 },
  { id: 'ex-lunch', group: 'time', label: '점심 직후', full: '점심 직후', match: (d, h) => h === 13 },
  { id: 'ex-pm',    group: 'time', label: '오후',      full: '오후',      match: (d, h) => h >= 13 && h < 16 },
  { id: 'ex-late',  group: 'time', label: '늦은 오후', full: '늦은 오후', match: (d, h) => h >= 16 },
]


// 기간 캘린더 (2026년 7월) — 7/1은 수요일. null은 빈 칸, 주말은 비활성.
export const CALENDAR = {
  monthLabel: '2026년 7월',
  weekdays: ['일', '월', '화', '수', '목', '금', '토'],
  // 주 단위 행. range: 데모 시나리오의 다음 주(13–17).
  weeks: [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, null],
  ],
  rangeStart: 13,
  rangeEnd: 17,
  today: 12,
}

export const SUGGESTED_BUSY = {
  dahye: [
    { day: '화', start: 13, end: 15, title: '브랜드 리뷰' },
    { day: '금', start: 10, end: 12, title: '촬영 입회' },
  ],
  taeo: [
    { day: '월', start: 10, end: 12, title: '법무 검토' },
    { day: '수', start: 14, end: 16, title: '파트너 미팅' },
  ],
}
