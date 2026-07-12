import { useMemo, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { HOST, PEOPLE, ADJUST_OPTIONS, LEARNED_IDS } from './data.js'
import Framing from './screens/Framing.jsx'
import Create from './screens/Create.jsx'
import Attendees from './screens/Attendees.jsx'
import Roles from './screens/Roles.jsx'
import Interstitial from './screens/Interstitial.jsx'
import Adjust from './screens/Adjust.jsx'
import Ranking from './screens/Ranking.jsx'
import Confirmed from './screens/Confirmed.jsx'

const STEPS = ['framing', 'create', 'attendees', 'roles', 'sent', 'adjust', 'collected', 'ranking', 'confirmed']

// 데모 내레이션 — 화자가 바뀌는 지점을 다크 화면으로 분리한다.
const NARRATIONS = {
  sent: {
    kicker: '확인 요청',
    lines: [
      '5명에게 확인을 보냈어요.',
      '바쁜 시간은 캘린더가, 성향은 지난 응답이 이미 알고 있어요. 그래서 물어볼 건 하나뿐이에요 — 다음 주, 평소와 달라요?',
    ],
    handoff: '이번엔 확인 요청을 받은 서연의 화면이에요.',
    cta: '서연의 화면으로',
  },
  collected: {
    kicker: '후보 생성',
    lines: [
      '서연은 탭 한 번으로 끝났어요.',
      '5명 모두 확인했어요 — 이렇게 응답이 가벼우니 다 모여요. 전원의 확인 위에서 후보가 만들어졌어요.',
    ],
    handoff: '다시 주최자, 지민의 화면이에요.',
    cta: '후보 시간 보기',
  },
}

export default function App() {
  const [stepIndex, setStepIndex] = useState(0)
  const [people, setPeople] = useState([HOST]) // 명단은 주최자부터 시작해 직접 만든다
  const [durationMin, setDurationMin] = useState(60) // 회의 길이(분) — 랭킹에 실반영
  const [chipIds, setChipIds] = useState(LEARNED_IDS) // 서연의 조건 — 학습값이 기본
  const [confirmedSlot, setConfirmedSlot] = useState(null)

  const step = STEPS[stepIndex]

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

  // 도트로 뒤 단계에 바로 점프할 때 — 명단이 비어 있으면 시나리오 상태로 채운다
  const jumpTo = (i) => {
    if (i >= STEPS.indexOf('sent') && people.length < 3) setPeople(PEOPLE)
    setStepIndex(i)
  }

  // 지난 회의 역할 기억으로 추가 — lastRole이 'optional'이면 선택으로
  const withRole = (c) => ({ ...c, required: c.lastRole !== 'optional' })

  const toggleIn = (setter) => (id) =>
    setter((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const viewpoint = {
    create: '지민 — 주최자의 화면',
    attendees: '지민 — 주최자의 화면',
    roles: '지민 — 주최자의 화면',
    adjust: '서연 — 참석자의 화면',
    ranking: '지민 — 주최자의 화면',
    confirmed: '지민 — 주최자의 화면',
  }[step]

  const dark = step === 'framing' || step === 'sent' || step === 'collected'

  return (
    <MotionConfig reducedMotion="user">
      <div className="stage">
        <div className={`phone ${dark ? 'phone-dark' : ''}`}>
          <AnimatePresence initial={false}>
            {viewpoint && (
              <motion.div
                className="viewpoint"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={viewpoint}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {viewpoint}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

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
              {(step === 'sent' || step === 'collected') && (
                <Interstitial
                  narration={
                    step === 'sent'
                      ? { ...NARRATIONS.sent, lines: [`${people.length - 1}명에게 확인을 보냈어요.`, NARRATIONS.sent.lines[1]] }
                      : NARRATIONS.collected
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
                <Confirmed slot={confirmedSlot} durationMin={durationMin} onReset={reset} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="demo-rail" role="navigation" aria-label="데모 진행">
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`demo-dot ${i === stepIndex ? 'is-active' : ''} ${i < stepIndex ? 'is-done' : ''}`}
              aria-label={`${i + 1}단계로 이동`}
              onClick={() => jumpTo(i)}
            />
          ))}
          <button className="demo-reset" onClick={reset}>처음부터</button>
        </div>
      </div>
    </MotionConfig>
  )
}
