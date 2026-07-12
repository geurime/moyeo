import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COLLEAGUES, GROUPS } from '../data.js'

const EASE = { duration: 0.24, ease: [0.2, 0, 0, 1] }

// 화면 ①: 참석자 — 명단 만들기.
// 그룹(팀 단위) 우선, 개인은 리스트에서 탭, 롱테일은 검색.
export default function Attendees({ people, onAddPerson, onAddMany, onRemovePerson, onNext }) {
  const [query, setQuery] = useState('')
  const remaining = COLLEAGUES.filter((c) => !people.some((p) => p.id === c.id))
  const results = remaining.filter((c) => !query || c.name.includes(query.trim()))
  const groups = GROUPS.map((g) => ({
    ...g,
    left: remaining.filter((c) => g.memberIds.includes(c.id)),
  })).filter((g) => g.left.length > 0)

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

      {/* 추가한 사람 — 아바타 스트립 (나는 제외: 고른 대상이 아니니까) */}
      <div className="picked">
        <AnimatePresence initial={false}>
          {people.filter((p) => !p.isHost).map((p) => (
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

      {!query && groups.length > 0 && (
        <>
          <div className="section-head">
            <h2 className="section-title">그룹</h2>
          </div>
          <ul className="person-list group-list">
            <AnimatePresence initial={false}>
              {groups.map((g) => (
                <motion.li
                  key={g.id}
                  className="person-row"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={EASE}
                >
                  <button className="person-row-inner person-add-row" onClick={() => onAddMany(g.left)}>
                    <span className="avatar avatar-group">{g.name[0]}</span>
                    <span className="person-name">
                      {g.name}
                      <span className="tag">{g.left.length}명</span>
                    </span>
                    <span className="add-mark" aria-hidden="true">＋</span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
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
          {people.length < 2 ? '함께할 사람을 골라주세요' : `나 포함 ${people.length}명으로 다음`}
        </motion.button>
      </div>
    </div>
  )
}
