"""
math_engine.py
=============================================================================
Linear Algebra & Vector Calculus - Project 18:
Null Space, Range and Rank-Nullity Analyzer (Modules 1, 2, 3)

Pure SymPy mathematical engine implementing the exact 7-stage sequential pipeline:
Stage 1: Matrix A parsing & representation (SymPy exact arithmetic)
Stage 2: Row reduction to RREF (Reduced Row Echelon Form)
Stage 3: Pivot analysis (Pivot columns vs Free columns, 1-based display)
Stage 4: Rank computation (Rank = number of pivot columns)
Stage 5: Null space computation (General solution, basis vectors, Av = 0 verification)
Stage 6: Range / Column space basis (Pivot columns from ORIGINAL matrix A)
Stage 7: Rank-Nullity Theorem verification (Rank + Nullity = n)

Authors: College Mini-Project Team
Technology: SymPy (Exact Rational/Symbolic Arithmetic)
=============================================================================
"""

import sympy as sp
from typing import Dict, Any, List, Tuple, Optional


def parse_cell_entry(val: Any, row_idx: int = 0, col_idx: int = 0) -> sp.Rational:
    """
    Parse a single matrix cell input into an exact SymPy Integer or Rational.
    Supports:
      - Integers: e.g. "0", "5", "-12"
      - Fractions: e.g. "1/2", "-3/4", "11/7"
      - Decimals: e.g. "0.75", "-1.5", "0.125" (converted to exact rational)
      - Positive/negative signs: "+4", "-3/5"
    Raises clear ValueError if the input is empty or invalid.
    """
    if val is None:
        raise ValueError(f"Cell at Row {row_idx + 1}, Column {col_idx + 1} is empty.")
    
    val_str = str(val).strip().replace(" ", "")
    if not val_str:
        raise ValueError(f"Cell at Row {row_idx + 1}, Column {col_idx + 1} is empty.")

    # Fraction detection: "a/b"
    if "/" in val_str:
        parts = val_str.split("/")
        if len(parts) != 2:
            raise ValueError(
                f"Invalid fraction '{val_str}' at Row {row_idx + 1}, Column {col_idx + 1}. Expected format like '3/4' or '-1/2'."
            )
        try:
            num = int(parts[0])
            den = int(parts[1])
        except ValueError:
            raise ValueError(
                f"Non-integer numerator/denominator in '{val_str}' at Row {row_idx + 1}, Column {col_idx + 1}."
            )
        if den == 0:
            raise ValueError(
                f"Division by zero in '{val_str}' at Row {row_idx + 1}, Column {col_idx + 1}. Denominator cannot be 0."
            )
        return sp.Rational(num, den)

    # Decimal detection: e.g. "0.75" -> 3/4
    if "." in val_str:
        try:
            # sp.Rational from string preserves exact decimal representation without binary float rounding
            return sp.Rational(val_str)
        except Exception:
            raise ValueError(
                f"Invalid decimal '{val_str}' at Row {row_idx + 1}, Column {col_idx + 1}."
            )

    # Integer detection: e.g. "4", "-8", "0"
    try:
        return sp.Integer(int(val_str))
    except ValueError:
        raise ValueError(
            f"Invalid numeric entry '{val_str}' at Row {row_idx + 1}, Column {col_idx + 1}. Only integers, fractions (e.g. 1/3), or decimals are permitted."
        )


def format_sympy_scalar(val: Any) -> str:
    """Format a SymPy scalar cleanly as a string (e.g., '1/2', '-3', '0')."""
    if isinstance(val, sp.Rational):
        if val.q == 1:
            return str(val.p)
        return f"{val.p}/{val.q}"
    return str(val)


def matrix_to_data(mat: sp.Matrix) -> Dict[str, Any]:
    """Helper to convert a SymPy matrix to a JSON-serializable dictionary."""
    m, n = mat.shape
    grid = [[format_sympy_scalar(mat[i, j]) for j in range(n)] for i in range(m)]
    return {
        "rows": m,
        "cols": n,
        "grid": grid,
        "latex": sp.latex(mat)
    }


def vector_to_data(vec: sp.Matrix) -> Dict[str, Any]:
    """Helper to convert a column matrix (vector) to JSON representation."""
    length = vec.shape[0]
    elements = [format_sympy_scalar(vec[i, 0]) for i in range(length)]
    return {
        "length": length,
        "elements": elements,
        "latex": sp.latex(vec)
    }


def analyze_matrix(raw_grid: List[List[Any]]) -> Dict[str, Any]:
    """
    Main mathematical pipeline.
    Executes the 7 sequential stages exactly as defined:
      Stage 1 - Matrix
      Stage 2 - Row reduction (RREF)
      Stage 3 - Pivot analysis (Pivot & Free columns, 1-based display)
      Stage 4 - Rank (Rank = number of pivot columns)
      Stage 5 - Null space (Ax = 0, general solution, basis, Av = 0 verification)
      Stage 6 - Range (Basis from ORIGINAL matrix pivot columns, dim = Rank)
      Stage 7 - Rank-nullity verification (Rank + Nullity = n)
    """
    # -------------------------------------------------------------------------
    # STAGE 1: Matrix Input & Conversion to SymPy Matrix A
    # -------------------------------------------------------------------------
    if not isinstance(raw_grid, list) or len(raw_grid) == 0:
        raise ValueError("Matrix data must be a non-empty 2D list.")

    m = len(raw_grid)
    if not isinstance(raw_grid[0], list) or len(raw_grid[0]) == 0:
        raise ValueError("Matrix rows must be non-empty lists.")
    n = len(raw_grid[0])

    if m < 1 or m > 10 or n < 1 or n > 10:
        raise ValueError("Matrix dimensions must be between 1x1 and 10x10.")

    parsed_grid = []
    for i in range(m):
        if len(raw_grid[i]) != n:
            raise ValueError(
                f"Row {i + 1} has {len(raw_grid[i])} columns; expected exactly {n} columns."
            )
        row_entries = []
        for j in range(n):
            val = parse_cell_entry(raw_grid[i][j], row_idx=i, col_idx=j)
            row_entries.append(val)
        parsed_grid.append(row_entries)

    # Create exact SymPy Matrix A
    A = sp.Matrix(parsed_grid)

    is_square = (m == n)
    is_zero = A.is_zero_matrix
    is_identity = (is_square and A == sp.eye(m))

    # Original column vectors of A
    original_cols = [vector_to_data(A.col(j)) for j in range(n)]

    stage1 = {
        "stage_number": 1,
        "title": "Stage 1 - Matrix A",
        "description": "Read entries and convert them into an m × n SymPy matrix A using exact arithmetic.",
        "rows": m,
        "cols": n,
        "matrix": matrix_to_data(A),
        "columns": original_cols,
        "is_square": is_square,
        "is_zero": is_zero,
        "is_identity": is_identity,
        "structure_label": f"{m} × {n} {'Square' if is_square else 'Rectangular'} Matrix",
        "latex": sp.latex(A)
    }

    # -------------------------------------------------------------------------
    # STAGE 2: Row Reduction to RREF
    # -------------------------------------------------------------------------
    # Exact RREF computation via SymPy Gauss-Jordan elimination
    rref_mat, pivot_tuple = A.rref()
    pivot_cols_0based = list(pivot_tuple)

    # Count non-zero rows in RREF
    nonzero_rows = sum(1 for i in range(m) if not all(rref_mat[i, j] == 0 for j in range(n)))

    stage2 = {
        "stage_number": 2,
        "title": "Stage 2 - Row Reduction (RREF)",
        "description": "Compute the Reduced Row Echelon Form (RREF) of A using exact SymPy arithmetic.",
        "rref_matrix": matrix_to_data(rref_mat),
        "nonzero_rows": nonzero_rows,
        "latex_rref": sp.latex(rref_mat),
        "latex_equation": f"A = {sp.latex(A)} \\xrightarrow{{\\text{{Gauss-Jordan}}}} \\text{{RREF}}(A) = {sp.latex(rref_mat)}"
    }

    # -------------------------------------------------------------------------
    # STAGE 3: Pivot Analysis
    # -------------------------------------------------------------------------
    # Internal 0-based indices
    free_cols_0based = [j for j in range(n) if j not in pivot_cols_0based]

    # Display 1-based indices and mathematical variable labels
    pivot_cols_1based = [j + 1 for j in pivot_cols_0based]
    free_cols_1based = [j + 1 for j in free_cols_0based]
    leading_vars = [f"x_{{{j + 1}}}" for j in pivot_cols_0based]
    free_vars = [f"x_{{{j + 1}}}" for j in free_cols_0based]

    # Detailed per-column categorization table
    columns_analysis = []
    for j in range(n):
        col_1based = j + 1
        var_name = f"x_{{{col_1based}}}"
        if j in pivot_cols_0based:
            pivot_row_0based = pivot_cols_0based.index(j)
            pivot_row_1based = pivot_row_0based + 1
            columns_analysis.append({
                "col_index": col_1based,
                "variable": f"x_{col_1based}",
                "variable_latex": var_name,
                "is_pivot": True,
                "type": "Pivot Column (Leading Variable)",
                "pivot_position": f"Row {pivot_row_1based}, Column {col_1based}",
                "role_description": f"Contains leading 1 in Row {pivot_row_1based}. Variable {var_name} is bound/basic."
            })
        else:
            columns_analysis.append({
                "col_index": col_1based,
                "variable": f"x_{col_1based}",
                "variable_latex": var_name,
                "is_pivot": False,
                "type": "Non-Pivot Column (Free Variable)",
                "pivot_position": "None",
                "role_description": f"Contains no leading 1. Variable {var_name} is an independent free parameter."
            })

    stage3 = {
        "stage_number": 3,
        "title": "Stage 3 - Pivot Analysis",
        "description": "Identify pivot columns (leading variables) and non-pivot columns (free variables) from RREF.",
        "pivot_columns_0based": pivot_cols_0based,
        "free_columns_0based": free_cols_0based,
        "pivot_columns_1based": pivot_cols_1based,
        "free_columns_1based": free_cols_1based,
        "leading_variables": leading_vars,
        "free_variables": free_vars,
        "columns_analysis": columns_analysis,
        "pivot_count": len(pivot_cols_0based),
        "free_count": len(free_cols_0based)
    }

    # -------------------------------------------------------------------------
    # STAGE 4: Rank
    # -------------------------------------------------------------------------
    # Rank(A) = number of pivot columns
    rank = len(pivot_cols_0based)
    max_possible_rank = min(m, n)

    if is_zero:
        rank_classification = "Zero Rank (All entries in A are zero)"
    elif is_square and rank == n:
        rank_classification = "Full Rank (Invertible / Non-singular square matrix)"
    elif is_square and rank < n:
        rank_classification = "Rank Deficient (Singular / Non-invertible square matrix)"
    elif not is_square and rank == n:
        rank_classification = "Full Column Rank (Columns of A are linearly independent)"
    elif not is_square and rank == m:
        rank_classification = "Full Row Rank (Rows span all of Codomain R^m)"
    else:
        rank_classification = f"Rank Deficient Rectangular Matrix (Rank {rank} < min({m}, {n}))"

    stage4 = {
        "stage_number": 4,
        "title": "Stage 4 - Rank",
        "description": "Rank(A) = number of pivot columns identified from Stage 3.",
        "rank": rank,
        "max_possible_rank": max_possible_rank,
        "classification": rank_classification,
        "derivation_latex": f"\\text{{Rank}}(A) = \\#(\\text{{pivot columns}}) = {rank}"
    }

    # -------------------------------------------------------------------------
    # STAGE 5: Null Space
    # -------------------------------------------------------------------------
    # Nullity(A) = number of free variables = number of basis vectors in Null(A)
    # Solve Ax = 0 using free variables
    null_basis_matrices = A.nullspace()
    nullity = len(null_basis_matrices)

    # Let's formulate the parametric equations expressing leading variables in terms of free variables
    # From RREF: for each pivot row i, x_{p_i} + sum_{j in free} R[i, j] x_j = 0
    # => x_{p_i} = - sum_{j in free} R[i, j] x_j
    system_equations_latex = []
    for i, p_col in enumerate(pivot_cols_0based):
        leading_var_str = f"x_{{{p_col + 1}}}"
        rhs_terms = []
        for f_col in free_cols_0based:
            coef = rref_mat[i, f_col]
            if coef != 0:
                neg_coef = -coef
                if neg_coef == 1:
                    rhs_terms.append(f"x_{{{f_col + 1}}}")
                elif neg_coef == -1:
                    rhs_terms.append(f"-x_{{{f_col + 1}}}")
                else:
                    rhs_terms.append(f"{format_sympy_scalar(neg_coef)} x_{{{f_col + 1}}}")
        if rhs_terms:
            rhs_str = " + ".join(rhs_terms).replace("+ -", "- ")
        else:
            rhs_str = "0"
        system_equations_latex.append(f"{leading_var_str} = {rhs_str}")

    # Build basis vector verification: A * v = 0 for each basis vector
    basis_vectors_data = []
    all_av_zero = True

    for k, v in enumerate(null_basis_matrices):
        prod = A * v
        is_zero_prod = prod.is_zero_matrix
        if not is_zero_prod:
            all_av_zero = False

        # Associated free parameter
        param_symbol = f"s_{{{k + 1}}}" if len(null_basis_matrices) > 1 else "s"

        basis_vectors_data.append({
            "index": k + 1,
            "parameter": param_symbol,
            "vector": vector_to_data(v),
            "product_Av": vector_to_data(prod),
            "is_zero_vector": is_zero_prod,
            "verification_latex": f"A \\cdot \\mathbf{{v}}_{{{k + 1}}} = {sp.latex(A)} {sp.latex(v)} = {sp.latex(prod)}"
        })

    # General solution representation
    if nullity == 0:
        # Trivial null space {0}
        zero_vec_n = sp.zeros(n, 1)
        trivial_prod = A * zero_vec_n
        general_solution_latex = f"\\mathbf{{x}} = \\mathbf{{0}} = {sp.latex(zero_vec_n)}"
        null_space_status = "Trivial Null Space: Only the zero vector satisfies A x = 0."
        basis_latex = "\\emptyset \\quad (\\text{Empty basis, dimension 0})"
    else:
        # General parametric linear combination
        terms = []
        for k in range(nullity):
            param = f"s_{{{k + 1}}}" if nullity > 1 else "s"
            terms.append(f"{param} {sp.latex(null_basis_matrices[k])}")
        general_solution_latex = f"\\mathbf{{x}} = " + " + ".join(terms) + f"\\quad (s_i \\in \\mathbb{{R}})"
        null_space_status = f"Non-trivial Null Space spanned by {nullity} linearly independent basis vector(s)."
        vectors_latex_list = ", ".join([sp.latex(v) for v in null_basis_matrices])
        basis_latex = f"\\left\\{{ {vectors_latex_list} \\right\\}}"

    stage5 = {
        "stage_number": 5,
        "title": "Stage 5 - Null Space",
        "description": "Solve Ax = 0 using free variables. Find general solution, null space basis, and verify Av = 0.",
        "nullity": nullity,
        "free_variable_count": len(free_cols_0based),
        "is_trivial": (nullity == 0),
        "status": null_space_status,
        "system_equations_latex": system_equations_latex,
        "general_solution_latex": general_solution_latex,
        "basis_latex": basis_latex,
        "basis_vectors": basis_vectors_data,
        "all_av_verified_zero": all_av_zero
    }

    # -------------------------------------------------------------------------
    # STAGE 6: Range (Column Space)
    # -------------------------------------------------------------------------
    # The basis of Range(A) = Col(A) is the set of pivot columns taken from
    # the ORIGINAL matrix A, NOT from the RREF!
    range_basis_vectors_data = []
    range_basis_matrices = []

    if rank == 0:
        # Zero matrix: Range is {0}, basis is empty, dimension is 0
        range_status = "Trivial Range: A is the zero matrix. Range(A) = {0}, basis is empty."
        range_basis_latex = "\\emptyset \\quad (\\text{Empty basis, dimension 0})"
        dim_range = 0
    else:
        for p in pivot_cols_0based:
            orig_col_vec = A.col(p)
            rref_col_vec = rref_mat.col(p)
            range_basis_matrices.append(orig_col_vec)
            range_basis_vectors_data.append({
                "pivot_column_1based": p + 1,
                "original_vector": vector_to_data(orig_col_vec),
                "rref_vector": vector_to_data(rref_col_vec),
                "latex": sp.latex(orig_col_vec)
            })
        dim_range = len(range_basis_matrices)
        range_status = f"Range(A) has dimension {dim_range}, spanned by {dim_range} pivot column(s) of ORIGINAL matrix A."
        vectors_latex_list = ", ".join([sp.latex(v) for v in range_basis_matrices])
        range_basis_latex = f"\\left\\{{ {vectors_latex_list} \\right\\}}"

    # Confirm dim Range(A) == Rank(A)
    dim_range_equals_rank = (dim_range == rank)

    stage6 = {
        "stage_number": 6,
        "title": "Stage 6 - Range (Column Space)",
        "description": "The basis of Range(A) consists of the pivot columns taken from the ORIGINAL matrix A, not RREF.",
        "dim_range": dim_range,
        "rank": rank,
        "dim_range_equals_rank": dim_range_equals_rank,
        "status": range_status,
        "basis_latex": range_basis_latex,
        "basis_vectors": range_basis_vectors_data,
        "critical_note": "Crucial Linear Algebra Theorem: The basis vectors of Range(A) must be extracted from original matrix A, not from RREF(A)."
    }

    # -------------------------------------------------------------------------
    # STAGE 7: Rank-Nullity Verification
    # -------------------------------------------------------------------------
    # Check Rank(A) + Nullity(A) = n (number of columns)
    # Take Rank from Stage 4 and Nullity from Stage 5 (do NOT compute nullity as n - rank)
    lhs_sum = rank + nullity
    rhs_cols = n
    is_verified = (lhs_sum == rhs_cols)

    substitution_str = f"{rank} + {nullity} = {rhs_cols}"
    theorem_latex = (
        f"\\underbrace{{\\text{{Rank}}(A)}}_{{{rank}}} + "
        f"\\underbrace{{\\text{{Nullity}}(A)}}_{{{nullity}}} = "
        f"{rank} + {nullity} = {rhs_cols} = n \\quad (\\text{{number of columns}})"
    )

    stage7 = {
        "stage_number": 7,
        "title": "Stage 7 - Rank-Nullity Theorem Verification",
        "description": "Verify Rank(A) + Nullity(A) = n, using Rank from Stage 4 and Nullity from Stage 5.",
        "rank_stage4": rank,
        "nullity_stage5": nullity,
        "columns_n": n,
        "lhs_sum": lhs_sum,
        "rhs_n": rhs_cols,
        "is_verified": is_verified,
        "substitution_str": substitution_str,
        "theorem_latex": theorem_latex,
        "domain_dimension": n,
        "codomain_dimension": m,
        "conclusion": (
            f"Verified: Dimension of Domain R^{n} ({n}) is completely partitioned into "
            f"Image/Range dimension ({rank}) and Kernel/Null space dimension ({nullity})."
        )
    }

    # Return full sequential report
    return {
        "success": True,
        "matrix_shape": {"rows": m, "cols": n},
        "stages": [
            stage1,
            stage2,
            stage3,
            stage4,
            stage5,
            stage6,
            stage7
        ]
    }


def get_sample_presets() -> List[Dict[str, Any]]:
    """
    Returns curated ready-made sample matrices covering all requested cases:
    - Square singular with dependent columns
    - Square invertible (trivial null space)
    - Identity matrix
    - Zero matrix (rank 0, empty range)
    - Rectangular wide (3x5, full row rank)
    - Rectangular tall (4x2, full column rank)
    - Fractional entries matrix
    - Rank-1 matrix with multiple free variables
    """
    return [
        {
            "id": "preset_sq_singular",
            "name": "Square Singular (3×3)",
            "tag": "Rank Deficient",
            "rows": 3,
            "cols": 3,
            "description": "Rows and columns are linearly dependent. Rank = 2, Nullity = 1.",
            "grid": [
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"]
            ]
        },
        {
            "id": "preset_sq_invertible",
            "name": "Square Invertible (3×3)",
            "tag": "Full Rank",
            "rows": 3,
            "cols": 3,
            "description": "Linearly independent columns. Trivial null space {0}. Rank = 3, Nullity = 0.",
            "grid": [
                ["1", "2", "1"],
                ["0", "1", "3"],
                ["2", "1", "0"]
            ]
        },
        {
            "id": "preset_identity",
            "name": "Identity Matrix (3×3)",
            "tag": "Canonical",
            "rows": 3,
            "cols": 3,
            "description": "Standard basis. Rank = 3, Nullity = 0, empty null space basis.",
            "grid": [
                ["1", "0", "0"],
                ["0", "1", "0"],
                ["0", "0", "1"]
            ]
        },
        {
            "id": "preset_zero",
            "name": "Zero Matrix (3×3)",
            "tag": "Zero Rank",
            "rows": 3,
            "cols": 3,
            "description": "Rank = 0, Nullity = 3, empty range basis, full null space R^3.",
            "grid": [
                ["0", "0", "0"],
                ["0", "0", "0"],
                ["0", "0", "0"]
            ]
        },
        {
            "id": "preset_wide_rect",
            "name": "Wide Rectangular (3×5)",
            "tag": "Underdetermined",
            "rows": 3,
            "cols": 5,
            "description": "More columns than rows. Rank = 2, Nullity = 3. 3 free variables.",
            "grid": [
                ["1", "2", "0", "3", "1"],
                ["0", "0", "1", "2", "-1"],
                ["2", "4", "1", "8", "1"]
            ]
        },
        {
            "id": "preset_tall_rect",
            "name": "Tall Rectangular (4×2)",
            "tag": "Overdetermined",
            "rows": 4,
            "cols": 2,
            "description": "More rows than columns. Full column rank: Rank = 2, Nullity = 0.",
            "grid": [
                ["1", "3"],
                ["2", "1"],
                ["0", "4"],
                ["1", "-1"]
            ]
        },
        {
            "id": "preset_fractions",
            "name": "Fractions & Decimals (3×3)",
            "tag": "Exact Rationals",
            "rows": 3,
            "cols": 3,
            "description": "Demonstrates exact SymPy arithmetic with fractional entries.",
            "grid": [
                ["1/2", "-1/3", "1"],
                ["3/4", "2/5", "-1/2"],
                ["1", "0", "2"]
            ]
        },
        {
            "id": "preset_rank1",
            "name": "Rank-1 Matrix (4×4)",
            "tag": "3 Free Variables",
            "rows": 4,
            "cols": 4,
            "description": "All rows are multiples of Row 1. Rank = 1, Nullity = 3.",
            "grid": [
                ["1", "-2", "3", "1"],
                ["2", "-4", "6", "2"],
                ["-1", "2", "-3", "-1"],
                ["3", "-6", "9", "3"]
            ]
        }
    ]
