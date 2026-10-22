/**
 * app.js
 * =============================================================================
 * Linear Algebra Lab // Matrix Workbench (Project 18)
 * Frontend Controller for dynamic matrix grid, keyboard navigation,
 * AJAX analysis calls, and sequential 7-stage Stitch rendering.
 * =============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    rows: 3,
    cols: 3,
    gridData: [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"]
    ],
    presets: []
  };

  // DOM Elements
  const inputRows = document.getElementById("input-rows");
  const inputCols = document.getElementById("input-cols");
  const btnRowMinus = document.getElementById("btn-row-minus");
  const btnRowPlus = document.getElementById("btn-row-plus");
  const btnColMinus = document.getElementById("btn-col-minus");
  const btnColPlus = document.getElementById("btn-col-plus");
  const matrixGrid = document.getElementById("matrix-grid");
  const matrixDimLabel = document.getElementById("matrix-dim-label");
  const transformationMapping = document.getElementById("transformation-mapping");
  const transformationDims = document.getElementById("transformation-dims");

  const btnAnalyze = document.getElementById("btn-analyze");
  const btnSpinner = document.getElementById("btn-spinner");
  const btnClearGrid = document.getElementById("btn-clear-grid");
  const btnIdentityGrid = document.getElementById("btn-identity-grid");
  const btnRandomGrid = document.getElementById("btn-random-grid");

  const errorBanner = document.getElementById("error-banner");
  const errorMessage = document.getElementById("error-message");
  const btnCloseError = document.getElementById("btn-close-error");

  const stagesContainer = document.getElementById("stages-container");
  const pipelineStepper = document.getElementById("pipeline-stepper");

  const btnTheoryModal = document.getElementById("btn-theory-modal");
  const btnPrintReport = document.getElementById("btn-print-report");
  const theoryModal = document.getElementById("theory-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnModalDone = document.getElementById("btn-modal-done");

  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-text");

  // ---------------------------------------------------------------------------
  // 1. Theme Switcher (Academic Light / Technical Dark)
  // ---------------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem("stitch_theme") || "light";
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("stitch_theme", theme);
    if (theme === "dark") {
      themeIcon.textContent = "☀";
      themeText.textContent = "Light";
    } else {
      themeIcon.textContent = "☾";
      themeText.textContent = "Dark";
    }
  }

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(current === "dark" ? "light" : "dark");
  });

  // ---------------------------------------------------------------------------
  // 2. Matrix Grid Construction & Management
  // ---------------------------------------------------------------------------
  function updateTransformationLabels() {
    if (transformationMapping) {
      transformationMapping.textContent = `T : ℝ${getSuperscript(state.cols)} → ℝ${getSuperscript(state.rows)}`;
    }
    if (transformationDims) {
      transformationDims.textContent = `Domain: ℝ${getSuperscript(state.cols)} (n=${state.cols}) • Codomain: ℝ${getSuperscript(state.rows)} (m=${state.rows})`;
    }
  }

  function getSuperscript(num) {
    const sups = { "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "0": "⁰" };
    return String(num).split("").map(ch => sups[ch] || ch).join("");
  }

  function renderMatrixGrid() {
    matrixGrid.innerHTML = "";
    matrixGrid.style.gridTemplateColumns = `repeat(${state.cols}, 3.25rem)`;
    matrixDimLabel.textContent = `${state.rows} × ${state.cols}`;
    updateTransformationLabels();

    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "matrix-cell-input";
        input.id = `cell-${r}-${c}`;
        input.dataset.row = r;
        input.dataset.col = c;
        input.autocomplete = "off";
        input.spellcheck = false;

        let val = "0";
        if (state.gridData[r] && state.gridData[r][c] !== undefined) {
          val = state.gridData[r][c];
        }
        input.value = val;

        input.addEventListener("keydown", handleCellKeydown);
        input.addEventListener("input", (e) => {
          if (!state.gridData[r]) state.gridData[r] = [];
          state.gridData[r][c] = e.target.value.trim();
          input.classList.remove("invalid-cell");
        });

        matrixGrid.appendChild(input);
      }
    }
  }

  function handleCellKeydown(e) {
    const r = parseInt(e.target.dataset.row, 10);
    const c = parseInt(e.target.dataset.col, 10);

    if (e.key === "ArrowUp" && r > 0) {
      e.preventDefault();
      focusCell(r - 1, c);
    } else if (e.key === "ArrowDown" && r < state.rows - 1) {
      e.preventDefault();
      focusCell(r + 1, c);
    } else if (e.key === "ArrowLeft" && c > 0 && e.target.selectionStart === 0) {
      e.preventDefault();
      focusCell(r, c - 1);
    } else if (e.key === "ArrowRight" && c < state.cols - 1 && e.target.selectionEnd === e.target.value.length) {
      e.preventDefault();
      focusCell(r, c + 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      triggerAnalysis();
    }
  }

  function focusCell(r, c) {
    const target = document.getElementById(`cell-${r}-${c}`);
    if (target) {
      target.focus();
      target.select();
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Matrix Dimension Adjustments
  // ---------------------------------------------------------------------------
  function setDimensions(newRows, newCols) {
    newRows = Math.max(1, Math.min(8, newRows));
    newCols = Math.max(1, Math.min(8, newCols));

    // Preserve existing cell values
    const newGrid = [];
    for (let r = 0; r < newRows; r++) {
      const row = [];
      for (let c = 0; c < newCols; c++) {
        if (state.gridData[r] && state.gridData[r][c] !== undefined) {
          row.push(state.gridData[r][c]);
        } else {
          row.push(r === c ? "1" : "0");
        }
      }
      newGrid.push(row);
    }

    state.rows = newRows;
    state.cols = newCols;
    state.gridData = newGrid;

    inputRows.value = newRows;
    inputCols.value = newCols;

    // Update quick size pills
    document.querySelectorAll(".size-pill").forEach(pill => {
      const pm = parseInt(pill.dataset.m, 10);
      const pn = parseInt(pill.dataset.n, 10);
      if (pm === newRows && pn === newCols) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });

    renderMatrixGrid();
    hideError();
  }

  btnRowMinus.addEventListener("click", () => setDimensions(state.rows - 1, state.cols));
  btnRowPlus.addEventListener("click", () => setDimensions(state.rows + 1, state.cols));
  btnColMinus.addEventListener("click", () => setDimensions(state.rows, state.cols - 1));
  btnColPlus.addEventListener("click", () => setDimensions(state.rows, state.cols + 1));

  document.querySelectorAll(".size-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const m = parseInt(pill.dataset.m, 10);
      const n = parseInt(pill.dataset.n, 10);
      setDimensions(m, n);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Sample Presets Management
  // ---------------------------------------------------------------------------
  async function loadPresets() {
    try {
      const res = await fetch("/api/presets");
      const data = await res.json();
      if (data.success && data.presets) {
        state.presets = data.presets;
        bindPresetClicks();
      }
    } catch (err) {
      console.warn("Could not load presets dynamically:", err);
      bindPresetClicks();
    }
  }

  function bindPresetClicks() {
    document.querySelectorAll(".preset-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const id = chip.dataset.presetId;
        fetchPresetById(id, chip);
      });
    });
  }

  async function fetchPresetById(id, chipEl) {
    try {
      const res = await fetch("/api/presets");
      const data = await res.json();
      if (data.success) {
        const found = data.presets.find(p => p.id === id);
        if (found) applyPreset(found, chipEl);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function applyPreset(preset, chipEl) {
    document.querySelectorAll(".preset-chip").forEach(c => c.classList.remove("active-preset"));
    if (chipEl) chipEl.classList.add("active-preset");

    state.rows = preset.rows;
    state.cols = preset.cols;
    inputRows.value = preset.rows;
    inputCols.value = preset.cols;
    state.gridData = JSON.parse(JSON.stringify(preset.grid));

    document.querySelectorAll(".size-pill").forEach(pill => {
      const pm = parseInt(pill.dataset.m, 10);
      const pn = parseInt(pill.dataset.n, 10);
      if (pm === preset.rows && pn === preset.cols) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });

    renderMatrixGrid();
    hideError();

    // Automatically trigger analysis
    triggerAnalysis();
  }

  // ---------------------------------------------------------------------------
  // 5. Grid Helper Actions (Clear, Identity, Randomize)
  // ---------------------------------------------------------------------------
  btnClearGrid.addEventListener("click", () => {
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        state.gridData[r][c] = "0";
      }
    }
    renderMatrixGrid();
    hideError();
  });

  btnIdentityGrid.addEventListener("click", () => {
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        state.gridData[r][c] = (r === c) ? "1" : "0";
      }
    }
    renderMatrixGrid();
    hideError();
  });

  btnRandomGrid.addEventListener("click", () => {
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const rnd = Math.floor(Math.random() * 9) - 4; // -4 to 4
        state.gridData[r][c] = rnd.toString();
      }
    }
    renderMatrixGrid();
    hideError();
  });

  // Global shortcut: Ctrl+Enter or Cmd+Enter to analyze
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      triggerAnalysis();
    }
  });

  // ---------------------------------------------------------------------------
  // 6. Matrix Analysis & Sequential Stages Execution
  // ---------------------------------------------------------------------------
  btnAnalyze.addEventListener("click", triggerAnalysis);

  async function triggerAnalysis() {
    hideError();

    const currentGrid = [];
    let hasEmpty = false;

    for (let r = 0; r < state.rows; r++) {
      const row = [];
      for (let c = 0; c < state.cols; c++) {
        const cell = document.getElementById(`cell-${r}-${c}`);
        const val = cell ? cell.value.trim() : "";
        if (!val) {
          hasEmpty = true;
          if (cell) cell.classList.add("invalid-cell");
        }
        row.push(val);
      }
      currentGrid.push(row);
    }

    if (hasEmpty) {
      showError("Please fill in all matrix entries. No cell may be left empty.");
      return;
    }

    btnAnalyze.classList.add("loading");
    btnAnalyze.disabled = true;

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grid: currentGrid })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showError(result.error || "Failed to analyze matrix. Verify your input values.");
        return;
      }

      renderSequentialStages(result.stages);

      // Trigger MathJax typesetting
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([stagesContainer]).catch(err => {
          console.warn("MathJax typesetting notice:", err);
        });
      }

      // Smooth scroll to first stage
      const firstStage = document.getElementById("stage-card-1");
      if (firstStage) {
        firstStage.scrollIntoView({ behavior: "smooth", block: "start" });
      }

    } catch (networkErr) {
      showError("Connection error communicating with Python backend server: " + networkErr.message);
    } finally {
      btnAnalyze.classList.remove("loading");
      btnAnalyze.disabled = false;
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Render Stages using Stitch "Mathematical Workstation" Aesthetic
  // ---------------------------------------------------------------------------
  function renderSequentialStages(stages) {
    stagesContainer.innerHTML = "";

    stages.forEach((stage, idx) => {
      if (idx > 0) {
        const chainEl = document.createElement("div");
        chainEl.className = "stage-chain-connector";
        chainEl.innerHTML = `
          <span class="chain-line"></span>
          <span>Stage 0${idx + 1} derives from Stage 0${idx}</span>
          <span class="chain-line"></span>
        `;
        stagesContainer.appendChild(chainEl);
      }

      const card = document.createElement("div");
      card.className = `stage-card ${stage.stage_number === 7 ? "stage-7-banner" : ""}`;
      card.id = `stage-card-${stage.stage_number}`;

      switch (stage.stage_number) {
        case 1:
          card.innerHTML = buildStage1HTML(stage);
          break;
        case 2:
          card.innerHTML = buildStage2HTML(stage);
          break;
        case 3:
          card.innerHTML = buildStage3HTML(stage);
          break;
        case 4:
          card.innerHTML = buildStage4HTML(stage);
          break;
        case 5:
          card.innerHTML = buildStage5HTML(stage);
          break;
        case 6:
          card.innerHTML = buildStage6HTML(stage);
          break;
        case 7:
          card.innerHTML = buildStage7HTML(stage);
          break;
      }

      stagesContainer.appendChild(card);
    });

    updateStepperHighlight(1);
  }

  // Stage 1: Matrix A Specification
  function buildStage1HTML(stage) {
    return `
      <div class="stage-badge-pill badge-indigo">
        <span>STAGE 01 // INPUT SPECIFICATION</span>
      </div>
      <h3 class="stage-title">${stage.title}</h3>
      <p class="stage-description">${stage.description}</p>

      <div class="stage-summary-grid">
        <div class="summary-stat-box">
          <div class="stat-label">Dimensions</div>
          <div class="stat-value">${stage.rows} × ${stage.cols}</div>
          <div class="stat-sub">${stage.rows} Rows ($m$), ${stage.cols} Columns ($n$)</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-label">Linear Mapping</div>
          <div class="stat-value" style="font-size: 1.2rem;">T : ℝ${getSuperscript(stage.cols)} → ℝ${getSuperscript(stage.rows)}</div>
          <div class="stat-sub">${stage.is_square ? 'Endomorphism on Euclidean Space' : 'Mapping Between Vector Spaces'}</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-label">Matrix Properties</div>
          <div class="stat-value" style="font-size: 1.05rem;">
            ${stage.is_zero ? 'Zero Matrix' : (stage.is_identity ? 'Identity Matrix' : (stage.is_square ? 'Square Matrix' : 'Rectangular Matrix'))}
          </div>
          <div class="stat-sub">Parsed with exact SymPy arithmetic</div>
        </div>
      </div>

      <div class="math-display-box">
        <div class="latex-container">
          $$A = ${stage.latex} \\in \\mathbb{R}^{${stage.rows} \\times ${stage.cols}}$$
        </div>
      </div>
    `;
  }

  // Stage 2: Row Reduction (RREF)
  function buildStage2HTML(stage) {
    return `
      <div class="stage-badge-pill badge-indigo">
        <span>STAGE 02 // GAUSS-JORDAN REDUCTION</span>
      </div>
      <h3 class="stage-title">${stage.title}</h3>
      <p class="stage-description">${stage.description}</p>

      <div class="stage-summary-grid">
        <div class="summary-stat-box">
          <div class="stat-label">Non-Zero Rows</div>
          <div class="stat-value">${stage.nonzero_rows}</div>
          <div class="stat-sub">Rows containing leading non-zero entries</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-label">Arithmetic Precision</div>
          <div class="stat-value" style="font-size: 1.15rem; color: var(--secondary);">Exact ℚ</div>
          <div class="stat-sub">Symbolic rational calculations, zero rounding drift</div>
        </div>
      </div>

      <div class="math-display-box">
        <div class="latex-container">
          $$${stage.latex_equation}$$
        </div>
      </div>
    `;
  }

  // Stage 3: Pivot Identification & Variable Classification
  function buildStage3HTML(stage) {
    const pivotColsStr = stage.pivot_columns_1based.length > 0 
      ? stage.pivot_columns_1based.map(c => `Col ${c}`).join(", ") 
      : "None (Zero Matrix)";
    const freeColsStr = stage.free_columns_1based.length > 0 
      ? stage.free_columns_1based.map(c => `Col ${c}`).join(", ") 
      : "None (Full Column Rank)";

    let tableRows = "";
    stage.columns_analysis.forEach(col => {
      tableRows += `
        <tr>
          <td><strong>Column ${col.col_index}</strong></td>
          <td><code>${col.variable}</code></td>
          <td>
            <span class="var-badge ${col.is_pivot ? 'var-pivot' : 'var-free'}">
              ${col.is_pivot ? '★ Pivot (Basic)' : '○ Free (Parameter)'}
            </span>
          </td>
          <td>${col.pivot_position}</td>
          <td>${col.role_description}</td>
        </tr>
      `;
    });

    return `
      <div class="stage-badge-pill badge-amber">
        <span>STAGE 03 // VARIABLE CLASSIFICATION</span>
      </div>
      <h3 class="stage-title">${stage.title}</h3>
      <p class="stage-description">${stage.description}</p>

      <div class="stage-summary-grid">
        <div class="summary-stat-box" style="border-left: 3px solid var(--pivot-amber);">
          <div class="stat-label">Pivot Columns (Basic Variables)</div>
          <div class="stat-value" style="color: var(--pivot-amber); font-size: 1.25rem;">
            ${pivotColsStr}
          </div>
          <div class="stat-sub">Count: <strong>${stage.pivot_count}</strong> leading variable(s)</div>
        </div>
        <div class="summary-stat-box" style="border-left: 3px solid var(--free-blue);">
          <div class="stat-label">Non-Pivot Columns (Free Variables)</div>
          <div class="stat-value" style="color: var(--free-blue); font-size: 1.25rem;">
            ${freeColsStr}
          </div>
          <div class="stat-sub">Count: <strong>${stage.free_count}</strong> free parameter(s)</div>
        </div>
      </div>

      <div class="stitch-table-wrapper">
        <table class="stitch-table">
          <thead>
            <tr>
              <th>Column (1-based)</th>
              <th>Variable</th>
              <th>Classification</th>
              <th>Pivot Entry Position</th>
              <th>Mathematical Role</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  }

  // Stage 4: Rank Computation
  function buildStage4HTML(stage) {
    return `
      <div class="stage-badge-pill badge-amber">
        <span>STAGE 04 // DIMENSION OF COLUMN SPACE</span>
      </div>
      <h3 class="stage-title">${stage.title}</h3>
      <p class="stage-description">${stage.description}</p>

      <div class="stage-summary-grid">
        <div class="summary-stat-box" style="border-left: 3px solid var(--primary);">
          <div class="stat-label">Rank(A)</div>
          <div class="stat-value" style="color: var(--primary); font-size: 2.2rem;">${stage.rank}</div>
          <div class="stat-sub">Equals number of pivot columns in RREF</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-label">Max Theoretical Rank</div>
          <div class="stat-value">${stage.max_possible_rank}</div>
          <div class="stat-sub">Bound: $\\min(m, n) = \\min(${stage.max_possible_rank})$</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-label">Classification</div>
          <div class="stat-value" style="font-size: 1.05rem;">${stage.classification}</div>
          <div class="stat-sub">Independent column vector structure</div>
        </div>
      </div>

      <div class="math-display-box">
        <div class="latex-container">
          $$${stage.derivation_latex}$$
        </div>
      </div>
    `;
  }

  // Stage 5: Null Space (Kernel)
  function buildStage5HTML(stage) {
    let verificationHTML = "";

    if (stage.is_trivial) {
      verificationHTML = `
        <div class="verification-card">
          <div class="verification-header">
            <span>✓</span>
            <span>Trivial Null Space Verification: A · 0 = 0</span>
          </div>
          <div class="verification-body">
            All $n$ columns are pivot columns (0 free variables). The homogeneous linear system $A\\mathbf{x} = \\mathbf{0}$ has only the unique trivial solution $\\mathbf{x} = \\mathbf{0}$.
            $$\\text{Null}(A) = \\{\\mathbf{0}\\}, \\quad \\dim(\\text{Null}(A)) = 0$$
          </div>
        </div>
      `;
    } else {
      let vectorsHTML = "";
      stage.basis_vectors.forEach(b => {
        vectorsHTML += `
          <div class="verification-card" style="margin-bottom: 0.625rem;">
            <div class="verification-header">
              <span>✓</span>
              <span>Basis Vector v_${b.index} Proof: A · v_${b.index} = 0</span>
            </div>
            <div class="verification-body">
              $$\\mathbf{v}_{${b.index}} = ${b.vector.latex}$$
              $$${b.verification_latex}$$
            </div>
          </div>
        `;
      });
      verificationHTML = vectorsHTML;
    }

    return `
      <div class="stage-badge-pill badge-sky">
        <span>STAGE 05 // KERNEL OF TRANSFORMATION</span>
      </div>
      <h3 class="stage-title">${stage.title}</h3>
      <p class="stage-description">${stage.description}</p>

      <div class="stage-summary-grid">
        <div class="summary-stat-box" style="border-left: 3px solid var(--free-blue);">
          <div class="stat-label">Nullity(A)</div>
          <div class="stat-value" style="color: var(--free-blue); font-size: 2.2rem;">${stage.nullity}</div>
          <div class="stat-sub">Dimension of Null Space ker(A)</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-label">Null Space Status</div>
          <div class="stat-value" style="font-size: 1.05rem;">${stage.status}</div>
          <div class="stat-sub">${stage.is_trivial ? 'Unique zero vector' : 'Spanned by ' + stage.nullity + ' basis vector(s)'}</div>
        </div>
      </div>

      ${stage.system_equations_latex.length > 0 ? `
        <div class="math-display-box" style="flex-direction: column; align-items: flex-start;">
          <div style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">
            Leading Variables in terms of Free Parameters:
          </div>
          <div class="latex-container" style="text-align: left;">
            $$\\begin{cases} ${stage.system_equations_latex.join(" \\\\ ")} \\end{cases}$$
          </div>
        </div>
      ` : ''}

      <div class="math-display-box">
        <div class="latex-container">
          <p style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">General Parametric Solution Form:</p>
          $$${stage.general_solution_latex}$$
          <p style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-top: 0.75rem;">Null Space Basis $\\mathcal{B}_{\\text{Null}(A)}$:</p>
          $$\\mathcal{B}_{\\text{Null}(A)} = ${stage.basis_latex}$$
        </div>
      </div>

      <div style="margin-top: 0.75rem;">
        <h4 style="font-family: var(--font-serif); font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
          Rigorous Proof Verification ($A \\cdot \\mathbf{v} = \\mathbf{0}$):
        </h4>
        ${verificationHTML}
      </div>
    `;
  }

  // Stage 6: Range (Column Space)
  function buildStage6HTML(stage) {
    let basisCardsHTML = "";

    if (stage.rank === 0) {
      basisCardsHTML = `
        <div class="verification-card">
          <div class="verification-header">
            <span>✓</span>
            <span>Zero Matrix Case: Range(A) = {0}</span>
          </div>
          <div class="verification-body">
            Because A is the all-zero matrix, its columns span only the trivial zero subspace.
            $$\\text{Basis} = \\emptyset, \\quad \\dim(\\text{Range}(A)) = 0$$
          </div>
        </div>
      `;
    } else {
      let vectorBlocks = "";
      stage.basis_vectors.forEach(b => {
        vectorBlocks += `
          <div class="vector-card">
            <div class="vector-header">Original Column ${b.pivot_column_1based} of A</div>
            <div class="math-display-box" style="padding: 0.5rem; margin: 0; min-height: auto; background: transparent; border: none;">
              $$${b.latex}$$
            </div>
          </div>
        `;
      });
      basisCardsHTML = `
        <div class="vectors-container">
          ${vectorBlocks}
        </div>
      `;
    }

    return `
      <div class="stage-badge-pill badge-indigo">
        <span>STAGE 06 // COLUMN SPACE OF ORIGINAL MATRIX</span>
      </div>
      <h3 class="stage-title">${stage.title}</h3>
      <p class="stage-description">${stage.description}</p>

      <div class="verification-card" style="background-color: var(--primary-light); border-color: var(--primary-border);">
        <div class="verification-header" style="color: var(--primary);">
          <span>📌</span>
          <span>Fundamental Linear Algebra Principle (Gilbert Strang)</span>
        </div>
        <div class="verification-body" style="color: var(--text-primary);">
          ${stage.critical_note}
        </div>
      </div>

      <div class="stage-summary-grid">
        <div class="summary-stat-box" style="border-left: 3px solid var(--primary);">
          <div class="stat-label">dim(Range(A))</div>
          <div class="stat-value" style="color: var(--primary); font-size: 2.2rem;">${stage.dim_range}</div>
          <div class="stat-sub">Identically equals Rank(A) = ${stage.rank}</div>
        </div>
        <div class="summary-stat-box">
          <div class="stat-label">Theorem Confirmation</div>
          <div class="stat-value" style="color: var(--secondary); font-size: 1.15rem;">
            ${stage.dim_range_equals_rank ? '✓ dim Range(A) = Rank(A)' : 'Mismatch'}
          </div>
          <div class="stat-sub">${stage.status}</div>
        </div>
      </div>

      <div class="math-display-box">
        <div class="latex-container">
          <p style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Range (Column Space) Basis $\\mathcal{B}_{\\text{Range}}$:</p>
          $$\\mathcal{B}_{\\text{Range}(A)} = ${stage.basis_latex}$$
        </div>
      </div>

      <div style="margin-top: 0.75rem;">
        <h4 style="font-family: var(--font-serif); font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
          Pivot Columns Extracted from Original Matrix A:
        </h4>
        ${basisCardsHTML}
      </div>
    `;
  }

  // Stage 7: Rank-Nullity Verification Milestone
  function buildStage7HTML(stage) {
    const rankPct = Math.round((stage.rank_stage4 / stage.columns_n) * 100);
    const nullPct = 100 - rankPct;

    return `
      <div class="stage-badge-pill badge-emerald">
        <span>STAGE 07 // THEOREM VERIFICATION MILESTONE</span>
      </div>
      <h3 class="stage-title">${stage.title}</h3>
      <p class="stage-description">${stage.description}</p>

      <div class="verified-hero-box">
        <div class="verified-equation">
          <div style="text-align: center;">
            <div class="stat-label" style="color: var(--primary);">Rank(A) (Stage 4)</div>
            <div class="verified-num" style="color: var(--primary);">${stage.rank_stage4}</div>
          </div>
          <div class="verified-op">+</div>
          <div style="text-align: center;">
            <div class="stat-label" style="color: var(--free-blue);">Nullity(A) (Stage 5)</div>
            <div class="verified-num" style="color: var(--free-blue);">${stage.nullity_stage5}</div>
          </div>
          <div class="verified-op">=</div>
          <div style="text-align: center;">
            <div class="stat-label" style="color: var(--secondary);">Total Columns n</div>
            <div class="verified-num" style="color: var(--secondary);">${stage.columns_n}</div>
          </div>
        </div>

        <div class="verified-badge">
          <span>✓</span>
          <span>RANK-NULLITY EQUALITY VERIFIED</span>
        </div>

        <!-- Domain Partitioning Proportion Bar -->
        <div class="proportion-wrapper">
          <div class="proportion-labels">
            <span style="color: var(--primary);">Rank (Col Space): ${stage.rank_stage4}/${stage.columns_n} (${rankPct}%)</span>
            <span style="color: var(--secondary);">Nullity (Kernel): ${stage.nullity_stage5}/${stage.columns_n} (${nullPct}%)</span>
          </div>
          <div class="proportion-bar" role="progressbar" aria-valuenow="${rankPct}" aria-valuemin="0" aria-valuemax="100">
            <div class="prop-rank" style="width: ${rankPct}%;">Rank = ${stage.rank_stage4}</div>
            <div class="prop-nullity" style="width: ${nullPct}%;">Nullity = ${stage.nullity_stage5}</div>
          </div>
        </div>
      </div>

      <div class="math-display-box" style="background-color: var(--secondary-light); border-color: var(--secondary-border);">
        <div class="latex-container">
          $$${stage.theorem_latex}$$
        </div>
      </div>

      <div class="verification-takeaway-card">
        <div class="takeaway-title">Mathematical Insight &amp; Dimension Conservation:</div>
        <div class="takeaway-text">
          ${stage.conclusion}
          <br><br>
          For linear transformation $T: \\mathbb{R}^{${stage.domain_dimension}} \\to \\mathbb{R}^{${stage.codomain_dimension}}$, every dimension of domain space $\\mathbb{R}^{${stage.domain_dimension}}$ is conserved: <strong>${stage.rank_stage4}</strong> dimension(s) span the image $\\text{Range}(A)$, while <strong>${stage.nullity_stage5}</strong> dimension(s) are collapsed into the origin $\\text{Null}(A)$.
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 8. Stepper Navigation Interaction
  // ---------------------------------------------------------------------------
  function updateStepperHighlight(activeStage) {
    document.querySelectorAll(".pipeline-step-item").forEach((item, idx) => {
      const stepNum = idx + 1;
      if (stepNum === activeStage) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
      if (stepNum === 7) {
        item.classList.add("verified");
      }
    });
  }

  document.querySelectorAll(".pipeline-step-item").forEach(item => {
    item.addEventListener("click", () => {
      const targetId = item.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        const stepNum = parseInt(item.querySelector(".step-num").textContent, 10);
        updateStepperHighlight(stepNum);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Error Handling
  // ---------------------------------------------------------------------------
  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove("hidden");
    errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideError() {
    errorBanner.classList.add("hidden");
  }

  btnCloseError.addEventListener("click", hideError);

  // ---------------------------------------------------------------------------
  // 10. Theory Modal & Export
  // ---------------------------------------------------------------------------
  btnTheoryModal.addEventListener("click", () => {
    theoryModal.classList.remove("hidden");
  });

  function closeModal() {
    theoryModal.classList.add("hidden");
  }

  btnCloseModal.addEventListener("click", closeModal);
  btnModalDone.addEventListener("click", closeModal);
  theoryModal.addEventListener("click", (e) => {
    if (e.target === theoryModal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !theoryModal.classList.contains("hidden")) {
      closeModal();
    }
  });

  btnPrintReport.addEventListener("click", () => {
    window.print();
  });

  // ---------------------------------------------------------------------------
  // 11. Initial App Boot
  // ---------------------------------------------------------------------------
  initTheme();
  renderMatrixGrid();
  loadPresets();
});
