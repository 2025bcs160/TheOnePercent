/* TheOnePercent — onboarding behaviour (pages/onboarding.html)
   -------------------------------------------------------------------
   Two questions, one screen: which markets, and how experienced. Those
   answers configure the dashboard, the default calculators and where
   the lesson path starts (roadmap, Foundation 03).

   Everything is written through Shell.saveProfile() and read back
   through Shell.profile(). That is deliberate: those two functions are
   the only place storage is touched, so swapping localStorage for a
   real backend later changes shell.js and nothing here.
   ------------------------------------------------------------------- */

(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const form = $("#ob-form");
  const cards = $$(".ob-card");
  const continueBtn = $("#ob-continue");
  const skipBtn = $("#ob-skip");
  const hint = $("#ob-hint");

  const stepLevel = $("#step-level");
  const barLevel = $("#bar-level");
  const stepCount = $("#step-count");

  /* ------------------------------------------------------------ state */

  const chosen = () => cards.filter((c) => c.getAttribute("aria-pressed") === "true");

  const experience = () => {
    const picked = $('input[name="experience"]:checked');
    return picked ? picked.value : "New to trading";
  };

  /* ------------------------------------------------------------ prefill
     Someone re-opening onboarding from the account panel ("Edit
     preferences") should see their current answers, not a blank form. */

  function prefill() {
    const me = window.Shell && Shell.profile ? Shell.profile() : null;
    if (!me) return;

    if (me.markets && me.markets.length) {
      const saved = me.markets.map((m) => String(m).toLowerCase());
      cards.forEach((card) => {
        const value = card.dataset.market.toLowerCase();
        if (saved.includes(value)) card.setAttribute("aria-pressed", "true");
      });
    }

    if (me.experience) {
      const match = $$('input[name="experience"]').find(
        (r) => r.value.toLowerCase() === String(me.experience).toLowerCase()
      );
      if (match) match.checked = true;
    }
  }

  /* ------------------------------------------------------------ progress
     The third dot lights up once a market is chosen, so the bar reflects
     real progress rather than just counting page loads. */

  function paint() {
    const count = chosen().length;
    const ready = count > 0;

    continueBtn.disabled = !ready;

    if (ready) {
      stepLevel.dataset.state = "active";
      barLevel.dataset.filled = "true";
      stepCount.textContent = "Step 3 of 3";
      hint.textContent =
        count === 1
          ? "1 market selected — you can change this later in settings."
          : count + " markets selected — you can change this later in settings.";
    } else {
      stepLevel.dataset.state = "todo";
      barLevel.dataset.filled = "false";
      stepCount.textContent = "Step 2 of 3";
      hint.textContent = "Pick at least one market to continue.";
    }
  }

  /* ------------------------------------------------------------ events */

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const on = card.getAttribute("aria-pressed") === "true";
      card.setAttribute("aria-pressed", String(!on));
      paint();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!chosen().length) return;

    continueBtn.disabled = true;
    continueBtn.textContent = "Saving…";

    if (window.Shell && Shell.saveProfile) {
      Shell.saveProfile({
        markets: chosen().map((c) => c.dataset.market),
        experience: experience(),
        onboardedAt: new Date().toISOString(),
      });
    }

    window.location.href = "dashboard.html";
  });

  /* Skipping is allowed — the dashboard has a real empty state that
     prompts for markets, so nobody is trapped here. */
  skipBtn.addEventListener("click", () => {
    if (window.Shell && Shell.saveProfile) {
      Shell.saveProfile({ onboardingSkipped: true });
    }
    window.location.href = "dashboard.html";
  });

  /* ------------------------------------------------------------ boot */

  prefill();
  paint();
})();