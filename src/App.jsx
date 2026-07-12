import { useMemo, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { HOST, PEOPLE, ADJUST_OPTIONS, LEARNED_IDS } from './data.js'
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
    text: '무엇을, 얼마나, 언제까지. 기간은 캘린더에서 바로 봐요.',
  },
  attendees: {
    name: '참석자',
    who: '지민 · 주최자',
    text: '그룹으로 한 번에, 검색으로 낱낱이. 명단을 만들어요.',
  },
  roles: {
    name: '꼭 와야 하는 사람',
    who: '지민 · 주최자',
    text: '가중치를 정해요. 역할 기본값은 지난 회의에서 학습돼 있어요.',
  },
  adjust: {
    name: '서연의 확인',
    who: '서연 · 참석자',
    text: '바쁜 시간은 캘린더가, 성향은 지난 응답이 이미 알아요. 이번 주 다른 것만 확인 — 탭 한 번이면 끝.',
  },
  ranking: {
    name: '후보 선택',
    who: '지민 · 주최자',
    text: '전원의 확인 위에서 후보가 나와요. 누가 무엇을 감수하는지 근거와 함께 — 주최자는 결정만 해요.',
  },
  confirmed: {
    name: '확정',
    who: '지민 · 주최자',
    text: '초대장엔 이유가 담기고, 양보는 기록돼요. 조건은 학습되니 다음 회의는 더 쉬워져요.',
  },
}

export default function App() {
  const [stepIndex, setStepIndex] = useState(0)
  const [people, setPeople] = useState([HOST]) // 명단은 주최자부터 시작해 직접 만든다
  const [durationMin, setDurationMin] = useState(60) // 회의 길이(분) — 랭킹에 실반영
  const [chipIds, setChipIds] = useState(LEARNED_IDS) // 서연의 조건 — 학습값이 기본
  const [confirmedSlot, setConfirmedSlot] = useState(null)

  const step = STEPS[stepIndex]
  const panel = PANEL[step]

  // 서연의 이번 주 조건 — 켜진 칩 그대로
  const yourChips = useMemo(
    () => ADJUST_OPTIONS.filter((o) => chipIds.includes(o.id)),
    [chipIds]
  )

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  const reset = () => {
    setStepIndex(0)
    setPeople([HOST])
    setDurationMin(60)
    setChipIds(LEARNED_IDS)
    setConfirmedSlot(null)
  }

  // 목차로 뒤 단계에 바로 점프할 때 — 명단이 비어 있으면 시나리오 상태로 채운다
  const jumpTo = (i) => {
    if (i >= STEPS.indexOf('adjust') && people.length < 3) setPeople(PEOPLE)
    setStepIndex(i)
  }

  const toggleIn = (setter) => (id) =>
    setter((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

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
                {step === 'attendees' && (
                  <Attendees
                    people={people}
                    onAddPerson={(c) => setPeople((ps) => [...ps, withRole(c)])}
                    onAddMany={(cs) => setPeople((ps) => [...ps, ...cs.map(withRole)])}
                    onRemovePerson={(id) => setPeople((ps) => ps.filter((p) => p.id !== id))}
                    onRemoveMany={(ids) => setPeople((ps) => ps.filter((p) => !ids.includes(p.id)))}
                    onNext={next}
                  />
                )}
                {step === 'roles' && (
                  <Roles
                    people={people}
                    onTogglePerson={(id) =>
                      setPeople((ps) => ps.map((p) => (p.id === id && !p.isHost ? { ...p, required: !p.required } : p)))
                    }
                    onNext={next}
                  />
                )}
                {step === 'adjust' && (
                  <Adjust
                    durationMin={durationMin}
                    chipIds={chipIds}
                    onToggle={toggleIn(setChipIds)}
                    onNext={next}
                  />
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

// 지난 회의 역할 기억으로 추가 — lastRole이 'optional'이면 선택으로
const withRole = (c) => ({ ...c, required: c.lastRole !== 'optional' })
