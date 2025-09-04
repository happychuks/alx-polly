# ALX Polly: A Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project serves as a practical learning ground for modern web development concepts, with a special focus on identifying and fixing common security vulnerabilities.

## About the Application

ALX Polly allows authenticated users to create, share, and vote on polls. It's a simple yet powerful application that demonstrates key features of modern web development:

-   **Authentication**: Secure user sign-up and login.
-   **Poll Management**: Users can create, view, and delete their own polls.
-   **Voting System**: A straightforward system for casting and viewing votes.
-   **User Dashboard**: A personalized space for users to manage their polls.

The application is built with a modern tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Backend & Database**: [Supabase](https://supabase.io/)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
-   **State Management**: React Server Components and Client Components

---

## 🚀 The Challenge: Security Audit & Remediation

As a developer, writing functional code is only half the battle. Ensuring that the code is secure, robust, and free of vulnerabilities is just as critical. This version of ALX Polly has been intentionally built with several security flaws, providing a real-world scenario for you to practice your security auditing skills.

**Your mission is to act as a security engineer tasked with auditing this codebase.**

### Your Objectives:

1.  **Identify Vulnerabilities**:
    -   Thoroughly review the codebase to find security weaknesses.
    -   Pay close attention to user authentication, data access, and business logic.
    -   Think about how a malicious actor could misuse the application's features.

2.  **Understand the Impact**:
    -   For each vulnerability you find, determine the potential impact.Query your AI assistant about it. What data could be exposed? What unauthorized actions could be performed?

3.  **Propose and Implement Fixes**:
    -   Once a vulnerability is identified, ask your AI assistant to fix it.
    -   Write secure, efficient, and clean code to patch the security holes.
    -   Ensure that your fixes do not break existing functionality for legitimate users.

### Where to Start?

A good security audit involves both static code analysis and dynamic testing. Here’s a suggested approach:

1.  **Familiarize Yourself with the Code**:
    -   Start with `app/lib/actions/` to understand how the application interacts with the database.
    -   Explore the page routes in the `app/(dashboard)/` directory. How is data displayed and managed?
    -   Look for hidden or undocumented features. Are there any pages not linked in the main UI?

2.  **Use Your AI Assistant**:
    -   This is an open-book test. You are encouraged to use AI tools to help you.
    -   Ask your AI assistant to review snippets of code for security issues.
    -   Describe a feature's behavior to your AI and ask it to identify potential attack vectors.
    -   When you find a vulnerability, ask your AI for the best way to patch it.

---

## Getting Started

To begin your security audit, you'll need to get the application running on your local machine.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [Supabase](https://supabase.io/) account (the project is pre-configured, but you may need your own for a clean slate).

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd alx-polly
npm install
```

### 3. Environment Variables

The project uses Supabase for its backend. An environment file `.env.local` is needed.Use the keys you created during the Supabase setup process.

### 4. Running the Development Server

Start the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🔒 SECURITY AUDIT RESULTS & REMEDIATION

**AUDIT COMPLETED**: This codebase has been thoroughly audited and all critical security vulnerabilities have been identified and fixed.

### 🚨 CRITICAL VULNERABILITIES DISCOVERED & FIXED

#### 1. **CRITICAL: Unauthorized Data Access in Admin Panel**
- **Location**: `/app/(dashboard)/admin/page.tsx`
- **Issue**: Any authenticated user could access and delete ALL polls in the system
- **Impact**: Complete data breach - users could view and delete any poll
- **Fix Applied**: 
  - Added role-based access control
  - Implemented admin email verification
  - Added proper authentication checks
  - Redirected unauthorized users

#### 2. **CRITICAL: Missing Authorization in Poll Deletion**
- **Location**: `/app/lib/actions/poll-actions.ts` (deletePoll function)
- **Issue**: No ownership verification - any user could delete any poll by ID
- **Impact**: Complete data loss potential
- **Fix Applied**:
  - Added user authentication check
  - Implemented ownership verification with `user_id` filter
  - Added proper error handling

#### 3. **HIGH: Missing Input Validation and Sanitization**
- **Location**: Multiple locations in poll actions
- **Issue**: No validation on poll questions, options, or user inputs
- **Impact**: XSS attacks, data corruption, injection attacks
- **Fix Applied**:
  - Added comprehensive input validation functions
  - Implemented input sanitization (removing dangerous characters)
  - Added length limits and format validation
  - Validated poll options count and content

#### 4. **HIGH: Insecure Direct Object Reference**
- **Location**: `/app/(dashboard)/polls/[id]/edit/page.tsx`
- **Issue**: Users could edit any poll by changing URL parameters
- **Impact**: Unauthorized modification of polls
- **Fix Applied**:
  - Added ownership verification before allowing edits
  - Implemented proper authentication checks
  - Added redirect for unauthorized access

#### 5. **MEDIUM: Information Disclosure**
- **Location**: Admin panel and various components
- **Issue**: Exposing internal IDs, user IDs, and system information
- **Impact**: Information leakage aiding further attacks
- **Fix Applied**:
  - Removed sensitive ID exposure from admin panel
  - Limited information disclosure to necessary data only

#### 6. **MEDIUM: Missing Vote Validation**
- **Location**: Vote submission system
- **Issue**: No validation on poll existence, option validity, or duplicate votes
- **Impact**: Vote manipulation, system errors
- **Fix Applied**:
  - Added poll existence verification
  - Implemented option index validation
  - Added duplicate vote prevention for logged-in users
  - Added UUID format validation

#### 7. **LOW: Missing Security Headers**
- **Location**: Next.js configuration
- **Issue**: No security headers to prevent common attacks
- **Impact**: XSS, clickjacking, MIME sniffing attacks
- **Fix Applied**:
  - Added X-Frame-Options: DENY
  - Added X-Content-Type-Options: nosniff
  - Added Referrer-Policy: origin-when-cross-origin
  - Added X-XSS-Protection: 1; mode=block

### 🛡️ SECURITY IMPROVEMENTS IMPLEMENTED

1. **Authentication & Authorization**:
   - Proper user session validation
   - Role-based access control for admin functions
   - Ownership verification for all data operations

2. **Input Validation & Sanitization**:
   - Comprehensive input validation functions
   - XSS prevention through input sanitization
   - Length and format validation for all user inputs

3. **Data Access Control**:
   - User-specific data filtering
   - Proper error handling without information leakage
   - Secure database queries with ownership checks

4. **Vote System Security**:
   - Poll existence verification
   - Option validation
   - Duplicate vote prevention
   - Proper error messages

5. **Security Headers**:
   - Protection against common web vulnerabilities
   - Proper content type handling
   - Frame embedding prevention

### 🔧 ADDITIONAL SECURITY RECOMMENDATIONS

For production deployment, consider implementing:

1. **Rate Limiting**: Implement rate limiting for API endpoints to prevent abuse
2. **CSRF Protection**: Add CSRF tokens for state-changing operations
3. **Content Security Policy**: Implement CSP headers for additional XSS protection
4. **Database Security**: 
   - Enable Row Level Security (RLS) in Supabase
   - Implement proper database indexes
   - Regular security updates
5. **Monitoring**: Add logging and monitoring for suspicious activities
6. **Environment Security**: 
   - Use environment variables for all secrets
   - Implement proper secret rotation
   - Use different credentials for different environments

### 📋 SECURITY CHECKLIST FOR FUTURE DEVELOPMENT

- [ ] Always validate and sanitize user inputs
- [ ] Implement proper authentication and authorization checks
- [ ] Use parameterized queries to prevent injection attacks
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Add proper error handling without information disclosure
- [ ] Use HTTPS in production
- [ ] Implement proper session management
- [ ] Regular security audits and dependency updates
- [ ] Use security headers
- [ ] Implement proper logging and monitoring

---

**AUDIT STATUS**: ✅ **COMPLETED** - All critical and high-severity vulnerabilities have been identified and remediated. The application is now significantly more secure and follows security best practices.

Good luck, engineer! This security audit demonstrates the importance of thorough code review and security-first development practices. The fixes implemented serve as a foundation for secure web application development.
