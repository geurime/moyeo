// 랭킹 로직 — 순수 함수. UI와 분리되어 있고, scripts/verify-ranking.mjs로 검증한다.
//
// 점수 체계 (설계 문서의 4단계):
//   필수 인원 하드 충돌   → 슬롯 탈락 (점수 없음)
//   선택 인원 하드 충돌   → -40  (불참)
//   소프트 비선호 침해     → -12  (아쉬움)
//   소프트 선호 일치       → +6   (좋음)
// 동점이면 주 초반 슬롯 우선 — "기한(다음 주까지) 안에서 빨리 확정"이 낫다는 판단.

import { DAYS, HOURS, BUSY, SOFT_CHIPS } from './data.js'

const SCORE = { OPTIONAL_BUSY: -40, AVOID: -12, PREFER: +6 }

export function isBusy(personId, day, hour) {
  return (BUSY[personId] || []).some((b) => b.day === day && hour >= b.start && hour < b.end)
}

// people: [{ id, name, required, responded }]
// yourChips: 서연이 응답 화면에서 고른 칩 배열 [{ kind, match, short }]
export function rankSlots(people, yourChips = []) {
  const slots = []

  for (const { key: day, date } of DAYS) {
    for (const hour of HOURS) {
      let score = 0
      let excluded = false
      const statuses = [] // 인별 상태

      for (const p of people) {
        const busy = isBusy(p.id, day, hour)
        const chips = p.id === 'seoyeon' ? yourChips : SOFT_CHIPS[p.id] || []
        const hits = busy ? [] : chips.filter((c) => c.match(day, hour))
        const avoids = hits.filter((c) => c.kind === 'avoid')
        const prefers = hits.filter((c) => c.kind === 'prefer')

        if (busy && p.required) excluded = true

        let status = 'ok' // 참석
        if (busy) {
          status = 'absent' // 불참 (선택 인원)
          score += SCORE.OPTIONAL_BUSY
        } else if (avoids.length > 0) {
          status = 'reluctant' // 참석하지만 비선호
          score += SCORE.AVOID * avoids.length
        } else {
          score += SCORE.PREFER * prefers.length
        }
        if (!p.responded && !busy) status = 'calendar-only' // 캘린더 기준 반영

        statuses.push({
          person: p,
          status,
          avoids: avoids.map((c) => c.short),
          prefers: prefers.map((c) => c.short),
        })
      }

      if (excluded) continue

      const attendCount = statuses.filter((s) => s.status !== 'absent').length
      slots.push({ day, date, hour, score, statuses, attendCount })
    }
  }

  // 점수 내림차순, 동점이면 주 초반·이른 시간 우선
  slots.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const di = (s) => DAYS.findIndex((d) => d.key === s.day)
    if (di(a) !== di(b)) return di(a) - di(b)
    return a.hour - b.hour
  })

  return slots
}

// 카드에 쓰는 근거 — 트레이드오프를 사람 말로. { headline, tradeoffs[] } 반환.
export function slotReason(slot, totalCount) {
  const absent = slot.statuses.filter((s) => s.status === 'absent')
  const reluctant = slot.statuses.filter((s) => s.status === 'reluctant')

  const headline =
    slot.attendCount === totalCount
      ? `전원 ${totalCount}명 참석 가능`
      : `${slot.attendCount}명 참석 가능`

  const tradeoffs = []
  for (const s of absent) {
    tradeoffs.push({ kind: 'absent', text: `${s.person.name}님(선택)은 일정이 겹쳐 불참이에요` })
  }
  for (const s of reluctant) {
    tradeoffs.push({ kind: 'avoid', text: `${s.person.name}님의 ‘${s.avoids[0]}’에 걸려요` })
  }
  if (tradeoffs.length === 0) {
    tradeoffs.push({ kind: 'clear', text: '아쉬운 사람 없이 모두 괜찮은 시간이에요' })
  }
  return { headline, tradeoffs }
}
