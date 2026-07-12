import { useEffect, useState } from 'react'
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
  const { weeks, weekdays, monthLabel, rangeStart, rangeEnd, today } = CALENDAR

  // 진입 연출 — 지민이 채우는 장면: 제목 → 소요 시간(30분→1시간) → 날짜(13→17).
  // 전부 표시 상태만 바꿔서 durationMin 등 실제 데이터는 오염되지 않는다.
  const [titleVisible, setTitleVisible] = useState(false)
  const [introSeg, setIntroSeg] = useState(0) // 썸을 잠시 '30분'에 두었다가 제자리로
  const [calStage, setCalStage] = useState(0) // 0 없음 → 1 시작일 → 2 범위 완성
  useEffect(() => {
    const ts = [
      setTimeout(() => setTitleVisible(true), 400),
      setTimeout(() => setIntroSeg(null), 900),
      setTimeout(() => setCalStage(1), 1500),
      setTimeout(() => setCalStage(2), 2000),
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  const segIndex = introSeg ?? (custom ? 3 : presetIndex)

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
          <motion.div animate={{ opacity: titleVisible ? 1 : 0 }} initial={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="일정 제목" />
          </motion.div>
        </label>

        <div className="field">
          <span className="field-label">소요 시간</span>
          <div className="seg" role="group" aria-label="소요 시간">
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
            {weeks.map((week, wi) => {
              // 밴드 = 주 행에 깔리는 한 덩어리 — 셀 배경 5조각이면 경계 반픽셀 틈이 생긴다
              const bandFirst = week.findIndex((d) => d !== null && d >= rangeStart && d <= rangeEnd)
              let bandLast = bandFirst
              week.forEach((d, i) => {
                if (d !== null && d >= rangeStart && d <= rangeEnd) bandLast = i
              })
              return (
              <div className="cal-grid" key={wi}>
                {week.map((d, di) => {
                  if (d === null) return <span key={di} className="cal-day" />
                  // 연출: 13 클릭 = 원 마커만 → 17 클릭 때 밴드(틴트)가 이어진다
                  const banded = calStage === 2 && d >= rangeStart && d <= rangeEnd
                  const isEdge =
                    (calStage >= 1 && d === rangeStart) || (calStage === 2 && d === rangeEnd)
                  const inRange = banded || isEdge
                  const num = isEdge ? (
                    <motion.span
                      className="cal-num"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={EASE}
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
                        banded && 'is-range', // 틴트 밴드는 범위 완성 후에만
                        isEdge && d === rangeStart && 'is-range-start',
                        ((calStage === 2 && d === rangeEnd) || (calStage === 1 && d === rangeStart)) && 'is-range-end',
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
                {calStage === 2 && bandFirst !== -1 && (
                  <motion.span
                    className="cal-band"
                    style={{
                      left: `${(bandFirst / 7) * 100}%`,
                      width: `${((bandLast - bandFirst + 1) / 7) * 100}%`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                    aria-hidden="true"
                  />
                )}
              </div>
              )
            })}
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
