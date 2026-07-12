import { useMemo, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { PEOPLE, YOUR_PROFILE, EXCEPTION_OPTIONS } from './data.js'
import Framing from './screens/Framing.jsx'
import Create from './screens/Create.jsx'
import Attendees from './screens/Attendees.jsx'
import Interstitial from './screens/Interstitial.jsx'
import Adjust from './screens/Adjust.jsx'
import Ranking from './screens/Ranking.jsx'
import Confirmed from './screens/Confirmed.jsx'

const STEPS = ['framing', 'create', 'attendees', 'sent', 'adjust', 'collected', 'ranking', 'confirmed']

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
      '확인이 모이면서 후보가 만들어졌어요. 준호는 아직 안 봤지만 캘린더·지난 응답 기준으로 반영돼 있어서, 미확인이 결정을 막지 않아요.',
    ],
    handoff: '다시 주최자, 지민의 화면이에요.',
    cta: '후보 시간 보기',
  },
}

export default function App() {
  const [stepIndex, setStepIndex] = useState(0)
  const [people, setPeople] = useState(PEOPLE)
  const [profileOff, setProfileOff] = useState([]) // 이번 주만 끈 프로필 항목
  const [exceptions, setExceptions] = useState([]) // 이번 주만 추가한 예외
  const [confirmedSlot, setConfirmedSlot] = useState(null)

  const step = STEPS[stepIndex]

  // 서연의 이번 주 조건 = 프로필(안 끈 것) + 이번 주 예외
  const yourChips = useMemo(() => [
    ...YOUR_PROFILE.filter((c) => !profileOff.includes(c.id)),
    ...EXCEPTION_OPTIONS
      .filter((o) => exceptions.includes(o.id))
      .map((o) => ({ kind: 'avoid', short: `${o.full} · 이번 주만`, match: o.match })),
  ], [profileOff, exceptions])

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  const reset = () => {
    setStepIndex(0)
    setPeople(PEOPLE)
    setProfileOff([])
    setExceptions([])
    setConfirmedSlot(null)
  }

  const toggleIn = (setter) => (id) =>
    setter((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const viewpoint = {
    create: '지민 — 주최자의 화면',
    attendees: '지민 — 주최자의 화면',
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
              {step === 'create' && <Create onNext={next} />}
              {step === 'attendees' && (
                <Attendees
                  people={people}
                  onTogglePerson={(id) =>
                    setPeople((ps) => ps.map((p) => (p.id === id && !p.isHost ? { ...p, required: !p.required } : p)))
                  }
                  onAddPerson={(s) => setPeople((ps) => [...ps, { ...s, isAdded: true }])}
                  onRemovePerson={(id) => setPeople((ps) => ps.filter((p) => p.id !== id))}
                  onNext={next}
                />
              )}
              {(step === 'sent' || step === 'collected') && (
                <Interstitial narration={NARRATIONS[step]} onNext={next} />
              )}
              {step === 'adjust' && (
                <Adjust
                  profileOff={profileOff}
                  exceptions={exceptions}
                  onToggleProfile={toggleIn(setProfileOff)}
                  onToggleException={toggleIn(setExceptions)}
                  onNext={next}
                />
              )}
              {step === 'ranking' && (
                <Ranking people={people} yourChips={yourChips}
                  onConfirm={(slot) => { setConfirmedSlot(slot); next() }} />
              )}
              {step === 'confirmed' && <Confirmed slot={confirmedSlot} onReset={reset} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="demo-rail" role="navigation" aria-label="데모 진행">
          {STEPS.map((s, i) => (
            <button
              key={s}
              className={`demo-dot ${i === stepIndex ? 'is-active' : ''} ${i < stepIndex ? 'is-done' : ''}`}
              aria-label={`${i + 1}단계로 이동`}
              onClick={() => setStepIndex(i)}
            />
          ))}
          <button className="demo-reset" onClick={reset}>처음부터</button>
        </div>
      </div>
    </MotionConfig>
  )
}
