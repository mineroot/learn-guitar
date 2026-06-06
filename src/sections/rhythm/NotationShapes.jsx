function NoteShape({ event, x, active, beamed }) {
  const y = 62;
  const stemTop = 25;
  const isOpen = event.id === "whole" || event.id === "half";
  const hasStem = event.id !== "whole";
  const hasFlag = !beamed && (event.id === "eighth" || event.id === "sixteenth" || event.id === "eighthTriplet");

  return (
    <g className={active ? "notation-event active" : "notation-event"}>
      <ellipse
        className={isOpen ? "note-head open" : "note-head"}
        cx={x}
        cy={y}
        rx="10"
        ry="7"
        transform={`rotate(-18 ${x} ${y})`}
      />
      {hasStem && <line className="note-stem" x1={x + 9} x2={x + 9} y1={y - 2} y2={stemTop} />}
      {hasFlag && (
        <>
          <path className="note-flag" d={`M ${x + 9} ${stemTop} C ${x + 35} ${stemTop + 6}, ${x + 33} ${stemTop + 24}, ${x + 12} ${stemTop + 30}`} />
          {event.id === "sixteenth" && (
            <path className="note-flag" d={`M ${x + 9} ${stemTop + 9} C ${x + 31} ${stemTop + 15}, ${x + 29} ${stemTop + 30}, ${x + 13} ${stemTop + 35}`} />
          )}
        </>
      )}
      {event.id.includes("Triplet") && <text className="triplet-mark" x={x} y="18">3</text>}
    </g>
  );
}

function RestShape({ event, x, active }) {
  return (
    <g className={active ? "notation-event rest active" : "notation-event rest"}>
      {(event.id === "whole" || event.id === "half") && (
        <rect x={x - 10} y={event.id === "whole" ? 47 : 55} width="20" height="8" rx="1" />
      )}
      {event.id === "quarter" && (
        <path d={`M ${x - 2} 34 L ${x + 9} 47 L ${x} 56 L ${x + 10} 69 L ${x - 4} 62 L ${x + 4} 54 L ${x - 7} 41 Z`} />
      )}
      {(event.id === "eighth" || event.id === "eighthTriplet") && (
        <path d={`M ${x - 5} 38 C ${x + 10} 32, ${x + 17} 43, ${x + 5} 50 L ${x - 8} 76 L ${x - 2} 77 L ${x + 14} 45 C ${x + 6} 47, ${x - 2} 45, ${x - 5} 38 Z`} />
      )}
      {event.id === "sixteenth" && (
        <>
          <path d={`M ${x - 5} 34 C ${x + 10} 28, ${x + 17} 39, ${x + 5} 46 L ${x - 8} 76 L ${x - 2} 77 L ${x + 14} 41 C ${x + 6} 43, ${x - 2} 41, ${x - 5} 34 Z`} />
          <path d={`M ${x - 1} 51 C ${x + 10} 47, ${x + 15} 55, ${x + 8} 62 L ${x + 1} 62 C ${x + 7} 58, ${x + 4} 54, ${x - 1} 51 Z`} />
        </>
      )}
      {event.id.includes("Triplet") && <text className="triplet-mark" x={x} y="26">3</text>}
    </g>
  );
}

export { NoteShape, RestShape };
