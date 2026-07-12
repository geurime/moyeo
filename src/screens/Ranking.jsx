import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { rankSlots, slotReason, endLabel } from '../ranking.js'
import { DAYS } from '../data.js'

const DAY_FULL = { 월: '월요일', 화: '화요일', 수: '수요일', 목: '목요일', 금: '금요일' }

const STATUS_LABEL = {
  ok: '참석',
  reluctant: '참석 · 아쉬움',
  absent: '불참',
  'calendar-only': '참석 · 캘린더 기준',
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

  const invitees = people.filter((p) => !p.isHost)
  const respondedCount = invitees.filter((p) => p.responded).length
  const silent = invitees.filter((p) => !p.responded)

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
        <p className="screen-sub">필수 인원이 안 되는 시간은 이미 걸러냈어요</p>
      </header>

      <div className="badge-row">
        <span className="badge">확인 {respondedCount}/{invitees.length}</span>
        {silent.length > 0 && (
          <span className="badge-note">
            미확인 {silent.map((p) => p.name).join(', ')}님은 캘린더·지난 응답 기준으로 반영했어요
          </span>
        )}
      </div>

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
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 320, damping: 30 }}
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
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.08 + 0.12 + j * 0.035, type: 'spring', stiffness: 520, damping: 26 }}
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
                  {reason.tradeoffs.map((t, j) => (
                    <p key={j} className={`tradeoff tradeoff-${t.kind}`}>{t.text}</p>
                  ))}
                  {ledgered.map((s) => (
                    <p key={s.person.id} className="tradeoff tradeoff-ledger">
                      {s.person.name}님은 {s.person.concessionNote} — 이번엔 더 무겁게 반영했어요
                    </p>
                  ))}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 38 }}
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
                            </span>
                            <span className={`detail-status status-${s.status}`}>
                              {s.status === 'reluctant' ? `참석 · ${s.avoids[0]}` : STATUS_LABEL[s.status]}
                              {s.status === 'ok' && s.prefers.length > 0 && ' · 선호와 맞아요'}
                              {s.ledgerWeighted && ' · 양보 기록 반영'}
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
