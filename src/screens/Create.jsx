import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MEETING, CALENDAR } from '../data.js'
import { formatMin } from '../ranking.js'

const EASE = { duration: 0.24, ease: [0.2, 0, 0, 1] }

// 표기 규칙: 60분 미만은 분, 60분부터는 시간(+분)
const DURATIONS = [
  { label: '30분', min: 30 },
  { label: '1시간', min: 60 },
  { label: '1시간 30분', min: 90 },
  { label: '직접', min: null },
]

export default function Create({ durationMin, onChangeDuration, onNext }) {
  const [title, setTitle] = useState(MEETING.title)
  const presetIndex = DURATIONS.findIndex((d) => d.min === durationMin)
  const [custom, setCustom] = useState(presetIndex === -1)
  const segIndex = custom ? 3 : presetIndex
  const { weeks, weekdays, monthLabel, rangeStart, rangeEnd, today } = CALENDAR

  const pick = (d) => {
    if (d.min === null) {
      setCustom(true)
      onChangeDuration(75)
    } else {
      setCustom(false)
      onChangeDuration(d.min)
    }
  }

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">새 일정</h1>
      </header>

      <div className="fields">
        <label className="field">
          <span className="field-label">제목</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="일정 제목" />
        </label>

        <div className="field">
          <span className="field-label">소요 시간</span>
          <div className="seg" role="group" aria-label="회의 길이">
            <motion.span
              className="seg-thumb"
              animate={{ x: `${segIndex * 100}%` }}
              transition={EASE}
              aria-hidden="true"
            />
            {DURATIONS.map((d, i) => (
              <button
                key={d.label}
                className={`seg-btn ${segIndex === i ? 'is-on' : ''}`}
                onClick={() => pick(d)}
                aria-pressed={segIndex === i}
              >
                {d.label}
              </button>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {custom && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={EASE}
                style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center' }}
              >
                <div className="stepper">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="stepper-btn"
                    onClick={() => onChangeDuration(Math.max(15, durationMin - 15))}
                    disabled={durationMin <= 15}
                    aria-label="15분 줄이기"
                  >
                    −
                  </motion.button>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={durationMin}
                      className="stepper-value"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.12 }}
                    >
                      {formatMin(durationMin)}
                    </motion.span>
                  </AnimatePresence>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="stepper-btn"
                    onClick={() => onChangeDuration(Math.min(240, durationMin + 15))}
                    disabled={durationMin >= 240}
                    aria-label="15분 늘리기"
                  >
                    +
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="field">
          <span className="field-label">날짜</span>
          <div className="cal">
            <div className="cal-head">
              <button className="cal-nav-btn" disabled aria-label="이전 달">‹</button>
              <span className="cal-month">{monthLabel}</span>
              <button className="cal-nav-btn" disabled aria-label="다음 달">›</button>
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
                  const inRange = d >= rangeStart && d <= rangeEnd
                  const isEdge = d === rangeStart || d === rangeEnd
                  const num = isEdge ? (
                    <motion.span
                      className="cal-num"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ ...EASE, delay: d === rangeEnd ? 0.28 : 0.2 }}
                    >
                      {d}
                    </motion.span>
                  ) : (
                    <span className="cal-num">{d}</span>
                  )
                  return (
                    <span
                      key={di}
                      className={[
                        'cal-day',
                        inRange && 'is-range',
                        d === rangeStart && 'is-range-start',
                        d === rangeEnd && 'is-range-end',
                        di === 0 && 'is-sun',
                        !inRange && 'is-muted', // 기한 밖 날짜는 선택 불가
                        d === today && 'is-today',
                      ].filter(Boolean).join(' ')}
                      aria-label={`7월 ${d}일${inRange ? ' · 선택된 기간' : ''}`}
                    >
                      {num}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onNext}>
          참석자 정하기
        </motion.button>
      </div>
    </div>
  )
}
