"""
api/index.py
=============================================================================
Vercel Serverless Function entry point for Flask.
Exports the Flask WSGI 'app' instance.
=============================================================================
"""

import os
import sys

# Ensure the root project directory is discoverable in Python's sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app
