const marks = {
  efood: <text x="12" y="16" textAnchor="middle">e</text>,
  wolt: <path d="m3.5 6 2.4 8h2.4L12 8.3l3.7 5.7h2.4l2.4-8h-2.6l-1.3 4.7-3-4.7h-2.3l-3 4.7L7 6H3.5Z" />,
  spotify: <><path d="M5 8.2c4.8-1.3 9.7-.8 14 1.8" /><path d="M6 11.6c3.9-1 8-.5 11.4 1.5" /><path d="M7 14.8c3-.7 6-.3 8.7 1.2" /></>,
  whatsup: <><path d="M5 5.5h14v10H11l-4 3v-3H5z" /><text x="12" y="13.5" textAnchor="middle">W</text></>,
  public: <><circle cx="12" cy="12" r="8" /><text x="12" y="16" textAnchor="middle">P</text></>,
  cosmote: <><circle cx="12" cy="12" r="8" /><path d="M15.5 9.2a4 4 0 1 0 0 5.6" /></>,
  box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4.5 7.7 7.5 4.4 7.5-4.4M12 12v8.5" /></>,
  village: <><path d="M4 20V8l8-5 8 5v12z" /><path d="M9 20v-6h6v6" /></>,
  oasa: <><circle cx="12" cy="12" r="8.5" /><path d="M7.5 15.5 12 7l4.5 8.5M9 13h6" /></>,
  freenow: <><path d="M6 20V5h12M6 10h9" /><circle cx="17.5" cy="17.5" r="2.5" /></>,
  home: <path d="m3 11 9-7 9 7M5.5 10v10h13V10M9 20v-6h6v6" />,
  gym: <path d="M4 9v6m3-9v12m10-12v12m3-9v6M7 12h10" />,
  cloud: <path d="M7 18h10a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 7 9a4.5 4.5 0 0 0 0 9Z" />,
  generic: <text x="12" y="16" textAnchor="middle">€</text>,
};

function brandFor(value = "") {
  const name = value.toLocaleLowerCase("el-GR");
  if (name.includes("efood")) return "efood";
  if (name.includes("wolt")) return "wolt";
  if (name.includes("spotify")) return "spotify";
  if (name.includes("what's up") || name.includes("whats up") || name.includes("whatsup")) return "whatsup";
  if (name.includes("public")) return "public";
  if (name.includes("box")) return "box";
  if (name.includes("village")) return "village";
  if (name.includes("οασα") || name.includes("oasa")) return "oasa";
  if (name.includes("free now") || name.includes("freenow")) return "freenow";
  if (name.includes("cosmote") || name.includes("κινητή") || name.includes("internet")) return "cosmote";
  if (name.includes("ενοίκιο")) return "home";
  if (name.includes("γυμναστήριο")) return "gym";
  if (name.includes("icloud")) return "cloud";
  return "generic";
}

export default function BrandIcon({ brand, label }) {
  const id = brandFor(brand);
  return (
    <span className={`brand-icon brand-icon-${id}`} title={label ?? brand}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{marks[id]}</svg>
    </span>
  );
}
