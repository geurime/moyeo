import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { rankSlots, endLabel } from '../ranking.js'
import { DAYS } from '../data.js'

const EASE = { duration: 0.24, ease: [0.2, 0, 0, 1] }

// 요약 한 줄 — 이 카드에서 읽어야 할 유일한 문장
function summarize(slot, total) {
  const absent = slot.statuses.filter((s) => s.status === 'absent')
  const reluctant = slot.statuses.filter((s) => s.status === 'reluctant')
  const sure = total - absent.length

  if (absent.length > 0) {
    // 불참자의 역할(선택)은 "그래서 괜찮다"의 근거 — 요약에서 바로 답한다
    const names = absent.map((s) => `${s.person.name}님${s.person.required ? '' : '(선택)'}`).join(' · ')
    return `${names} 불참 · ${sure}명 참석`
  }
  if (reluctant.length === 1) return `전원 참석 · ${reluctant[0].person.name}님만 아쉬워요`
  if (reluctant.length > 1) return `전원 참석 · ${reluctant.length}명이 아쉬워요`
  return `전원 ${total}명 참석 · 모두 괜찮아요`
}

function statusText(s) {
  if (s.status === 'absent') return '불참'
  if (s.status === 'unlikely') return `불참 예상 · ${s.avoids[0]}`
  if (s.status === 'reluctant') return `참석 · ${s.avoids[0]}`
  if (s.prefers.length > 0) return '참석 · 선호와 맞아요'
  return '참석'
}

export default function Ranking({ people, yourChips, durationMin, onReduceDuration, onConfirm }) {
  const ranked = useMemo(() => rankSlots(people, yourChips, durationMin), [people, yourChips, durationMin])
  const top3 = ranked.slice(0, 3)
  const [selected, setSelected] = useState(0)

  const hourlyCount = useMemo(
    () => (ranked.length === 0 ? rankSlots(people, yourChips, 60).length : 0),
    [ranked.length, people, yourChips]
  )

  if (ranked.length === 0) {
    return (
      <div className="product">
        <header className="screen-head">
          <h1 className="screen-title">이 길이로는 다음 주에<br />모일 수 있는 시간이 없어요</h1>
          <p className="screen-sub">필수 인원이 연속으로 비어 있는 시간이 없어서예요</p>
        </header>
        <div className="empty-card">
          {hourlyCount > 0 ? (
            <>
              <p className="empty-lead">
                회의를 <strong>1시간</strong>으로 줄이면 후보 <strong>{hourlyCount}개</strong>가 생겨요
              </p>
              <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={onReduceDuration}>
                1시간으로 줄여서 보기
              </motion.button>
            </>
          ) : (
            <p className="empty-lead">기한을 다다음 주까지 넓히거나, 선택 인원 없이 다시 잡아보세요</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">모두가 괜찮은 시간을 찾았어요</h1>
        <p className="screen-sub">5명이 모두 확인한 조건으로 골랐어요</p>
      </header>

      <div className="slot-list" role="radiogroup" aria-label="후보 시간">
        {top3.map((slot, i) => {
          const picked = selected === i
          const date = DAYS.find((d) => d.key === slot.day)?.date
          return (
            <motion.div
              key={`${slot.day}${slot.hour}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...EASE, delay: i * 0.06 }}
            >
              <button
                className={`slot ${picked ? 'is-picked' : ''}`}
                onClick={() => setSelected(i)}
                role="radio"
                aria-checked={picked}
              >
                {/* 선택 표시는 카드 테두리가 담당 — 라디오 없음. 추천은 시간과 같은 줄에 */}
                <div className="slot-when">
                  <span className="slot-date">{slot.day} {date}</span>
                  <span className="slot-clock">{slot.hour}:00–{endLabel(slot.hour, durationMin)}</span>
                  {i === 0 && <span className="slot-badge">추천</span>}
                </div>

                <p className="slot-note">{summarize(slot, people.length)}</p>

                <AnimatePresence initial={false}>
                  {picked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={EASE}
                      style={{ overflow: 'hidden' }}
                    >
                      {/* 상세 = 아바타 스트립 + 제자리 주석. 예외만 캡션이 붙는다 */}
                      <div className="mini-strip">
                        {[...slot.statuses]
                          .sort((a, b) => (b.person.required ? 1 : 0) - (a.person.required ? 1 : 0))
                          .map((s) => (
                            <div key={s.person.id} className={`mini-person is-${s.status}`}>
                              <span className="avatar">{s.person.initial}</span>
                              <span className="mini-pname">{s.person.name}</span>
                              {s.status === 'reluctant' && (
                                <span className="mini-pnote">{s.avoids[0]}</span>
                              )}
                              {s.status === 'absent' && (
                                <>
                                  {!s.person.required && <span className="mini-pnote">선택</span>}
                                  <span className="mini-pnote">{s.avoids[0] || '일정 겹침'}</span>
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          )
        })}
      </div>

      <div className="cta-dock">
        <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={() => onConfirm(top3[selected])}>
          이 시간으로 확정하기
        </motion.button>
      </div>
    </div>
  )
}
