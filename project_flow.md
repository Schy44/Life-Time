# Profitable Matchmaking Flow: The "Blurry-to-Unlock" Strategy

This document outlines a highly optimized user journey designed to maximize user engagement while creating a sustainable, non-coercive revenue model.

---

## 1. Core Philosophy: "Proof of Interest"
Instead of charging users for a monthly subscription to see *everything*, we charge them only when they find someone who is **mutually interested**. This eliminates the feeling of "paying to see fake profiles" and builds trust.

---

## 2. The Comprehensive User Journey

### Phase 1: Discovery (The "Nudge")
Users browse profiles discovered via the algorithm.
- **Visuals**: Primary profile image is **blurred** (using CSS filter). 
- **Information Visibility**:
    - **Visible**: Surname (Last Name), Age, City, Religion, Profession, Compatibility Score.
    - **Hidden**: First Name, High-res images, Contact details, Full Bio, Family details.
- **Psychological Trigger**: Curiosity. The user sees a high compatibility score and a "matching type" (e.g., "Software Engineer from London"), but can't see the face clearly.

### Phase 2: Expression of Interest (High Engagement/Zero Friction)
- **Action**: User clicks "Send Interest".
- **Cost**: **FREE** (or 1 credit for premium visibility).
- **Goal**: Encourage users to interact as much as possible. A busy notification bell is the best retention tool.

### Phase 3: Reciprocity (The Validation)
The recipient receives a notification: *"Someone highly compatible is interested in you!"*
- **Action**: Recipient views the sender's blurred profile and can click **Accept** or **Decline**.
- **Outcome**: If Accepted, it becomes a **"Mutual Match"**.

### Phase 4: The Revenue Moment (The "Unlock")
Once a Mutual Match exists, both users get a "Match Success" notification.
- **The Paywall**: A button appears: **"Unlock Full Profile & Chat"**.
- **Conditions to Unlock**:
    1. **Mutual Approval**: Both must have said "Yes" (already done in Phase 3).
    2. **Credit Payment**: User spends **X Credits** (e.g., 5-10 credits) to unlock this specific connection forever.
- **Transparency**: Users are told: *"You only pay once you both agree there's a match. No wasted credits on inactive profiles."*

### Phase 5: Connection (Retention)
Once unlocked:
- Photos become clear (CSS blur removed).
- Full bio and family details appear.
- Direct messaging/Chat is enabled.

---

## 3. Business Perspective: Profitability Highlights

| Feature | Revenue Impact | User Sentiment |
| :--- | :--- | :--- |
| **Blurry Previews** | High curiosity drives actions. | Anticipation, not frustration. |
| **Free Requests** | High volume of "Interests" keeps people logging in. | No barrier to start. |
| **Pay-per-Match** | Perceived as "fair value" for a real connection. | High trust; "I only pay when I win." |
| **Credit Top-ups** | Users buy packs (10, 50, 100 credits) to be ready for the "Unlock" moment. | Micropayments are easier to convert than subs. |

---

## 4. Implementation Roadmap (Technical Execution)

### [A] Frontend: Blurry UI
Use a conditional CSS class in React:
```css
.profile-image-blurred {
  filter: blur(8px) brightness(0.9);
  transition: filter 0.5s ease;
}
```
Apply this if `match.is_unlocked` is false.

### [B] Backend: Connection State
Modify the `Interest` model or create a `Connection` model to track:
- `is_mutual`: Boolean.
- `unlocked_by_sender`: Boolean.
- `unlocked_by_receiver`: Boolean.

### [C] Backend: Credit Logic
An API endpoint `/api/interests/{id}/unlock/` that:
1. Checks if `is_mutual == True`.
2. Checks user `CreditWallet`.
3. Deducts credits and updates `unlocked_by_user = True`.

---

## 5. Avoiding the "Scam" Feeling
- **Golden Rule**: Never hide the Compatibility Score. It justifies why the user should pay for *this* specific match.
- **Limit Blur**: Allow the "Origin City" and "Profession" to be crystal clear. This provides enough "real data" to make the paywall feel like a shortcut to a real person, not a gamble.
