import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MEETING, SUGGESTED_PEOPLE, CALENDAR } from '../data.js'

const SPRING = { type: 'spring', stiffness: 700, damping: 35 }
const EXPAND = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { type: 'spring', stiffness: 420, damping: 38 },
}

const DURATIONS = ['30분', '1시간', '90분', '직접']

export default function Create({ people, onTogglePerson, onAddPerson, onRemovePerson, onNext }) {
  const [title, setTitle] = useState(MEETING.title)
  const [duration, setDuration] = useState('1시간')
  const [customMin, setCustomMin] = useState('75')
  const [calOpen, setCalOpen] = useState(false)
  const [calHint, setCalHint] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const remaining = SUGGESTED_PEOPLE.filter((s) => !people.some((p) => p.id === s.id))
  const { weeks, weekdays, monthLabel, rangeStart, rangeEnd, today } = CALENDAR

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">새 회의</h1>
      </header>

      <div className="field-card">
        <label className="field">
          <span className="field-label">회의 이름</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="회의 이름" />
        </label>

        <div className="field">
          <span className="field-label">길이</span>
          <div className="seg" role="group" aria-label="회의 길이">
            {DURATIONS.map((d) => (
              <button
                key={d}
                className={`seg-btn ${duration === d ? 'is-on' : ''}`}
                onClick={() => setDuration(d)}
                aria-pressed={duration === d}
              >
                {d}
              </button>
            ))}
            <AnimatePresence initial={false}>
              {duration === '직접' && (
                <motion.label
                  className="seg-custom"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={SPRING}
                >
                  <input
                    className="seg-custom-input"
                    inputMode="numeric"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    aria-label="직접 입력한 길이(분)"
                  />
                  분
                </motion.label>
              )}
            </AnimatePresence>
          </div>
          {duration !== '1시간' && (
            <p className="picker-hint">데모 후보는 1시간 기준으로 보여드려요</p>
          )}
        </div>

        <div className="field">
          <span className="field-label">기간</span>
          <button className="field-picker" onClick={() => { setCalOpen(!calOpen); setCalHint(false) }} aria-expanded={calOpen}>
            <span className="field-value">{MEETING.weekLabel}</span>
            <motion.span className="picker-chev" animate={{ rotate: calOpen ? 180 : 0 }} transition={SPRING} aria-hidden="true">⌄</motion.span>
          </button>
          <AnimatePresence initial={false}>
            {calOpen && (
              <motion.div {...EXPAND} style={{ overflow: 'hidden' }}>
                <div className="cal">
                  <div className="cal-head">
                    <span className="cal-month">{monthLabel}</span>
                    <div className="cal-nav">
                      <button onClick={() => setCalHint(true)} aria-label="이전 달">‹</button>
                      <button onClick={() => setCalHint(true)} aria-label="다음 달">›</button>
                    </div>
                  </div>
                  <div className="cal-grid cal-weekdays" aria-hidden="true">
                    {weekdays.map((w, i) => (
                      <span key={w} className={`cal-wd ${i === 0 ? 'is-sun' : ''}`}>{w}</span>
                    ))}
                  </div>
                  {weeks.map((week, wi) => (
                    <div className="cal-grid" key={wi}>
                      {week.map((d, di) => {
                        if (d === null) return <span key={di} className="cal-day" />
                        const weekend = di === 0 || di === 6
                        const inRange = d >= rangeStart && d <= rangeEnd
                        const isEdge = d === rangeStart || d === rangeEnd
                        const past = d < today
                        const num = isEdge ? (
                          <motion.span
                            className="cal-num"
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 26, delay: d === rangeEnd ? 0.08 : 0.02 }}
                          >
                            {d}
                          </motion.span>
                        ) : (
                          <span className="cal-num">{d}</span>
                        )
                        return (
                          <button
                            key={di}
                            className={[
                              'cal-day',
                              inRange && 'is-range',
                              d === rangeStart && 'is-range-start',
                              d === rangeEnd && 'is-range-end',
                              di === 0 && 'is-sun',
                              (weekend || past) && 'is-muted',
                              d === today && 'is-today',
                            ].filter(Boolean).join(' ')}
                            disabled={weekend || past}
                            onClick={() => (inRange ? setCalOpen(false) : setCalHint(true))}
                            aria-label={`7월 ${d}일${inRange ? ' · 선택된 기간' : ''}`}
                          >
                            {num}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                  {calHint && <p className="picker-hint">데모 데이터는 다음 주(7/13–17) 기준이에요</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="attendees">
        <div className="section-head section-head-row">
          <h2 className="section-title">참석자 {people.length}명</h2>
          {remaining.length > 0 && (
            <button className="head-add" onClick={() => setSearchOpen(!searchOpen)} aria-expanded={searchOpen}>
              + 추가
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {searchOpen && remaining.length > 0 && (
            <motion.div {...EXPAND} style={{ overflow: 'hidden' }}>
              <ul className="suggest-list">
                {remaining.map((s) => (
                  <li key={s.id} className="suggest-row">
                    <span className="avatar">{s.initial}</span>
                    <span className="person-name">{s.name}</span>
                    <motion.button whileTap={{ scale: 0.94 }} className="suggest-add" onClick={() => onAddPerson(s)}>
                      추가
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <ul className="person-list">
          <AnimatePresence initial={false}>
            {people.map((p) => (
              <motion.li
                key={p.id}
                className="person-row"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              >
                <div className="person-row-inner">
                  <span className={`avatar ${p.required ? 'avatar-required' : ''}`}>{p.initial}</span>
                  <span className="person-name">
                    {p.name}
                    {p.isHost && <span className="tag">나 · 주최</span>}
                    {p.isAdded && (
                      <button className="remove-btn" onClick={() => onRemovePerson(p.id)} aria-label={`${p.name} 제외`}>✕</button>
                    )}
                  </span>
                  <motion.button
                    whileTap={p.isHost ? undefined : { scale: 0.92 }}
                    transition={SPRING}
                    className={`role-chip ${p.required ? 'is-required' : ''}`}
                    onClick={() => onTogglePerson(p.id)}
                    disabled={p.isHost}
                    aria-pressed={p.required}
                    aria-label={`${p.name} ${p.required ? '필수' : '선택'} 참석 — 눌러서 전환`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={p.required ? 'r' : 'o'}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.12 }}
                      >
                        {p.required ? '필수' : '선택'}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>

      <div className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onNext}>
          {people.length - 1}명에게 확인 요청 보내기
        </motion.button>
      </div>
    </div>
  )
}
