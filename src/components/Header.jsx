import { sections } from "../data/sections";

function Header({ activeSection }) {
  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">Daily guitar tools</p>
        <h1>Learn Guitar</h1>
      </div>
      <nav className="section-tabs" aria-label="Practice sections">
        {sections.map((section) => (
          <a
            className={activeSection === section.id ? "active" : ""}
            href={`#/${section.id}`}
            key={section.id}
          >
            {section.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default Header;
