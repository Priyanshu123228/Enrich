# Enrich Ladies Beauty Parlor & Cosmetic Clinic — Web & Booking Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-rose.svg)](https://opensource.org/licenses/MIT)
[![Stack: React + Vite + Node.js](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Node.js%20%7C%20Express-be123c.svg)](https://react.dev/)
[![Database: MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47a248.svg)](https://www.mongodb.com/)
[![Google Places API](https://img.shields.io/badge/Google%20Places-API%20(New)%20Verified-4285F4.svg)](https://developers.google.com/maps/documentation/places/web-service/overview)
[![Ratings: 4.9★ (512+ Reviews)](https://img.shields.io/badge/Google%20Rating-4.9%E2%98%85%20(512%2B%20Reviews)-f59e0b.svg)](https://www.google.com/maps/place/Enrich+Ladies+Beauty+Parlor/@27.6053398,75.1384512,17z/data=!3m1!4b1!4m6!3m5!1s0x396ca5b1f3574153:0x25aebec5e5e3b1fa!8m2!3d27.6053398!4d75.1384512!16s%2Fg%2F11h4_bw5rk)

A full-stack, production-grade luxury salon management, appointment booking, and cosmetic clinic platform for **Enrich Ladies Beauty Parlor & Cosmetic Clinic**, located at **First Floor, Sharda Heights, Ramlila Maidan, Chandpol, Sikar, Rajasthan 332001, India**.

Built with **React 19 + Vite**, **Node.js + Express**, **MongoDB Atlas**, **Google Places API (New)**, **Tailwind CSS**, **Razorpay Payment Gateway**, **Cloudinary Media Storage**, and **Nodemailer Transactional Notifications**.

---

## 📑 Table of Contents

1. [Business Identity & Location](#-business-identity--location)
2. [Key Architecture & Features](#-key-architecture--features)
3. [Google Places API (New) Integration](#-google-places-api-new-integration)
4. [Technology Stack](#-technology-stack)
5. [Project Structure](#-project-structure)
6. [Environment Variables](#-environment-variables)
7. [Installation & Local Setup](#-installation--local-setup)
8. [API Endpoints Reference](#-api-endpoints-reference)
9. [Performance & SEO Optimizations](#-performance--seo-optimizations)
10. [Security & Compliance](#-security--compliance)
11. [Production Deployment Guide](#-production-deployment-guide)

---

## 📍 Business Identity & Location

* **Business Name**: Enrich Ladies Beauty Parlor & Cosmetic Clinic
* **Location**: First Floor, Sharda Heights, Ramlila Maidan, Chandpol, Sikar, Rajasthan 332001, India
* **Coordinates**: Latitude `27.6053398`, Longitude `75.1384512`
* **Google Place ID**: `ChIJU0FX87GlbDkR-rHj5cW-riU`
* **Direct Google Maps Profile**: [Enrich Ladies Beauty Parlor on Google Maps](https://www.google.com/maps/place/Enrich+Ladies+Beauty+Parlor/@27.6053398,75.1384512,17z/data=!3m1!4b1!4m6!3m5!1s0x396ca5b1f3574153:0x25aebec5e5e3b1fa!8m2!3d27.6053398!4d75.1384512!16s%2Fg%2F11h4_bw5rk)
* **Direct 1-Click Review Link**: [Write a Google Review](https://search.google.com/local/writereview?placeid=ChIJU0FX87GlbDkR-rHj5cW-riU)
* **Concierge Desk**: +91 96679 00313
* **Official Email**: `enrichparlour1212@gmail.com`
* **Live Website**: [https://enrich-mu.vercel.app](https://enrich-mu.vercel.app)

---

## 🌟 Key Architecture & Features

### 1. Client Experience & Online Booking
* **24/7 Booking Wizard**: Interactive multi-step appointment scheduler with live specialist selection, date & time slot locking, and instant confirmation.
* **Online & Salon Payments**: Seamless checkout via Razorpay (UPI, Cards, NetBanking) or Pay-at-Salon option.
* **Customer Dashboard**: View upcoming appointments, service history, invoices, profile details, and cancellation/rescheduling management.
* **Luxury HTML Emails**: Transactional notifications for booking confirmations, cancellations, reminders, and payment receipts with exact Sharda Heights GPS directions.

### 2. Live Google Reviews Integration
* **Google Places API (New)**: Live sync retrieving real Google rating (`4.9★`), total reviews (`512+`), author photos/avatars, relative timestamps, and review texts.
* **Zero Fake Data**: Static placeholder reviews have been completely removed across the frontend, seed scripts, and MongoDB.
* **1-Click Review Trigger**: Dedicated *"Write a Google Review"* button that instantly opens Google's native rating dialog.

### 3. Comprehensive Admin Console
* **Appointment Management**: Filter, approve, cancel, and reschedule bookings with calendar views.
* **Cosmetics & Retail Management**: Product catalog with stock tracking, direct Cloudinary uploads, and image URL support.
* **Inquiries & Consultation Concierge**: Customer contact inbox with reply modals, status flags, and anti-spam filters.
* **Reputation & Review Moderation**: Dual-tab dashboard showing live Google Reviews sync + internal client feedback moderation.
* **Media Showcase & Transformations**: Manage photo galleries, before/after sliders, and video walkthroughs.
* **Dynamic Social Links**: Manage active Instagram, WhatsApp, YouTube, and Facebook profiles in real-time.

---

## 🗺️ Google Places API (New) Integration

The integration uses a secure server-side proxy pattern:
```
Client Browser (React + Vite)
      │
      ▼  GET /api/v1/google-reviews
Node.js Express Backend (Cached 1-hour TTL)
      │  (X-Goog-Api-Key stored securely in .env)
      ▼
Google Places API (New) [https://places.googleapis.com/v1/places/ChIJU0FX87GlbDkR-rHj5cW-riU]
```

* **Security**: `GOOGLE_MAPS_API_KEY` is kept strictly on the backend server and never exposed to the client bundle.
* **Performance**: 1-hour in-memory cache complies with Google caching policies while eliminating redundant API bills.

---

## 💻 Technology Stack

### Frontend
* **Core**: React 19, Vite 8, React Router v7
* **Styling**: Tailwind CSS v4, Vanilla CSS Design System (Rose `#be123c`, Gold `#e2a36b`, Cream `#faf7f2`)
* **Typography**: Playfair Display (Serif), Plus Jakarta Sans (Sans-serif)
* **Icons**: Lucide React
* **Code Splitting**: `React.lazy` + `Suspense` + Rollup `manualChunks`

### Backend
* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MongoDB Atlas with Mongoose ODM
* **Security**: Helmet, Express Rate Limit, Mongo Sanitize, HPP, Force HTTPS Redirect
* **Authentication**: JWT (JSON Web Tokens) with HTTP-only Cookies + Bcrypt
* **Payments**: Razorpay Node SDK
* **Media**: Cloudinary Storage SDK & Multer
* **Email**: Nodemailer with Custom Luxury Responsive HTML Templates

---

## 📂 Project Structure

```
Enrich/
├── backend/
│   ├── src/
│   │   ├── config/              # MongoDB & Cloudinary configuration
│   │   ├── controllers/         # Express endpoint controllers
│   │   │   ├── appointment.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── googleReviews.controller.js
│   │   │   ├── inquiry.controller.js
│   │   │   ├── media.controller.js
│   │   │   ├── product.controller.js
│   │   │   └── service.controller.js
│   │   ├── middlewares/         # Auth, Role, RateLimiter, ErrorHandler
│   │   ├── models/              # Mongoose schemas (User, Service, Appointment, etc.)
│   │   ├── routes/              # Express API routers
│   │   ├── services/            # Google Places API, Razorpay, Email & OTP services
│   │   ├── templates/           # Luxury HTML email templates
│   │   └── app.js               # Express application initialization & security headers
│   ├── .env                     # Backend environment secrets
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg          # Luxury rose & gold brand favicon
│   │   ├── robots.txt           # Search crawler directives
│   │   └── sitemap.xml          # Canonical XML search sitemap
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # Admin layout, sidebar, modals
│   │   │   ├── common/          # SEO, ErrorBoundary, CookieConsent, SkeletonLoader
│   │   │   ├── gallery/         # Lightbox, BeforeAfterSlider, VideoModal
│   │   │   ├── layout/          # Navbar, Footer, MainLayout
│   │   │   └── GoogleReviews.jsx# Dynamic Google Reviews component
│   │   ├── config/              # salonConfig.js (Central business constants)
│   │   ├── context/             # AuthContext state provider
│   │   ├── pages/               # Home, Services, Cosmetics, Gallery, Offers, Admin, etc.
│   │   ├── routes/              # AppRoutes.jsx with lazy loading & guards
│   │   ├── services/            # Axios API consumer wrappers
│   │   ├── App.jsx              # Main App root with ErrorBoundary & CookieConsent
│   │   └── main.jsx
│   ├── vite.config.js           # Vite 8 config with vendor chunk splitting
│   └── package.json
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Enrich?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your_cookie_secret_here

# Client Origin
CLIENT_URL=http://localhost:5173
PRODUCTION_CLIENT_URL=https://enrich-mu.vercel.app

# Google Places API (New) Integration
GOOGLE_MAPS_API_KEY=AIzaSy...your_google_cloud_api_key
GOOGLE_PLACE_ID=ChIJU0FX87GlbDkR-rHj5cW-riU

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Razorpay Payments
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email Service (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=enrichparlour1212@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="Enrich Beauty Parlour & Clinic" <enrichparlour1212@gmail.com>
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

---

## ⚡ Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Priyanshu123228/Enrich.git
cd Enrich
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend will launch on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
The frontend will launch on `http://localhost:5173`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/health` | System health check & uptime telemetry | Public |
| **GET** | `/api/v1/google-reviews` | Verified Google Places API reviews & rating | Public |
| **POST** | `/api/v1/inquiries` | Submit contact / consultation message (Rate Limited) | Public |
| **POST** | `/api/v1/auth/signup` | Register new customer account | Public |
| **POST** | `/api/v1/auth/login` | Authenticate customer / admin | Public |
| **GET** | `/api/v1/services` | Fetch active salon services & categories | Public |
| **GET** | `/api/v1/products` | Fetch retail cosmetics catalog | Public |
| **POST** | `/api/v1/appointments` | Reserve salon session & lock slot | Customer |
| **GET** | `/api/v1/appointments/my-appointments` | View customer booking history | Customer |
| **POST** | `/api/v1/payments/create-order` | Initialize Razorpay payment order | Customer |
| **GET** | `/api/v1/admin/dashboard` | Aggregated KPIs & revenue stats | Admin |
| **GET** | `/api/v1/inquiries` | View & moderate customer inquiries | Admin |
| **PATCH** | `/api/v1/reviews/:id/approval` | Moderate internal client feedback | Admin |

---

## 🚀 Performance & SEO Optimizations

* **85% Reduced JS Bundle**: Code-split via `React.lazy()` and manual vendor chunking (`vendor-react`, `vendor-icons`). Initial homepage payload is under `29 kB` (gzipped).
* **Google LocalBusiness Schema**: Validated JSON-LD rich snippet embedded in `index.html` enabling gold 4.9★ stars in Google Search results.
* **Geographical Targeting**: Indian geo-location meta tags (`IN-RJ`, Sikar coordinates `27.605340, 75.138451`).
* **Sitemap & Robots**: Dynamic canonical `sitemap.xml` indexing all public service catalogs while protecting `/admin` routes in `robots.txt`.
* **Social Previews**: High-resolution OpenGraph and Twitter card image generation for WhatsApp, Instagram, and Facebook link sharing.

---

## 🛡️ Security & Compliance

* **Server-Side API Key Protection**: Google Places API key is isolated on backend servers.
* **Strict HTTPS Enforcement**: Automatic 301 redirection on all production traffic with `upgrade-insecure-requests` CSP header.
* **Anti-Bot Honeypots & Rate Limiting**: Invisible honeypot traps and IP limiters prevent spam floods on contact and booking forms.
* **Cookie Consent Banner**: Luxury glassmorphism banner allowing clients to accept or set essential-only cookie preferences.
* **Legal Agreements**: Dedicated Privacy Policy (`/privacy-policy`) and Terms & Conditions (`/terms-and-conditions`) pages.
* **Frontend Error Boundary**: Graceful React crash recovery with one-click page reload and homepage fallback.

---

## 🌐 Production Deployment Guide

### Deploying Backend on Render
1. Create a **New Web Service** connected to your GitHub repository (`backend` root directory).
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Add Environment Variables from the [Backend .env section](#backend-backend-env).

### Deploying Frontend on Vercel
1. Import repository on [Vercel](https://vercel.com/) with root directory set to `frontend`.
2. Add Environment Variables:
   * `VITE_API_URL` = `https://your-backend-app.onrender.com/api/v1`
   * `VITE_RAZORPAY_KEY_ID` = `rzp_live_...`
3. Click **Deploy**.

---

## 📄 License & Attribution

Copyright © 2026 **Enrich Ladies Beauty Parlor & Cosmetic Clinic**. All rights reserved.  
Google Maps, Google Places, and Google Reviews are trademarks of Google LLC.