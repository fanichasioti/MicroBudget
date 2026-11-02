# MicroBudget
MicroBudget is an app especially for uni students, helping them manage their monthly budget advise them and update them about offers and alerts them
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#eff4ef" />
    <title>MicroBudget</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <script type="importmap">
      { "imports": { "react": "https://esm.sh/react@18.3.1" } }
    </script>
    <style>
      :root {
        font-family: "DM Sans", sans-serif;
        color: #172f28;
        background: #edf2ed;
        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-width: 320px;
        min-height: 100vh;
        background-color: #edf2ed;
        background-image: linear-gradient(135deg, rgba(255,255,255,.82) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,.55) 25%, transparent 25%);
        background-size: 34px 34px;
      }
      button { font: inherit; }
      .app-shell { height: min(860px, calc(100dvh - 48px)); min-height: 650px; }
      .screen-scroll { scrollbar-width: none; }
      .screen-scroll::-webkit-scrollbar { display: none; }
      .progress-fill { animation: fill-in 850ms cubic-bezier(.2,.8,.2,1) both; }
      @keyframes fill-in { from { width: 0; } to { width: 72%; } }
      @keyframes toast-in { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
      .toast-in { animation: toast-in 180ms ease-out both; }
      @media (max-width: 440px) {
        body { background: #f8faf7; }
        .app-shell { width: 100%; height: 100dvh; min-height: 600px; border: 0; border-radius: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import React, { useState } from "https://esm.sh/react@18.3.1";
      import { createRoot } from "https://esm.sh/react-dom@18.3.1/client?external=react";
      import {
        ArrowDownLeft, ArrowRight, Bell, BusFront, Check, ChevronRight,
        Coffee, House, Music2, ShoppingBasket, Sparkles, Utensils, Wallet,
      } from "https://esm.sh/lucide-react@0.468.0?external=react&deps=react@18.3.1";

      const h = React.createElement;

      const expenses = [
        { name: "efood", detail: "Lunch · 12:42 PM", amount: "€12.00", icon: Utensils, tint: "bg-[#eaf4ed] text-[#347451]" },
        { name: "OASA ticket", detail: "Transport · 10:18 AM", amount: "€1.20", icon: BusFront, tint: "bg-[#fff1e6] text-[#bd7040]" },
        { name: "Spotify", detail: "Subscription · Today", amount: "€7.99", icon: Music2, tint: "bg-[#f1edf8] text-[#75629b]" },
      ];

      const offers = [
        {
          id: "coffee", discount: "20% OFF", title: "Your coffee run, for a little less.",
          description: "You order coffee often. Get 20% off at Coffee Island via efood.",
          partner: "COFFEE ISLAND", category: "Food & drink", icon: Coffee, color: "bg-[#f3e7d8] text-[#93663d]", code: "BREW20",
        },
        {
          id: "ride", discount: "FREE RIDE", title: "Make your next commute count.",
          description: "Your OASA pass expires soon. Top up now and get a free e-scooter ride.",
          partner: "OASA × HOP", category: "Getting around", icon: BusFront, color: "bg-[#e3f0e9] text-[#347451]", code: "ONEHOP",
        },
        {
          id: "market", discount: "€5 OFF", title: "A little more room for the essentials.",
          description: "Save €5 on your next grocery order this weekend.",
          partner: "WEEKEND MARKET", category: "Groceries", icon: ShoppingBasket, color: "bg-[#f8e9e3] text-[#ad624c]", code: "SAVE5",
        },
      ];

      function ExpenseRow({ expense }) {
        const Icon = expense.icon;
        return h("div", { className: "flex items-center justify-between py-3.5" },
          h("div", { className: "flex min-w-0 items-center gap-3" },
            h("span", { className: `grid h-10 w-10 shrink-0 place-items-center rounded-[14px] ${expense.tint}` }, h(Icon, { size: 18, strokeWidth: 1.8 })),
            h("span", { className: "min-w-0" },
              h("span", { className: "block truncate text-[13px] font-bold text-[#20372f]" }, expense.name),
              h("span", { className: "mt-0.5 block truncate text-[11px] font-medium text-[#89958f]" }, expense.detail),
            ),
          ),
          h("span", { className: "ml-3 text-[13px] font-bold tabular-nums text-[#20372f]" }, expense.amount),
        );
      }

      function OfferCard({ offer, claimed, onClaim }) {
        const Icon = offer.icon;
        return h("article", { className: "overflow-hidden rounded-[20px] border border-[#e9ede8] bg-white shadow-[0_5px_18px_rgba(27,52,39,0.035)] transition-transform duration-200 hover:-translate-y-0.5" },
          h("div", { className: "flex items-center justify-between px-4 pb-3 pt-4" },
            h("span", { className: `grid h-10 w-10 place-items-center rounded-[14px] ${offer.color}` }, h(Icon, { size: 19, strokeWidth: 1.8 })),
            h("span", { className: "rounded-md bg-[#f0f5ef] px-2.5 py-1.5 text-[10px] font-extrabold tracking-[.08em] text-[#426b52]" }, offer.discount),
          ),
          h("div", { className: "px-4 pb-3" },
            h("p", { className: "mb-1 text-[10px] font-extrabold tracking-[.13em] text-[#9aa59f]" }, offer.partner),
            h("h3", { className: "font-[Manrope] text-[16px] font-extrabold leading-snug text-[#20372f]" }, offer.title),
            h("p", { className: "mt-1.5 text-[12px] leading-[1.55] text-[#78867e]" }, offer.description),
          ),
          h("div", { className: "mx-4 border-t border-dashed border-[#dce4dc]" }),
          h("div", { className: "flex items-center justify-between gap-2 px-4 py-3" },
            h("span", { className: "text-[11px] font-semibold text-[#89958f]" }, offer.category),
            h("button", {
              type: "button", onClick: onClaim,
              className: `inline-flex min-h-9 items-center gap-1.5 rounded-[10px] px-3 text-[11px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#426b52] ${claimed ? "bg-[#e8f2e9] text-[#39734d]" : "bg-[#173b2d] text-white hover:bg-[#285743]"}`,
              "aria-label": claimed ? `${offer.title} saved` : `Claim ${offer.discount} offer`,
            }, claimed ? h(React.Fragment, null, h(Check, { size: 14 }), "Saved") : h(React.Fragment, null, "Claim offer", h(ArrowRight, { size: 13 }))),
          ),
        );
      }

      function App() {
        const [activeTab, setActiveTab] = useState("dashboard");
        const [claimed, setClaimed] = useState([]);
        const [toast, setToast] = useState("");
        const [toastTimer, setToastTimer] = useState(null);

        function notify(message) {
          window.clearTimeout(toastTimer);
          setToast(message);
          setToastTimer(window.setTimeout(() => setToast(""), 2200));
        }

        function claimOffer(offer) {
          setClaimed((current) => current.includes(offer.id) ? current : [...current, offer.id]);
          notify(`${offer.discount} added to your wallet`);
        }

        return h("main", { className: "grid min-h-[100dvh] place-items-center p-0 sm:p-6" },
          h("div", { className: "app-shell relative flex w-[400px] max-w-full flex-col overflow-hidden rounded-[30px] border border-[#dce5dc] bg-[#f8faf7] shadow-[0_24px_70px_rgba(38,63,46,0.15)]" },
            h("div", { className: "flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[11px] font-bold text-[#20372f]", "aria-label": "Status bar" },
              h("span", null, "9:41"),
              h("span", { className: "flex items-center gap-1.5", "aria-hidden": "true" },
                h("span", { className: "flex h-3 items-end gap-[2px]" }, [4, 6, 8, 10].map((height) => h("i", { key: height, className: "w-[3px] rounded-sm bg-[#20372f]", style: { height } }))),
                h("span", { className: "h-[9px] w-[15px] rounded-[3px] border-[1.5px] border-[#20372f] p-[1px]" }, h("span", { className: "block h-full w-[72%] rounded-[1px] bg-[#20372f]" })),
              ),
            ),
            h("header", { className: "flex shrink-0 items-center justify-between px-5 pb-3 pt-1" },
              h("a", { href: "#dashboard", onClick: (event) => { event.preventDefault(); setActiveTab("dashboard"); }, className: "flex items-center gap-2.5 text-inherit no-underline", "aria-label": "MicroBudget home" },
                h("span", { className: "grid h-9 w-9 place-items-center rounded-[13px] bg-[#173b2d] text-white" }, h(Wallet, { size: 17, strokeWidth: 1.8 })),
                h("span", { className: "font-[Manrope] text-[15px] font-extrabold tracking-[-.03em]" }, "micro", h("span", { className: "text-[#5d8a69]" }, "budget")),
              ),
              h("button", { type: "button", className: "relative grid h-9 w-9 place-items-center rounded-full border border-[#e5ebe4] bg-white text-[#52655a] transition hover:bg-[#f1f5ef]", "aria-label": "Notifications", onClick: () => notify("You're all caught up") },
                h(Bell, { size: 17, strokeWidth: 1.8 }),
                h("span", { className: "absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#dd8767] ring-2 ring-white" }),
              ),
            ),
            h("div", { className: "screen-scroll flex-1 overflow-y-auto px-5 pb-5", key: activeTab },
              activeTab === "dashboard"
                ? h("section", { "aria-label": "Dashboard" },
                    h("div", { className: "mb-4 mt-2 flex items-end justify-between" },
                      h("div", null,
                        h("p", { className: "mb-1 text-[10px] font-extrabold tracking-[.15em] text-[#8c9990]" }, "MONDAY, MAY 12"),
                        h("h1", { className: "font-[Manrope] text-[26px] font-extrabold tracking-[-.055em] text-[#20372f]" }, "Hello, Maria", h("span", { className: "ml-1" }, "✳")),
                      ),
                      h("div", { className: "mb-0.5 grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#e6c6a9] text-[13px] font-extrabold text-[#65462f] shadow-sm", "aria-label": "Maria's profile" }, "M"),
                    ),
                    h("section", { className: "overflow-hidden rounded-[21px] bg-[#173b2d] p-[17px] text-white shadow-[0_10px_24px_rgba(23,59,45,.13)]", "aria-labelledby": "predictor-title" },
                      h("div", { className: "mb-4 flex items-center justify-between" },
                        h("div", { className: "flex items-center gap-2" }, h("span", { className: "grid h-7 w-7 place-items-center rounded-[9px] bg-white/10 text-[#d8edc8]" }, h(Sparkles, { size: 15 })), h("h2", { id: "predictor-title", className: "text-[11px] font-bold tracking-[.02em] text-white/90" }, "Budget Burn Rate Predictor")),
                        h("span", { className: "flex items-center gap-1.5 rounded-full bg-[#c4e6c7]/15 px-2.5 py-1 text-[9px] font-bold text-[#c6e7c9]" }, h("span", { className: "h-1.5 w-1.5 rounded-full bg-[#a5d6a7]" }), "ON TRACK"),
                      ),
                      h("div", { className: "mb-2 flex items-end justify-between" },
                        h("p", { className: "text-[12px] font-semibold text-white/65" }, "Monthly spending"),
                        h("p", { className: "font-[Manrope] text-[13px] font-extrabold tabular-nums" }, "€180", h("span", { className: "font-medium text-white/50" }, " / €250")),
                      ),
                      h("div", { className: "h-[7px] overflow-hidden rounded-full bg-white/15", role: "progressbar", "aria-label": "Monthly budget spent", "aria-valuenow": "72", "aria-valuemin": "0", "aria-valuemax": "100" }, h("div", { className: "progress-fill h-full rounded-full bg-[#c3e3a8]" })),
                      h("div", { className: "mt-2 flex justify-between text-[10px] font-medium text-white/45" }, h("span", null, "€70 left to spend"), h("span", null, "72% used")),
                      h("div", { className: "mt-4 flex gap-2.5 rounded-[13px] bg-[#f4eedf] px-3 py-2.5 text-[#554a38]" },
                        h("span", { className: "mt-0.5 shrink-0 text-[#ad7845]" }, h(Sparkles, { size: 14 })),
                        h("p", { className: "text-[11px] leading-[1.55]" }, h("strong", { className: "font-extrabold" }, "A heads-up: "), "At this pace, your monthly budget may run out 5 days early. Consider reducing Wolt orders this weekend."),
                      ),
                    ),
                    h("div", { className: "mb-2 mt-6 flex items-center justify-between" },
                      h("h2", { className: "font-[Manrope] text-[16px] font-extrabold tracking-[-.035em] text-[#20372f]" }, "Recent activity"),
                      h("button", { type: "button", onClick: () => notify("Showing your latest expenses"), className: "flex items-center gap-0.5 text-[11px] font-bold text-[#64836c]" }, "See all", h(ChevronRight, { size: 14 })),
                    ),
                    h("div", { className: "divide-y divide-[#edf0ec] rounded-[18px] border border-[#e9ede8] bg-white px-3.5" }, expenses.map((expense) => h(ExpenseRow, { key: expense.name, expense }))),
                    h("div", { className: "mt-4 flex items-center justify-between rounded-[16px] border border-[#e9ede8] bg-[#f2f6f0] px-3.5 py-3" },
                      h("div", { className: "flex items-center gap-2.5" }, h("span", { className: "grid h-8 w-8 place-items-center rounded-[11px] bg-white text-[#67836d]" }, h(ArrowDownLeft, { size: 16 })), h("span", { className: "text-[11px] font-bold text-[#40564a]" }, "Your daily check-in is ready")),
                      h("button", { type: "button", onClick: () => setActiveTab("deals"), className: "grid h-7 w-7 place-items-center rounded-full text-[#64836c] hover:bg-white", "aria-label": "Explore Smart Deals" }, h(ArrowRight, { size: 15 })),
                    ),
                  )
                : h("section", { "aria-label": "Smart Deals" },
                    h("div", { className: "mb-4 mt-3" },
                      h("div", { className: "mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#e9f1e7] px-2.5 py-1 text-[10px] font-bold text-[#54765b]" }, h(Sparkles, { size: 12 }), "PICKED FOR YOU"),
                      h("h1", { className: "max-w-[310px] font-[Manrope] text-[24px] font-extrabold leading-[1.2] tracking-[-.05em] text-[#20372f]" }, "AI recommendations based on your habits"),
                      h("p", { className: "mt-2 text-[12px] text-[#819087]" }, "Small perks for your everyday spending."),
                    ),
                    h("div", { className: "mb-3 flex items-center justify-between" }, h("h2", { className: "text-[12px] font-bold text-[#52645a]" }, "Offers near you"), h("span", { className: "text-[10px] font-semibold text-[#99a39c]" }, "3 offers")),
                    h("div", { className: "grid gap-3" }, offers.map((offer) => h(OfferCard, { key: offer.id, offer, claimed: claimed.includes(offer.id), onClaim: () => claimOffer(offer) }))),
                    h("p", { className: "pb-1 pt-4 text-center text-[10px] leading-relaxed text-[#a0aaa3]" }, "Offers are personalized from your spending patterns."),
                  ),
            ),
            h("nav", { className: "z-10 grid h-[72px] shrink-0 grid-cols-2 border-t border-[#e9ede8] bg-white/95 px-5 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur", "aria-label": "Main navigation" },
              [
                { id: "dashboard", label: "Dashboard", icon: House },
                { id: "deals", label: "Smart Deals", icon: Sparkles },
              ].map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return h("button", { key: id, type: "button", onClick: () => setActiveTab(id), className: `flex flex-col items-center justify-center gap-1 rounded-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#54765b] ${active ? "text-[#24543a]" : "text-[#99a39c] hover:text-[#5c7262]"}`, "aria-current": active ? "page" : undefined },
                  h("span", { className: `grid h-[27px] w-[50px] place-items-center rounded-full transition-colors ${active ? "bg-[#eaf2e8]" : "bg-transparent"}` }, h(Icon, { size: 18, strokeWidth: active ? 2.2 : 1.8 })),
                  h("span", { className: `text-[10px] ${active ? "font-extrabold" : "font-semibold"}` }, label),
                );
              }),
            ),
            toast && h("div", { role: "status", className: "toast-in absolute bottom-[84px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#20372f] px-4 py-2.5 text-[11px] font-bold text-white shadow-lg" }, h(Check, { size: 14, className: "text-[#c3e3a8]" }), toast),
          ),
        );
      }

      createRoot(document.getElementById("root")).render(h(React.StrictMode, null, h(App)));
    </script>
  </body>
</html>
