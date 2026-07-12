import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MEETING, DAYS, PEOPLE } from '../data.js'
import { endLabel, rankSlots } from '../ranking.js'

const DAY_FULL = { 월: '월요일', 화: '화요일', 수: '수요일', 목: '목요일', 금: '금요일' }

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.2, 0, 0, 1] } },
}

// 첫 줄 = 선정 근거 — 슬롯 구성과 후보 지형에서 생성한다. 고정 문구 없음.
function reasonLine(slot, allSlots, total) {
  const absent = slot.statuses.filter((s) => s.status === 'absent')
  const reluctant = slot.statuses.filter((s) => s.status === 'reluctant')
  const fullSlots = allSlots.filter((s) => s.attendCount === total)

  if (absent.length > 0) return '필수 인원이 모두 가능한 시간 중 최선이에요'
  if (reluctant.length === 0) return '모두에게 괜찮은 시간이에요'
  if (fullSlots.length === 1) return '전원이 모일 수 있는 유일한 시간이에요'
  return '전원이 모이는 시간 중 아쉬움이 가장 적어요'
}

// 확정 = 모두가 받아보는 회의 요약장. 근거 → 양보 → 불참 순의 사실만.
export default function Confirmed({ slot, yourChips, durationMin, onReset }) {
  if (!slot) return null
  const date = DAYS.find((d) => d.key === slot.day)?.date
  const dateLabel = `7월 ${date.split('/')[1]}일 ${DAY_FULL[slot.day]}`
  const timeLabel = `${slot.hour}:00–${endLabel(slot.hour, durationMin)}`

  const allSlots = useMemo(() => rankSlots(PEOPLE, yourChips, durationMin), [yourChips, durationMin])
  const reluctant = slot.statuses.filter((s) => s.status === 'reluctant')
  const absent = slot.statuses.filter((s) => s.status === 'absent')

  return (
    <motion.div
      className="product"
      variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
      initial="hidden"
      animate="show"
    >
      <div className="confirm-body">
        <div className="confirm-hero">
          <svg className="check" viewBox="0 0 64 64" aria-hidden="true">
            <circle className="check-circle" cx="32" cy="32" r="29" />
            <path className="check-mark" d="M20 33.5 L28.5 42 L44 24.5" />
          </svg>
          <motion.p variants={item} className="confirm-title">{MEETING.title}</motion.p>
          <motion.p variants={item} className="confirm-over is-date">{dateLabel}</motion.p>
          <motion.h1 variants={item} className="confirm-time">{timeLabel}</motion.h1>
        </div>

        <motion.ul variants={item} className="fact-list">
        <li className="fact-row">
          <span className="auto-check" aria-hidden="true">✓</span>
          {reasonLine(slot, allSlots, slot.statuses.length)}
        </li>
        {reluctant.map((s) => (
          <li key={s.person.id} className="fact-row">
            <span className="auto-check" aria-hidden="true">✓</span>
            {s.person.name}님이 양보해주셨어요
          </li>
        ))}
        {absent.map((s) => (
          <li key={s.person.id} className="fact-row">
            <span className="auto-check" aria-hidden="true">✓</span>
            {s.person.name}님은 불참이에요{s.avoids[0] ? ` · ${s.avoids[0]}` : ''}
          </li>
        ))}
        </motion.ul>
      </div>

      <motion.div variants={item} className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onReset}>
          처음부터 다시 보기
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
