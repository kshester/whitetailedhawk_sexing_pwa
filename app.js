// Hawk Sexing PWA logic (mm ranges + color coding)

// Ranges (mm)
const ranges = {
  wing:   { min: 300, max: 500, label: "Wing chord" },
  culmen: { min: 15,  max: 30,  label: "Culmen length" },
  hallux: { min: 20,  max: 35,  label: "Hallux length" }
};

const wingEl = document.getElementById("wing");
const culmenEl = document.getElementById("culmen");
const halluxEl = document.getElementById("hallux");

const calcBtn = document.getElementById("calcBtn");
const resetBtn = document.getElementById("resetBtn");

const scoreOut = document.getElementById("scoreOut");
const sexOut = document.getElementById("sexOut");
const hintOut = document.getElementById("hintOut");
const outputBox = document.getElementById("outputBox");

// Clear output styling
function setNeutral(message = "") {
  outputBox.classList.remove("male", "female", "borderline");
  outputBox.classList.add("neutral");
  hintOut.textContent = message;
}

// Validate a field value
function validateNumber(value, range) {
  if (value === "" || value === null || value === undefined) {
    return { ok: false, msg: `${range.label} is required.` };
  }

  const n = Number(value);
  if (!Number.isFinite(n)) {
    return { ok: false, msg: `${range.label} must be a number.` };
  }

  if (n < range.min || n > range.max) {
    return { ok: false, msg: `${range.label} must be between ${range.min} and ${range.max} mm.` };
  }

  return { ok: true, n };
}

// Compute score
function computeScore(wing, culmen, hallux) {
  return (0.079 * wing) + (0.35 * culmen) + (0.317 * hallux) - 50.114;
}

// Update outputs + color
function displayResult(score) {
  scoreOut.textContent = score.toFixed(3);

  // Color + label rules
  if (score < 1) {
    sexOut.textContent = "Male";
    outputBox.classList.remove("female", "borderline", "neutral");
    outputBox.classList.add("male");
    hintOut.textContent = "Score < 1 → Male";

  } else if (score > 1) {
    sexOut.textContent = "Female";
    outputBox.classList.remove("male", "borderline", "neutral");
    outputBox.classList.add("female");
    hintOut.textContent = "Score > 1 → Female";

  } else {
    sexOut.textContent = "Borderline (= 1.000)";
    outputBox.classList.remove("male", "female", "neutral");
    outputBox.classList.add("borderline");
    hintOut.textContent = "Score = 1 → Borderline";
  }
}

// Main calculate
function calculate() {
  const vWing = validateNumber(wingEl.value, ranges.wing);
  if (!vWing.ok) return alertAndNeutral(vWing.msg);

  const vCulmen = validateNumber(culmenEl.value, ranges.culmen);
  if (!vCulmen.ok) return alertAndNeutral(vCulmen.msg);

  const vHallux = validateNumber(halluxEl.value, ranges.hallux);
  if (!vHallux.ok) return alertAndNeutral(vHallux.msg);

  const score = computeScore(vWing.n, vCulmen.n, vHallux.n);
  displayResult(score);
}

// Helper: alert + neutralize output
function alertAndNeutral(msg) {
  window.alert(msg);
  scoreOut.textContent = "—";
  sexOut.textContent = "—";
  setNeutral("Enter valid measurements to calculate.");
}

// Reset everything
function resetAll() {
  wingEl.value = "";
  culmenEl.value = "";
  halluxEl.value = "";
  scoreOut.textContent = "—";
  sexOut.textContent = "—";
  setNeutral("");
  wingEl.focus();
}

// Auto-clear output when editing inputs
function attachAutoClear(el) {
  el.addEventListener("input", () => {
    scoreOut.textContent = "—";
    sexOut.textContent = "—";
    setNeutral("");
  });
}

attachAutoClear(wingEl);
attachAutoClear(culmenEl);
attachAutoClear(halluxEl);

// Button events
calcBtn.addEventListener("click", calculate);
resetBtn.addEventListener("click", resetAll);

// Let Enter key calculate when focused in a field
[wingEl, culmenEl, halluxEl].forEach(el => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") calculate();
  });
});

// Initial state
setNeutral("");

// Register service worker (offline support)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch (err) {
      // If it fails, app still works online
      console.log("Service worker registration failed:", err);
    }
  });
}
