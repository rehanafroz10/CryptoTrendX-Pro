# 🚀 CryptoTrendX Pro: Real-Time Analytics & Predictive Trend Platform

> **Production-Ready, FAANG/MAANG-Targeted Full-Stack Machine Learning & Quantitative Analytics Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-111111?style=for-the-badge&logo=xgboost)](https://xgboost.readthedocs.io/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

**CryptoTrendX Pro** is an end-to-end financial data science and full-stack web application designed to analyze multi-horizon cryptocurrency price trends (**60h, 100h, 500h, 1500h, 2000h+ lookbacks**). It leverages an ensemble **Machine Learning pipeline (XGBoost + SHAP Explainability)** fused with **NLP Sentiment Analysis** to deliver 48-hour directional price movement forecasts and target price ranges.

---

## 📑 Table of Contents

- [Why This Project Stands Out](#-why-this-project-stands-out-for-high-bar-engineering-faangmaang)
- [System Architecture](#️-high-level-system-architecture)
- [Core Concepts & Technical Logic](#-core-concepts--technical-logic)
- [Tech Stack](#️-complete-tech-stack)
- [Directory Structure](#-project-directory-structure)
- [Quick Start](#-quick-start-guide)
- [Resume Bullet Points](#-resume-bullet-points-faangmaang-ready)
- [License](#-license)
- [Author](#-author)

---

## 🎯 Why This Project Stands Out for High-Bar Engineering (FAANG/MAANG)

Unlike typical CRUD apps or basic wrapper applications, CryptoTrendX Pro is architected to address real-world production engineering concerns: **System Design, Scalability, ML Interpretability, and MLOps Accountability**.

| Engineering Pillar | Production Implementation in CryptoTrendX Pro |
| :--- | :--- |
| **System Design & Performance** | Asynchronous FastAPI core, Redis caching layer, SlowAPI rate-limiting, and a WebSocket Pub/Sub pattern for zero-polling real-time market streams |
| **Data Structures & Algorithms** | Sliding-window moving averages ($O(N)$ rolling sums), Pearson matrix vectorization ($O(N^2 \cdot M)$ optimization via NumPy) |
| **Machine Learning & Interpretability** | Dual-model pipeline (XGBoost Classifier + Regressor) integrated with **SHAP (SHapley Additive exPlanations)** to eliminate black-box AI behavior |
| **MLOps & Accountability** | Automated historical prediction logging and rolling 48-hour accuracy tracking |
| **Security & Auth** | JWT authentication, bcrypt password hashing, and user-isolated SQLite/PostgreSQL schema |

---

## 🏗️ High-Level System Architecture

```text
                               ┌────────────────────────────────────────┐
                               │           Binance WebSockets            │
                               └───────────────────┬────────────────────┘
                                                    │ Live Tick Stream
                                                    ▼
┌───────────────────┐  HTTP/REST   ┌────────────────────────────────────────┐
│                    ├─────────────►│            FastAPI Backend              │
│   React Frontend   │              │  ┌────────────────────────────────────┐ │
│   (Tailwind UI)     │              │  │      Async Route Controller       │ │
│                    │◄─────────────┤  └─────────────────┬──────────────────┘ │
└─────────┬──────────┘  WebSockets  └────────────────────┼────────────────────┘
          │                                              │
          │ Request Cache / Rate Limit                   │ Feature Pipeline
          ▼                                              ▼
┌───────────────────┐                        ┌────────────────────────────────┐
│  Redis + SlowAPI   │                        │  Analytics Engine (Pandas/NumPy)│
└───────────────────┘                        │   RSI · SMA · Volatility        │
                                              └───────────────┬────────────────┘
                                                              │ Clean Features
                                                              ▼
                                              ┌────────────────────────────────┐
                                              │        ML Forecasting Core      │
                                              │  XGBoost Classifier (UP/DOWN)   │
                                              │  XGBoost Regressor (Range)      │
                                              │  SHAP Explainer Engine          │
                                              └────────────────────────────────┘
```

---

## 📊 Core Concepts & Technical Logic

### 1. Dynamic Lookback & Warmup Buffer Math

To guarantee exactly $N$ clean historical training samples after technical-indicator calculations and future target shifts, the data pipeline dynamically computes a **Warmup Buffer**:

$$
\text{Fetch Limit} = \text{Requested Hours} + \text{Warmup Buffer (97 rows)}
$$

$$
\text{Total Dropped Rows} = \underbrace{49}_{\text{SMA-50 warmup}} + \underbrace{48}_{\text{48h target shift}} = 97 \text{ rows}
$$

$$
\text{Final Clean Training Rows} = (\text{Requested Hours} + 97) - 97 = \text{Requested Hours (exact)}
$$

### 2. Algorithmic Sliding-Window Moving Averages

Traditional naive rolling-average computation takes $O(N \cdot K)$ time complexity. CryptoTrendX Pro uses vectorized sliding windows via NumPy/Pandas to maintain optimal runtime, $O(N)$:

$$
\text{SMA}_n = \frac{1}{n} \sum_{i=1}^{n} P_i
$$

### 3. Explainable AI (XAI) & Hybrid Decision Matrix

To ensure predictions are transparent, SHAP calculates the exact marginal contribution of each feature to the final classification:

$$
\text{Confidence Score} = w_1 \cdot \text{ML Probability} + w_2 \cdot \text{News Sentiment} + w_3 \cdot \text{Fear and Greed Index}
$$

$$
\text{where } w_1 = 0.60, \quad w_2 = 0.30, \quad w_3 = 0.10
$$

---

## 🛠️ Complete Tech Stack

| Layer | Tools & Frameworks | Purpose |
| :--- | :--- | :--- |
| **Backend** | Python 3.10+, [FastAPI](https://fastapi.tiangolo.com/), Asyncio, [Pydantic](https://docs.pydantic.dev/), [SQLAlchemy](https://www.sqlalchemy.org/), SQLite/PostgreSQL | Async REST + WebSocket server |
| **Machine Learning & Data Science** | [XGBoost](https://xgboost.readthedocs.io/), [Scikit-Learn](https://scikit-learn.org/), [SHAP](https://shap.readthedocs.io/), Pandas, NumPy, SciPy | Forecasting & explainability |
| **NLP & Sentiment** | VADER Sentiment / [FinBERT](https://huggingface.co/ProsusAI/finbert) Pipeline, [Alternative.me API](https://alternative.me/crypto/fear-and-greed-index/) | News & market sentiment scoring |
| **Caching & Rate Limiting** | Redis, `fastapi-cache2`, [SlowAPI](https://slowapi.readthedocs.io/) | Performance & API abuse prevention |
| **Frontend** | React.js ([Vite](https://vitejs.dev/)), Tailwind CSS, [Lucide Icons](https://lucide.dev/), [Recharts](https://recharts.org/) / [D3.js](https://d3js.org/) | Dashboard UI & visualization |
| **Real-Time Data Layer** | Async `httpx`, WebSockets ([Binance Stream API](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams)) | Live tick data streaming |

---

## 📂 Project Directory Structure

```text
CryptoTrendX/
├── app/                          # FastAPI Backend
│   ├── api/                      # Route Handlers
│   │   ├── endpoints/
│   │   │   ├── analytics.py      # Technical Indicators & Metrics
│   │   │   ├── auth.py           # JWT Signup / Login
│   │   │   ├── portfolio.py      # User Holdings & P&L
│   │   │   ├── predict.py        # ML Engine + SHAP Explainer
│   │   │   └── websocket.py      # Live Ticker Streamer
│   │   └── router.py
│   ├── core/                     # Application Security & Config
│   │   ├── config.py
│   │   ├── rate_limiter.py       # SlowAPI Middleware
│   │   └── security.py           # Password Hashing & JWT Claims
│   ├── database.py               # SQLAlchemy Session Engine
│   ├── models.py                 # DB ORM Models (User, Portfolio, Predictions)
│   ├── services/                 # Core Business & ML Logic
│   │   ├── analytics_engine.py   # RSI, SMA, Volatility Calculations
│   │   ├── data_fetcher.py       # Binance REST & WS Data Pipeline
│   │   ├── ml_model.py           # XGBoost Classifier/Regressor Trainer
│   │   ├── nlp_sentiment.py      # News & Market Sentiment Scorer
│   │   └── shap_explainer.py     # Feature Importance Calculation
│   └── main.py                   # FastAPI Application Entry
├── frontend/                     # React Single Page Application (Vite)
│   ├── src/
│   │   ├── components/           # Modular UI Components
│   │   │   ├── Analytics.jsx
│   │   │   ├── PredictionCard.jsx   # SHAP Visualizer & Signal Badge
│   │   │   ├── WhatIfCalc.jsx       # Historical Backtester
│   │   │   └── Header.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── models/                       # Exported Trained ML Artifacts (.pkl)
├── requirements.txt              # Backend Dependencies
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Redis Server](https://redis.io/docs/getting-started/) (`redis-server`)

### 1. Backend Setup

```bash
# Clone repository
git clone https://github.com/rehanafroz10/CryptoTrendX-Pro.git
cd CryptoTrendX-Pro

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start local Redis server
redis-server

# Run FastAPI backend
uvicorn app.main:app --reload
```

📍 Interactive Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install node modules
npm install

# Start development server
npm run dev
```

📍 Frontend Application: [http://localhost:3000](http://localhost:3000) or [http://localhost:5173](http://localhost:5173)

---

## 💼 Resume Bullet Points (FAANG/MAANG Ready)

- Engineered an end-to-end crypto analytics platform serving 48-hour predictive trend models and dynamic target price ranges using **FastAPI, React, XGBoost, and WebSockets**.
- Designed a hybrid decision matrix fusing technical indicators (RSI, SMA-20/50, Volatility) with NLP news sentiment and Fear & Greed indices into a unified confidence metric.
- Implemented **Explainable AI (XAI)** via **SHAP**, decomposing black-box machine learning output into human-readable feature-contribution vectors.
- Architected high-concurrency real-time pipelines using Binance WebSockets for tick data streaming, backed by Redis caching and SlowAPI rate limiting for sub-10ms API responses.
- Built **MLOps tracking** functionality logging all 48-hour forecasts to continuously evaluate and surface historical directional model accuracy.

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

## 👨‍💻 Author

**Developed with ❤️ by Rehan Afroz**

- 🐙 GitHub: [@rehanafroz10](https://github.com/rehanafroz10)
- 💼 LinkedIn: [Rehan Afroz](https://www.linkedin.com/in/rehan-afroz-490340321/)
