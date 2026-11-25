const destinations = [
  { id: "dashboard", label: "Πίνακας", icon: "⌂" },
  { id: "bills", label: "Συνδρομές & Πάγια", icon: "◷" },
  { id: "deals", label: "Smart Deals", icon: "⚡" },
];

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Κύρια πλοήγηση">
      {destinations.map((destination) => (
        <button
          className={`nav-button ${activePage === destination.id ? "active" : ""}`}
          key={destination.id}
          type="button"
          onClick={() => onNavigate(destination.id)}
          aria-current={activePage === destination.id ? "page" : undefined}
        >
          <span aria-hidden="true">{destination.icon}</span>
          {destination.label}
        </button>
      ))}
    </nav>
  );
}
