# Null Space, Range and Rank-Nullity Analyzer
**Project 18 • Modules 1, 2, 3 • Linear Algebra and Vector Calculus**

A complete, mathematically rigorous web application built with **Python (Flask)**, **SymPy** (exact rational arithmetic), and a modern **Stitch Design System** interface.

---

## 🎯 Aim of the Project
To analyze matrices with diverse structural properties and verify the **Rank-Nullity Theorem** across square, rectangular, full-rank, rank-deficient, zero, identity, and fractional matrices.

The application strictly executes and visualizes the sequential mathematical process:
$$\text{Matrix } A \longrightarrow \text{Row Reduction (RREF)} \longrightarrow \text{Pivot Analysis} \longrightarrow \text{Rank} \longrightarrow \text{Null Space } N(A) \longrightarrow \text{Range } \text{Col}(A) \longrightarrow \text{Rank-Nullity Verification}$$

Each stage derives its results directly from the previous stage, demonstrating authentic linear algebraic dependencies.

---

## 📂 Project Folder Structure

```text
math mini project/
├── app.py                      # Flask backend (routes, API endpoints, error handling)
├── math_engine.py              # Pure SymPy Linear Algebra engine (7 sequential stages)
├── test_math_engine.py         # Automated unit test suite (100% test coverage)
├── requirements.txt            # Project dependencies (Flask, SymPy)
├── README.md                   # Comprehensive documentation and VS Code setup guide
├── templates/
│   └── index.html              # Modern semantic HTML5 interface with Stitch design
└── static/
    ├── css/
    │   └── style.css           # Custom Stitch design system & responsive styling
    └── js/
        └── app.js              # Dynamic matrix grid builder, API caller, stage renderer
```

---

## 🔬 The 7 Sequential Mathematical Stages

| Stage | Name | Mathematical Definition & Implementation |
| :--- | :--- | :--- |
| **Stage 1** | **Matrix $A$** | Reads user entries ($m \times n$) and converts them into an exact SymPy Matrix $A$. Handles integers, fractions (`1/3`, `-4/7`), and decimals (`0.75` $\to \frac{3}{4}$). |
| **Stage 2** | **Row Reduction** | Computes the exact Reduced Row Echelon Form ($\text{RREF}$) using SymPy Gauss-Jordan elimination: $A \xrightarrow{\text{Gauss-Jordan}} \text{RREF}(A)$. |
| **Stage 3** | **Pivot Analysis** | Identifies pivot columns (leading variables $x_j$) containing leading 1s and non-pivot columns (free variables $x_k$). Uses 0-based indexing internally and displays 1-based indices to the user. |
| **Stage 4** | **Rank** | $\text{Rank}(A) = \text{number of pivot columns}$ identified in Stage 3. Classifies matrix as full-rank, singular, full column/row rank, or rank-deficient. |
| **Stage 5** | **Null Space** | Solves $A\mathbf{x} = \mathbf{0}$ using the free variables. Formulates the general solution $\mathbf{x} = \sum s_i \mathbf{v}_i$ and null space basis. Proves that $\text{Nullity}(A) = \text{number of basis vectors} = \text{free variable count}$. **Verifies $A\mathbf{v} = \mathbf{0}$ for every basis vector**. Handles trivial null space $\{\mathbf{0}\}$. |
| **Stage 6** | **Range (Column Space)** | **Fundamental Theorem:** The basis of $\text{Range}(A)$ consists of the pivot columns taken from the **ORIGINAL matrix $A$**, not from the RREF. Confirms $\dim(\text{Range}(A)) = \text{Rank}(A)$. Handles zero matrix (rank 0, empty basis $\emptyset$). |
| **Stage 7** | **Rank-Nullity Verification** | Verifies $\text{Rank}(A) + \text{Nullity}(A) = n$ (number of columns / domain dimension). Displays substituted numerical values (e.g. $2 + 1 = 3$) and an illuminated **VERIFIED** banner. |

---

## ⚡ Special Cases Handled

1. **Square Invertible Matrix ($3 \times 3$)**:
   - Full rank ($r = 3$), trivial null space ($\text{Nullity} = 0$, basis is empty $\emptyset$).
2. **Square Singular Matrix ($3 \times 3$)**:
   - Rank-deficient ($r = 2$), nullity = $1$, dependent columns.
3. **Zero Matrix ($3 \times 3$)**:
   - $\text{Rank} = 0$, $\text{Nullity} = 3$, empty range basis $\emptyset$, entire $\mathbb{R}^3$ is null space.
4. **Identity Matrix ($3 \times 3$)**:
   - Canonical basis, $\text{Rank} = 3$, $\text{Nullity} = 0$, trivial null space.
5. **Rectangular Wide Matrix ($3 \times 5$, Underdetermined)**:
   - More columns than rows ($n > m$). At least $n - m = 2$ free variables. Rank = 2, Nullity = 3.
6. **Rectangular Tall Matrix ($4 \times 2$, Overdetermined)**:
   - More rows than columns ($m > n$). Full column rank ($r = 2$), $\text{Nullity} = 0$.
7. **Fractional & Decimal Entries**:
   - Entries like `1/2`, `-3/4`, `0.25` are parsed into exact SymPy `Rational` numbers, preventing IEEE-754 floating-point rounding errors.

---

## 🚀 Step-by-Step Instructions to Run on Windows in VS Code

### Step 1: Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Click **File** $\to$ **Open Folder...**
3. Select `d:\projects\math mini project`.

### Step 2: Open PowerShell Terminal in VS Code
- Press <kbd>Ctrl</kbd> + <kbd>`</kbd> (or go to **Terminal** $\to$ **New Terminal**).

### Step 3: (Recommended) Create & Activate Virtual Environment
```powershell
# Create a virtual environment named .venv
python -m venv .venv

# Activate the virtual environment
.venv\Scripts\Activate.ps1
```
*(If PowerShell displays an ExecutionPolicy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and re-run activate).*

### Step 4: Install Dependencies
```powershell
pip install -r requirements.txt
```
*(Dependencies: `Flask>=3.0.0`, `sympy>=1.12.0`)*

### Step 5: Run Automated Unit Tests
To verify all linear algebra calculations and edge cases before running:
```powershell
python -m unittest test_math_engine.py
```
*Expected output:*
```text
......
----------------------------------------------------------------------
Ran 6 tests in 0.030s

OK
```

### Step 6: Start the Flask Application
```powershell
python app.py
```

You will see:
```text
======================================================================
Starting Null Space, Range & Rank-Nullity Analyzer...
Access the web application at: http://127.0.0.1:5000
======================================================================
 * Running on http://127.0.0.1:5000
```

### Step 7: Open in Browser
- Open your web browser (Chrome, Edge, Firefox, or Brave) and navigate to:
  **`http://127.0.0.1:5000`**

---

## 🎨 Using the Stitch Design Interface
1. **Sample Presets**: Click any ready-made preset chip at the top (e.g. *Wide Rectangular*, *Identity*, *Zero Matrix*, or *Fractions*) to automatically load and analyze.
2. **Custom Dimension Chooser**: Use the $+$ and $-$ buttons or the quick-size shortcuts ($2\times2$, $3\times3$, $3\times5$, $4\times2$, $4\times4$) to adjust row and column counts.
3. **Interactive Matrix Grid**:
   - Enter integers (`4`, `-2`), fractions (`1/3`, `-5/2`), or decimals (`0.75`).
   - Navigate smoothly between cells using **Arrow Keys**, **Tab**, or **Enter**.
4. **Analyze Matrix**: Click the electric indigo **⚡ Analyze Matrix** button.
5. **Review Stages**: Scroll through the 7 stages linked by directional stitch connectors.
6. **Export Report**: Click **🖨️ Export Report** in the top navigation to print or save a clean lab PDF report.
7. **Theory Guide**: Click **📖 Theory Guide** to access formal definitions of RREF, Range, Null Space, and the Rank-Nullity Theorem.

---

## 📜 Mathematical Foundations
- **Domain & Codomain**: For $A \in \mathbb{R}^{m \times n}$, $A$ represents a linear map $T: \mathbb{R}^n \to \mathbb{R}^m$.
- **Fundamental Rank-Nullity Equation**:
  $$\dim(\ker(T)) + \dim(\text{im}(T)) = \dim(\text{domain})$$
  $$\text{Nullity}(A) + \text{Rank}(A) = n$$
- **Conservation of Dimensions**: The input dimension $n$ is partitioned between the dimensions that survive into the image ($\text{Rank}$) and the dimensions collapsed to the origin ($\text{Nullity}$).

---

## ☁️ Deploying to Vercel

The project is pre-configured with `vercel.json` and a serverless entry point at `api/index.py`.

### Option A: Via GitHub (Recommended)
1. Push this project to a new repository on GitHub:
   ```powershell
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and click **Add New... $\to$ Project**.
3. Import your GitHub repository.
4. Leave all settings at default and click **Deploy**.

### Option B: Via Vercel CLI (Instant)
Run the following in your terminal:
```powershell
npx vercel
```
Follow the interactive prompts to log in and deploy. When asked for production deployment:
```powershell
npx vercel --prod
```

