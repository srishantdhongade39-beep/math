"""
test_math_engine.py
=============================================================================
Unit Test Suite for Null Space, Range and Rank-Nullity Analyzer
Validates:
- Exact SymPy parsing of integers, fractions, and decimals
- Input validation (empty cells, invalid strings, division by zero)
- Sequential 7-stage output integrity
- Rank = number of pivot columns
- Nullity = number of free variables
- Null space basis: A * v = 0 for every basis vector
- Range basis: extracted from ORIGINAL matrix A, dim(Range) = Rank
- Rank-Nullity Theorem: Rank + Nullity = n
- Edge cases: Zero matrix, Identity matrix, Tall, Wide, Fractional, Singular
=============================================================================
"""

import unittest
import sympy as sp
from math_engine import parse_cell_entry, analyze_matrix, get_sample_presets


class TestMathEngine(unittest.TestCase):

    def test_parse_cell_entry_valid(self):
        """Test valid numeric inputs: integers, fractions, decimals."""
        self.assertEqual(parse_cell_entry("0"), sp.Integer(0))
        self.assertEqual(parse_cell_entry("-7"), sp.Integer(-7))
        self.assertEqual(parse_cell_entry("+15"), sp.Integer(15))
        self.assertEqual(parse_cell_entry("1/2"), sp.Rational(1, 2))
        self.assertEqual(parse_cell_entry("-3/4"), sp.Rational(-3, 4))
        self.assertEqual(parse_cell_entry(" 5 / 7 "), sp.Rational(5, 7))
        self.assertEqual(parse_cell_entry("0.75"), sp.Rational(3, 4))
        self.assertEqual(parse_cell_entry("-1.5"), sp.Rational(-3, 2))

    def test_parse_cell_entry_invalid(self):
        """Test invalid inputs raise ValueError with informative messages."""
        with self.assertRaises(ValueError):
            parse_cell_entry("")
        with self.assertRaises(ValueError):
            parse_cell_entry("   ")
        with self.assertRaises(ValueError):
            parse_cell_entry("abc")
        with self.assertRaises(ValueError):
            parse_cell_entry("1/0")  # division by zero
        with self.assertRaises(ValueError):
            parse_cell_entry("1/2/3")

    def test_sample_presets_all_pass_theorem(self):
        """Ensure all ready-made presets satisfy Rank-Nullity Theorem and Av = 0."""
        presets = get_sample_presets()
        self.assertGreaterEqual(len(presets), 6)

        for preset in presets:
            name = preset["name"]
            res = analyze_matrix(preset["grid"])
            self.assertTrue(res["success"], f"Failed to analyze preset {name}")

            stages = res["stages"]
            self.assertEqual(len(stages), 7, f"Expected 7 stages for {name}")

            # Check Stage order
            for idx, stage in enumerate(stages):
                self.assertEqual(stage["stage_number"], idx + 1)

            stage1 = stages[0]
            stage2 = stages[1]
            stage3 = stages[2]
            stage4 = stages[3]
            stage5 = stages[4]
            stage6 = stages[5]
            stage7 = stages[6]

            n = stage1["cols"]
            rank = stage4["rank"]
            nullity = stage5["nullity"]

            # Stage 3 vs Stage 4
            self.assertEqual(rank, len(stage3["pivot_columns_0based"]))
            self.assertEqual(nullity, len(stage3["free_columns_0based"]))

            # Stage 5 Null Space verification
            if nullity > 0:
                self.assertTrue(stage5["all_av_verified_zero"], f"Av != 0 on {name}")
                self.assertEqual(len(stage5["basis_vectors"]), nullity)
            else:
                self.assertTrue(stage5["is_trivial"], f"Expected trivial null space on {name}")

            # Stage 6 Range verification
            self.assertEqual(stage6["dim_range"], rank)
            self.assertTrue(stage6["dim_range_equals_rank"])
            if rank > 0:
                self.assertEqual(len(stage6["basis_vectors"]), rank)

            # Stage 7 Rank-Nullity Theorem
            self.assertEqual(rank + nullity, n, f"Rank-Nullity failed on {name}: {rank} + {nullity} != {n}")
            self.assertTrue(stage7["is_verified"])
            self.assertEqual(stage7["lhs_sum"], n)
            self.assertEqual(stage7["rhs_n"], n)

    def test_zero_matrix(self):
        """Test 3x3 Zero Matrix special case (Rank 0, Nullity 3, Empty Range Basis)."""
        grid = [["0", "0", "0"], ["0", "0", "0"], ["0", "0", "0"]]
        res = analyze_matrix(grid)
        stages = res["stages"]

        stage4_rank = stages[3]["rank"]
        stage5_nullity = stages[4]["nullity"]
        stage6_range = stages[5]

        self.assertEqual(stage4_rank, 0)
        self.assertEqual(stage5_nullity, 3)
        self.assertEqual(stage6_range["dim_range"], 0)
        self.assertEqual(len(stage6_range["basis_vectors"]), 0)  # empty range basis
        self.assertTrue(stages[6]["is_verified"])

    def test_identity_matrix(self):
        """Test 3x3 Identity Matrix (Rank 3, Nullity 0, Empty Null Space Basis)."""
        grid = [["1", "0", "0"], ["0", "1", "0"], ["0", "0", "1"]]
        res = analyze_matrix(grid)
        stages = res["stages"]

        stage4_rank = stages[3]["rank"]
        stage5_nullity = stages[4]["nullity"]
        stage5 = stages[4]

        self.assertEqual(stage4_rank, 3)
        self.assertEqual(stage5_nullity, 0)
        self.assertTrue(stage5["is_trivial"])
        self.assertEqual(len(stage5["basis_vectors"]), 0)  # empty null space basis
        self.assertTrue(stages[6]["is_verified"])

    def test_range_basis_extracted_from_original_matrix_not_rref(self):
        """Verify that Stage 6 basis vectors come from ORIGINAL matrix A, not RREF."""
        # Matrix A where RREF column 1 is [1, 0]^T but original column 1 is [2, 4]^T
        grid = [["2", "3"], ["4", "6"]]
        res = analyze_matrix(grid)
        stages = res["stages"]

        stage6 = stages[5]
        self.assertEqual(stage6["dim_range"], 1)
        orig_vec_elements = stage6["basis_vectors"][0]["original_vector"]["elements"]
        rref_vec_elements = stage6["basis_vectors"][0]["rref_vector"]["elements"]

        # Original column is [2, 4], RREF column is [1, 0]
        self.assertEqual(orig_vec_elements, ["2", "4"])
        self.assertEqual(rref_vec_elements, ["1", "0"])
        self.assertNotEqual(orig_vec_elements, rref_vec_elements)


if __name__ == "__main__":
    unittest.main()
