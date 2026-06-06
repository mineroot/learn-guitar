import { useEffect, useState } from "react";
import { defaultSectionId, sections } from "../data/sections";

function getSectionFromHash() {
  const hashSection = window.location.hash.replace(/^#\/?/, "");
  return sections.some((section) => section.id === hashSection) ? hashSection : defaultSectionId;
}

export function useHashSection() {
  const [activeSection, setActiveSection] = useState(getSectionFromHash);

  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, "", `#/${defaultSectionId}`);

    const handleHashChange = () => {
      setActiveSection(getSectionFromHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return activeSection;
}
