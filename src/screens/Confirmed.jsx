import { motion } from 'framer-motion'
import { MEETING, DAYS } from '../data.js'
import { endLabel } from '../ranking.js'

const DAY_FULL = { 월: '월요일', 화: '화요일', 수: '수요일', 목: '목요일', 금: '금요일' }

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.2, 0, 0, 1] } },
}

// 확정 = 축하 한 덩어리 + 사실 몇 줄. 시스템은 감정을 연기하지 않는다.
export default function Confirmed({ slot, durationMin, onReset }) {
  if (!slot) return null
  const date = DAYS.find((d) => d.key === slot.day)?.date
  const dateLabel = `7월 ${date.split('/')[1]}일 ${DAY_FULL[slot.day]}`
  const timeLabel = `${slot.hour}:00–${endLabel(slot.hour, durationMin)}`

  const reluctant = slot.statuses.filter((s) => s.status === 'reluctant')
  const absent = slot.statuses.filter((s) => s.status === 'absent')

  return (
    <motion.div
      className="product"
      variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
      initial="hidden"
      animate="show"
    >
      <div className="confirm-hero">
        <svg className="check" viewBox="0 0 64 64" aria-hidden="true">
          <circle className="check-circle" cx="32" cy="32" r="29" />
          <path className="check-mark" d="M20 33.5 L28.5 42 L44 24.5" />
        </svg>
        <motion.p variants={item} className="confirm-over">{MEETING.title}</motion.p>
        <motion.p variants={item} className="confirm-over is-date">{dateLabel}</motion.p>
        <motion.h1 variants={item} className="screen-title">{timeLabel} 확정했어요</motion.h1>
        <motion.p variants={item} className="screen-sub">
          초대장에 <strong>왜 이 시간인지</strong>도 함께 담아 보내요
        </motion.p>
      </div>

      <motion.ul variants={item} className="fact-list">
        {reluctant.map((s) => (
          <li key={s.person.id} className="fact-row">
            <span className="auto-check" aria-hidden="true">✓</span>
            {s.person.name}님이 양보해주셨어요
          </li>
        ))}
        {absent.map((s) => (
          <li key={s.person.id} className="fact-row">
            <span className="auto-check" aria-hidden="true">✓</span>
            {s.person.name}님은 불참이에요
          </li>
        ))}
        {reluctant.length === 0 && absent.length === 0 && (
          <li className="fact-row">
            <span className="auto-check" aria-hidden="true">✓</span>
            모두에게 괜찮은 시간이에요
          </li>
        )}
      </motion.ul>

      <motion.div variants={item} className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onReset}>
          처음부터 다시 보기
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
