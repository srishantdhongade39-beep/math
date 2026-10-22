"""
app.py
=============================================================================
Linear Algebra & Vector Calculus - Project 18:
Null Space, Range and Rank-Nullity Analyzer (Flask Backend)

Routes:
  GET  /             -> Serves main single-page web application
  POST /api/analyze  -> Validates input grid & runs 7 sequential stages via SymPy
  GET  /api/presets  -> Returns pre-configured sample matrices

Authors: College Mini-Project Team
Technology: Flask, SymPy
=============================================================================
"""

import os
import sys
from flask import Flask, render_template, request, jsonify
from math_engine import analyze_matrix, get_sample_presets

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static"),
)
app.config["SECRET_KEY"] = "linear-algebra-rank-nullity-analyzer-secret-key"


@app.route("/")
def index():
    """Renders the main single-page application."""
    presets = get_sample_presets()
    return render_template("index.html", presets=presets)


@app.route("/api/presets", methods=["GET"])
def api_presets():
    """API endpoint to fetch all curated sample presets."""
    try:
        presets = get_sample_presets()
        return jsonify({"success": True, "presets": presets}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    """
    API endpoint to analyze an m x n matrix through the 7 sequential stages.
    Expects JSON body:
      {
        "grid": [
          ["1", "2", "3"],
          ["4", "5", "6"]
        ]
      }
    """
    try:
        data = request.get_json(force=True, silent=True)
        if not data or "grid" not in data:
            return jsonify({
                "success": False,
                "error": "Missing matrix grid data in request payload."
            }), 400

        grid = data["grid"]
        results = analyze_matrix(grid)
        return jsonify(results), 200

    except ValueError as val_err:
        # Mathematical or input validation error
        return jsonify({
            "success": False,
            "error": str(val_err)
        }), 400

    except Exception as exc:
        # Unexpected server error
        return jsonify({
            "success": False,
            "error": f"Internal computation error: {str(exc)}"
        }), 500


if __name__ == "__main__":
    print("=" * 70)
    print("Starting Null Space, Range & Rank-Nullity Analyzer...")
    print("Access the web application at: http://127.0.0.1:5000")
    print("=" * 70)
    app.run(host="127.0.0.1", port=5000, debug=True)
