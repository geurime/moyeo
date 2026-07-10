import { useState } from 'react'
import { MEETING, SUGGESTED_PEOPLE } from '../data.js'

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
        <p className="screen-sub">조건을 알려주면, 모두가 괜찮은 시간을 찾아드려요</p>
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
            <span className={`picker-chev ${periodOpen ? 'is-open' : ''}`} aria-hidden="true">⌄</span>
          </button>
          {periodOpen && (
            <div className="picker-options">
              <button className="picker-opt" onClick={() => setPeriodHint(true)}>이번 주 · 7월 7일(월) – 11일(금)</button>
              <button className="picker-opt is-on" onClick={() => { setPeriodOpen(false); setPeriodHint(false) }}>
                다음 주 · 7월 13일(월) – 17일(금) ✓
              </button>
              <button className="picker-opt" onClick={() => setPeriodHint(true)}>날짜 직접 선택</button>
              {periodHint && <p className="picker-hint">데모는 ‘다음 주’ 시나리오로 진행돼요</p>}
            </div>
          )}
        </div>
      </div>

      <section className="attendees">
        <div className="section-head">
          <h2 className="section-title">참석자 {people.length}명</h2>
          <p className="section-sub">꼭 와야 하는 사람에게 ‘필수’를 켜주세요 — 시간을 고를 때 기준이 돼요</p>
        </div>

        <ul className="person-list">
          {people.map((p) => (
            <li key={p.id} className="person-row">
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
                <span className="toggle-opt">필수</span>
                <span className="toggle-opt">선택</span>
              </button>
            </li>
          ))}
        </ul>

        {remaining.length > 0 && (
          <div className="add-area">
            <button className="add-btn" onClick={() => setSearchOpen(!searchOpen)} aria-expanded={searchOpen}>
              + 동료 추가
            </button>
            {searchOpen && (
              <ul className="suggest-list">
                {remaining.map((s) => (
                  <li key={s.id} className="suggest-row">
                    <span className="avatar">{s.initial}</span>
                    <span className="person-name">{s.name}</span>
                    <button className="suggest-add" onClick={() => onAddPerson(s)}>추가</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <div className="cta-dock">
        <button className="cta" onClick={onNext}>{people.length - 1}명에게 확인 요청 보내기</button>
        <p className="cta-hint">
          확인이 모이는 대로 후보를 만들어요 · 답이 없어도 캘린더 기준으로 반영돼요
        </p>
      </div>
    </div>
  )
}
