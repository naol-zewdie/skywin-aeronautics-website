# Comprehensive Testing & Review Prompt

## Agent Testing Protocol - Skywin Aeronautics Website

Execute the following systematic checks. If any errors are found, fix them immediately. Report all findings.

---

## 1. FOLDER ORGANIZATION & STRUCTURE

### Backend (`/server`)
```
Check:
- src/modules/ has consistent structure (controller, service, dto, schema, module)
- src/common/ contains shared utilities, guards, decorators
- src/config/ for configuration files
- test/ directory for e2e and unit tests
- All modules registered in app.module.ts
- No orphaned/unused files
- File naming conventions (kebab-case for files, PascalCase for classes)
```

**Verify each module has:**
- [ ] `[name].module.ts`
- [ ] `[name].controller.ts` 
- [ ] `[name].service.ts`
- [ ] `dto/create-[name].dto.ts`
- [ ] `dto/update-[name].dto.ts`
- [ ] `dto/[name].dto.ts`
- [ ] `schemas/[name].schema.ts`
- [ ] `*.spec.ts` test files

### Frontend (`/admin`)
```
Check:
- app/(dashboard)/ pages follow naming convention
- components/ui/ shadcn components properly configured
- components/layout/ for shared layout components
- lib/ for utilities and API clients
- contexts/ for React contexts
- hooks/ for custom hooks
- types/ for TypeScript interfaces
- public/ for static assets
```

**Verify:**
- [ ] Each route has proper folder structure
- [ ] [id]/ routes for dynamic segments
- [ ] new/ folders for creation pages
- [ ] No empty/unused files
- [ ] Consistent file naming

---

## 2. ERROR HANDLING VERIFICATION

### Backend Error Handling
**Check every controller and service:**
- [ ] All async functions have try-catch blocks where needed
- [ ] NotFoundException thrown for missing resources
- [ ] BadRequestException for invalid inputs
- [ ] UnauthorizedException for auth failures
- [ ] ForbiddenException for permission violations
- [ ] InternalServerErrorException logged but sanitized for client
- [ ] Error messages are descriptive but don't leak sensitive info

**Test error scenarios:**
- [ ] Request non-existent ID (should return 404)
- [ ] Send invalid JSON (should return 400)
- [ ] Access without token (should return 401)
- [ ] Access with wrong role (should return 403)
- [ ] Validation errors return proper messages

### Frontend Error Handling
**Check every API call:**
- [ ] All API calls wrapped in try-catch
- [ ] Error boundaries implemented for React components
- [ ] Network errors handled gracefully
- [ ] Toast notifications for errors with descriptive messages
- [ ] Form submission errors show field-level feedback
- [ ] Loading states prevent double-submission

---

## 3. DATA VALIDATION CHECK

### DTO Validation (Backend)
**Check all DTOs have proper decorators:**
- [ ] @IsString() for string fields
- [ ] @IsEmail() for email fields
- [ ] @IsIn() for enum values (roles, types)
- [ ] @IsNumber() for numeric fields
- [ ] @IsBoolean() for boolean fields
- [ ] @IsOptional() for optional fields
- [ ] @MinLength() / @MaxLength() for strings
- [ ] @IsUrl() for URL fields
- [ ] @IsArray() for array fields
- [ ] @ValidateNested() for nested objects
- [ ] Custom validators where needed

**Test validation:**
- [ ] Submit empty required fields → should fail
- [ ] Submit invalid email → should fail
- [ ] Submit wrong role type → should fail
- [ ] Submit string where number expected → should fail
- [ ] Submit oversized content → should fail
- [ ] SQL injection attempts sanitized
- [ ] XSS attempts sanitized

### Form Validation (Frontend)
**Check all forms have:**
- [ ] Required field indicators
- [ ] Real-time validation feedback
- [ ] Client-side validation matching backend rules
- [ ] Password strength indicators
- [ ] Email format validation
- [ ] Date format validation
- [ ] Number range validation
- [ ] Character limits displayed

---

## 4. ERROR & SUCCESS MESSAGES

### Backend Messages
**Verify all responses include:**
- [ ] Consistent error message format
- [ ] Success messages for mutations
- [ ] Action confirmation messages
- [ ] User-friendly messages (not raw errors)
- [ ] Proper HTTP status codes

### Frontend Toast Notifications
**Check every user action has feedback:**
- [ ] Create operations → "Created successfully" 
- [ ] Update operations → "Updated successfully"
- [ ] Delete operations → "Deleted successfully"
- [ ] Export operations → "Export complete"
- [ ] Error toasts have descriptive messages
- [ ] Success toasts auto-dismiss after 3-4 seconds
- [ ] Error toasts require manual dismissal
- [ ] Loading states show progress indicators

**Toast styling check:**
- [ ] Success: Green background with checkmark
- [ ] Error: Red background with X mark
- [ ] Warning: Yellow/Orange for cautions
- [ ] Info: Blue for neutral information

---

## 5. CODE SCALABILITY REVIEW

### Backend Scalability
- [ ] Services follow single responsibility principle
- [ ] Database queries use proper indexing strategy
- [ ] Pagination implemented for list endpoints
- [ ] Search functionality uses efficient queries
- [ ] File uploads use streaming (not buffering)
- [ ] Caching strategy for frequently accessed data
- [ ] Rate limiting configured
- [ ] Database connection pooling
- [ ] Async/await used consistently
- [ ] No memory leaks in event listeners

### Frontend Scalability
- [ ] Component composition pattern used
- [ ] React.memo for expensive renders
- [ ] useMemo/useCallback where beneficial
- [ ] Virtual scrolling for long lists
- [ ] Image lazy loading
- [ ] Code splitting with dynamic imports
- [ ] API response caching
- [ ] Debounced search inputs
- [ ] Optimistic UI updates

---

## 6. ROBUSTNESS TESTING

### Edge Cases (Backend)
- [ ] Handle empty database gracefully
- [ ] Handle null/undefined values
- [ ] Handle very large payloads
- [ ] Handle special characters in inputs
- [ ] Handle concurrent requests
- [ ] Handle database connection failures
- [ ] Handle file upload failures
- [ ] Handle malformed JSON
- [ ] Handle extremely long strings
- [ ] Handle duplicate entries

### Edge Cases (Frontend)
- [ ] Empty states for all lists
- [ ] Network offline scenarios
- [ ] Very long content display
- [ ] Mobile responsive check
- [ ] Slow network simulation
- [ ] Browser back button behavior
- [ ] Refresh during form submission
- [ ] Session expiration handling
- [ ] File upload cancellation
- [ ] Rapid button clicking

---

## 7. AUTHENTICATION & SECURITY

### JWT Authentication
- [ ] Tokens expire correctly (15 min access, 7 day refresh)
- [ ] Refresh token rotation working
- [ ] Token blacklist for logout
- [ ] Secure token storage (httpOnly cookies)
- [ ] Token validation on every protected route
- [ ] Proper CORS configuration
- [ ] HTTPS enforcement in production

### Role-Based Access Control (RBAC)
**Verify role enforcement:**
- [ ] ADMIN role has full access
- [ ] OPERATOR role can CRUD products, services, careers, posts
- [ ] VIEWER role can only view dashboard
- [ ] Admin-only endpoints reject operator/viewer
- [ ] Cannot delete own account
- [ ] Admin cannot edit another admin
- [ ] All endpoints have @Roles() decorator
- [ ] RolesGuard applied globally

### Security Headers
- [ ] Helmet.js configured
- [ ] Content-Security-Policy header
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection enabled

### Data Protection
- [ ] Passwords hashed with bcrypt (salt rounds 10+)
- [ ] No passwords returned in API responses
- [ ] Sensitive data excluded from logs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF tokens for state-changing operations

---

## 8. UI COMPONENTS AUDIT

### Shadcn/UI Components
**Verify all components are properly configured:**
- [ ] Button - all variants working (default, destructive, outline, secondary, ghost, link)
- [ ] Card - CardHeader, CardTitle, CardContent, CardFooter
- [ ] Input - with labels, validation states
- [ ] Select - with proper options
- [ ] Dialog/AlertDialog - confirmation modals
- [ ] Toast/Toaster - notifications displaying
- [ ] Badge - all variants
- [ ] Table - DataTable with sorting/filtering
- [ ] Skeleton - loading states
- [ ] Switch - toggle functionality
- [ ] Textarea - multi-line input
- [ ] Avatar - user profile images
- [ ] DropdownMenu - navigation menus
- [ ] Tabs - content organization
- [ ] Sheet - side panels
- [ ] Tooltip - hover information

### Custom Components
**Check layout components:**
- [ ] Header - logo, search, notifications, user menu
- [ ] Sidebar - navigation, role-based filtering
- [ ] DataTable - columns, sorting, pagination, actions
- [ ] AuthProvider - context wrapping

### Responsive Design
**Test at multiple breakpoints:**
- [ ] Desktop (1920px, 1440px, 1280px)
- [ ] Tablet (768px)
- [ ] Mobile (375px, 414px)
- [ ] Sidebar collapses on mobile
- [ ] Tables scroll horizontally on small screens
- [ ] Forms stack vertically on mobile
- [ ] Buttons touch-friendly (44px min)

---

## 9. .GITIGNORE UPDATES

**Ensure comprehensive .gitignore:**
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock
pnpm-lock.yaml

# Production builds
/build
dist/
.next/
out/

# Environment variables
.env
.env.local
.env.*.local
.env.development
.env.test
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/

# Misc
.cache/
temp/
tmp/
*.tmp
```

**Backend-specific:**
- [ ] /uploads/* (except .gitkeep)
- [ ] MongoDB data directories
- [ ] SSL certificates

**Frontend-specific:**
- [ ] .vercel
- [ ] .turbo

---

## 10. NOTIFICATION & ALERT SYSTEM

### Toast System
- [ ] Toaster component mounted in root layout
- [ ] All success operations show toast
- [ ] All errors show toast with details
- [ ] Toast positions consistent (bottom-right or top-right)
- [ ] Toast auto-dismiss timing appropriate
- [ ] Toast action buttons where needed (undo, retry)

### Alert Dialogs
- [ ] Delete confirmations with item name
- [ ] Bulk operation confirmations
- [ ] Unsaved changes warnings
- [ ] Session expiration alerts

### Inline Notifications
- [ ] Form field error messages
- [ ] Inline success indicators
- [ ] Helpful hints below inputs
- [ ] Character counters for limited fields

---

## 11. ROLES IMPLEMENTATION VERIFICATION

### Role Enum Consistency
**Check across entire codebase:**
- [ ] Backend Role enum: ADMIN, OPERATOR, VIEWER
- [ ] Frontend role strings match exactly
- [ ] Database role storage matches enum
- [ ] No old roles (it, hr) remaining

### Permission Matrix Test

| Feature | Admin | Operator | Viewer |
|---------|-------|----------|--------|
| Dashboard | ✅ | ✅ | ✅ |
| Products (View) | ✅ | ✅ | ✅ |
| Products (Create) | ✅ | ✅ | ❌ |
| Products (Edit) | ✅ | ✅ | ❌ |
| Products (Delete) | ✅ | ❌ | ❌ |
| Products (Export) | ✅ | ✅ | ❌ |
| Services (All) | ✅ | ✅ | ❌ |
| Careers (All) | ✅ | ✅ | ❌ |
| Posts (View) | ✅ | ✅ | ✅ |
| Posts (Create) | ✅ | ✅ | ❌ |
| Posts (Edit) | ✅ | ✅ | ❌ |
| Posts (Delete) | ✅ | ❌ | ❌ |
| Posts (Export) | ✅ | ✅ | ❌ |
| Users (All) | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ |

**Test each cell:**
- [ ] Access with correct role succeeds
- [ ] Access with wrong role shows 403 or hidden UI
- [ ] API returns 403 for unauthorized access
- [ ] UI doesn't show unauthorized buttons/links

---

## 12. THEME UPDATES - SUBTLE PINK

### Color Palette Integration
Add subtle pink accents to the existing theme:

**CSS Variables (globals.css):**
```css
:root {
  /* Keep existing colors, add pink accents */
  --pink-50: #fdf2f8;
  --pink-100: #fce7f3;
  --pink-200: #fbcfe8;
  --pink-300: #f9a8d4;
  --pink-400: #f472b6;
  --pink-500: #ec4899;
  --pink-600: #db2777;
  
  /* Apply subtle pink to theme */
  --accent: 335 85% 60%; /* Pink accent */
  --accent-foreground: 0 0% 100%;
  
  /* Background pink tint */
  --background: 0 0% 100%;
  --background-soft: 335 30% 98%; /* Very subtle pink bg */
}

.dark {
  --accent: 335 85% 60%;
  --background-soft: 335 20% 8%;
}
```

**Apply pink accents to:**
- [ ] Primary buttons - slight pink gradient on hover
- [ ] Active navigation items - pink left border
- [ ] Selected table rows - soft pink background
- [ ] Badge components - pink variant
- [ ] Progress indicators - pink fill
- [ ] Switch toggles - pink when active
- [ ] Radio/checkbox selected - pink fill
- [ ] Focus rings - pink outline
- [ ] Links - pink hover color
- [ ] Success states - soft pink tint combined with green

**Background pink hint:**
- [ ] Dashboard cards - very subtle pink tint (pink-50/900 depending on theme)
- [ ] Content areas - barely noticeable pink undertone
- [ ] Active/selected states - soft pink background

### Implementation Checklist
- [ ] Update tailwind.config.ts with pink color extensions
- [ ] Update globals.css with CSS variables
- [ ] Apply pink to Button component variants
- [ ] Apply pink to Switch component
- [ ] Apply pink to Checkbox/Radio components
- [ ] Apply pink to Badge component
- [ ] Apply pink to Progress component
- [ ] Apply pink to Navigation active states
- [ ] Apply pink to DataTable selected rows
- [ ] Apply pink focus rings globally
- [ ] Test in both light and dark modes

---

## 13. FUNCTIONALITY TEST MATRIX

### Authentication Flow
- [ ] Register new user
- [ ] Login with credentials
- [ ] Login with invalid password → error
- [ ] Token refresh on expiry
- [ ] Logout clears session
- [ ] Access protected route without token → redirect to login
- [ ] Access with expired token → refresh or redirect

### User Management (Admin only)
- [ ] Create user with each role
- [ ] Edit user details
- [ ] Change user role
- [ ] Delete user (not self)
- [ ] Prevent deleting own account
- [ ] Prevent admin editing another admin
- [ ] Search/filter users
- [ ] Validation errors on invalid data

### Products CRUD
- [ ] Create product with all fields
- [ ] Create product with minimal fields
- [ ] Edit product
- [ ] Delete product
- [ ] View product list
- [ ] Search products
- [ ] Filter by category
- [ ] Export CSV
- [ ] Export PDF
- [ ] Duplicate name prevention

### Posts CRUD
- [ ] Create news post
- [ ] Create blog post
- [ ] Create event post with date/location
- [ ] Edit each type
- [ ] Delete post
- [ ] Filter by type
- [ ] Search posts
- [ ] Export CSV
- [ ] Export PDF

### Services & Careers
- [ ] Full CRUD operations
- [ ] Status toggling
- [ ] List filtering

---

## 14. PERFORMANCE TESTING

### Backend Performance
- [ ] API response time < 200ms for simple queries
- [ ] List endpoints with pagination
- [ ] Search queries optimized
- [ ] Database query explain plans reviewed
- [ ] No N+1 query problems

### Frontend Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size analyzed
- [ ] Images optimized
- [ ] Fonts preloaded
- [ ] CSS purged of unused styles

---

## 15. DOCUMENTATION CHECK

- [ ] README.md with setup instructions
- [ ] API documentation with Swagger
- [ ] Environment variable documentation
- [ ] Deployment instructions
- [ ] Contributing guidelines

---

## TESTING EXECUTION LOG

```
Date: ___________
Agent: ___________

PASS/FAIL for each section:
1. Folder Organization: _____
2. Error Handling: _____
3. Data Validation: _____
4. Messages: _____
5. Scalability: _____
6. Robustness: _____
7. Auth & Security: _____
8. UI Components: _____
9. .gitignore: _____
10. Notifications: _____
11. Roles: _____
12. Theme (Pink): _____
13. Functionality: _____
14. Performance: _____
15. Documentation: _____

ISSUES FOUND:
- 
- 
- 

FIXES APPLIED:
- 
- 
-
```

---

**Execute this prompt systematically. Report ALL findings. Fix errors immediately.**
