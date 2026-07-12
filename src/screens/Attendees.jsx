import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COLLEAGUES, GROUPS } from '../data.js'

const EASE = { duration: 0.24, ease: [0.2, 0, 0, 1] }

function CheckMark({ on }) {
  return (
    <span className={`row-check ${on ? 'is-checked' : ''}`} aria-hidden="true">
      {on && (
        <svg viewBox="0 0 12 12" width="11" height="11">
          <path d="M2 6.2 L4.8 9 L10 3.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

// 화면 ①: 참석자 — 명단 만들기.
// 리스트는 불변, 상태만 토글(체크). 그룹은 멤버 전원 토글. 스트립은 요약 + 빠른 제거.
export default function Attendees({ people, onAddPerson, onAddMany, onRemovePerson, onRemoveMany, onNext }) {
  const [query, setQuery] = useState('')
  const isIn = (id) => people.some((p) => p.id === id)
  const results = COLLEAGUES.filter((c) => !query || c.name.includes(query.trim()))
  const picked = people.filter((p) => !p.isHost)

  const toggle = (c) => (isIn(c.id) ? onRemovePerson(c.id) : onAddPerson(c))
  const toggleGroup = (g) => {
    const members = COLLEAGUES.filter((c) => g.memberIds.includes(c.id))
    const allIn = members.every((m) => isIn(m.id))
    if (allIn) onRemoveMany(members.map((m) => m.id))
    else onAddMany(members.filter((m) => !isIn(m.id)))
  }

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">참석자</h1>
      </header>

      <div className="search">
        <span className="search-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="16" height="16">
            <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="13.5" y1="13.5" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름으로 검색"
          aria-label="동료 검색"
        />
      </div>

      {/* 고른 사람 — 요약 스트립. 비어 있으면 접혀 있다 */}
      <AnimatePresence initial={false}>
        {picked.length > 0 && (
          <motion.div
            className="picked"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={EASE}
          >
            <div className="picked-inner">
              <AnimatePresence initial={false}>
                {picked.map((p) => (
                  <motion.button
                    key={p.id}
                    className="picked-item"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={EASE}
                    onClick={() => onRemovePerson(p.id)}
                    aria-label={`${p.name} 빼기`}
                  >
                    <span className="avatar">{p.initial}</span>
                    <span className="picked-name">{p.name}</span>
                    <span className="picked-x" aria-hidden="true">✕</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!query && (
        <>
          <div className="section-head">
            <h2 className="section-title">그룹</h2>
          </div>
          <ul className="person-list group-list">
            {GROUPS.map((g) => {
              const members = COLLEAGUES.filter((c) => g.memberIds.includes(c.id))
              const allIn = members.every((m) => isIn(m.id))
              return (
                <li key={g.id} className="person-row">
                  <button className="person-row-inner person-add-row" onClick={() => toggleGroup(g)} aria-pressed={allIn}>
                    <span className="avatar">{g.name[0]}</span>
                    <span className="person-name">
                      {g.name}
                      <span className="tag">{members.length}명</span>
                    </span>
                    <CheckMark on={allIn} />
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <div className="section-head">
        <h2 className="section-title">동료</h2>
      </div>

      <ul className="person-list">
        {results.map((c) => (
          <li key={c.id} className="person-row">
            <button className="person-row-inner person-add-row" onClick={() => { toggle(c); setQuery('') }} aria-pressed={isIn(c.id)}>
              <span className="avatar">{c.initial}</span>
              <span className="person-name">{c.name}</span>
              <CheckMark on={isIn(c.id)} />
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <p className="search-none">‘{query}’와 맞는 동료가 없어요</p>
        )}
      </ul>

      <div className="cta-dock">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="cta"
          onClick={onNext}
          disabled={people.length < 2}
        >
          {people.length < 2 ? '함께할 사람을 골라주세요' : `나 포함 ${people.length}명으로 다음`}
        </motion.button>
      </div>
    </div>
  )
}
