# Verified-ML: AI-Powered Fraud Detection & Trust Scoring

## Overview
This service is the core verification engine for our submission to **Squad Hackathon 3.0: Smart Systems**. [cite_start]We address **Challenge 01: "Proof of Life"** by providing a technically rigorous AI trust-scoring system for financial claims[cite: 76, 78, 82].

## AI Technical Depth
[cite_start]Our solution moves beyond simple rules by using a multi-modal processing approach[cite: 100]:
* [cite_start]**Behavioral Analysis**: Utilizes a `RandomForestClassifier` trained on historical claim patterns to predict risk[cite: 86].
* [cite_start]**Image Evidence**: A CV-ready processor that identifies insufficient visual evidence and flags potential forgeries[cite: 86].
* [cite_start]**Document Intelligence**: Simulates OCR analysis to detect discrepancies in claim documentation[cite: 86, 93].

## Squad API Integration
[cite_start]The `squadAction` output (`RELEASE_PAYMENT`, `HOLD_ESCROW`) is designed to trigger automated payment workflows via the **Squad Sandbox API**[cite: 105, 137].

## Setup & Reproduction
1. Install dependencies: `pip install -r requirements.txt`
2. Train the model: `python train_behavioral.py`
3. Run the API: `uvicorn main:app --reload`