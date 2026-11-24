# KENYA CREATES

> **YOUR IDEAS. YOUR PROJECTS. YOUR FUTURE.**  
> *Kenya's home for ideas, innovation, creativity and projects.*  
> **Powered by KenyaOne**

---

## 1. Overview & Vision

**KENYA CREATES** is a sovereign national digital platform that gives every Kenyan an opportunity to showcase what they are creating, developing, inventing, researching, building, or planning.

From an irrigation valve in Murang'a, a clean water desalination pod in Turkana, a machine learning disease detector in Kisumu, to biomedical prosthetics engineered in Kiambu and Swahili spatial folklore in Mombasa, Kenya Creates unites creators across all 47 counties and the global diaspora.

---

## 2. Key Features

### 🏛️ National Innovation Showcase & 47 Counties
- **Live Database-Derived Statistics**: Real-time counters for projects published, ideas submitted, counties represented, registered creators, collaborations, and opportunities.
- **Interactive 47-County Explorer**: Filter innovations by any of Kenya's 47 counties (Nairobi, Mombasa, Kisumu, Nakuru, Turkana, Machakos, Garissa, etc.).
- **21 Sector Categories**: Technology & AI, Agriculture, Health, Green Energy, Environment, CBC Education, Engineering, Transport/E-mobility, Arts & Culture, and more.

### 📝 6-Step Comprehensive Project Submission System
1. **Project Identity**: Title, tagline, category, county, sub-county, locality, year, language, and links.
2. **Development Stage**: Concept, research, prototype in development, prototype completed, testing, pilot, or operational.
3. **Materials Upload**: Cover photos, gallery, demonstration video link, and research papers/CAD files.
4. **Creator Needs**: Funding, investors, developers, mechanical engineers, manufacturing support, mentors, or volunteers.
5. **Intellectual Property & Transparency**: Clear notice that creators retain 100% of their IP rights, terms of publication, and visibility selection (Public, Limited, Draft).
6. **Preview & Submission**: Full card review, save draft, or instant submission to the technical moderation board.

### 👥 Collaboration Centre & Marketplace
- Post and browse requests for technical co-builders, engineers, agronomists, and marketing partners.
- In-platform proposal applications with skill matching.

### 🎯 Verified Opportunities Directory
- Real Kenyan grants (KeNIA National Innovation Awards, KCIC Climate Fund, Safaricom Spark Accelerator, East African Arts Fellowships) with deadlines and direct links.

### ✨ Kenya Creates AI Assistant
- Integrated with Gemini models via a secure server-side endpoint (`/api/ai/assist`).
- Helps creators structure problem statements, formulate executive summaries, generate 6-month roadmaps, and translate descriptions between English and Swahili.

### 🪐 Immersive 3D WebXR Spatial Dome Exhibition
- Powered by **XR Blocks** (`xrblocks@0.24.0` and Three.js).
- Features a glowing 3D Kenya holographic centerpiece with 47 orbiting county nodes.
- Interactive 3D prototype pedestal showcasing physical prototypes (Soil valve, spectral drone, desalination tank, myoelectric robotic hand).
- Built-in `xb.UICard` with spatial buttons and light controls.
- Seamless toggle between Full Web Platform mode and Immersive 3D Spatial Dome.

### 🛡️ Administration & Moderation Control Centre
- 1-click project approval, change requests, and rejection with audit logging.
- Verification badges: Community Submitted, Profile Reviewed, Org Verified, Evidence Reviewed, Featured.
- Factory reset and testing controls.

### 🔒 Privacy & Kenya Data Protection Act (DPA 2019)
- User data export (`.json`) and privacy controls.
- Safe contact mechanisms without exposing private telephone numbers or residential addresses.

---

## 3. Technology Architecture

- **Frontend Framework**: Vanilla TypeScript + XR Blocks (`xb.Script`) + Tailwind CSS.
- **3D Spatial Engine**: Three.js (`three@0.186.0`) & WebXR device API with Android XR / desktop simulator support.
- **Server-Side API**: Node.js Vite server middleware (`/api/ai/assist`) calling `@google/genai` (`gemini-3.8-flash`) with telemetry header `'User-Agent': 'aistudio-build'`.
- **State & Storage**: Reactive `StorageService` with local storage persistence and automated audit logging.

---

## 4. Running & Verification

```bash
# Start development server on port 3000
npm run dev

# Run unit tests (Node built-in runner via tsx)
npx --yes tsx --test src/services/storageService.test.ts

# Type-check and lint
npm run lint

# Production build
npm run build
```
