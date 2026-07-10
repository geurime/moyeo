import { useMemo, useState } from 'react'
import { rankSlots, slotReason } from '../ranking.js'
import { DAYS } from '../data.js'

const DAY_FULL = { 월: '월요일', 화: '화요일', 수: '수요일', 목: '목요일', 금: '금요일' }

const STATUS_LABEL = {
  ok: '참석',
  reluctant: '참석 · 아쉬움',
  absent: '불참',
  'calendar-only': '참석 · 캘린더 기준',
}

export default function Ranking({ people, yourChips, onConfirm }) {
  const ranked = useMemo(() => rankSlots(people, yourChips), [people, yourChips])
  const top3 = ranked.slice(0, 3)
  const [openIndex, setOpenIndex] = useState(0)

  const invitees = people.filter((p) => !p.isHost)
  const respondedCount = invitees.filter((p) => p.responded).length
  const silent = invitees.filter((p) => !p.responded)

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
          return (
            <article key={`${slot.day}${slot.hour}`} className={`slot-card ${i === 0 ? 'is-top' : ''}`}>
              <button className="slot-summary" onClick={() => setOpenIndex(open ? -1 : i)} aria-expanded={open}>
                <div className="slot-head">
                  <span className={`rank-pill ${i === 0 ? 'is-top' : ''}`}>
                    {i === 0 ? '1위 · 추천' : `${i + 1}위`}
                  </span>
                  <span className="slot-day">{DAY_FULL[slot.day]} {date}</span>
                </div>
                <div className="slot-time">
                  {slot.hour}:00<span className="slot-time-end">–{slot.hour + 1}:00</span>
                </div>
                <div className="dots-row">
                  <div className="dots">
                    {slot.statuses.map((s) => (
                      <span key={s.person.id} className={`dot dot-${s.status}`} title={`${s.person.name} · ${STATUS_LABEL[s.status]}`}>
                        {s.person.initial}
                      </span>
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
                </div>
              </button>

              {open && (
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
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button className="cta" onClick={() => onConfirm(slot)}>
                    이 시간으로 확정하기
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>

      <p className="logic-note">
        <strong>순서는 이렇게 정했어요.</strong> 필수 인원이 안 되는 시간은 제외하고,
        불참(−40) · 비선호(−12) · 선호(+6)로 점수를 매겼어요. 같은 점수면 이른
        날짜가 먼저예요.
      </p>
    </div>
  )
}
