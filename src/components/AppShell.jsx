import Header from "./Header";
import InstrumentPanel from "./InstrumentPanel";

function AppShell({ activeSection, children }) {
  return (
    <main className="app-shell">
      <Header activeSection={activeSection} />
      <InstrumentPanel />
      {children}
    </main>
  );
}

export default AppShell;
