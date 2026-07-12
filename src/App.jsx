import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { PEOPLE, YOUR_PROFILE } from './data.js'
import Framing from './screens/Framing.jsx'
import Create from './screens/Create.jsx'
import Attendees from './screens/Attendees.jsx'
import Roles from './screens/Roles.jsx'
import Adjust from './screens/Adjust.jsx'
import Ranking from './screens/Ranking.jsx'
import Confirmed from './screens/Confirmed.jsx'

const STEPS = ['framing', 'create', 'attendees', 'roles', 'adjust', 'ranking', 'confirmed']

// 좌측 패널 — 설명은 제품 밖에서. 단계당 1~2문장만.
const PANEL = {
  framing: {
    name: '인트로',
    who: null,
    text: '같은 회사 6명이 다음 주까지 모여야 해요. 조건은 제각각 — 캘린더는 빈 시간을 알지만, 괜찮은 시간은 모르죠.',
  },
  create: {
    name: '새 일정',
    who: '지민 · 주최자',
    text: '제목과 소요 시간을 정하고, 날짜는 캘린더에서 바로 선택해요.',
  },
  attendees: {
    name: '참석자',
    who: '지민 · 주최자',
    text: '프로덕트팀 6명이 모이는 회의예요. 명단은 그룹과 검색으로 바꿀 수 있어요.',
  },
  roles: {
    name: '빠져도 되는 사람',
    who: '지민 · 주최자',
    text: '빠져도 되는 사람만 선택으로 바꿔요. 이번엔 하은·지연님이에요.',
  },
  adjust: {
    name: '서연의 확인',
    who: '서연 · 참석자',
    text: '일정은 사내 캘린더 연동, 성향은 지난 응답에서 가져와요. 이번에 다른 것만 조정하면 끝이에요.',
  },
  ranking: {
    name: '후보 선택',
    who: '지민 · 주최자',
    text: '전원의 확인 위에서 후보가 나와요. 누가 무엇을 감수하는지 근거와 함께 — 주최자는 결정만 해요.',
  },
  confirmed: {
    name: '확정',
    who: '지민 · 주최자',
    text: '모두가 이 요약을 받아요. 양보는 기록돼 다음 일정에서 먼저 배려되고, 조건은 학습돼 갈수록 쉬워져요.',
  },
}

export default function App() {
  const [stepIndex, setStepIndex] = useState(0)
  const [durationMin, setDurationMin] = useState(60) // 회의 길이(분) — 랭킹에 실반영
  const [confirmedSlot, setConfirmedSlot] = useState(null)

  const step = STEPS[stepIndex]
  const panel = PANEL[step]

  // 진행 결과는 항상 시나리오 고정값 — 각 화면의 연출·조작은 그 화면의 로컬 상태.
  // 어떤 경로로 눌러도 기본 경로의 후보·확정은 동일하다.
  const people = PEOPLE
  const yourChips = YOUR_PROFILE

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  const reset = () => {
    setStepIndex(0)
    setDurationMin(60)
    setConfirmedSlot(null)
  }
  const jumpTo = (i) => setStepIndex(i)

  return (
    <MotionConfig reducedMotion="user">
      <div className="stage">
        {/* 좌측 패널 — 내레이션과 목차. 제품(폰)은 100% 제품으로 */}
        <aside className="panel">
          <div className="brand brand-ink">모여<span className="brand-dot" aria-hidden="true" /></div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="panel-body"
            >
              {panel.who && <p className="panel-who">{panel.who}</p>}
              <p className="panel-text">{panel.text}</p>
            </motion.div>
          </AnimatePresence>

          <nav className="panel-toc" aria-label="데모 단계">
            {STEPS.map((s, i) => (
              <button
                key={s}
                className={`toc-item ${i === stepIndex ? 'is-now' : ''} ${i < stepIndex ? 'is-done' : ''}`}
                onClick={() => jumpTo(i)}
              >
                {PANEL[s].name}
              </button>
            ))}
          </nav>

          <button className="panel-reset" onClick={reset}>처음부터</button>
        </aside>

        <div className="phone-col">
          <div className={`phone ${step === 'framing' ? 'phone-dark' : ''}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                className="screen"
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
              >
                {step === 'framing' && <Framing onNext={next} />}
                {step === 'create' && (
                  <Create durationMin={durationMin} onChangeDuration={setDurationMin} onNext={next} />
                )}
                {step === 'attendees' && <Attendees onNext={next} />}
                {step === 'roles' && <Roles onNext={next} />}
                {step === 'adjust' && (
                  <Adjust durationMin={durationMin} onNext={next} />
                )}
                {step === 'ranking' && (
                  <Ranking people={people} yourChips={yourChips} durationMin={durationMin}
                    onReduceDuration={() => setDurationMin(60)}
                    onConfirm={(slot) => { setConfirmedSlot(slot); next() }} />
                )}
                {step === 'confirmed' && (
                  <Confirmed slot={confirmedSlot} yourChips={yourChips} durationMin={durationMin} onReset={reset} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="mobile-reset" onClick={reset}>처음부터</button>
        </div>
      </div>
    </MotionConfig>
  )
}
