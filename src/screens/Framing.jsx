export default function Framing({ onNext }) {
  return (
    <div className="narrator">
      <div className="narrator-body">
        <div className="brand">
          모여<span className="brand-dot" aria-hidden="true" />
        </div>

        <h1 className="narrator-display">
          당신은 지민이에요.
          <br />
          다음 주까지 6명이
          <br />
          모여야 해요.
        </h1>

        <p className="narrator-p">
          회의는 딱 1시간. 그런데 누구는 점심 직후가 싫고, 누구는 목요일마다
          외근이에요. 꼭 와야 하는 사람도, 빠져도 되는 사람도 있고요.
        </p>
        <p className="narrator-p">
          캘린더는 빈 시간을 알지만, <em>괜찮은 시간</em>은 몰라요. 그 간극을
          메우는 게 이 제품이에요.
        </p>
      </div>

      <div className="narrator-foot">
        <button className="cta cta-light" onClick={onNext}>
          회의 만들기부터 시작
        </button>
        <p className="narrator-hint">3분짜리 데모 · 화면은 직접 눌러볼 수 있어요</p>
      </div>
    </div>
  )
}
