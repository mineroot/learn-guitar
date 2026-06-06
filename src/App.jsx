import AppShell from "./components/AppShell";
import { useHashSection } from "./hooks/useHashSection";
import Fretboard from "./sections/Fretboard";
import Metronome from "./sections/Metronome";
import RhythmGenerator from "./sections/RhythmGenerator";
import Tuner from "./sections/Tuner";

const sectionComponents = {
  metronome: Metronome,
  tuner: Tuner,
  fretboard: Fretboard,
  rhythm: RhythmGenerator,
};

function App() {
  const activeSection = useHashSection();
  const ActiveSection = sectionComponents[activeSection] ?? Metronome;

  return (
    <AppShell activeSection={activeSection}>
      <ActiveSection />
    </AppShell>
  );
}

export default App;
