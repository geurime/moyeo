import { motion } from 'framer-motion'
import { BUSY, DAYS, MEETING, ADJUST_OPTIONS } from '../data.js'
import { formatMin } from '../ranking.js'

const myBusy = BUSY.seoyeon
const DAY_START = 10
const DAY_END = 17

// 화면: 서연의 조정 — 캘린더가 모르는 조건을 확인·조정한다.
// 분류는 하나(요일 기피 → 시간대 기피 → 시간대 선호), 학습된 값은 미리 체크되어 있다.
export default function Adjust({ durationMin, chipIds, onToggle, onNext }) {
  const dayOptions = ADJUST_OPTIONS.filter((o) => o.group === 'day')
  const timeOptions = ADJUST_OPTIONS.filter((o) => o.group === 'time')
  const preferOptions = ADJUST_OPTIONS.filter((o) => o.group === 'prefer')


  const chip = (o) => (
    <motion.button
      key={o.id}
      whileTap={{ scale: 0.94 }}
      className={`chip ${chipIds.includes(o.id) ? 'is-on' : ''}`}
      onClick={() => onToggle(o.id)}
      aria-pressed={chipIds.includes(o.id)}
    >
      {o.label}
    </motion.button>
  )

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">일정을 확인해주세요</h1>
        <p className="screen-sub">지민님의 {MEETING.title} · 다음 주 · {formatMin(durationMin)}</p>
      </header>

      {/* 캘린더 자동 반영 — 텍스트 목록 대신 미니 주간 타임라인.
          제목 없이 바쁨 블록만: 시스템이 읽는 것도 free/busy뿐이다. */}
      <div className="autocal" role="img" aria-label={`캘린더 일정 ${myBusy.length}건 자동 반영`}>
        <div className="autocal-head">
          <span className="auto-check" aria-hidden="true">✓</span>
          <span className="autocal-title">캘린더 일정 {myBusy.length}건이 자동으로 반영됐어요</span>
        </div>
        <div className="autocal-grid">
          {DAYS.map(({ key: day }, di) => (
            <div className="autocal-col" key={day}>
              <div className="autocal-track">
                {myBusy.filter((b) => b.day === day).map((b) => (
                  <motion.span
                    key={b.start}
                    className="autocal-block"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: 0.15 + di * 0.05, duration: 0.3, ease: [0.2, 0, 0, 1] }}
                    style={{
                      top: `${((b.start - DAY_START) / (DAY_END - DAY_START)) * 100}%`,
                      height: `${((b.end - b.start) / (DAY_END - DAY_START)) * 100}%`,
                    }}
                  />
                ))}
              </div>
              <span className="autocal-day">{day}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="chips-section">
        <div className="section-head">
          <h2 className="section-title">피하고 싶은 요일</h2>
        </div>
        <div className="chips">{dayOptions.map(chip)}</div>
      </section>

      <section className="chips-section">
        <div className="section-head">
          <h2 className="section-title">피하고 싶은 시간대</h2>
        </div>
        <div className="chips">{timeOptions.map(chip)}</div>
      </section>

      <section className="chips-section">
        <div className="section-head">
          <h2 className="section-title">이런 시간이 좋아요</h2>
        </div>
        <div className="chips">{preferOptions.map(chip)}</div>
      </section>

      <div className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onNext}>
          이대로 좋아요
        </motion.button>
      </div>
    </div>
  )
}
