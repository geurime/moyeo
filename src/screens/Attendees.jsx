import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COLLEAGUES, LAST_MEETING_IDS } from '../data.js'

const EASE = { duration: 0.24, ease: [0.2, 0, 0, 1] }

// 화면 ①: 누구와 모여요? — 명단 만들기.
// 브라우즈(동료 리스트) 우선, 검색은 롱테일. 지난 멤버는 벌크 칩 한 번에.
export default function Attendees({ people, onAddPerson, onAddMany, onRemovePerson, onNext }) {
  const [query, setQuery] = useState('')
  const remaining = COLLEAGUES.filter((c) => !people.some((p) => p.id === c.id))
  const results = remaining.filter((c) => !query || c.name.includes(query.trim()))
  const lastMembersLeft = remaining.filter((c) => LAST_MEETING_IDS.includes(c.id))

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">누구와 모여요?</h1>
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

      {/* 추가된 사람 — 아바타 스트립 */}
      <div className="picked">
        <AnimatePresence initial={false}>
          {people.map((p) => (
            <motion.button
              key={p.id}
              className="picked-item"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={EASE}
              onClick={() => !p.isHost && onRemovePerson(p.id)}
              disabled={p.isHost}
              aria-label={p.isHost ? `${p.name} (주최자)` : `${p.name} 빼기`}
            >
              <span className={`avatar ${p.isHost ? 'avatar-required' : ''}`}>{p.initial}</span>
              <span className="picked-name">{p.isHost ? '나' : p.name}</span>
              {!p.isHost && <span className="picked-x" aria-hidden="true">✕</span>}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {!query && lastMembersLeft.length > 1 && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="bulk-chip"
          onClick={() => onAddMany(lastMembersLeft)}
        >
          <span className="bulk-icon" aria-hidden="true">↺</span>
          지난 킥오프 멤버 {lastMembersLeft.length}명 한 번에 추가
        </motion.button>
      )}

      <div className="section-head">
        <h2 className="section-title">동료</h2>
      </div>

      <ul className="person-list">
        <AnimatePresence initial={false}>
          {results.map((c) => (
            <motion.li
              key={c.id}
              className="person-row"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={EASE}
            >
              <button className="person-row-inner person-add-row" onClick={() => { onAddPerson(c); setQuery('') }}>
                <span className="avatar">{c.initial}</span>
                <span className="person-name">{c.name}</span>
                <span className="add-mark" aria-hidden="true">＋</span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {results.length === 0 && (
          <p className="search-none">{query ? `‘${query}’와 맞는 동료가 없어요` : '모두 추가했어요'}</p>
        )}
      </ul>

      <div className="cta-dock">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="cta"
          onClick={onNext}
          disabled={people.length < 2}
        >
          {people.length < 2 ? '함께할 사람을 골라주세요' : `${people.length}명으로 다음`}
        </motion.button>
      </div>
    </div>
  )
}
