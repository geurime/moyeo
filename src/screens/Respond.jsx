import { BUSY, MEETING, YOUR_CHIP_OPTIONS } from '../data.js'

const myBusy = BUSY.seoyeon

export default function Respond({ selected, onToggleChip, onNext }) {
  return (
    <div className="product">
      <header className="screen-head">
        <h1 className="screen-title">지민님이 회의 시간을 찾고 있어요</h1>
        <p className="screen-sub">{MEETING.title} · 1시간 · {MEETING.weekLabel}</p>
      </header>

      <div className="auto-card">
        <div className="auto-head">
          <span className="auto-check" aria-hidden="true">✓</span>
          <span className="auto-title">캘린더 일정 {myBusy.length}건이 자동으로 반영됐어요</span>
        </div>
        <ul className="busy-list">
          {myBusy.map((b) => (
            <li key={`${b.day}${b.start}`} className="busy-item">
              <span className="busy-when">{b.day} {b.start}:00–{b.end}:00</span>
              <span className="busy-title">{b.title}</span>
            </li>
          ))}
        </ul>
        <p className="auto-note">바쁜 시간은 입력할 필요 없어요. 캘린더에 없는 사정만 알려주세요.</p>
      </div>

      <section className="chips-section">
        <div className="section-head">
          <h2 className="section-title">캘린더가 모르는 것</h2>
          <p className="section-sub">해당하는 게 있으면 눌러주세요 — 없으면 그냥 보내도 돼요</p>
        </div>
        <div className="chips">
          {YOUR_CHIP_OPTIONS.map((c) => {
            const on = selected.includes(c.id)
            return (
              <button
                key={c.id}
                className={`chip ${on ? 'is-on' : ''} ${c.kind === 'prefer' ? 'chip-prefer' : ''}`}
                onClick={() => onToggleChip(c.id)}
                aria-pressed={on}
              >
                {on && <span className="chip-check" aria-hidden="true">✓</span>}
                {c.label}
              </button>
            )
          })}
        </div>
      </section>

      <div className="cta-dock">
        <button className="cta" onClick={onNext}>
          {selected.length > 0 ? `이대로 보내기 · ${selected.length}개 선택` : '이대로 보내기'}
        </button>
        <p className="cta-hint">여기까지 10초 — 그리드를 칠하지 않아도 돼요</p>
      </div>
    </div>
  )
}
