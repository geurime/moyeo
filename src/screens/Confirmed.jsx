import { MEETING, DAYS } from '../data.js'

const DAY_FULL = { 월: '월요일', 화: '화요일', 수: '수요일', 목: '목요일', 금: '금요일' }

export default function Confirmed({ slot, onReset }) {
  if (!slot) return null
  const date = DAYS.find((d) => d.key === slot.day)?.date
  const when = `${DAY_FULL[slot.day]} ${date} · ${slot.hour}:00–${slot.hour + 1}:00`

  const reluctant = slot.statuses.filter((s) => s.status === 'reluctant')
  const absent = slot.statuses.filter((s) => s.status === 'absent')
  const isFull = slot.attendCount === slot.statuses.length

  return (
    <div className="product">
      <div className="confirm-hero">
        <svg className="check" viewBox="0 0 64 64" aria-hidden="true">
          <circle className="check-circle" cx="32" cy="32" r="29" />
          <path className="check-mark" d="M20 33.5 L28.5 42 L44 24.5" />
        </svg>
        <h1 className="screen-title">{when}<br />확정했어요</h1>
        <p className="screen-sub">
          초대장에 <strong>왜 이 시간인지</strong>도 함께 담아 보내요 — 결정에
          뒷말이 없도록요
        </p>
      </div>

      <div className="msg-card">
        <p className="msg-label">전원에게</p>
        <p className="msg-body">
          <strong>{MEETING.title}</strong>이 {when}로 확정됐어요.{' '}
          {isFull
            ? '6명 전원이 참석할 수 있는 시간이에요.'
            : '필수 인원이 모두 모일 수 있는 시간이에요.'}
        </p>
      </div>

      {reluctant.map((s) => (
        <div className="msg-card msg-warn" key={s.person.id}>
          <p className="msg-label">{s.person.name}님께는 따로</p>
          <p className="msg-body">
            ‘{s.avoids[0]}’ 시간인 걸 알아요. 그래도 전원이 모일 수 있는 시간이
            이때뿐이라 미리 양해를 구해요. 다음 회의에선 먼저 배려할게요.
          </p>
        </div>
      ))}

      {absent.map((s) => (
        <div className="msg-card msg-warn" key={s.person.id}>
          <p className="msg-label">{s.person.name}님께는 따로</p>
          <p className="msg-body">
            일정이 겹쳐 이번엔 참석이 어려우시죠. 선택 참석이라 이 시간으로
            확정했고, 회의록은 끝나는 대로 공유해드릴게요.
          </p>
        </div>
      ))}

      <div className="end-card">
        <p className="end-kicker">데모 끝</p>
        <p className="end-body">
          응답은 칩 몇 번의 탭, 결정은 근거와 함께.
          <br />
          이게 ‘모여’의 핵심 플로우예요.
        </p>
        <button className="cta cta-light" onClick={onReset}>처음부터 다시 보기</button>
      </div>
    </div>
  )
}
