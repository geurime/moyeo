import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { rankSlots, slotReason, endLabel } from '../ranking.js'
import { DAYS } from '../data.js'

const DAY_FULL = { 월: '월요일', 화: '화요일', 수: '수요일', 목: '목요일', 금: '금요일' }

const STATUS_LABEL = {
  ok: '참석',
  reluctant: '참석 · 아쉬움',
  absent: '불참',
  'calendar-only': '참석',
}

function Shield() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
      <path
        d="M6 1 L10 2.5 V6 C10 8.5 8.2 10.3 6 11 C3.8 10.3 2 8.5 2 6 V2.5 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M4.2 6 L5.5 7.3 L7.9 4.9" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Ranking({ people, yourChips, durationMin, onReduceDuration, onConfirm }) {
  const ranked = useMemo(() => rankSlots(people, yourChips, durationMin), [people, yourChips, durationMin])
  const top3 = ranked.slice(0, 3)
  const [openIndex, setOpenIndex] = useState(0)

  // 빈 상태 대비 — 1시간이면 몇 개가 생기는지 미리 계산해 대안으로 제시
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

      <div className="slot-list">
        {top3.map((slot, i) => {
          const reason = slotReason(slot, people.length)
          const open = openIndex === i
          const date = DAYS.find((d) => d.key === slot.day)?.date
          const ledgered = slot.statuses.filter((s) => s.ledgerWeighted)
          return (
            <motion.article
              key={`${slot.day}${slot.hour}`}
              className={`slot-card ${i === 0 ? 'is-top' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: [0.2, 0, 0, 1] }}
            >
              <button className="slot-summary" onClick={() => setOpenIndex(open ? -1 : i)} aria-expanded={open}>
                <div className="slot-head">
                  <span className={`rank-pill ${i === 0 ? 'is-top' : ''}`}>
                    {i === 0 ? '1위 · 추천' : `${i + 1}위`}
                  </span>
                  <span className="slot-day">{DAY_FULL[slot.day]} {date}</span>
                </div>
                <div className="slot-time">
                  {slot.hour}:00<span className="slot-time-end">–{endLabel(slot.hour, durationMin)}</span>
                </div>
                <div className="dots-row">
                  <div className="dots">
                    {slot.statuses.map((s, j) => (
                      <motion.span
                        key={s.person.id}
                        className={`dot dot-${s.status}`}
                        title={`${s.person.name} · ${STATUS_LABEL[s.status]}`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.07 + 0.12 + j * 0.03, duration: 0.2, ease: [0.2, 0, 0, 1] }}
                      >
                        {s.person.initial}
                      </motion.span>
                    ))}
                  </div>
                  <span className={`attend-label ${slot.attendCount === people.length ? 'is-full' : ''}`}>
                    {slot.attendCount}/{people.length} 참석
                  </span>
                </div>
                <div className="reason">
                  <p className="reason-headline">{reason.headline}</p>
                  <div className="tag-row">
                    {slot.statuses.filter((s) => s.status === 'absent').map((s) => (
                      <span key={s.person.id} className="info-tag">{s.person.name} · 불참</span>
                    ))}
                    {slot.statuses.filter((s) => s.status === 'reluctant').map((s) => (
                      <span key={s.person.id} className="info-tag">{s.person.name} · {s.avoids[0]}</span>
                    ))}
                    {ledgered.map((s) => (
                      <span key={`l-${s.person.id}`} className="info-tag tag-care">
                        <Shield />
                        {s.person.name} · 양보 배려
                      </span>
                    ))}
                    {slot.statuses.every((s) => s.status === 'ok' || s.status === 'calendar-only') && (
                      <span className="info-tag tag-care">아쉬운 사람 없음</span>
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="detail">
                      <ul className="detail-list">
                        {slot.statuses.map((s) => (
                          <li key={s.person.id} className="detail-row">
                            <span className={`dot dot-sm dot-${s.status}`}>{s.person.initial}</span>
                            <span className="detail-name">
                              {s.person.name}
                              <span className="detail-role">{s.person.required ? '필수' : '선택'}</span>
                              {s.ledgerWeighted && (
                                <span className="info-tag tag-care"><Shield />양보 배려</span>
                              )}
                            </span>
                            <span className={`detail-status status-${s.status}`}>
                              {s.status === 'reluctant' ? `참석 · ${s.avoids[0]}` : STATUS_LABEL[s.status]}
                              {s.status === 'ok' && s.prefers.length > 0 && ' · 선호와 맞아요'}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <motion.button whileTap={{ scale: 0.98 }} className="cta" onClick={() => onConfirm(slot)}>
                        이 시간으로 확정하기
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          )
        })}
      </div>

      <p className="logic-note">
        <strong>순서는 이렇게 정했어요.</strong> 전원이 모일 수 있는 시간이 먼저예요.
        필수 인원이 안 되는 시간은 뺐고, 불참은 아쉬움보다 무겁게 봤어요. 그리고
        지난 회의에서 양보한 사람은 이번에 먼저 배려했어요.
      </p>
    </div>
  )
}
