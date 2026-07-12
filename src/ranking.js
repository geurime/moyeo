// 랭킹 로직 — 순수 함수. UI와 분리되어 있고, scripts/verify-ranking.mjs로 검증한다.
//
// 점수 체계 (설계 문서의 4단계 + 양보 원장):
//   필수 인원 하드 충돌   → 슬롯 탈락 (점수 없음)
//   선택 인원 하드 충돌   → -40  (불참)
//   소프트 비선호 침해     → -12  (아쉬움) · 최근 양보자는 ×1.5 = -18
//   소프트 선호 일치       → +6   (좋음)
// 동점이면 주 초반 슬롯 우선 — "기한(다음 주까지) 안에서 빨리 확정"이 낫다는 판단.
// 양보 원장: 비선호 시간에 확정된 양보는 기록되고, 다음 회의에서 그 사람의
// 비선호가 더 무겁게 반영된다. 같은 사람이 반복해서 희생되는 걸 구조로 막는다.

import { DAYS, HOURS, BUSY, SOFT_CHIPS, SUGGESTED_BUSY } from './data.js'

const ALL_BUSY = { ...BUSY, ...SUGGESTED_BUSY }

const SCORE = { OPTIONAL_BUSY: -40, AVOID: -12, PREFER: +6, CONCESSION_MULTIPLIER: 1.5 }

export function isBusy(personId, day, hour) {
  return (ALL_BUSY[personId] || []).some((b) => b.day === day && hour >= b.start && hour < b.end)
}

// 연속 업무 시간 블록 — 12시는 점심이라 11→13은 연속이 아니다.
const RUNS = [[10, 11], [13, 14, 15, 16]]

// duration(분)이 1시간을 넘으면 연속으로 비어 있는 시간이 필요하다.
function spanFor(startHour, durationMin) {
  const need = Math.ceil(durationMin / 60)
  const run = RUNS.find((r) => r.includes(startHour))
  const idx = run.indexOf(startHour)
  if (idx + need > run.length) return null // 블록 끝을 넘거나 점심을 가로지름
  return run.slice(idx, idx + need)
}

// 길이 표기 규칙 — 60분 미만은 분, 60분부터는 시간(+분)
export function formatMin(min) {
  if (min < 60) return `${min}분`
  if (min % 60 === 0) return `${min / 60}시간`
  return `${Math.floor(min / 60)}시간 ${min % 60}분`
}

// 종료 시각 라벨 — "10:00–11:30" 의 뒷부분
export function endLabel(startHour, durationMin) {
  const endH = startHour + Math.floor(durationMin / 60)
  const endM = durationMin % 60
  return `${endH}:${String(endM).padStart(2, '0')}`
}

// people: [{ id, name, required, responded }]
// yourChips: 서연이 조정 화면에서 확정한 칩 배열 [{ kind, match, short }]
// durationMin: 회의 길이(분) — 슬롯 성립 조건과 종료 시각에 반영
export function rankSlots(people, yourChips = [], durationMin = 60) {
  const slots = []

  for (const { key: day, date } of DAYS) {
    for (const hour of HOURS) {
      const span = spanFor(hour, durationMin)
      if (!span) continue

      let score = 0
      let excluded = false
      const statuses = [] // 인별 상태

      for (const p of people) {
        const busy = span.some((h) => isBusy(p.id, day, h))
        const chips = p.id === 'seoyeon' ? yourChips : SOFT_CHIPS[p.id] || []
        const hits = busy ? [] : chips.filter((c) => span.some((h) => c.match(day, h)))
        const avoids = hits.filter((c) => c.kind === 'avoid')
        const prefers = hits.filter((c) => c.kind === 'prefer')

        if (busy && p.required) excluded = true

        const hasLedger = (p.concessions || 0) > 0

        let status = 'ok' // 참석
        if (busy) {
          status = 'absent' // 불참 (선택 인원)
          score += SCORE.OPTIONAL_BUSY
        } else if (avoids.length > 0) {
          status = 'reluctant' // 참석하지만 비선호
          const weight = hasLedger ? SCORE.CONCESSION_MULTIPLIER : 1
          score += SCORE.AVOID * avoids.length * weight
        } else {
          score += SCORE.PREFER * prefers.length
        }
        if (!p.responded && !busy) status = 'calendar-only' // 캘린더 기준 반영

        statuses.push({
          person: p,
          status,
          ledgerWeighted: status === 'reluctant' && hasLedger,
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
