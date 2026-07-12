import { AnimatePresence, motion } from 'framer-motion'
import { BUSY, MEETING, ADJUST_OPTIONS, LEARNED, LEARNED_IDS } from '../data.js'
import { formatMin } from '../ranking.js'

const myBusy = BUSY.seoyeon

// 화면: 서연의 조정 — 캘린더가 모르는 조건을 확인·조정한다.
// 분류는 하나(요일 기피 → 시간대 기피 → 시간대 선호), 학습된 값은 미리 체크되어 있다.
export default function Adjust({ durationMin, chipIds, onToggle, onNext }) {
  const dayOptions = ADJUST_OPTIONS.filter((o) => o.group === 'day')
  const timeOptions = ADJUST_OPTIONS.filter((o) => o.group === 'time')
  const preferOptions = ADJUST_OPTIONS.filter((o) => o.group === 'prefer')

  // 학습 기본값에서 달라진 개수 = 이번 주 조정
  const changes =
    chipIds.filter((id) => !LEARNED_IDS.includes(id)).length +
    LEARNED_IDS.filter((id) => !chipIds.includes(id)).length
  const ctaLabel = changes > 0 ? `보내기 · 이번 주 조정 ${changes}개` : '이대로 좋아요'

  const chip = (o, extraClass = '') => {
    const on = chipIds.includes(o.id)
    const learned = LEARNED[o.id]
    return (
      <motion.button
        key={o.id}
        whileTap={{ scale: 0.94 }}
        className={`chip ${extraClass} ${on ? `is-on ${o.kind === 'prefer' ? 'chip-prefer' : ''}` : ''} ${!on && learned ? 'chip-off' : ''}`}
        onClick={() => onToggle(o.id)}
        aria-pressed={on}
      >
        {on && <span className="chip-check" aria-hidden="true">✓</span>}
        {o.label}
        {learned && <span className="chip-source">{on ? learned : '이번 주는 끔'}</span>}
      </motion.button>
    )
  }

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">다음 주, 서연님 조건은<br />이렇게 반영돼 있어요</h1>
        <p className="screen-sub">지민님의 {MEETING.title} · {formatMin(durationMin)}</p>
      </header>

      <div className="auto-card">
        <div className="auto-head">
          <span className="auto-check" aria-hidden="true">✓</span>
          <span className="auto-title">캘린더 일정 {myBusy.length}건 자동 반영</span>
        </div>
        <ul className="busy-list">
          {myBusy.map((b) => (
            <li key={`${b.day}${b.start}`} className="busy-item">
              <span className="busy-when">{b.day} {b.start}:00–{b.end}:00</span>
              <span className="busy-title">{b.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <section className="chips-section">
        <div className="section-head">
          <h2 className="section-title">피하고 싶은 요일</h2>
        </div>
        <div className="chips chips-grid">{dayOptions.map((o) => chip(o, 'chip-sm'))}</div>
      </section>

      <section className="chips-section">
        <div className="section-head">
          <h2 className="section-title">피하고 싶은 시간대</h2>
        </div>
        <div className="chips">{timeOptions.map((o) => chip(o))}</div>
      </section>

      <section className="chips-section">
        <div className="section-head">
          <h2 className="section-title">이런 시간이 좋아요</h2>
        </div>
        <div className="chips">{preferOptions.map((o) => chip(o))}</div>
      </section>

      <div className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onNext}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={ctaLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
            >
              {ctaLabel}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <p className="cta-hint">반복되는 조정은 학습해서, 다음 회의의 기본값이 돼요</p>
      </div>
    </div>
  )
}
