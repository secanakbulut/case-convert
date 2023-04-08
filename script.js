// case-convert
// parse input into a list of words, then re-emit in whatever style you want.

// the parser. order of the splits matters here.
// 1. break on any non-alphanumeric run (space, _, -, ., /, etc)
// 2. inside each chunk, split on case boundaries:
//      lower|Upper      -> helloWorld -> hello, World
//      UPPER|UpperLower -> HTMLParser -> HTML, Parser
// 3. digits attach to the preceding alpha run, but a number-only run is its own word.
function parseWords(input) {
  if (!input) return [];

  // first pass: split on anything that isn't a letter or digit.
  const chunks = input.split(/[^A-Za-z0-9]+/).filter(Boolean);

  const words = [];
  for (const chunk of chunks) {
    // split camelCase and acronym boundaries
    // insert a space:
    //   between a lowercase/digit and an uppercase           (aB)
    //   between two uppercases when followed by a lowercase  (ABc -> A Bc)
    const spaced = chunk
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

    for (const w of spaced.split(/\s+/)) {
      if (w) words.push(w);
    }
  }
  return words;
}

// converters. each takes the list of parsed words.
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
const low = (w) => w.toLowerCase();
const up  = (w) => w.toUpperCase();

const converters = [
  {
    key: "camelCase",
    fn: (ws) => ws.length === 0 ? "" :
      low(ws[0]) + ws.slice(1).map(cap).join(""),
  },
  {
    key: "PascalCase",
    fn: (ws) => ws.map(cap).join(""),
  },
  {
    key: "snake_case",
    fn: (ws) => ws.map(low).join("_"),
  },
  {
    key: "CONSTANT_CASE",
    fn: (ws) => ws.map(up).join("_"),
  },
  {
    key: "kebab-case",
    fn: (ws) => ws.map(low).join("-"),
  },
  {
    key: "Title Case",
    fn: (ws) => ws.map(cap).join(" "),
  },
  {
    key: "Sentence case",
    fn: (ws) => {
      if (ws.length === 0) return "";
      const lowered = ws.map(low);
      lowered[0] = cap(lowered[0]);
      return lowered.join(" ");
    },
  },
  {
    key: "dot.case",
    fn: (ws) => ws.map(low).join("."),
  },
  {
    key: "path/case",
    fn: (ws) => ws.map(low).join("/"),
  },
  {
    key: "no space",
    fn: (ws) => ws.map(low).join(""),
  },
];

// dom
const $src = document.getElementById("src");
const $results = document.getElementById("results");
const $count = document.getElementById("wordCount");
const $clear = document.getElementById("clear");
const $toast = document.getElementById("toast");

// build the rows once
const rowEls = converters.map(({ key }) => {
  const row = document.createElement("div");
  row.className = "row";
  row.setAttribute("role", "button");
  row.setAttribute("tabindex", "0");
  row.dataset.key = key;

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = key;

  const value = document.createElement("div");
  value.className = "value";
  value.textContent = "";

  row.appendChild(label);
  row.appendChild(value);
  $results.appendChild(row);

  row.addEventListener("click", () => copyRow(row));
  row.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copyRow(row);
    }
  });

  return { key, row, value };
});

function render() {
  const words = parseWords($src.value);
  $count.textContent = words.length === 1 ? "1 word" : `${words.length} words`;

  for (const { key, value } of rowEls) {
    const conv = converters.find((c) => c.key === key);
    const out = conv.fn(words);
    if (out === "") {
      value.textContent = "(empty)";
      value.classList.add("empty");
    } else {
      value.textContent = out;
      value.classList.remove("empty");
    }
  }
}

let toastTimer = null;
function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.classList.remove("show"), 1200);
}

function copyRow(row) {
  const valueEl = row.querySelector(".value");
  const text = valueEl.classList.contains("empty") ? "" : valueEl.textContent;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    row.classList.add("copied");
    setTimeout(() => row.classList.remove("copied"), 600);
    showToast(`copied ${row.dataset.key}`);
  }).catch(() => {
    // fallback for older browsers / file:// in some setups
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); showToast(`copied ${row.dataset.key}`); }
    catch (_) { showToast("copy failed"); }
    document.body.removeChild(ta);
  });
}

$src.addEventListener("input", render);
$clear.addEventListener("click", () => {
  $src.value = "";
  $src.focus();
  render();
});

render();
