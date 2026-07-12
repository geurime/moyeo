import { motion } from 'framer-motion'

const EASE = { duration: 0.2, ease: [0.2, 0, 0, 1] }

// 화면 ②: 꼭 와야 하는 사람은? — 가중치 결정.
// 역할 기본값은 사람별로 학습돼 미리 채워져 있다. 나는 판단 대상이 아니라 명단에서 제외.
export default function Roles({ people, onTogglePerson, onNext }) {
  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">꼭 와야 하는 사람은<br />누구예요?</h1>
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
