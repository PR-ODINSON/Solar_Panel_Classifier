# Authentication Flow Debugging Guide

## Fixed Issues

✅ **Routing Structure**: Completely restructured the App.jsx to have proper flat routing instead of nested routes
✅ **Role-Based Redirect**: Created RoleBasedRedirect component to handle initial routing based on user role
✅ **Authentication Flow**: Fixed the redirect paths to use the root `/` path which then redirects based on role

## How It Should Work Now

### 1. First Visit to `http://localhost:3000`
- User visits `/` (root)
- `RoleBasedRedirect` component checks authentication status
- If not authenticated → redirect to `/signin`
- If authenticated → redirect based on role:
  - Admin → `/dashboard`
  - Maintenance Staff → `/maintenance/dashboard`

### 2. Login Flow
1. User enters credentials on `/signin`
2. Mock authentication validates credentials
3. User role is determined based on username:
   - `admin` → role: 'admin'
   - `maintenance` → role: 'maintenance_staff'
4. After successful login → redirect to `/` which then redirects to appropriate dashboard

### 3. Protected Routes
- Each route is individually protected with `ProtectedRoute` wrapper
- Role-specific routes check for required permissions
- Unauthorized access redirects to `/unauthorized`

## Test Scenarios

### Admin User Flow
```
1. Visit http://localhost:3000 → Redirect to /signin
2. Login with admin/admin123 → Redirect to / → Redirect to /dashboard
3. Can access: /dashboard, /upload-infer, /inspections, /defects, /analytics, /settings
4. Cannot access: /maintenance/dashboard (redirects to /unauthorized)
```

### Maintenance User Flow
```
1. Visit http://localhost:3000 → Redirect to /signin
2. Login with maintenance/maintenance123 → Redirect to / → Redirect to /maintenance/dashboard
3. Can access: /maintenance/dashboard, /inspections, /defects, /analytics, /settings
4. Cannot access: /dashboard, /upload-infer (redirects to /unauthorized)
```

## Debug Steps

If you're still getting redirected to `/unauthorized`:

### 1. Check Browser Developer Tools
- Open DevTools → Console tab
- Look for any JavaScript errors
- Check Network tab for failed requests

### 2. Check Local Storage
- DevTools → Application tab → Local Storage
- Look for:
  - `token` - should exist after login
  - `darkMode` - theme preference

### 3. Test Authentication Manually
```javascript
// In browser console after login
console.log('Token:', localStorage.getItem('token'))
// Should show a token like: "mock-jwt-token-1234567890"
```

### 4. Check Role Assignment
The mock authentication in `apiClient.js` assigns roles based on username:
- Username `admin` → role: 'admin'
- Username `maintenance` → role: 'maintenance_staff'
- Any other username → role: 'maintenance_staff'

## Common Issues & Solutions

### Issue: Still redirected to /unauthorized
**Possible Causes:**
1. Token not being stored properly
2. Role not being assigned correctly
3. JavaScript errors preventing authentication

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page and try login again
3. Check console for errors

### Issue: Login form not working
**Possible Causes:**
1. Form validation errors
2. API client errors
3. Context not properly initialized

**Solution:**
1. Check that both username and password are filled
2. Try demo credential buttons
3. Check console for errors

### Issue: Dark mode not working
**Possible Causes:**
1. localStorage not accessible
2. Tailwind classes not loading

**Solution:**
1. Check localStorage permissions
2. Verify Tailwind CSS is loading

## Next Steps After Confirmation

Once the authentication is working properly:
1. Test both admin and maintenance user flows
2. Verify role-based navigation menu
3. Test all protected routes
4. Begin implementing detailed pages (Inspections, Defects, etc.)

If issues persist, please share:
1. Browser console errors
2. Network request details
3. Local storage contents
