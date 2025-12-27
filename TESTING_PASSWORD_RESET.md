# Manual Testing Guide: Password Reset Feature

## Prerequisites
- Development server running: `pnpm dev`
- Valid email credentials in `.env`:
  - `RESEND_API_KEY`
  - `RESEND_FROM`
  - `BETTER_AUTH_URL` or `NEXT_PUBLIC_BETTER_AUTH_URL`

## Test Plan

### Test 1: Navigate to Forgot Password Page

**Steps:**
1. Open browser to `http://localhost:3001/login`
2. Look for "¿Olvidaste tu contraseña?" link next to "Contraseña" label
3. Click the link

**Expected Result:**
- Should navigate to `/forgot-password`
- Page should display:
  - "Trello Clone" header
  - "Recupera el acceso a tu cuenta" subtitle
  - Email input field
  - "Enviar enlace de recuperación" button
  - "Volver al inicio de sesión" link

---

### Test 2: Request Password Reset (Valid Email)

**Steps:**
1. Navigate to `/forgot-password`
2. Enter a valid email address from your database
3. Click "Enviar enlace de recuperación"

**Expected Result:**
- Toast notification: "Se ha enviado un correo con instrucciones para restablecer tu contraseña"
- Form stays on the same page
- **Check development console** for reset link (printed in dev mode)
  - Should look like: `Password reset link: http://localhost:3001/reset-password?token=...&error=...`
  - Copy this link for Test 4

---

### Test 3: Request Password Reset (Invalid Email)

**Steps:**
1. Navigate to `/forgot-password`
2. Enter an invalid email format (e.g., "notanemail")
3. Click "Enviar enlace de recuperación"

**Expected Result:**
- Toast error: "Correo electrónico inválido"
- No email sent
- No link in console

---

### Test 4: Request Password Reset (Non-existent Email)

**Steps:**
1. Navigate to `/forgot-password`
2. Enter a valid email format that doesn't exist in DB (e.g., "nonexistent@example.com")
3. Click "Enviar enlace de recuperación"

**Expected Result:**
- **Security feature**: Shows success message even though user doesn't exist
- Toast notification: "Se ha enviado un correo con instrucciones para restablecer tu contraseña"
- **No email sent** (check logs - should see "User not found" in server logs but still return success)
- This prevents email enumeration attacks

---

### Test 5: Reset Password with Valid Token

**Steps:**
1. Copy the reset link from Test 2 console output
2. Open the link in browser (should be `http://localhost:3001/reset-password?token=...`)
3. Enter a new password (minimum 8 characters)
4. Enter the same password in "Confirmar contraseña"
5. Click "Restablecer contraseña"

**Expected Result:**
- Toast success: "Contraseña actualizada correctamente"
- Automatically redirects to `/login` after 1 second
- Can now log in with the new password

---

### Test 6: Reset Password - Mismatched Passwords

**Steps:**
1. Navigate to `/reset-password?token=valid_token`
2. Enter "password123" in "Nueva contraseña"
3. Enter "different456" in "Confirmar contraseña"
4. Click "Restablecer contraseña"

**Expected Result:**
- Toast error: "Las contraseñas no coinciden"
- Form stays on page
- No password change

---

### Test 7: Reset Password - Short Password

**Steps:**
1. Navigate to `/reset-password?token=valid_token`
2. Enter "short" (less than 8 characters)
3. Enter "short" in confirm field
4. Click "Restablecer contraseña"

**Expected Result:**
- Toast error: "La contraseña debe tener al menos 8 caracteres"
- No password change

---

### Test 8: Reset Password - Invalid/Expired Token

**Steps:**
1. Navigate to `/reset-password?token=invalid_or_expired_token`
2. Enter valid passwords
3. Click "Restablecer contraseña"

**Expected Result:**
- Toast error: "El enlace de restablecimiento es inválido o ha expirado. Por favor, solicita uno nuevo."
- Stays on reset-password page

---

### Test 9: Direct Navigation to Reset Password (No Token)

**Steps:**
1. Navigate directly to `/reset-password` (without token in URL)
2. Observe the page

**Expected Result:**
- Page displays an error message: "El enlace de restablecimiento es inválido o ha expirado. Por favor, solicita uno nuevo."
- Shows a link to "Solicitar nuevo enlace" → `/forgot-password`

---

### Test 10: Rate Limiting

**Steps:**
1. Navigate to `/forgot-password`
2. Submit the form 6 times rapidly (more than rate limit allows)

**Expected Result:**
- After 5 requests, should show toast error:
  - "Demasiados intentos. Intenta de nuevo en X segundos."
- Wait for the specified time and try again - should work

---

### Test 11: Email Content Verification (Production)

**Steps:**
1. Set up real email credentials in `.env`
2. Request password reset for a real email you control
3. Check your inbox

**Expected Result:**
- Email subject: "Restablece tu contraseña - Trello Clone"
- Email from: Value of `RESEND_FROM` env variable
- Email contains:
  - Professional styling
  - "Restablecer contraseña" button/link
  - Warning about 1-hour expiration
  - Security notice about ignoring if not requested
  - Link expires in 1 hour

---

## Troubleshooting

### Link on Login Page Doesn't Work

**Possible causes:**
1. JavaScript error in console - check browser DevTools
2. Form intercepting clicks - the link should be outside form submit
3. CSS preventing clicks - check `pointer-events` style
4. Next.js routing issue - verify dev server is running

**Debug steps:**
```javascript
// Open browser console and check if link is correct
document.querySelector('a[href="/forgot-password"]')
// Should show the link element
```

### No Reset Link in Console

**Causes:**
- Not in development mode
- Email doesn't exist in database (this is expected - check server logs for "User not found")
- Better Auth configuration issue

### Email Not Received (Production)

**Check:**
1. Resend dashboard for send status
2. Server logs for errors
3. Environment variables are correct
4. Email provider allows sending from `RESEND_FROM` address

### Token Invalid Immediately

**Causes:**
- Clock skew between server and database
- Better Auth secret changed between request and reset
- Token was already used (tokens are single-use)

---

## Expected Server Logs (Development)

When testing successfully, you should see logs like:

```
[Auth] Password reset requested for: user@example.com
Password reset link: http://localhost:3001/reset-password?token=abc123...
[Auth] Password reset successful for token: abc123...
```

## Success Criteria

✅ All 11 tests pass
✅ No console errors
✅ Proper Spanish language in all user messages
✅ Security features working (email enumeration prevention, rate limiting)
✅ Email received (if testing with real email)
✅ Can successfully reset password and log in with new credentials

---

## Next Steps After Testing

1. **If all tests pass:**
   - Push to remote: `git push trello-next feature/forgot-password-37`
   - Create pull request
   - Merge to main

2. **If issues found:**
   - Document the issue
   - Check relevant logs
   - Fix and re-test
   - Commit fixes to the same branch

3. **Optional improvements** (from code review):
   - Extract LoadingSpinner to shared component
   - Add Suspense boundary for useSearchParams
   - Create dedicated passwordReset rate limiter
   - Replace magic numbers with named constants
