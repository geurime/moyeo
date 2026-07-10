import { useMemo, useState } from 'react'
import { PEOPLE, YOUR_CHIP_OPTIONS } from './data.js'
import Framing from './screens/Framing.jsx'
import Create from './screens/Create.jsx'
import Interstitial from './screens/Interstitial.jsx'
import Respond from './screens/Respond.jsx'
import Ranking from './screens/Ranking.jsx'
import Confirmed from './screens/Confirmed.jsx'

const STEPS = ['framing', 'create', 'sent', 'respond', 'collected', 'ranking', 'confirmed']

// 데모 내레이션 — 화자가 바뀌는 지점을 다크 화면으로 분리한다.
const NARRATIONS = {
  sent: {
    kicker: '요청 완료',
    lines: [
      '5명에게 링크를 보냈어요.',
      '바쁜 시간은 사내 캘린더에서 자동으로 가져와요. 그래서 각자는 캘린더가 모르는 것만 답하면 돼요 — 10초면 충분해요.',
    ],
    handoff: '이번엔 응답자, 서연의 화면이에요.',
    cta: '서연의 화면으로',
  },
  collected: {
    kicker: '응답 수집',
    lines: [
      '서연까지 4명이 답했어요.',
      '준호는 아직 안 봤지만 괜찮아요. 준호가 언제 바쁜지는 캘린더가 이미 알고 있으니까, 기다리지 않고 후보를 만들 수 있어요.',
    ],
    handoff: '다시 주최자, 지민의 화면이에요.',
    cta: '후보 시간 보기',
  },
}

export default function App() {
  const [stepIndex, setStepIndex] = useState(0)
  const [people, setPeople] = useState(PEOPLE)
  const [yourChipIds, setYourChipIds] = useState([])
  const [confirmedSlot, setConfirmedSlot] = useState(null)

  const step = STEPS[stepIndex]
  const yourChips = useMemo(
    () => YOUR_CHIP_OPTIONS.filter((c) => yourChipIds.includes(c.id)),
    [yourChipIds]
  )

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  const reset = () => {
    setStepIndex(0)
    setPeople(PEOPLE)
    setYourChipIds([])
    setConfirmedSlot(null)
  }

  const viewpoint = {
    create: '지민 — 주최자의 화면',
    respond: '서연 — 응답자의 화면',
    ranking: '지민 — 주최자의 화면',
    confirmed: '지민 — 주최자의 화면',
  }[step]

  const dark = step === 'framing' || step === 'sent' || step === 'collected'

  return (
    <div className="stage">
      <div className={`phone ${dark ? 'phone-dark' : ''}`}>
        {viewpoint && <div className="viewpoint">{viewpoint}</div>}

        <div className="screen" key={step}>
          {step === 'framing' && <Framing onNext={next} />}
          {step === 'create' && (
            <Create people={people} onTogglePerson={(id) =>
              setPeople((ps) => ps.map((p) => (p.id === id && !p.isHost ? { ...p, required: !p.required } : p)))
            } onNext={next} />
          )}
          {(step === 'sent' || step === 'collected') && (
            <Interstitial narration={NARRATIONS[step]} onNext={next} />
          )}
          {step === 'respond' && (
            <Respond
              selected={yourChipIds}
              onToggleChip={(id) =>
                setYourChipIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
              }
              onNext={next}
            />
          )}
          {step === 'ranking' && (
            <Ranking people={people} yourChips={yourChips}
              onConfirm={(slot) => { setConfirmedSlot(slot); next() }} />
          )}
          {step === 'confirmed' && <Confirmed slot={confirmedSlot} onReset={reset} />}
        </div>
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
  )
}
