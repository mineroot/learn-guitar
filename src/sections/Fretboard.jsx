import { useMemo, useState } from "react";
import { fretMarkers, fretNumbers, fretboardStrings, noteIndex, noteStrings, scalePatterns } from "../data/music";

function Fretboard() {
  const [root, setRoot] = useState("E");
  const [pattern, setPattern] = useState("minorPentatonic");
  const [spotlight, setSpotlight] = useState(null);

  const activeNotes = useMemo(() => {
    const rootIndex = noteIndex(root);
    return new Set(
      scalePatterns[pattern].intervals.map((interval) => noteStrings[(rootIndex + interval) % 12]),
    );
  }, [pattern, root]);

  const visibleSpotlight = spotlight && activeNotes.has(spotlight) ? spotlight : null;

  return (
    <section className="fretboard-section" aria-label="Guitar fretboard">
      <div className="fretboard-controls">
        <label>
          <span>Root</span>
          <select onChange={(event) => setRoot(event.target.value)} value={root}>
            {noteStrings.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Pattern</span>
          <select onChange={(event) => setPattern(event.target.value)} value={pattern}>
            {Object.entries(scalePatterns).map(([id, scale]) => (
              <option key={id} value={id}>
                {scale.label}
              </option>
            ))}
          </select>
        </label>
        <button className="ghost-action" onClick={() => setSpotlight(root)} type="button">
          Show roots
        </button>
        <button className="ghost-action" onClick={() => setSpotlight(null)} type="button">
          Clear focus
        </button>
      </div>

      <div className="fretboard-wrap">
        <div className="fret-numbers" aria-hidden="true">
          <span>String</span>
          {fretNumbers.map((fret) => (
            <span className={fretMarkers.includes(fret) ? "marker" : ""} key={fret}>
              {fret === 0 ? "Open" : fret}
            </span>
          ))}
        </div>

        <div className="fretboard-grid">
          {fretboardStrings.map((string) => (
            <div className="fretboard-row" key={string.name}>
              <div className="string-label">
                <strong>{string.name}</strong>
              </div>
              {fretNumbers.map((fret) => {
                const note = noteStrings[(noteIndex(string.name) + fret) % 12];
                const inPattern = activeNotes.has(note);
                const isRoot = note === root;
                const isSpotlight = visibleSpotlight === note;

                return (
                  <button
                    aria-label={`${string.name} string, fret ${fret}, ${note}`}
                    className={[
                      "fret-cell",
                      inPattern ? "in-pattern" : "",
                      isRoot ? "root-note" : "",
                      isSpotlight ? "spotlight" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={`${string.name}-${fret}`}
                    onClick={() => setSpotlight(note)}
                    type="button"
                  >
                    <span>{note}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="fretboard-summary">
        <p>
          {root} {scalePatterns[pattern].label}
        </p>
        <div aria-label="Active notes">
          {[...activeNotes].map((note) => (
            <button
              className={note === root ? "root-note" : ""}
              key={note}
              onClick={() => setSpotlight(note)}
              type="button"
            >
              {note}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Fretboard;
