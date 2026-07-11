import { AnimatePresence, motion } from 'framer-motion'
import { BUSY, MEETING, YOUR_PROFILE, EXCEPTION_OPTIONS } from '../data.js'

const myBusy = BUSY.seoyeon

export default function Adjust({ profileOff, exceptions, onToggleProfile, onToggleException, onNext }) {
  const changes = profileOff.length + exceptions.length
  const dayOptions = EXCEPTION_OPTIONS.filter((o) => o.group === 'day')
  const timeOptions = EXCEPTION_OPTIONS.filter((o) => o.group === 'time')
  const ctaLabel = changes > 0 ? `보내기 · 이번 주 조정 ${changes}개` : '이대로 좋아요'

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">다음 주, 서연님 조건은<br />이렇게 반영돼 있어요</h1>
        <p className="screen-sub">지민님의 {MEETING.title} · 1시간</p>
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
          <h2 className="section-title">지난 응답에서 가져왔어요</h2>
        </div>
        <div className="chips">
          {YOUR_PROFILE.map((c) => {
            const off = profileOff.includes(c.id)
            return (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                className={`chip ${off ? 'chip-off' : `is-on ${c.kind === 'prefer' ? 'chip-prefer' : ''}`}`}
                onClick={() => onToggleProfile(c.id)}
                aria-pressed={!off}
              >
                {!off && <span className="chip-check" aria-hidden="true">✓</span>}
                {c.label}
                <span className="chip-source">{off ? '이번 주는 끔' : c.source}</span>
              </motion.button>
            )
          })}
        </div>
      </section>

      <section className="chips-section">
        <div className="section-head">
          <h2 className="section-title">이번 주만 다른 게 있어요?</h2>
          <p className="section-sub">피하고 싶은 요일이나 시간대를 눌러주세요</p>
        </div>
        <div className="chips chips-grid">
          {dayOptions.map((o) => (
            <motion.button key={o.id} whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 600, damping: 30 }}
              className={`chip chip-sm ${exceptions.includes(o.id) ? 'is-on' : ''}`}
              onClick={() => onToggleException(o.id)}
              aria-pressed={exceptions.includes(o.id)}
            >{o.label}</motion.button>
          ))}
        </div>
        <div className="chips chips-grid">
          {timeOptions.map((o) => (
            <motion.button key={o.id} whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 600, damping: 30 }}
              className={`chip chip-sm ${exceptions.includes(o.id) ? 'is-on' : ''}`}
              onClick={() => onToggleException(o.id)}
              aria-pressed={exceptions.includes(o.id)}
            >{o.label}</motion.button>
          ))}
        </div>
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
