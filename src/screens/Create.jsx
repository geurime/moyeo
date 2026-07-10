import { useState } from 'react'
import { MEETING } from '../data.js'

export default function Create({ people, onTogglePerson, onNext }) {
  const [title, setTitle] = useState(MEETING.title)
  const requiredCount = people.filter((p) => p.required).length

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
        <div className="field-row">
          <div className="field">
            <span className="field-label">길이</span>
            <div className="seg" role="group" aria-label="회의 길이">
              <button className="seg-btn">30분</button>
              <button className="seg-btn is-on">1시간</button>
              <button className="seg-btn">90분</button>
            </div>
          </div>
        </div>
        <div className="field">
          <span className="field-label">기간</span>
          <span className="field-value">{MEETING.weekLabel}</span>
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
      </section>

      <div className="cta-dock">
        <button className="cta" onClick={onNext}>
          {people.length - 1}명에게 요청 보내기
        </button>
        <p className="cta-hint">필수 {requiredCount}명 · 바쁜 시간은 사내 캘린더에서 자동으로 가져와요</p>
      </div>
    </div>
  )
}
