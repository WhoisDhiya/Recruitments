# 🏗️ SETTINGS PAGE - ARCHITECTURE & FLOW DIAGRAM

## 📊 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                     JOBSPLATFORM APPLICATION                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼──────┐          ┌──────▼─────┐
              │  Frontend  │          │   Backend  │
              │   (React)  │          │  (Node.js) │
              └─────┬──────┘          └────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼────┐  ┌──▼────┐  ┌──▼────┐
    │Dashboard│  │Recruiter│  │ Admin │
    │ (Cand)  │  │Dashboard│  │Dashboard
    └───┬────┘  └──┬─────┘  └──┬────┘
        │          │            │
        └──────────┼────────────┘
                   │
            ⚙️ Settings Click
                   │
        ┌──────────▼──────────┐
        │  useNavigate()      │
        │ navigate('/settings')
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   React Router      │
        │  Match /settings    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  <Settings />       │
        │   Component         │
        └─────────────────────┘
```

---

## 🗂️ Arborescence des Fichiers

```
Frontend/
│
├── src/
│   ├── pages/
│   │   ├── Settings.tsx              ✨ NEW (534 lines)
│   │   ├── Settings.css              ✨ NEW (700+ lines)
│   │   ├── Dashboard.tsx             ✏️  UPDATED
│   │   ├── RecruiterDashboard.tsx   ✏️  UPDATED
│   │   ├── AdminDashboard.tsx       ✏️  UPDATED
│   │   ├── AppliedJobs.tsx
│   │   ├── PostJobPage.tsx
│   │   ├── SignIn.tsx
│   │   ├── signup.tsx
│   │   └── homepage.tsx
│   │
│   ├── App.tsx                       ✏️  UPDATED (Added route)
│   ├── main.tsx
│   ├── types.ts
│   ├── index.css
│   │
│   ├── api/
│   │   └── api.ts
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   └── assets/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🔄 Component Hierarchy

```
App.tsx
│
├── Routes
│   ├── / → Homepage
│   ├── /signup → Signup
│   ├── /signin → SignIn
│   ├── /dashboard → Dashboard
│   ├── /settings → Settings ⭐ NEW
│   └── /admin → AdminDashboard
│
└── BrowserRouter
    └── Settings Component
        ├── Header
        │   ├── Title
        │   └── Subtitle
        │
        ├── Navigation Tabs
        │   ├── Personal Tab (🟦 ACTIVE)
        │   ├── Profile Tab
        │   ├── Social Tab
        │   └── Account Tab
        │
        ├── Save Message (If saving)
        │   └── Success/Error Message
        │
        └── Content Area
            ├── Personal Form
            │   ├── First Name
            │   ├── Last Name
            │   ├── Email
            │   ├── Phone
            │   ├── Date of Birth
            │   ├── Gender (Select)
            │   ├── Nationality
            │   └── Save Button
            │
            ├── Profile Form
            │   ├── Profile Picture Upload
            │   ├── Address
            │   ├── City
            │   ├── Zip Code
            │   ├── Country
            │   ├── Bio (Textarea)
            │   └── Save Button
            │
            ├── Social Form
            │   ├── LinkedIn URL
            │   ├── Twitter URL
            │   ├── Facebook URL
            │   ├── Instagram URL
            │   ├── Portfolio URL
            │   └── Save Button
            │
            └── Account Form
                ├── Password Section
                │   ├── Current Password
                │   ├── New Password
                │   ├── Confirm Password
                │   └── Eye Toggles
                │
                ├── Notifications Section
                │   ├── Email Notifications ☑️
                │   ├── SMS Notifications ☐
                │   ├── Push Notifications ☑️
                │   ├── Job Alerts ☑️
                │   └── Save Button
```

---

## 🔗 Navigation Flow

```
Dashboard (Candidate)
│
└─→ Sidebar
    └─→ Click Settings Icon (⚙️)
        └─→ onClick Handler
            └─→ navigate('/settings')
                └─→ React Router
                    └─→ /settings Route
                        └─→ <Settings user={user} />
                            └─→ Settings Page Displayed

                                Settings Page
                                │
                                ├─→ Personal Tab
                                │   └─→ Edit Form
                                │
                                ├─→ Profile Tab
                                │   └─→ Edit Form + Upload
                                │
                                ├─→ Social Tab
                                │   └─→ Social Links Form
                                │
                                └─→ Account Tab
                                    ├─→ Password Section
                                    └─→ Notifications Section

Same flow for RecruiterDashboard and AdminDashboard
```

---

## 🧠 State Management

```
Settings Component
│
└─ formData (useState)
   ├─ Personal Fields (8 fields)
   │  ├─ firstName
   │ ├─ lastName
   │  ├─ email
   │  ├─ phone
   │  ├─ dateOfBirth
   │  ├─ nationality
   │  ├─ gender
   │  └─ [READ ONLY: user data from props]
   │
   ├─ Profile Fields (5 fields)
   │  ├─ address
   │  ├─ city
   │  ├─ zipCode
   │  ├─ country
   │  └─ bio
   │
   ├─ Social Fields (5 fields)
   │  ├─ linkedin
   │  ├─ twitter
   │  ├─ facebook
   │  ├─ instagram
   │  └─ portfolio
   │
   └─ Account Fields (7 fields)
      ├─ currentPassword
      ├─ newPassword
      ├─ confirmPassword
      ├─ emailNotifications
      ├─ smsNotifications
      ├─ pushNotifications
      └─ jobAlerts

Additional States:
├─ activeTab (Personal | Profile | Social | Account)
├─ isSaving (boolean)
├─ saveMessage (string)
├─ showPassword (boolean)
└─ showNewPassword (boolean)
```

---

## 💾 Data Flow

```
┌──────────────────────────────────────────────┐
│  User Input (Form Fields)                    │
└────────────┬─────────────────────────────────┘
             │
             │ handleInputChange()
             │
┌────────────▼─────────────────────────────────┐
│  State Update (setFormData)                  │
└────────────┬─────────────────────────────────┘
             │
             │ User clicks "Save Changes"
             │
┌────────────▼─────────────────────────────────┐
│  handleSave() / handlePasswordChange()       │
└────────────┬─────────────────────────────────┘
             │
             │ setIsSaving(true)
             │ API Call (Future)
             │
┌────────────▼─────────────────────────────────┐
│  Response Handling                           │
└────────────┬─────────────────────────────────┘
             │
             ├─ Success:
             │  └─ setSaveMessage('✓ saved')
             │
             └─ Error:
                └─ setSaveMessage('Error')
```

---

## 🎨 CSS Cascade

```
Settings.css
│
├─ .settings-container         (Main container, max-width: 1000px)
│  │
│  ├─ .settings-header
│  │  ├─ .settings-title       (h1)
│  │  └─ .settings-subtitle    (p)
│  │
│  ├─ .settings-tabs           (Flex, gap: 12px)
│  │  └─ .settings-tab.active  (Blue background)
│  │
│  ├─ .save-message            (Green alert, animation)
│  │  └─ .close-message        (Button)
│  │
│  └─ .settings-content
│     └─ .settings-section     (Fade-in animation)
│        │
│        ├─ .form-group
│        │  ├─ label
│        │  ├─ input
│        │  ├─ select
│        │  └─ textarea
│        │
│        ├─ .form-row          (Grid: 2 columns)
│        │  ├─ .form-group
│        │  └─ .form-group
│        │
│        ├─ .form-actions
│        │  ├─ .btn-save       (Green)
│        │  └─ .btn-cancel     (Gray)
│        │
│        ├─ .profile-image-container
│        │
│        ├─ .social-links-group
│        │
│        ├─ .password-input-group
│        │  └─ .password-toggle (Eye icon)
│        │
│        ├─ .settings-subsection
│        │  └─ .subsection-title
│        │
│        └─ .checkbox-group
│           └─ .checkbox-label
```

---

## 📱 Responsive Breakpoints

```
Mobile View (< 480px)
┌─────────────┐
│  Settings   │
├─────────────┤
│ Personal |..│  ← Scrollable tabs
├─────────────┤
│ Full width  │
│ form group  │
│             │
│ [Save Btn]  │
└─────────────┘

Tablet View (481px - 768px)
┌──────────────────┐
│   Settings       │
├──────────────────┤
│ Personal Profile │  ← Visible tabs
├──────────────────┤
│ Form 1    Form 2 │
│   (2 columns)    │
│                  │
│  [Save Button]   │
└──────────────────┘

Desktop View (769px+)
┌────────────────────────────────┐
│        Settings                │
├────────────────────────────────┤
│ Personal Profile Social Account │ ← All tabs visible
├────────────────────────────────┤
│ Form 1                  Form 2  │
│ (Max 1000px width)              │
│                                 │
│           [Save Button]         │
└────────────────────────────────┘
```

---

## 🔐 Security Flow

```
Login
  │
  ├─→ JWT Token Created
  │   └─→ Stored in localStorage
  │
  ├─→ Navigate to Dashboard
  │   └─→ User object stored
  │
  ├─→ Click Settings
  │   └─→ useNavigate('/settings')
  │
  ├─→ React Router Check
  │   ├─ User authenticated? ✅ YES
  │   ├─ Has valid token? ✅ YES
  │   └─→ Allow access to Settings
  │
  └─→ Settings Page Loaded
      └─→ User data pre-filled (if available)

Logout
  │
  ├─→ apiService.logout()
  │   ├─ Clear localStorage
  │   └─ Clear user state
  │
  ├─→ Try to access /settings
  │   └─→ <Navigate to="/signin" />
  │
  └─→ Redirected to signin page
```

---

## 📊 Component Props & State Summary

```
<Settings />
│
├─ Props
│  └─ user?: any              (Pre-fill user data)
│
└─ Internal State
   ├─ activeTab: 'Personal' | 'Profile' | 'Social' | 'Account'
   ├─ formData: FormData object (30+ fields)
   ├─ isSaving: boolean
   ├─ saveMessage: string
   ├─ showPassword: boolean
   └─ showNewPassword: boolean
```

---

## 🚀 Deployment Flow

```
Development
  │
  ├─→ npm run dev        (Local dev server)
  │   └─→ http://localhost:5173
  │
  ├─→ Test all features
  │
  └─→ Production Build

Production
  │
  ├─→ npm run build      (Bundle optimization)
  │   └─→ /dist folder
  │
  ├─→ Deploy to server
  │   ├─→ Upload dist files
  │   └─→ Configure server
  │
  ├─→ Backend API ready
  │   ├─→ /api/user/settings
  │   ├─→ /api/user/password/change
  │   └─→ ... (other endpoints)
  │
  └─→ Live Application ✅
      └─→ Settings fully functional
```

---

## 🔄 Update Flow (Future with Backend)

```
User edits form
    │
    ├─→ onChange handler
    │   └─→ Update formData state
    │
    ├─→ User clicks "Save Changes"
    │   └─→ handleSave() called
    │
    ├─→ setIsSaving(true)
    │
    ├─→ API Call: PUT /api/user/settings
    │   │
    │   ├─→ Frontend sends formData
    │   │   └─→ Includes JWT token
    │   │
    │   ├─→ Backend receives request
    │   │   ├─→ Validate token
    │   │   ├─→ Validate data
    │   │   └─→ Update database
    │   │
    │   └─→ Backend sends response
    │       ├─ Success (200)
    │       └─ Error (400, 401, 500)
    │
    ├─→ Frontend handles response
    │   ├─ Success: setSaveMessage('✓ saved')
    │   └─ Error: setSaveMessage('Error msg')
    │
    ├─→ setIsSaving(false)
    │
    └─→ User sees confirmation
        └─→ Message auto-hides after 3s
```

---

**Dernière mise à jour:** November 10, 2025
