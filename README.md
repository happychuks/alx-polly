# ALX Polly: A Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project serves as a practical learning ground for modern web development concepts, with a special focus on identifying and fixing common security vulnerabilities.

## 📋 Project Overview

ALX Polly is a comprehensive polling platform that allows users to create, share, and vote on polls with QR code integration for easy sharing. The application demonstrates modern web development practices including secure authentication, data validation, and responsive UI design.

### Key Features

-   **🔐 Secure Authentication**: User registration, login, and session management
-   **📊 Poll Management**: Create, edit, delete, and view polls with real-time updates
-   **🗳️ Voting System**: Cast votes with duplicate prevention and validation
-   **📱 QR Code Sharing**: Generate QR codes for easy poll sharing
-   **👤 User Dashboard**: Personalized space for managing polls and viewing statistics
-   **🛡️ Security First**: Comprehensive input validation, XSS prevention, and ownership verification

### Technology Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Backend & Database**: [Supabase](https://supabase.io/)
-   **UI Components**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
-   **State Management**: React Server Components and Client Components
-   **Authentication**: Supabase Auth with server-side session management
-   **QR Code Generation**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)

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

## 🚀 Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v20.x or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [Supabase](https://supabase.io/) account

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd alx-polly
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Supabase Configuration

1. **Create a new Supabase project:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Note down your project URL and anon key

2. **Set up the database schema:**
   ```sql
   -- Create polls table
   CREATE TABLE polls (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     question TEXT NOT NULL,
     options TEXT[] NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create votes table
   CREATE TABLE votes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
     option_index INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
   ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view all polls" ON polls FOR SELECT USING (true);
   CREATE POLICY "Users can create polls" ON polls FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own polls" ON polls FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete own polls" ON polls FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view all votes" ON votes FOR SELECT USING (true);
   CREATE POLICY "Users can create votes" ON votes FOR INSERT WITH CHECK (true);
   ```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📖 Usage Examples

### Creating a Poll

1. **Register/Login**: Create an account or sign in to access the dashboard
2. **Navigate to Create**: Click "Create Poll" in the dashboard
3. **Fill out the form**:
   - Enter your poll question (3-500 characters)
   - Add at least 2 options (up to 10 options allowed)
   - Each option can be 1-200 characters
4. **Submit**: Click "Create Poll" to save your poll

### Voting on Polls

1. **Find a poll**: Browse polls or use a shared link
2. **Select an option**: Click on your preferred choice
3. **Submit vote**: Your vote is recorded (authenticated users can only vote once per poll)

### Sharing Polls

1. **Access poll**: Navigate to any poll's detail page
2. **Copy link**: Use the share button to copy the poll URL
3. **QR Code**: Generate a QR code for easy mobile sharing
4. **Share**: Send the link or QR code to others

### Managing Your Polls

1. **View all polls**: Access your dashboard to see all created polls
2. **Edit poll**: Click edit on any poll you own to modify question/options
3. **Delete poll**: Remove polls you no longer need
4. **View results**: See real-time vote counts and statistics

## 🧪 Testing the Application

### Manual Testing

1. **Authentication Flow**:
   ```bash
   # Test user registration
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

2. **Poll Creation**:
   - Create a poll with valid data
   - Try creating polls with invalid data (empty question, too few options)
   - Verify input validation works correctly

3. **Voting System**:
   - Vote on polls as authenticated user
   - Try voting multiple times (should be prevented)
   - Test anonymous voting functionality

4. **Security Testing**:
   - Try accessing polls you don't own
   - Attempt to edit/delete other users' polls
   - Test input sanitization with malicious content

### Automated Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Performance Testing

```bash
# Build and analyze bundle size
npm run build
npm run analyze

# Run Lighthouse audit
npm run lighthouse
```

### Security Testing

```bash
# Run security audit
npm audit

# Fix security vulnerabilities
npm audit fix

# Run dependency check
npm run security-check
```

## 🏗️ Codebase Structure

```
alx-polly/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/               # Admin panel
│   │   ├── create/              # Poll creation
│   │   └── polls/               # Poll management
│   ├── components/              # Reusable components
│   ├── lib/                     # Core application logic
│   │   ├── actions/             # Server Actions
│   │   ├── context/             # React Context providers
│   │   └── types/               # TypeScript type definitions
│   └── globals.css              # Global styles
├── components/                   # Shared UI components
│   └── ui/                      # shadcn/ui components
├── lib/                         # Utility libraries
│   └── supabase/                # Supabase client configuration
├── public/                      # Static assets
└── middleware.ts                # Next.js middleware
```

## 📚 API Documentation

### Server Actions

#### Poll Actions (`app/lib/actions/poll-actions.ts`)

- **`createPoll(formData: FormData)`**: Creates a new poll with validation
- **`getUserPolls()`**: Retrieves all polls for the authenticated user
- **`getPollById(id: string)`**: Fetches a specific poll by ID
- **`submitVote(pollId: string, optionIndex: number)`**: Records a vote for a poll
- **`deletePoll(id: string)`**: Deletes a poll (owner only)
- **`updatePoll(pollId: string, formData: FormData)`**: Updates a poll (owner only)

#### Auth Actions (`app/lib/actions/auth-actions.ts`)

- **`login(data: LoginFormData)`**: Authenticates a user
- **`register(data: RegisterFormData)`**: Registers a new user
- **`logout()`**: Signs out the current user
- **`getCurrentUser()`**: Gets the current authenticated user
- **`getSession()`**: Retrieves the current session

### Database Schema

#### Polls Table
```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Votes Table
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Type Definitions

```typescript
interface Poll {
  id: string;
  question: string;
  options: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Vote {
  id: string;
  poll_id: string;
  user_id: string | null;
  option_index: number;
  created_at: string;
}
```

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

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run tsc          # Run TypeScript compiler

# Testing (if configured)
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any` types
- **Components**: Prefer Server Components, use Client Components only when necessary
- **Security**: Always validate and sanitize user input
- **Error Handling**: Use try/catch blocks and proper error boundaries
- **Documentation**: Add JSDoc comments for all public functions

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

#### 1. Supabase Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify Supabase project is active
# Check Supabase dashboard for project status
```

#### 2. Authentication Problems
- Ensure Supabase Auth is enabled in your project
- Check that email confirmation is configured correctly
- Verify RLS policies are set up properly

#### 3. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run tsc
```

#### 4. Database Issues
- Verify database schema is created correctly
- Check RLS policies are enabled
- Ensure proper foreign key relationships

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Report security issues privately to maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.io/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
