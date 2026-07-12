// 데모 시나리오 검증 — 더미 데이터가 설계 의도대로 랭킹되는지 확인한다.
// 의도:
//   1. 전원(6명) 참석 가능한 슬롯이 존재한다 (과제 요구: 모두가 괜찮은 시간)
//   2. 그러나 '완벽한 슬롯'(전원 참석 + 침해 0)은 없다 (트레이드오프가 드러남)
//   3. 1위 = 화 10:00 (전원 참석, 민수 비선호)
//   4. 상위 3개의 트레이드오프 사유가 서로 다르다 (카드 다양성)
//   5. 조정 화면에서 무엇을 켜고 꺼도 1위는 화 10:00 (데모 견고성)

import { PEOPLE, YOUR_PROFILE, ADJUST_OPTIONS } from '../src/data.js'
import { rankSlots, slotReason } from '../src/ranking.js'

// 데모 기본 상태: 프로필 전부 켜짐, 예외 없음
const ranked = rankSlots(PEOPLE, YOUR_PROFILE)

let failures = 0
const check = (name, cond, detail = '') => {
  console.log(`${cond ? '✓' : '✗ FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
  if (!cond) failures++
}

console.log('=== 후보 슬롯 전체 (점수순) ===')
for (const s of ranked) {
  const r = slotReason(s, PEOPLE.length)
  console.log(
    `${s.day} ${String(s.hour).padStart(2, '0')}:00  score=${String(s.score).padStart(4)}  ` +
    `참석 ${s.attendCount}/6  | ${r.headline} · ${r.tradeoffs.map((t) => t.text).join(' · ')}`
  )
}
console.log(`\n총 ${ranked.length}개 슬롯 생존 (30개 중, 나머지는 필수 인원 충돌로 탈락)\n`)

console.log('=== 설계 의도 검증 ===')
const top = ranked[0]
check('1위는 화 10:00', top && top.day === '화' && top.hour === 10, top && `실제 1위: ${top.day} ${top.hour}:00`)
check('1위는 전원 6명 참석', top && top.attendCount === 6)

const fullSlots = ranked.filter((s) => s.attendCount === PEOPLE.length)
check('전원 참석 가능 슬롯 존재', fullSlots.length > 0, `${fullSlots.length}개`)

const perfect = ranked.filter((s) => s.attendCount === PEOPLE.length && s.score >= 0 &&
  s.statuses.every((st) => st.status === 'ok' || st.status === 'calendar-only'))
check('완벽한 슬롯(침해 0)은 없음', perfect.length === 0, perfect.length > 0 ? `완벽 슬롯: ${perfect.map((s) => s.day + s.hour).join(',')}` : '')

const top3 = ranked.slice(0, 3)
const texts = top3.map((s) => slotReason(s, 6).tradeoffs.map((t) => t.text).join('·'))
check('상위 3개 트레이드오프 사유가 서로 다름', new Set(texts).size === 3, texts.join(' / '))
check('상위 3개에 불참(absent) 케이스 포함', top3.some((s) =>
  slotReason(s, 6).tradeoffs.some((t) => t.kind === 'absent')))

// 견고성 1: 프로필을 전부 이번 주만 끈 경우
const topEmpty = rankSlots(PEOPLE, [])[0]
check('프로필 전부 꺼도 1위는 화 10:00', topEmpty.day === '화' && topEmpty.hour === 10,
  `실제: ${topEmpty.day} ${topEmpty.hour}:00`)

// 견고성 2: 조정 칩을 전부 켠 극단 케이스 — 크래시 없이 재계산되고,
// 서연의 다중 기피(화요일+출근 직후)가 화 10:00을 밀어내 목 15:00이 1위가 되는 게 옳다.
const rankedAll = rankSlots(PEOPLE, ADJUST_OPTIONS)
check('칩 전부 켜도 후보가 정상 생성됨', rankedAll.length === 3, `실제: ${rankedAll.length}개`)
check('칩 전부 켜면 다중 기피가 실반영돼 1위가 목 15:00로 재계산됨',
  rankedAll[0].day === '목' && rankedAll[0].hour === 15,
  `실제: ${rankedAll[0].day} ${rankedAll[0].hour}:00`)

// 양보 원장: 지연(지난달 양보 1회)의 비선호는 -12가 아니라 -18로 반영
const thu15 = ranked.find((s) => s.day === '목' && s.hour === 15)
check('양보 원장 가중 적용 (목 15:00 = -18)', thu15 && thu15.score === -18,
  thu15 ? `실제: ${thu15.score}` : '슬롯 없음')
check('원장 가중이 상태에 표시됨', thu15 && thu15.statuses.some((s) => s.ledgerWeighted))

// 길이 실동작: 30분이면 후보·순위 동일(1시간 안에 들어가므로), 90분이면 연속 시간이 없어 0개
const top30 = rankSlots(PEOPLE, YOUR_PROFILE, 30)[0]
check('30분 회의도 1위는 화 10:00', top30 && top30.day === '화' && top30.hour === 10)
const ranked90 = rankSlots(PEOPLE, YOUR_PROFILE, 90)
check('90분 회의는 후보 0개 (빈 상태 진입)', ranked90.length === 0, `실제: ${ranked90.length}개`)
const ranked120 = rankSlots(PEOPLE, YOUR_PROFILE, 120)
check('2시간 회의도 후보 0개', ranked120.length === 0, `실제: ${ranked120.length}개`)

// 준호(미확인)가 랭킹에 반영되는지 — 캘린더 폴백
const junhoInTop = top && top.statuses.find((s) => s.person.id === 'junho')
check('미확인자 준호가 캘린더 기준으로 반영됨', junhoInTop && junhoInTop.status === 'calendar-only')

console.log(failures === 0 ? '\n모든 검증 통과' : `\n${failures}개 실패`)
process.exit(failures === 0 ? 0 : 1)
