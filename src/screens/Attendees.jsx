import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SUGGESTED_PEOPLE } from '../data.js'

const SPRING = { type: 'spring', stiffness: 700, damping: 35 }
const EXPAND = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { type: 'spring', stiffness: 420, damping: 38 },
}

export default function Attendees({ people, onTogglePerson, onAddPerson, onRemovePerson, onNext }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const remaining = SUGGESTED_PEOPLE.filter((s) => !people.some((p) => p.id === s.id))
  const optionalCount = people.filter((p) => !p.required).length

  return (
    <div className="product">
      <header className="screen-head section-head-row">
        <div>
          <h1 className="screen-title">누구와 모여요?</h1>
          <p className="screen-sub">빠져도 되는 사람만 ‘선택’으로 바꿔주세요</p>
        </div>
        {remaining.length > 0 && (
          <button className="head-add" onClick={() => setSearchOpen(!searchOpen)} aria-expanded={searchOpen}>
            + 추가
          </button>
        )}
      </header>

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

      <div className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onNext}>
          {people.length - 1}명에게 확인 요청 보내기
        </motion.button>
        {optionalCount > 0 && (
          <p className="cta-hint">필수 {people.length - optionalCount}명 · 선택 {optionalCount}명</p>
        )}
      </div>
    </div>
  )
}
