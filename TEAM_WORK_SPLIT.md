# SkillBridge Team Work Split

Use this split so four people can push to GitHub without stepping on each other's files.

## Do Not Push

Do not commit these files or folders:

```text
.env
server/.env
client/.env
node_modules/
client/node_modules/
server/node_modules/
dist/
client/dist/
```

Commit `.env.example` files instead.

## Person 1: Backend Core, Database, Admin Permissions

Branch:

```text
feature/backend-core-admin
```

Owns:

```text
server/server.js
server/seed.js
server/models/Freelancer.js
server/models/Service.js
server/models/Inquiry.js
server/models/User.js
server/middlewares/requireAuth.js
server/middlewares/requireAdmin.js
server/routes/freelancers.js
server/routes/services.js
server/routes/inquiries.js
server/utils/db.js
```

Responsibilities:

```text
MongoDB connection, schemas, seed data, CRUD routes, admin-only route protection, one-profile-per-user freelancer ownership.
```

## Person 2: Auth, Email, Verification, Chat Backend

Branch:

```text
feature/auth-email-chat
```

Owns:

```text
server/models/Conversation.js
server/models/Message.js
server/routes/auth.js
server/routes/chats.js
server/utils/auth.js
server/utils/email.js
server/.env.example
.env.example
SETUP.md
```

Responsibilities:

```text
Signup/login, email verification link/OTP, SMTP/Nodemailer, admin email list parsing, chat APIs, email notifications.
```

## Person 3: Frontend Public Marketplace UI

Branch:

```text
feature/public-marketplace-ui
```

Owns:

```text
client/src/pages/HomePage.jsx
client/src/pages/BrowsePage.jsx
client/src/pages/FreelancerProfilePage.jsx
client/src/pages/ContactPage.jsx
client/src/pages/NotFoundPage.jsx
client/src/components/AIScopeAssistant.jsx
client/src/components/CategoryPill.jsx
client/src/components/ContactForm.jsx
client/src/components/FreelancerCard.jsx
client/src/components/ServiceCard.jsx
client/src/components/StarRating.jsx
```

Responsibilities:

```text
Home, browse, profile pages, inquiry modal, public freelancer cards, AI scoping layout, public marketplace polish.
```

## Person 4: Frontend Auth, Admin, Dashboard, App Shell

Branch:

```text
feature/auth-admin-dashboard-ui
```

Owns:

```text
client/src/App.jsx
client/src/main.jsx
client/src/index.css
client/src/services/api.js
client/src/context/AuthContext.jsx
client/src/components/Navbar.jsx
client/src/components/Footer.jsx
client/src/components/ProtectedRoute.jsx
client/src/pages/AdminPage.jsx
client/src/pages/LoginPage.jsx
client/src/pages/SignupPage.jsx
client/src/pages/VerifyEmailPage.jsx
client/src/pages/MyFreelancerProfilePage.jsx
client/src/pages/ChatPage.jsx
```

Responsibilities:

```text
Routing, global styling, API client, auth state, protected routes, admin dashboard, signup/login/verification UI, chat UI, self-posted freelancer profile UI.
```

## Shared Files Rule

Only one person should edit these at a time:

```text
package.json
package-lock.json
client/package.json
server/package.json
client/src/services/api.js
client/src/App.jsx
server/server.js
```

If a dependency is needed, tell the team first, install it once, then everyone pulls the updated lockfile.

## Push Workflow

Each person should use:

```powershell
git checkout -b feature/your-area-name
git add files-you-own
git commit -m "Clear message for your area"
git push origin feature/your-area-name
```

Then open a pull request into `main`.

## Merge Order

Recommended merge order:

```text
1. Person 1 backend core/admin permissions
2. Person 2 auth/email/chat backend
3. Person 4 auth/admin/dashboard frontend
4. Person 3 public marketplace frontend
```

Before every push:

```powershell
npm run build
```

For backend edits, also run:

```powershell
cd server
$files = Get-ChildItem -Recurse -File . | Where-Object { $_.Extension -eq '.js' }; foreach ($file in $files) { node --check $file.FullName }
```
