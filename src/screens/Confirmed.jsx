import { motion } from 'framer-motion'
import { MEETING, DAYS } from '../data.js'
import { endLabel } from '../ranking.js'

const DAY_FULL = { 월: '월요일', 화: '화요일', 수: '수요일', 목: '목요일', 금: '금요일' }

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.2, 0, 0, 1] } },
}

export default function Confirmed({ slot, durationMin, onReset }) {
  if (!slot) return null
  const date = DAYS.find((d) => d.key === slot.day)?.date
  const dateLabel = `7월 ${date.split('/')[1]}일 ${DAY_FULL[slot.day]}`
  const timeLabel = `${slot.hour}:00–${endLabel(slot.hour, durationMin)}`
  const when = `${dateLabel} ${timeLabel}`

  const reluctant = slot.statuses.filter((s) => s.status === 'reluctant')
  const absent = slot.statuses.filter((s) => s.status === 'absent')
  const isFull = slot.attendCount === slot.statuses.length

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
        <motion.p variants={item} className="confirm-over">{dateLabel}</motion.p>
        <motion.h1 variants={item} className="screen-title">{timeLabel} 확정했어요</motion.h1>
        <motion.p variants={item} className="screen-sub">
          초대장에 <strong>왜 이 시간인지</strong>도 함께 담아 보내요
        </motion.p>
      </div>

      <motion.div variants={item} className="msg-card">
        <p className="msg-label">전원에게</p>
        <p className="msg-body">
          <strong>{MEETING.title}</strong>이 {when}로 확정됐어요.{' '}
          {isFull
            ? '6명 전원이 참석할 수 있는 시간이에요.'
            : '필수 인원이 모두 모일 수 있는 시간이에요.'}
        </p>
      </motion.div>

      {reluctant.map((s) => (
        <motion.div variants={item} className="msg-card msg-warn" key={s.person.id}>
          <p className="msg-label">{s.person.name}님께는 따로</p>
          <p className="msg-body">
            피하고 싶으신 시간인 걸 알아요. 그래도 전원이 모일 수 있는 시간이
            이때뿐이라 미리 양해를 구해요.
          </p>
          <p className="msg-ledger">
            ✓ 이번 양보는 기록했어요 — 다음 회의에선 {s.person.name}님 선호가 먼저예요
          </p>
        </motion.div>
      ))}

      {absent.map((s) => (
        <motion.div variants={item} className="msg-card msg-warn" key={s.person.id}>
          <p className="msg-label">{s.person.name}님께는 따로</p>
          <p className="msg-body">
            일정이 겹쳐 이번엔 참석이 어려우시죠. 선택 참석이라 이 시간으로
            확정했고, 회의록은 끝나는 대로 공유해드릴게요.
          </p>
          <p className="msg-ledger">
            ✓ 불참도 양보로 기록했어요 — 다음 회의에서 먼저 배려돼요
          </p>
        </motion.div>
      ))}

      <motion.div variants={item} className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onReset}>
          처음부터 다시 보기
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
