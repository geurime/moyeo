import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MEETING, CALENDAR } from '../data.js'

const SPRING = { type: 'spring', stiffness: 700, damping: 35 }
const DURATIONS = ['30분', '1시간', '90분', '직접']

function formatMin(min) {
  if (min < 60) return `${min}분`
  if (min % 60 === 0) return `${min / 60}시간`
  return `${Math.floor(min / 60)}시간 ${min % 60}분`
}

export default function Create({ onNext }) {
  const [title, setTitle] = useState(MEETING.title)
  const [duration, setDuration] = useState('1시간')
  const [customMin, setCustomMin] = useState(75)
  const [calHint, setCalHint] = useState(false)
  const { weeks, weekdays, monthLabel, rangeStart, rangeEnd, today } = CALENDAR
  const durationIndex = DURATIONS.indexOf(duration)

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">새 회의</h1>
      </header>

      <div className="fields">
        <label className="field">
          <span className="field-label">회의 이름</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="회의 이름" />
        </label>

        <div className="field">
          <span className="field-label">길이</span>
          <div className="seg" role="group" aria-label="회의 길이">
            <motion.span
              className="seg-thumb"
              animate={{ x: `${durationIndex * 100}%` }}
              transition={SPRING}
              aria-hidden="true"
            />
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
          </div>

          <AnimatePresence initial={false}>
            {duration === '직접' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="stepper">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    className="stepper-btn"
                    onClick={() => setCustomMin((m) => Math.max(15, m - 15))}
                    disabled={customMin <= 15}
                    aria-label="15분 줄이기"
                  >
                    −
                  </motion.button>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={customMin}
                      className="stepper-value"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.12 }}
                    >
                      {formatMin(customMin)}
                    </motion.span>
                  </AnimatePresence>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    className="stepper-btn"
                    onClick={() => setCustomMin((m) => Math.min(240, m + 15))}
                    disabled={customMin >= 240}
                    aria-label="15분 늘리기"
                  >
                    +
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {duration !== '1시간' && (
            <p className="picker-hint">데모 후보는 1시간 기준으로 보여드려요</p>
          )}
        </div>

        <div className="field">
          <span className="field-label">기간</span>
          <div className="cal">
            <div className="cal-head">
              <button className="cal-nav-btn" onClick={() => setCalHint(true)} aria-label="이전 달">‹</button>
              <span className="cal-month">{monthLabel}</span>
              <button className="cal-nav-btn" onClick={() => setCalHint(true)} aria-label="다음 달">›</button>
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
                      transition={{ type: 'spring', stiffness: 500, damping: 26, delay: d === rangeEnd ? 0.24 : 0.16 }}
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
                      onClick={() => { if (!inRange) setCalHint(true) }}
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
        </div>
      </div>

      <div className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onNext}>
          참석자 고르기
        </motion.button>
      </div>
    </div>
  )
}
