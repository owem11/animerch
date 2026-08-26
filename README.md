# Animerch — AI-Powered Anime Merchandise Platform.

Animerch is a full-stack e-commerce platform built with Next.js, Node.js, and Supabase PostgreSQL. The platform integrates a **Learning-to-Rank (LRS)** machine learning model to optimize product discovery, alongside an automated AI email support pipeline and interactive admin analytics.

---

## ✨ Key Features

* **Smart Product Ranking:** Integrates a Learning to Rank (LRS) model to dynamically order products based on user interaction patterns and relevancy.
* **Automated AI Support Pipeline:** Built-in AI workflow to handle and respond to customer support emails automatically.
* **Responsive Storefront:** Next.js application featuring dynamic theme switching and modern UI powered by Tailwind CSS.
* **Authentication & Authorization:** Secure user sign-in using Google OAuth via Supabase Auth.
* **Admin Analytics Dashboard:** Interactive real-time analytics tracking revenue, sales metrics, and inventory updates.
* **Cloud Infrastructure:** Serverless architecture optimized for high-performance deployment on Vercel.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

### **Backend & Database**
* **Server:** Node.js, Express.js
* **Database:** Supabase (PostgreSQL)
* **Authentication:** Google OAuth / Supabase Auth
* **APIs:** RESTful API Endpoints

### **Machine Learning & Automation**
* **Recommendation System:** Learning to Rank (LRS) Model
* **Email Automation:** Node.js pipeline with AI email processing

---

## 📁 Repository Structure

```text
animerch/
├── src/
│   ├── components/      # Reusable UI components (Navbar, Product Cards, Buttons)
│   ├── pages/           # Next.js routes and API endpoints
│   ├── styles/          # Tailwind CSS configuration and custom styles
│   ├── utils/           # Supabase client setup, OAuth configs, and helper functions
│   └── models/          # LRS recommendation logic and inference scripts
├── public/              # Static assets (images, icons)
├── .env.example         # Environment variables template
├── package.json
└── README.md
