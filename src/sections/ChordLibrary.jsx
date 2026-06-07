import { useMemo, useState } from "react";
import { chordRoots, chordTypes } from "../data/chords";
import { chordName, getChordShapes, getDiatonicChords } from "../utils/chords";

const stringLabels = ["E", "A", "D", "G", "B", "E"];
const fretsToShow = 5;

function ChordDiagram({ chord }) {
  const visibleFrets = Array.from({ length: fretsToShow + 1 }, (_, index) => index);

  return (
    <div className="chord-card">
      <div className="chord-card-header">
        <h3>{chord.name}</h3>
        <span>{chord.baseFret > 1 ? `fret ${chord.baseFret}` : "open"}</span>
      </div>
      <div className="chord-diagram" aria-label={`${chord.name} chord diagram`}>
        <div className="chord-string-status">
          {chord.frets.map((fret, index) => (
            <span key={`${chord.name}-status-${stringLabels[index]}`}>{fret === null ? "x" : fret === 0 ? "o" : ""}</span>
          ))}
        </div>
        <div className={chord.baseFret === 1 ? "chord-grid nut" : "chord-grid"}>
          {stringLabels.map((string) => (
            <i className="chord-string-line" key={`${chord.name}-string-${string}`} />
          ))}
          {visibleFrets.map((fret) => (
            <i className="chord-fret-line" key={`${chord.name}-fret-${fret}`} />
          ))}
          {chord.barres.map((barre) => (
            <span className="barre" key={`${chord.id}-barre-${barre}`} style={{ top: `${((barre - 0.5) / fretsToShow) * 100}%` }} />
          ))}
          {chord.frets.map((fret, stringIndex) => {
            if (!fret || fret > fretsToShow) return null;

            return (
              <span
                className="finger-dot"
                key={`${chord.name}-${stringIndex}-${fret}`}
                style={{
                  left: `${(stringIndex / 5) * 100}%`,
                  top: `${((fret - 0.5) / fretsToShow) * 100}%`,
                }}
              >
                {chord.fingers[stringIndex] ?? ""}
              </span>
            );
          })}
        </div>
        <div className="chord-string-labels">
          {stringLabels.map((string, index) => (
            <span key={`${chord.name}-label-${index}`}>{string}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChordLibrary() {
  const [root, setRoot] = useState("C");
  const [type, setType] = useState("major");
  const [keyRoot, setKeyRoot] = useState("C");
  const [mode, setMode] = useState("major");

  const matchingShapes = useMemo(
    () => getChordShapes(root, type).slice(0, 8),
    [root, type],
  );
  const keyChords = useMemo(() => getDiatonicChords(keyRoot, mode), [keyRoot, mode]);

  return (
    <section className="chord-section" aria-label="Chord library">
      <div className="chord-controls">
        <label>
          <span>Root</span>
          <select onChange={(event) => setRoot(event.target.value)} value={root}>
            {chordRoots.map((note) => (
              <option key={note.dbKey} value={note.label}>
                {note.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Type</span>
          <select onChange={(event) => setType(event.target.value)} value={type}>
            {chordTypes.map((chordType) => (
              <option key={chordType.id} value={chordType.id}>
                {chordType.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="chord-layout">
        <div className="chord-results">
          <div className="chord-title-row">
            <h2>{chordName(root, type)}</h2>
            <span>{matchingShapes.length ? `${matchingShapes.length} shape${matchingShapes.length === 1 ? "" : "s"}` : "No saved shapes"}</span>
          </div>
          <div className="chord-grid-list">
            {matchingShapes.map((chord) => (
              <ChordDiagram chord={chord} key={chord.id} />
            ))}
          </div>
        </div>

        <aside className="key-panel" aria-label="Chords in key">
          <div className="key-controls">
            <label>
              <span>Key</span>
              <select onChange={(event) => setKeyRoot(event.target.value)} value={keyRoot}>
                {chordRoots.map((note) => (
                  <option key={note.dbKey} value={note.label}>
                    {note.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Mode</span>
              <select onChange={(event) => setMode(event.target.value)} value={mode}>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </label>
          </div>
          <div className="key-chords">
            {keyChords.map((chord) => (
              <button
                key={`${chord.degree}-${chord.name}`}
                onClick={() => {
                  setRoot(chord.root);
                  setType(chord.type);
                }}
                type="button"
              >
                <span>{chord.degree}</span>
                <strong>{chord.name}</strong>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ChordLibrary;
