import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PEOPLE } from '../data.js'

const EASE = { duration: 0.2, ease: [0.2, 0, 0, 1] }

// 화면 ②: 빠져도 괜찮은 사람 거르기 — 회의는 다 오면 좋으니 기본은 전원 필수.
// 역할은 회의 주제의 함수라 학습하지 않는다. 나는 판단 대상이 아니라 명단에서 제외.
// 상태는 로컬: 연출(하은→지연 순차 강등)과 조작 모두 화면 안의 일.
export default function Roles({ onNext }) {
  const [people, setPeople] = useState(() => PEOPLE.map((p) => ({ ...p, required: true })))
  const onTogglePerson = (id) =>
    setPeople((ps) => ps.map((p) => (p.id === id && !p.isHost ? { ...p, required: !p.required } : p)))

  // 진입 연출 — 지민이 하은, 지연을 차례로 '선택'으로 내리는 장면
  useEffect(() => {
    const demote = (id) => () =>
      setPeople((ps) => ps.map((p) => (p.id === id ? { ...p, required: false } : p)))
    const ts = [setTimeout(demote('haeun'), 800), setTimeout(demote('jiyeon'), 1250)]
    return () => ts.forEach(clearTimeout)
  }, [])

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">빠져도 괜찮은 사람이 있나요?</h1>
        <p className="screen-sub">모두 참석이 기본이에요</p>
      </header>

      <ul className="person-list">
        {people.filter((p) => !p.isHost).map((p) => (
          <li key={p.id} className="person-row">
            <div className="person-row-inner">
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
                aria-label={`${p.name} ${p.required ? '필수' : '선택'} 참석 — 눌러서 전환`}
              >
                <motion.span
                  className="toggle-ind"
                  animate={{ x: p.required ? '0%' : '100%' }}
                  transition={EASE}
                  aria-hidden="true"
                />
                <span className={`toggle-opt ${p.required ? 'is-on' : ''}`}>필수</span>
                <span className={`toggle-opt ${!p.required ? 'is-on' : ''}`}>선택</span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onNext}>
          확인 요청 보내기
        </motion.button>
      </div>
    </div>
  )
}
