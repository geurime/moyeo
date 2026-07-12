import { AnimatePresence, motion } from 'framer-motion'

const EASE = { duration: 0.24, ease: [0.2, 0, 0, 1] }

// 화면 ②: 꼭 와야 하는 사람은? — 가중치 결정.
// 역할도 지난 회의에서 학습돼 미리 채워져 있다. 확인만 하면 끝.
export default function Roles({ people, rolesRemembered, onTogglePerson, onNext }) {
  const optionalCount = people.filter((p) => !p.required).length

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">꼭 와야 하는 사람은<br />누구예요?</h1>
        {rolesRemembered && (
          <p className="screen-sub">지난 회의와 같은 구성으로 채워뒀어요</p>
        )}
      </header>

      <ul className="person-list">
        {people.map((p) => (
          <li key={p.id} className="person-row">
            <div className="person-row-inner">
              <span className={`avatar ${p.required ? 'avatar-required' : ''}`}>{p.initial}</span>
              <span className="person-name">
                {p.name}
                {p.isHost && <span className="tag">나 · 주최</span>}
              </span>
              <motion.button
                whileTap={p.isHost ? undefined : { scale: 0.92 }}
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
          </li>
        ))}
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
