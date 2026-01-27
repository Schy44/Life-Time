# Life-Time: Project Features & Technical Documentation

This document provides a comprehensive overview of the **Life-Time** project, detailing the implemented features, their technical architecture, and the logic behind each.

---

## 1. Architecture Overview

- **Backend**: Python / Django REST Framework (DRF)
- **Frontend**: React.js / Tailwind CSS / Framer Motion
- **Database**: PostgreSQL (Supabase)
- **Real-time**: Supabase Realtime (Postgres Changes)
- **Storage**: Supabase Storage (for profile and additional images)
- **Payments**: SSLCommerz & Stripe

---

## 2. Core Feature Modules

### 👤 User Onboarding & Profile Management
The foundation of the platform, enabling users to create detailed matrimonial profiles.

- **Initial Survey**: Users complete a comprehensive survey covering identity, lifestyle, and preferences.
    - **Page**: [SurveyPage.jsx](file:///e:/Life_Time/frontend/src/pages/SurveyPage.jsx)
- **Profile Detail**: A centralized hub for editing personal information, photos, and social links.
    - **Page**: [profile_page.jsx](file:///e:/Life_Time/frontend/src/pages/profile_page.jsx)
- **Public Profile View**: How other users see a profile. Includes privacy controls and "locked" sections for premium data.
    - **Page**: [PublicProfilePage.jsx](file:///e:/Life_Time/frontend/src/pages/PublicProfilePage.jsx)
    - **Backend View**: `ProfileViewSet.retrieve` in [api/views.py](file:///e:/Life_Time/backend/api/views.py)

### 🧩 Discovery & Matching Algorithm
Technically sophisticated system to rank and filter potential partners.

- **Matching Logic**: Uses a weighted scoring system based on mutual preferences (Age, Religion, Country, Marital Status, Profession, Height).
    - **Service**: [matching_service.py](file:///e:/Life_Time/backend/api/services/matching_service.py)
    - **Formula**: `(My_Score_for_Them + Their_Score_for_Me) / 2`
- **Search & Filters**: Debounced search allowing filtering by age, gender, and interests.
    - **Page**: [ProfilesListPage.jsx](file:///e:/Life_Time/frontend/src/pages/ProfilesListPage.jsx)
- **Match Recommendations**: Top-ranked profiles displayed on a landing preview page.
    - **Page**: [MatchPreviewPage.jsx](file:///e:/Life_Time/frontend/src/pages/MatchPreviewPage.jsx)

### 🤝 Engagement & Interests
The workflow for users to connect.

- **Interest Workflow**: Users can "Send Interest". If accepted, a chat room is automatically created.
    - **Backend Model**: `Interest` in [api/models.py](file:///e:/Life_Time/backend/api/models.py)
    - **Notification Trigger**: `post_save` signal in [api/models.py](file:///e:/Life_Time/backend/api/models.py#L348)
- **Real-time Notifications**: Instant updates for views, interests, and acceptances using Supabase Realtime.
    - **Component**: [NotificationsDropdown.jsx](file:///e:/Life_Time/frontend/src/components/NotificationsDropdown.jsx)
    - **Tech**: Listens for `INSERT` events on the `api_notification` table filtered by `recipient_id`.

### 💳 Monetization & Subscriptions
Credit-based system with tiered subscription plans.

- **Subscription Plans**: Three tiers (Silver, Gold, Platinum) with different feature sets and credit allocations.
    - **Backend Logic**: [subscription/views.py](file:///e:/Life_Time/backend/subscription/views.py)
- **Credit Wallet**: Users spend credits to unlock sensitive profile sections or initiate chats.
    - **Wallet Model**: `CreditWallet` in [subscription/models.py](file:///e:/Life_Time/backend/subscription/models.py#L40)
- **Dual Gateways**: Integration with SSLCommerz (Region-specific) and Stripe (Global).
    - **Gateways Path**: [backend/subscription/gateways/](file:///e:/Life_Time/backend/subscription/gateways/)

### 💬 Messaging System
Private communication between matched users.

- **Chat Rooms**: Created only after an interest is accepted.
    - **Page**: [ChatPage.jsx](file:///e:/Life_Time/frontend/src/pages/ChatPage.jsx)
- **Message Privacy**: Messages are stored in the database but managed via a secure logic where both participants must "Unlock" the chat (spending credits) to view content.
    - **Logic**: `ChatUnlock` model and `ChatRoomSerializer`.

### 📊 Analytics & Insights
Premium dashboard for users to track their profile performance.

- **Metrics Tracking**: Profile views, search appearances, and interest trends.
    - **Service**: [analytics_service.py](file:///e:/Life_Time/backend/api/services/analytics_service.py)
- **Visitor History**: See who viewed your profile, with names masked for non-unlocked visitors.
    - **Dashboard**: [AnalyticsDashboard.jsx](file:///e:/Life_Time/frontend/src/pages/AnalyticsDashboard.jsx)
- **Profile Strength**: A numerical score (0-100) with actionable recommendations to improve visibility.

---

## 3. Notable Technical Implementations

### Name Masking Logic
To protect privacy, the system masks names (e.g., "Member", "Khan", or "S. *****") based on whether a connection exists.
- **Location**: `ProfileSerializer.to_representation` in [api/serializers.py](file:///e:/Life_Time/backend/api/serializers.py#L362)

### PDF Biodata Generation
A feature allowing users to download a professional PDF summary of their profile.
- **Frontend Handling**: `handleDownloadPDF` in [PublicProfilePage.jsx](file:///e:/Life_Time/frontend/src/pages/PublicProfilePage.jsx)

### Real-time Chat Subscription
Chat messages appear instantly without refresh.
- **Logic**: `useEffect` subscription in [ChatRoomPage.jsx](file:///e:/Life_Time/frontend/src/pages/ChatRoomPage.jsx)

---

## 📂 Project Structure Registry

| Category | Key Files/Paths |
| :--- | :--- |
| **Backend Core** | `backend/api/` |
| **Subscription Logic** | `backend/subscription/` |
| **Database Schema** | `backend/api/models.py`, `backend/subscription/models.py` |
| **Frontend Components** | `frontend/src/components/` |
| **Frontend Pages** | `frontend/src/pages/` |
| **API Services (FE)** | `frontend/src/services/` |
| **Global Styles** | `frontend/src/index.css` |
