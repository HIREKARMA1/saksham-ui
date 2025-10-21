# AI Placement Simulator - Frontend

> **Empowering Students with Real-World Job Assessment Practice**

A comprehensive web platform designed for college students and recent graduates to practice job-specific assessments, track performance, and improve placement readiness through AI-powered analytics.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Types](#user-types)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Flows](#user-flows)
- [Assessment Flow](#assessment-flow)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Contact](#contact)

---

## 🎯 Overview

The **AI Placement Simulator** replicates real-world company assessment patterns (like TCS NQT, InfyTQ, Jindal GET, etc.) and provides:

- **Job Role-Specific Simulations** - Practice assessments tailored to specific job roles
- **Multi-Round Testing** - Aptitude, Technical, Soft Skills, HR Interviews
- **AI-Powered Evaluation** - Instant feedback and performance reports
- **Comprehensive Analytics** - Track progress, identify strengths and weaknesses
- **College-Wide Monitoring** - Enable placement officers to monitor student readiness

**Supported Streams:** B.Tech, MCA, MBA, B.Sc, B.Com

---

## ✨ Key Features

### 🧑‍🎓 For Students

- **Resume Analysis** - Upload resume and get ATS score
- **Job Recommendations** - AI-powered job recommendations based on profile (15+ job cards)
- **Mock Assessments** - Complete multi-round simulations including:
  - Aptitude Test
  - Technical Test (MCQ + Coding)
  - Soft Skills Evaluation
  - Technical Mock Interview (AI-based)
  - HR Mock Interview (AI-based)
- **Performance Analytics** - Detailed reports with:
  - Sectional scores
  - Readiness Index (0-100)
  - Progress tracking & trends
  - AI-based improvement suggestions
- **Progress Tracking** - View past history, graphs, and performance trends
- **Free Trial** - One free mock test for direct sign-ups

### 🏛️ For College Admins

- **Student Management** - Monitor all registered students
- **Performance Dashboard** - View analytics by:
  - Individual students
  - Department/Branch
  - Batch-wise performance
- **Detailed Reports** - Export analytics in PDF/CSV format
- **Skill Gap Analysis** - Identify weak areas across student groups
- **Metrics Overview**:
  - Average Readiness Index per department
  - Percentage of placement-ready students
  - Skill-wise heatmap

### ⚙️ For System Admin

- **Account Management** - Create and manage college accounts
- **Student Account Creation** - Bulk or individual student account setup
- **Platform Analytics** - Overall platform usage and performance metrics
- **Subscription Management** - Handle premium access and college licenses

---

## 👥 User Types

| User Type         | Access Level   | Key Capabilities                                     |
| ----------------- | -------------- | ---------------------------------------------------- |
| **Student**       | Primary User   | Take assessments, view reports, track progress       |
| **College Admin** | Secondary User | Monitor students, export analytics, identify gaps    |
| **System Admin**  | Super User     | Manage colleges, create accounts, platform oversight |

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js (React)
- **Language:** TypeScript/JavaScript
- **Styling:** Tailwind CSS / Material-UI
- **State Management:** Redux / Context API
- **Charts & Visualization:** Recharts / Chart.js
- **PDF Generation:** jsPDF / react-pdf

### Backend Integration

- **API:** Python FastAPI
- **Database:** PostgreSQL
- **AI Services:** OpenAI GPT (evaluation), Whisper (voice analysis)
- **Authentication:** JWT-based auth

### Hosting

- **Platform:** AWS / Vercel
- **CDN:** CloudFront

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/hirekarma/aiSimulator-ui.git
   cd aiSimulator-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update the `.env.local` file with your configuration (see [Environment Variables](#environment-variables))

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
aiSimulator-ui/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (student)/     # Student dashboard & features
│   │   ├── (college)/     # College admin dashboard
│   │   ├── (admin)/       # System admin dashboard
│   │   └── api/           # API routes
│   ├── components/        # Reusable components
│   │   ├── common/        # Shared components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── assessment/    # Assessment-related components
│   │   └── analytics/     # Analytics & charts
│   ├── lib/               # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript types
│   ├── services/          # API service layer
│   └── store/             # State management
├── .env.local             # Environment variables
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Dependencies
```

---

## 🔄 User Flows

### Student Journey

```
Registration
    → Dashboard
    → Upload Resume
    → ATS Score Analysis
    → 15 Job Recommendations
    → Select Job Card
    → Multi-Round Mock Test:
        1. Aptitude Test
        2. Soft Skills Test
        3. Technical Test (MCQ + Coding)
        4. Technical Mock Interview (AI)
        5. HR Mock Interview (AI)
    → Exam Analytics & Report
    → Progress Tracking
```

**Note:** Direct sign-ups get **1 free mock test**, then require subscription.

### College Admin Journey

```
Login
    → Dashboard (Analytics Overview)
    → View All Students
    → Select Individual Student
    → View Detailed Analytics
    → Export Reports (PDF/CSV)
    → Track Department-wise Performance
```

### System Admin Journey

```
Login
    → Admin Dashboard
    → Platform Analytics
    → Create College Account (Offline Payment)
    → Create Student Accounts (Bulk/Individual)
    → Manage Subscriptions
```

---

## 📝 Assessment Flow

### Job Role Examples

| Category         | Example Roles                | Duration   | Rounds                                        |
| ---------------- | ---------------------------- | ---------- | --------------------------------------------- |
| IT/Software      | Software Engineer, Developer | 90-100 min | Aptitude, Coding, Technical MCQ, AI Interview |
| Core Engineering | Mechanical GET, Civil GET    | 60-75 min  | Aptitude, Domain MCQ, Case Study, HR          |
| Business/Sales   | BDE, Operations Executive    | 60 min     | Aptitude, Verbal, Situational, HR             |
| Finance/Commerce | Analyst, Accountant          | 60 min     | Aptitude, Domain, Case Study, HR              |
| HR/Generalist    | HR Executive, Recruiter      | 60 min     | Aptitude, HR Concepts, Interviews              |

### Scoring System

| Section           | Weightage | Evaluation Criteria             |
| ----------------- | --------- | ------------------------------- |
| Aptitude          | 25%       | Accuracy, Time Efficiency       |
| Technical/Domain  | 35%       | Concept Knowledge               |
| Soft Skills/HR    | 20%       | Communication, Confidence       |
| Overall Readiness | 20%       | AI-based cross-round evaluation |

**Readiness Index:** 0-100 score indicating placement readiness

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=your_backend_api_url
NEXT_PUBLIC_API_KEY=your_api_key

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OpenAI (for AI features)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key

# AWS Configuration (if needed)
NEXT_PUBLIC_AWS_REGION=your_aws_region
NEXT_PUBLIC_S3_BUCKET=your_s3_bucket

# Payment Integration
NEXT_PUBLIC_PAYMENT_GATEWAY_KEY=your_payment_key

# Environment
NEXT_PUBLIC_ENV=development
```

---

## 💻 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Run tests
npm run test

# Format code
npm run format
```

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- TypeScript for type safety

---

## 🚢 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to AWS

1. Build the application
2. Configure AWS Amplify or EC2
3. Set up environment variables
4. Deploy using CI/CD pipeline

---

## 🔒 Access & Subscription

### Access Tiers

| Tier                | Description                          | Limitations                      |
| ------------------- | ------------------------------------ | -------------------------------- |
| **Free**            | 1 mock test                          | Summary report only              |
| **Premium**         | Unlimited simulations                | Detailed reports + AI interviews |
| **College License** | Unlimited students + admin dashboard | Custom analytics & export        |

### Payment Model

- **Students:** Online payment via payment gateway (post free trial)
- **Colleges:** Offline payment → Admin creates account with credentials
- **Admin-Created Accounts:** No payment required for students

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🗺️ Roadmap

### Phase 1 (Current - Core Launch)

- ✅ Student Dashboard & Assessment
- ✅ College Admin Analytics
- ✅ System Admin Management
- ✅ AI-Powered Evaluation

### Phase 2 (Upcoming)

- 📱 Mobile App for Students
- 🏢 Company-Specific Exam Templates (TCS, Infosys, Accenture)
- 🎓 Trainer / EdTech Integration
- 🔗 API Integration with HireKarma Recruitment Platform

---

## 📞 Contact

**HireKarma Team**

- **Email:** info@hirekarma.in
- **Website:** [www.hirekarma.in](https://www.hirekarma.in)
- **Support:** support@hirekarma.in

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

---

## 🙏 Acknowledgments

- Built with ❤️ by the HireKarma Team
- Powered by AI to help students succeed in their placement journey

---

**Version:** 1.1 - Core Phase (Student + College)  
**Last Updated:** October 2025
