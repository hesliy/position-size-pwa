// =========================
// DEFAULT SETTINGS
// =========================

const DEFAULT_SETTINGS = {
  risk: {
    maxRiskPerTrade: 100,
    maxContracts: 8
  },
  presets: {
    distances: [6, 8, 10, 12, 15, 20]
  },
  ladder: {
    mode: "coarse",
    coarseStep: 0.5,
    coarseRange: 1.5,
    fineStep: 0.1,
    fineRange: 0.4
  },
  table: {
    minStop: 1,
    maxStop: 30,
    step: 0.5
  },
  appearance: {
    theme: "dark"
  }
};


// =========================
// APP STATE
// =========================

const state = {
  activeTab: "execution",
  activeSettingsCategory: "risk",
  sessionLocked: false,
  stopDistance: "",
  settings: null
};

// =========================
// SETTINGS STORAGE
// =========================

const SETTINGS_STORAGE_KEY = "mnq-size-pwa-settings";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadSettings() {
  const fallback = deepClone(DEFAULT_SETTINGS);

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);

    return {
      ...fallback,
      ...parsed,
      risk: {
        ...fallback.risk,
        ...(parsed.risk || {})
      },
      presets: {
        ...fallback.presets,
        ...(parsed.presets || {})
      },
      ladder: {
        ...fallback.ladder,
        ...(parsed.ladder || {})
      },
      table: {
        ...fallback.table,
        ...(parsed.table || {})
      },
      appearance: {
        ...fallback.appearance,
        ...(parsed.appearance || {})
      }
    };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return fallback;
  }
}

function saveSettings() {
  if (!state.settings) {
    return;
  }

  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(state.settings)
    );
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

function updateSetting(path, value) {
  const [section, key] = path;

  if (!state.settings[section]) {
    return;
  }

  state.settings[section][key] = value;
  saveSettings();
  refreshShareLink();
}


// =========================
// DOM REFERENCES
// =========================

const tabExecutionBtn = document.getElementById("tabExecution");
const tabTableBtn = document.getElementById("tabTable");
const tabSettingsBtn = document.getElementById("tabSettings");

const executionPanel = document.getElementById("executionPanel");
const tablePanel = document.getElementById("tablePanel");
const settingsPanel = document.getElementById("settingsPanel");

const lockBtn = document.getElementById("lockSessionBtn");

const presetButtonsContainer = document.getElementById("presetButtons");
const stopDistanceInput = document.getElementById("stopDistanceInput");
const riskAmountDisplay = document.getElementById("riskAmountDisplay");

const contractsDisplay = document.getElementById("contractsDisplay");
const totalRiskDisplay = document.getElementById("totalRiskDisplay");
const perContractRiskDisplay = document.getElementById("perContractRiskDisplay");

const exactContractsDisplay = document.getElementById("exactContractsDisplay");
const safeContractsDisplay = document.getElementById("safeContractsDisplay");
const cappedContractsDisplay = document.getElementById("cappedContractsDisplay");

const manualSaveBtn = document.getElementById("manualSaveBtn");
const settingsStatusText = document.getElementById("settingsStatusText");

const riskAmountSlider = document.getElementById("riskAmountSlider");
const riskAmountInput = document.getElementById("riskAmountInput");
const riskAmountValueLabel = document.getElementById("riskAmountValueLabel");

const maxContractsSlider = document.getElementById("maxContractsSlider");
const maxContractsInput = document.getElementById("maxContractsInput");
const maxContractsValueLabel = document.getElementById("maxContractsValueLabel");
const presetDistancesInput = document.getElementById("presetDistancesInput");

const sizingTableBody = document.getElementById("sizingTableBody");

const ladderTabCoarse = document.getElementById("ladderTabCoarse");
const ladderTabFine = document.getElementById("ladderTabFine");
const ladderContent = document.getElementById("ladderContent");

const coarseStepSlider = document.getElementById("coarseStepSlider");
const coarseStepInput = document.getElementById("coarseStepInput");
const coarseStepValueLabel = document.getElementById("coarseStepValueLabel");

const coarseRangeSlider = document.getElementById("coarseRangeSlider");
const coarseRangeInput = document.getElementById("coarseRangeInput");
const coarseRangeValueLabel = document.getElementById("coarseRangeValueLabel");

const fineStepSlider = document.getElementById("fineStepSlider");
const fineStepInput = document.getElementById("fineStepInput");
const fineStepValueLabel = document.getElementById("fineStepValueLabel");

const fineRangeSlider = document.getElementById("fineRangeSlider");
const fineRangeInput = document.getElementById("fineRangeInput");
const fineRangeValueLabel = document.getElementById("fineRangeValueLabel");

const tableMinStopSlider = document.getElementById("tableMinStopSlider");
const tableMinStopInput = document.getElementById("tableMinStopInput");
const tableMinStopValueLabel = document.getElementById("tableMinStopValueLabel");

const tableMaxStopSlider = document.getElementById("tableMaxStopSlider");
const tableMaxStopInput = document.getElementById("tableMaxStopInput");
const tableMaxStopValueLabel = document.getElementById("tableMaxStopValueLabel");

const tableStepSlider = document.getElementById("tableStepSlider");
const tableStepInput = document.getElementById("tableStepInput");
const tableStepValueLabel = document.getElementById("tableStepValueLabel");

const settingsPanelTitle = document.getElementById("settingsPanelTitle");

const settingsNavRisk = document.getElementById("settingsNavRisk");
const settingsNavPresets = document.getElementById("settingsNavPresets");
const settingsNavLadder = document.getElementById("settingsNavLadder");
const settingsNavTable = document.getElementById("settingsNavTable");
const settingsNavSync = document.getElementById("settingsNavSync");
const settingsNavInstall = document.getElementById("settingsNavInstall");
const settingsNavHotkeys = document.getElementById("settingsNavHotkeys");
const settingsNavAppearance = document.getElementById("settingsNavAppearance");

const settingsCategoryRisk = document.getElementById("settingsCategoryRisk");
const settingsCategoryPresets = document.getElementById("settingsCategoryPresets");
const settingsCategoryLadder = document.getElementById("settingsCategoryLadder");
const settingsCategoryTable = document.getElementById("settingsCategoryTable");
const settingsCategorySync = document.getElementById("settingsCategorySync");
const settingsCategoryInstall = document.getElementById("settingsCategoryInstall");
const settingsCategoryHotkeys = document.getElementById("settingsCategoryHotkeys");
const settingsCategoryAppearance = document.getElementById("settingsCategoryAppearance");

const exportSettingsBtn = document.getElementById("exportSettingsBtn");
const importSettingsInput = document.getElementById("importSettingsInput");
const shareLinkOutput = document.getElementById("shareLinkOutput");
const copyShareLinkBtn = document.getElementById("copyShareLinkBtn");


// =========================
// SETTINGS UI HELPERS
// =========================

let settingsStatusTimer = null;

function setSettingsStatus(message) {
  settingsStatusText.textContent = message;

  if (settingsStatusTimer) {
    clearTimeout(settingsStatusTimer);
  }

  settingsStatusTimer = setTimeout(() => {
    settingsStatusText.textContent = "Settings ready.";
  }, 1800);
}

function syncRiskControls() {
  const risk = state.settings?.risk?.maxRiskPerTrade ?? DEFAULT_SETTINGS.risk.maxRiskPerTrade;

  riskAmountSlider.value = String(risk);
  riskAmountInput.value = String(risk);
  riskAmountValueLabel.textContent = String(risk);
}

function syncMaxContractsControls() {
  const maxContracts = state.settings?.risk?.maxContracts ?? DEFAULT_SETTINGS.risk.maxContracts;

  maxContractsSlider.value = String(maxContracts);
  maxContractsInput.value = String(maxContracts);
  maxContractsValueLabel.textContent = String(maxContracts);
}

function parsePresetDistances(rawValue) {
  const parsed = rawValue
    .split(",")
    .map((part) => Number.parseFloat(part.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  const uniqueSorted = [...new Set(parsed)].sort((a, b) => a - b);

  return uniqueSorted;
}

function syncPresetControls() {
  const presets = state.settings?.presets?.distances ?? DEFAULT_SETTINGS.presets.distances;
  presetDistancesInput.value = presets.join(", ");
}

function syncLadderControls() {
  const ladder = state.settings?.ladder ?? DEFAULT_SETTINGS.ladder;

  coarseStepSlider.value = String(ladder.coarseStep);
  coarseStepInput.value = String(ladder.coarseStep);
  coarseStepValueLabel.textContent = String(ladder.coarseStep);

  coarseRangeSlider.value = String(ladder.coarseRange);
  coarseRangeInput.value = String(ladder.coarseRange);
  coarseRangeValueLabel.textContent = String(ladder.coarseRange);

  fineStepSlider.value = String(ladder.fineStep);
  fineStepInput.value = String(ladder.fineStep);
  fineStepValueLabel.textContent = String(ladder.fineStep);

  fineRangeSlider.value = String(ladder.fineRange);
  fineRangeInput.value = String(ladder.fineRange);
  fineRangeValueLabel.textContent = String(ladder.fineRange);
}

function syncTableControls() {
  const table = state.settings?.table ?? DEFAULT_SETTINGS.table;

  tableMinStopSlider.value = String(table.minStop);
  tableMinStopInput.value = String(table.minStop);
  tableMinStopValueLabel.textContent = String(table.minStop);

  tableMaxStopSlider.value = String(table.maxStop);
  tableMaxStopInput.value = String(table.maxStop);
  tableMaxStopValueLabel.textContent = String(table.maxStop);

  tableStepSlider.value = String(table.step);
  tableStepInput.value = String(table.step);
  tableStepValueLabel.textContent = String(table.step);
}

function renderPresetButtons() {
  const presets = state.settings?.presets?.distances ?? DEFAULT_SETTINGS.presets.distances;

  presetButtonsContainer.innerHTML = "";

  presets.forEach((distance) => {
    const button = document.createElement("button");
    button.className = "preset-button";
    button.type = "button";
    button.dataset.distance = String(distance);
    button.textContent = String(distance);

    if (String(distance) === String(state.stopDistance)) {
      button.classList.add("active");
    }

    if (state.sessionLocked) {
      button.disabled = true;
      button.classList.add("disabled");
    }

    presetButtonsContainer.appendChild(button);
  });
}

function syncSettingsControls() {
  syncRiskControls();
  syncMaxContractsControls();
  syncPresetControls();
  syncLadderControls();
  syncTableControls();
}

function applyImportedSettings(nextSettings) {
  const fallback = deepClone(DEFAULT_SETTINGS);

  state.settings = {
    ...fallback,
    ...nextSettings,
    risk: {
      ...fallback.risk,
      ...(nextSettings.risk || {})
    },
    presets: {
      ...fallback.presets,
      ...(nextSettings.presets || {})
    },
    ladder: {
      ...fallback.ladder,
      ...(nextSettings.ladder || {})
    },
    table: {
      ...fallback.table,
      ...(nextSettings.table || {})
    },
    appearance: {
      ...fallback.appearance,
      ...(nextSettings.appearance || {})
    }
  };

  saveSettings();
  syncSettingsControls();
  renderPresetButtons();
  updateActivePreset();
  renderAnswerCard();
  buildSizingTable();
  renderLadder();
  applyLockState();
  refreshShareLink();
}

function encodeSettingsForShare(settingsObject) {
  return encodeURIComponent(
    btoa(JSON.stringify(settingsObject))
  );
}

function decodeSharedSettings(encodedValue) {
  return JSON.parse(atob(decodeURIComponent(encodedValue)));
}

function buildShareLink() {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const encoded = encodeSettingsForShare(state.settings);
  return `${baseUrl}?settings=${encoded}`;
}

function refreshShareLink() {
  if (!shareLinkOutput || !state.settings) {
    return;
  }

  shareLinkOutput.value = buildShareLink();
}

function exportSettingsToFile() {
  const blob = new Blob(
    [JSON.stringify(state.settings, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  link.href = url;
  link.download = `mnq-size-settings-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

async function copyShareLink() {
  if (!shareLinkOutput?.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(shareLinkOutput.value);
    setSettingsStatus("Share link copied.");
  } catch (error) {
    console.error("Failed to copy share link:", error);
    setSettingsStatus("Could not copy share link.");
  }
}

function importSettingsFromFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      applyImportedSettings(parsed);
      setSettingsStatus("Settings imported and saved.");
    } catch (error) {
      console.error("Failed to import settings:", error);
      setSettingsStatus("Import failed.");
    }
  };

  reader.readAsText(file);
}

function maybeApplySharedSettingsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("settings");

  if (!encoded) {
    refreshShareLink();
    return;
  }

  try {
    const parsed = decodeSharedSettings(encoded);
    applyImportedSettings(parsed);
    setSettingsStatus("Shared settings imported.");

    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, "", cleanUrl);
  } catch (error) {
    console.error("Failed to apply shared settings from URL:", error);
    setSettingsStatus("Shared settings could not be imported.");
  }
}


// =========================
// CALCULATION HELPERS
// =========================

function parseStopDistance(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function calculateMnqPositionSize(riskAmount, stopDistance) {
  if (!Number.isFinite(riskAmount) || riskAmount <= 0) {
    return null;
  }

  if (!Number.isFinite(stopDistance) || stopDistance <= 0) {
    return null;
  }

  const riskPerContract = stopDistance * 2;
  const exactContracts = riskAmount / riskPerContract;
  const safeContracts = Math.floor(exactContracts);

  let cappedContracts = safeContracts;

  const maxContracts = state.settings?.risk?.maxContracts;

  if (Number.isFinite(maxContracts) && maxContracts > 0) {
    cappedContracts = Math.min(safeContracts, maxContracts);
  }

  const totalRisk = cappedContracts > 0
    ? cappedContracts * riskPerContract
    : 0;

  return {
    riskPerContract,
    exactContracts,
    safeContracts,
    cappedContracts,
    totalRisk
  };
}

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return value.toFixed(decimals);
}

function resetAnswerCard() {
  contractsDisplay.textContent = "--";
  totalRiskDisplay.textContent = "--";
  perContractRiskDisplay.textContent = "--";
  exactContractsDisplay.textContent = "--";
  safeContractsDisplay.textContent = "--";
  cappedContractsDisplay.textContent = "--";
}

function renderAnswerCard() {
  const riskAmount = state.settings?.risk?.maxRiskPerTrade ?? 0;

  riskAmountDisplay.textContent = formatNumber(riskAmount, 0);

  const stopDistance = parseStopDistance(state.stopDistance);

  if (!stopDistance) {
    resetAnswerCard();
    renderLadder();
    return;
  }

  const result = calculateMnqPositionSize(riskAmount, stopDistance);

  if (!result) {
    resetAnswerCard();
    renderLadder();
    return;
  }

  contractsDisplay.textContent = result.cappedContracts;
  totalRiskDisplay.textContent = formatNumber(result.totalRisk, 2);
  perContractRiskDisplay.textContent = formatNumber(result.riskPerContract, 2);

  exactContractsDisplay.textContent = formatNumber(result.exactContracts, 2);
  safeContractsDisplay.textContent = result.safeContracts;
  cappedContractsDisplay.textContent = result.cappedContracts;
  renderLadder();
}


// =========================
// TABLE GENERATION
// =========================

function buildSizingTable() {
  if (!sizingTableBody) return;

  const riskAmount = state.settings?.risk?.maxRiskPerTrade ?? 0;
  const minStop = state.settings?.table?.minStop ?? 1;
  const maxStop = state.settings?.table?.maxStop ?? 30;
  const step = state.settings?.table?.step ?? 0.5;

  sizingTableBody.innerHTML = "";

  for (let stop = minStop; stop <= maxStop; stop += step) {
    const result = calculateMnqPositionSize(riskAmount, stop);

    if (!result) continue;

    const row = document.createElement("tr");

    const stopCell = document.createElement("td");
    stopCell.textContent = stop.toFixed(1);

    const contractsCell = document.createElement("td");
    contractsCell.textContent = result.cappedContracts;

    const riskCell = document.createElement("td");
    riskCell.textContent = `$${formatNumber(result.totalRisk, 2)}`;

    row.appendChild(stopCell);
    row.appendChild(contractsCell);
    row.appendChild(riskCell);

    sizingTableBody.appendChild(row);
  }
}


// =========================
// LADDER GENERATION
// =========================

function roundToStep(value, step) {
  const precision = step.toString().includes(".")
    ? step.toString().split(".")[1].length
    : 0;

  return Number((Math.round(value / step) * step).toFixed(precision));
}

function buildLadderValues(centerValue, step, range) {
  const values = [];
  const start = centerValue - range;
  const end = centerValue + range;

  for (let value = start; value <= end + (step / 2); value += step) {
    const rounded = roundToStep(value, step);

    if (rounded > 0) {
      values.push(rounded);
    }
  }

  const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
  return uniqueValues;
}

function setLadderMode(mode) {
  state.settings.ladder.mode = mode;
  saveSettings();

  ladderTabCoarse.classList.toggle("active", mode === "coarse");
  ladderTabFine.classList.toggle("active", mode === "fine");

  ladderTabCoarse.setAttribute("aria-pressed", mode === "coarse");
  ladderTabFine.setAttribute("aria-pressed", mode === "fine");

  renderLadder();
}

function renderLadder() {
  if (!ladderContent) {
    return;
  }

  const stopDistance = parseStopDistance(state.stopDistance);

  if (!stopDistance) {
    ladderContent.innerHTML = `
      <p class="ladder-placeholder">Enter a stop distance to populate the ladder.</p>
    `;
    return;
  }

  const riskAmount = state.settings?.risk?.maxRiskPerTrade ?? 0;
  const mode = state.settings?.ladder?.mode ?? "coarse";

  const step = mode === "fine"
    ? (state.settings?.ladder?.fineStep ?? 0.1)
    : (state.settings?.ladder?.coarseStep ?? 0.5);

  const range = mode === "fine"
    ? (state.settings?.ladder?.fineRange ?? 0.4)
    : (state.settings?.ladder?.coarseRange ?? 1.5);

  const ladderValues = buildLadderValues(stopDistance, step, range);

  ladderContent.innerHTML = "";

  const ladderGrid = document.createElement("div");
  ladderGrid.className = "ladder-grid";

  ladderValues.forEach((value) => {
    const result = calculateMnqPositionSize(riskAmount, value);

    if (!result) {
      return;
    }

    const item = document.createElement("button");
    item.type = "button";
    item.className = "ladder-item";
    item.dataset.distance = String(value);

    if (String(value) === String(stopDistance)) {
      item.classList.add("active");
    }

    if (state.sessionLocked) {
      item.disabled = true;
      item.classList.add("disabled");
    }

    item.innerHTML = `
      <span class="ladder-distance">${formatNumber(value, step < 1 ? 1 : 0)} pts</span>
      <span class="ladder-contracts">${result.cappedContracts} contracts</span>
      <span class="ladder-risk">$${formatNumber(result.totalRisk, 2)}</span>
    `;

    ladderGrid.appendChild(item);
  });

  ladderContent.appendChild(ladderGrid);
}


// =========================
// SETTINGS CATEGORY SWITCHING
// =========================

function setActiveSettingsCategory(categoryName) {
  state.activeSettingsCategory = categoryName;

  const categoryMap = {
    risk: {
      button: settingsNavRisk,
      panel: settingsCategoryRisk,
      title: "Risk & Limits"
    },
    presets: {
      button: settingsNavPresets,
      panel: settingsCategoryPresets,
      title: "Presets"
    },
    ladder: {
      button: settingsNavLadder,
      panel: settingsCategoryLadder,
      title: "Ladder"
    },
    table: {
      button: settingsNavTable,
      panel: settingsCategoryTable,
      title: "Sizing Table"
    },
    sync: {
      button: settingsNavSync,
      panel: settingsCategorySync,
      title: "Sync & Transfer"
    },
    install: {
      button: settingsNavInstall,
      panel: settingsCategoryInstall,
      title: "Install"
    },
    hotkeys: {
      button: settingsNavHotkeys,
      panel: settingsCategoryHotkeys,
      title: "Hotkeys"
    },
    appearance: {
      button: settingsNavAppearance,
      panel: settingsCategoryAppearance,
      title: "Appearance"
    }
  };

  Object.entries(categoryMap).forEach(([key, config]) => {
    const isActive = key === categoryName;
    config.button.classList.toggle("active", isActive);
    config.panel.hidden = !isActive;
  });

  settingsPanelTitle.textContent = categoryMap[categoryName]?.title ?? "Settings";
}


// =========================
// TAB SWITCHING
// =========================

function setActiveTab(tabName) {
  state.activeTab = tabName;

  const isExecution = tabName === "execution";
  const isTable = tabName === "table";
  const isSettings = tabName === "settings";

  tabExecutionBtn.classList.toggle("active", isExecution);
  tabTableBtn.classList.toggle("active", isTable);
  tabSettingsBtn.classList.toggle("active", isSettings);

  tabExecutionBtn.setAttribute("aria-pressed", isExecution);
  tabTableBtn.setAttribute("aria-pressed", isTable);
  tabSettingsBtn.setAttribute("aria-pressed", isSettings);

  executionPanel.classList.toggle("active", isExecution);
  tablePanel.classList.toggle("active", isTable);
  settingsPanel.classList.toggle("active", isSettings);

  executionPanel.hidden = !isExecution;
  tablePanel.hidden = !isTable;
  settingsPanel.hidden = !isSettings;

  if (tabName === "table") {
  buildSizingTable();
}
}


// =========================
// LOCK STATE APPLICATION
// =========================

function applyLockState() {
  const locked = state.sessionLocked;

  // Execution inputs
  stopDistanceInput.disabled = locked;

  const presetButtons = presetButtonsContainer.querySelectorAll(".preset-button");
  presetButtons.forEach((btn) => {
    btn.disabled = locked;
    btn.classList.toggle("disabled", locked);
  });

  // Settings inputs
  riskAmountSlider.disabled = locked;
  riskAmountInput.disabled = locked;

  maxContractsSlider.disabled = locked;
  maxContractsInput.disabled = locked;

  presetDistancesInput.disabled = locked;

  coarseStepSlider.disabled = locked;
  coarseStepInput.disabled = locked;
  coarseRangeSlider.disabled = locked;
  coarseRangeInput.disabled = locked;

  fineStepSlider.disabled = locked;
  fineStepInput.disabled = locked;
  fineRangeSlider.disabled = locked;
  fineRangeInput.disabled = locked;

  tableMinStopSlider.disabled = locked;
  tableMinStopInput.disabled = locked;
  tableMaxStopSlider.disabled = locked;
  tableMaxStopInput.disabled = locked;
  tableStepSlider.disabled = locked;
  tableStepInput.disabled = locked;

  importSettingsInput.disabled = locked;
  exportSettingsBtn.disabled = locked;
  copyShareLinkBtn.disabled = locked;

  // Optional visual feedback
  document.body.classList.toggle("session-locked", locked);
}


// =========================
// SESSION LOCK TOGGLE
// =========================

function toggleSessionLock() {
  state.sessionLocked = !state.sessionLocked;

  lockBtn.textContent = state.sessionLocked
    ? "Session Locked"
    : "Session Unlocked";

  lockBtn.setAttribute("aria-pressed", state.sessionLocked);
  lockBtn.classList.toggle("locked", state.sessionLocked);

  applyLockState();
}


// =========================
// SETTINGS ACTIONS
// =========================

function applyRiskAmount(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return;
  }

  updateSetting(["risk", "maxRiskPerTrade"], parsed);
  syncRiskControls();
  renderAnswerCard();
  setSettingsStatus("Risk setting auto-saved.");
  buildSizingTable();
  renderLadder();
}

function applyMaxContracts(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return;
  }

  updateSetting(["risk", "maxContracts"], parsed);
  syncMaxContractsControls();
  renderAnswerCard();
  setSettingsStatus("Max contracts setting auto-saved.");
  buildSizingTable();
  renderLadder();
}

function handleRiskSliderInput(event) {
  applyRiskAmount(event.target.value);
}

function handleRiskInputChange(event) {
  applyRiskAmount(event.target.value);
}

function handleMaxContractsSliderInput(event) {
  applyMaxContracts(event.target.value);
}

function handleMaxContractsInputChange(event) {
  applyMaxContracts(event.target.value);
}

function applyPresetDistances(rawValue) {
  const parsed = parsePresetDistances(rawValue);

  if (!parsed.length) {
    return;
  }

  updateSetting(["presets", "distances"], parsed);
  renderPresetButtons();
  updateActivePreset();
  renderLadder();
  setSettingsStatus("Preset distances auto-saved.");
}

function handlePresetDistancesInput(event) {
  applyPresetDistances(event.target.value);
}

function handlePresetDistancesBlur() {
  syncPresetControls();
}

function applyLadderSetting(key, value, minValue = 0.1) {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < minValue) {
    return;
  }

  updateSetting(["ladder", key], parsed);
  syncLadderControls();
  renderLadder();
  setSettingsStatus("Ladder setting auto-saved.");
}

function applyTableSetting(key, value, minValue = 0.1) {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < minValue) {
    return;
  }

  const nextTable = {
    ...state.settings.table,
    [key]: parsed
  };

  if (nextTable.minStop >= nextTable.maxStop) {
    return;
  }

  updateSetting(["table", key], parsed);
  syncTableControls();
  buildSizingTable();
  setSettingsStatus("Table setting auto-saved.");
}

function handleCoarseStepInput(event) {
  applyLadderSetting("coarseStep", event.target.value, 0.1);
}

function handleCoarseRangeInput(event) {
  applyLadderSetting("coarseRange", event.target.value, 0.1);
}

function handleFineStepInput(event) {
  applyLadderSetting("fineStep", event.target.value, 0.1);
}

function handleFineRangeInput(event) {
  applyLadderSetting("fineRange", event.target.value, 0.1);
}

function handleTableMinStopInput(event) {
  applyTableSetting("minStop", event.target.value, 0.1);
}

function handleTableMaxStopInput(event) {
  applyTableSetting("maxStop", event.target.value, 0.1);
}

function handleTableStepInput(event) {
  applyTableSetting("step", event.target.value, 0.1);
}

function handleManualSaveClick() {
  saveSettings();
  setSettingsStatus("Settings saved.");
}

function handleExportSettingsClick() {
  exportSettingsToFile();
  setSettingsStatus("Settings exported.");
}

function handleImportSettingsChange(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  importSettingsFromFile(file);
  event.target.value = "";
}

function handleCopyShareLinkClick() {
  copyShareLink();
}


// =========================
// INPUT + PRESET ACTIONS
// =========================

function updateActivePreset() {
  const currentValue = String(state.stopDistance);

  const presetButtons = presetButtonsContainer.querySelectorAll(".preset-button");

  presetButtons.forEach((button) => {
    const isActive = button.dataset.distance === currentValue;
    button.classList.toggle("active", isActive);
  });
}

function setStopDistance(value) {
  state.stopDistance = String(value);
  stopDistanceInput.value = String(value);
  updateActivePreset();
  renderAnswerCard();
}

function handleStopDistanceInput(event) {
  state.stopDistance = event.target.value.trim();
  updateActivePreset();
  renderAnswerCard();
}

function handlePresetClick(event) {
  const button = event.target.closest(".preset-button");

  if (!button) {
    return;
  }

  const distance = button.dataset.distance;

  if (!distance) {
    return;
  }

  setStopDistance(distance);
  stopDistanceInput.focus();
}

function handleLadderClick(event) {
  const button = event.target.closest(".ladder-item");

  if (!button || button.disabled) {
    return;
  }

  const distance = button.dataset.distance;

  if (!distance) {
    return;
  }

  setStopDistance(distance);
  stopDistanceInput.focus();
}


// =========================
// EVENT LISTENERS
// =========================

tabExecutionBtn.addEventListener("click", () => {
  setActiveTab("execution");
});

tabTableBtn.addEventListener("click", () => {
  setActiveTab("table");
});

tabSettingsBtn.addEventListener("click", () => {
  setActiveTab("settings");
});

settingsNavRisk.addEventListener("click", () => {
  setActiveSettingsCategory("risk");
});

settingsNavPresets.addEventListener("click", () => {
  setActiveSettingsCategory("presets");
});

settingsNavLadder.addEventListener("click", () => {
  setActiveSettingsCategory("ladder");
});

settingsNavTable.addEventListener("click", () => {
  setActiveSettingsCategory("table");
});

settingsNavSync.addEventListener("click", () => {
  setActiveSettingsCategory("sync");
});

settingsNavInstall.addEventListener("click", () => {
  setActiveSettingsCategory("install");
});

settingsNavHotkeys.addEventListener("click", () => {
  setActiveSettingsCategory("hotkeys");
});

settingsNavAppearance.addEventListener("click", () => {
  setActiveSettingsCategory("appearance");
});

lockBtn.addEventListener("click", toggleSessionLock);
manualSaveBtn.addEventListener("click", handleManualSaveClick);

exportSettingsBtn.addEventListener("click", handleExportSettingsClick);
importSettingsInput.addEventListener("change", handleImportSettingsChange);
copyShareLinkBtn.addEventListener("click", handleCopyShareLinkClick);

stopDistanceInput.addEventListener("input", handleStopDistanceInput);
presetButtonsContainer.addEventListener("click", handlePresetClick);

riskAmountSlider.addEventListener("input", handleRiskSliderInput);
riskAmountInput.addEventListener("input", handleRiskInputChange);

maxContractsSlider.addEventListener("input", handleMaxContractsSliderInput);
maxContractsInput.addEventListener("input", handleMaxContractsInputChange);

coarseStepSlider.addEventListener("input", handleCoarseStepInput);
coarseStepInput.addEventListener("input", handleCoarseStepInput);

coarseRangeSlider.addEventListener("input", handleCoarseRangeInput);
coarseRangeInput.addEventListener("input", handleCoarseRangeInput);

fineStepSlider.addEventListener("input", handleFineStepInput);
fineStepInput.addEventListener("input", handleFineStepInput);

fineRangeSlider.addEventListener("input", handleFineRangeInput);
fineRangeInput.addEventListener("input", handleFineRangeInput);

tableMinStopSlider.addEventListener("input", handleTableMinStopInput);
tableMinStopInput.addEventListener("input", handleTableMinStopInput);

tableMaxStopSlider.addEventListener("input", handleTableMaxStopInput);
tableMaxStopInput.addEventListener("input", handleTableMaxStopInput);

tableStepSlider.addEventListener("input", handleTableStepInput);
tableStepInput.addEventListener("input", handleTableStepInput);

presetDistancesInput.addEventListener("input", handlePresetDistancesInput);
presetDistancesInput.addEventListener("blur", handlePresetDistancesBlur);

ladderTabCoarse.addEventListener("click", () => {
  setLadderMode("coarse");
});

ladderTabFine.addEventListener("click", () => {
  setLadderMode("fine");
});

ladderContent.addEventListener("click", handleLadderClick);


// =========================
// INITIALIZE
// =========================

state.settings = loadSettings();
saveSettings();

syncSettingsControls();
renderPresetButtons();
setLadderMode(state.settings?.ladder?.mode ?? "coarse");
setActiveSettingsCategory(state.activeSettingsCategory);
setActiveTab("execution");
updateActivePreset();
renderAnswerCard();
applyLockState();
buildSizingTable();
maybeApplySharedSettingsFromUrl();
refreshShareLink();