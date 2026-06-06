import { guitarStrings } from "../data/music";

function InstrumentPanel() {
  return (
    <div className="instrument-panel" aria-hidden="true">
      <div className="guitar-neck">
        {guitarStrings.map((string) => (
          <span key={string.name} />
        ))}
        <div className="frets">
          {Array.from({ length: 8 }).map((_, index) => (
            <i key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstrumentPanel;
