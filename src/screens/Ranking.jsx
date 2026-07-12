import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { rankSlots, endLabel } from '../ranking.js'
import { DAYS } from '../data.js'

const EASE = { duration: 0.24, ease: [0.2, 0, 0, 1] }
const DAY_FULL = { 월: '월요일', 화: '화요일', 수: '수요일', 목: '목요일', 금: '금요일' }

// 요약 한 줄 — 고정 문형: [참석 현황(강조)] · [설명(그레이)]
function SummaryNote({ slot, total }) {
  const absent = slot.statuses.filter((s) => s.status === 'absent')
  const reluctant = slot.statuses.filter((s) => s.status === 'reluctant')
  const sure = total - absent.length
  const full = absent.length === 0

  const tail = []
  for (const s of absent) {
    // 역할 태그 없음 — 후보에 불참이 보인다면 그 사람은 논리상 반드시 '선택'
    // (필수 불참 시간은 애초에 탈락). 이 불변식은 화면 부제가 1회 선언한다.
    tail.push(<span key={s.person.id}>{' · '}{s.person.name}님 불참</span>)
  }
  if (reluctant.length === 1) tail.push(<span key="r"> · {reluctant[0].person.name}님이 아쉬워요</span>)
  if (reluctant.length > 1) tail.push(<span key="r"> · {reluctant.length}명이 아쉬워요</span>)
  if (tail.length === 0) tail.push(<span key="r"> · 모두 괜찮아요</span>)

  return (
    <p className="slot-note">
      <strong className={`note-head ${full ? 'is-full' : ''}`}>{full ? '전원 참석' : `${sure}명 참석`}</strong>
      {tail}
    </p>
  )
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
        <p className="screen-sub">어떤 후보든 필수는 전원 참석이에요</p>
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
                {/* 오버라인(날짜·요일 작게) + 큰 시간 — 크기 차이가 읽는 순서 */}
                <div className="slot-over">
                  <span className="slot-date">7월 {date.split('/')[1]}일 {DAY_FULL[slot.day]}</span>
                  {i === 0 && <span className="slot-badge">추천</span>}
                </div>
                <div className="slot-clock">
                  {slot.hour}:00–{endLabel(slot.hour, durationMin)}
                </div>

                <SummaryNote slot={slot} total={people.length} />

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
                                <span className="mini-pnote">{s.avoids[0] || '일정 겹침'}</span>
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
