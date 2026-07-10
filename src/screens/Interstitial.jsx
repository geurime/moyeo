export default function Interstitial({ narration, onNext }) {
  return (
    <div className="narrator">
      <div className="narrator-body">
        <p className="narrator-kicker">{narration.kicker}</p>
        <h2 className="narrator-display">{narration.lines[0]}</h2>
        <p className="narrator-p">{narration.lines[1]}</p>
        <p className="narrator-handoff">{narration.handoff}</p>
      </div>
      <div className="narrator-foot">
        <button className="cta cta-light" onClick={onNext}>{narration.cta}</button>
      </div>
    </div>
  )
}
