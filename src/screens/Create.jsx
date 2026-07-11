import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MEETING, SUGGESTED_PEOPLE } from '../data.js'

const SPRING = { type: 'spring', stiffness: 700, damping: 35 }
const EXPAND = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { type: 'spring', stiffness: 420, damping: 38 },
}

export default function Create({ people, onTogglePerson, onAddPerson, onRemovePerson, onNext }) {
  const [title, setTitle] = useState(MEETING.title)
  const [periodOpen, setPeriodOpen] = useState(false)
  const [periodHint, setPeriodHint] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const requiredCount = people.filter((p) => p.required).length
  const remaining = SUGGESTED_PEOPLE.filter((s) => !people.some((p) => p.id === s.id))

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
            <button className="seg-btn">30분</button>
            <button className="seg-btn is-on">1시간</button>
            <button className="seg-btn">90분</button>
          </div>
        </div>
        <div className="field">
          <span className="field-label">기간</span>
          <button className="field-picker" onClick={() => setPeriodOpen(!periodOpen)} aria-expanded={periodOpen}>
            <span className="field-value">{MEETING.weekLabel}</span>
            <motion.span className="picker-chev" animate={{ rotate: periodOpen ? 180 : 0 }} transition={SPRING} aria-hidden="true">⌄</motion.span>
          </button>
          <AnimatePresence initial={false}>
            {periodOpen && (
              <motion.div {...EXPAND} style={{ overflow: 'hidden' }}>
                <div className="picker-options">
                  <button className="picker-opt" onClick={() => setPeriodHint(true)}>이번 주 · 7월 7일(월) – 11일(금)</button>
                  <button className="picker-opt is-on" onClick={() => { setPeriodOpen(false); setPeriodHint(false) }}>
                    다음 주 · 7월 13일(월) – 17일(금) ✓
                  </button>
                  <button className="picker-opt" onClick={() => setPeriodHint(true)}>날짜 직접 선택</button>
                  {periodHint && <p className="picker-hint">데모는 ‘다음 주’ 시나리오로 진행돼요</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="attendees">
        <div className="section-head">
          <h2 className="section-title">참석자 {people.length}명</h2>
        </div>

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
                  <button
                    className={`toggle ${p.required ? 'is-required' : ''}`}
                    onClick={() => onTogglePerson(p.id)}
                    disabled={p.isHost}
                    aria-pressed={p.required}
                  >
                    <motion.span
                      className="toggle-ind"
                      animate={{ x: p.required ? '0%' : '100%' }}
                      transition={SPRING}
                      aria-hidden="true"
                    />
                    <span className={`toggle-opt ${p.required ? 'is-on' : ''}`}>필수</span>
                    <span className={`toggle-opt ${!p.required ? 'is-on' : ''}`}>선택</span>
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {remaining.length > 0 && (
          <div className="add-area">
            <button className="add-btn" onClick={() => setSearchOpen(!searchOpen)} aria-expanded={searchOpen}>
              + 동료 추가
            </button>
            <AnimatePresence initial={false}>
              {searchOpen && (
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
          </div>
        )}
      </section>

      <div className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onNext}>
          {people.length - 1}명에게 확인 요청 보내기
        </motion.button>
        <p className="cta-hint">답이 없어도 캘린더 기준으로 후보를 만들어요</p>
      </div>
    </div>
  )
}
