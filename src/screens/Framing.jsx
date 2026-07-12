export default function Framing({ onNext }) {
  return (
    <div className="narrator">
      <div className="narrator-body">
        <div className="brand">
          모여<span className="brand-dot" aria-hidden="true" />
        </div>

        <h1 className="narrator-display">당신은 지민이에요.</h1>

        <p className="narrator-p">
          다음 주까지 6명이 모여야 해요. 회의는 딱 1시간.
        </p>
        <p className="narrator-p">
          누구는 점심 직후가 싫고, 누구는 목요일마다 외근이에요. 꼭 와야 하는
          사람도, 빠져도 되는 사람도 있죠.
        </p>
      </div>

      <div className="narrator-foot">
        <button className="cta cta-light" onClick={onNext}>
          일정 만들기부터 시작
        </button>
      </div>
    </div>
  )
}
