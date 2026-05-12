# ✅ VALIDATION & TESTING CHECKLIST

Complete end-to-end testing checklist for the chat application.

## Pre-Deployment Validation

### Environment Setup

- [ ] Backend `.env` created with `JWT_SECRET` set
- [ ] Frontend `.env` created with correct API URLs
- [ ] No `.env` files committed to Git (check `.gitignore`)
- [ ] All environment variables documented in `.env.example` files
- [ ] Database initialized and migrations run

### Build Verification

- [ ] Backend starts without errors: `npm run dev`
- [ ] Frontend builds successfully: `npm run build`
- [ ] Frontend development server works: `npm run dev`
- [ ] No console errors or warnings on startup

---

## Functional Testing

### Authentication

- [ ] ✅ User can register with valid credentials
- [ ] ✅ Registration validation rejects invalid inputs:
  - [ ] Short username (< 3 chars)
  - [ ] Non-alphanumeric username
  - [ ] Invalid email format
  - [ ] Short password (< 6 chars)
- [ ] ✅ User cannot register with duplicate username
- [ ] ✅ User cannot register with duplicate email
- [ ] ✅ User can login with correct credentials
- [ ] ✅ User cannot login with wrong password
- [ ] ✅ User can logout
- [ ] ✅ JWT token persists in localStorage
- [ ] ✅ Page refreshes preserve login state
- [ ] ✅ Invalid/expired token redirects to login

### Rooms (Public Chat)

- [ ] ✅ User can create a room with valid name
- [ ] ✅ Room name validation rejects short names (< 2 chars)
- [ ] ✅ Cannot create room with duplicate name
- [ ] ✅ User is auto-joined when creating room
- [ ] ✅ User can view list of all rooms
- [ ] ✅ User can search for rooms by name
- [ ] ✅ User can join existing room
- [ ] ✅ User can leave room
- [ ] ✅ Room shows member count
- [ ] ✅ Room members list updates in real-time

### Direct Messages (Private Chat)

- [ ] ✅ User can search for other users
- [ ] ✅ User can start DM with another user
- [ ] ✅ User cannot start DM with themselves (error shown)
- [ ] ✅ DM list shows other user's username
- [ ] ✅ DM list shows last message preview
- [ ] ✅ DM list sorts by most recent first
- [ ] ✅ User can open previous DM conversations

### Messaging Features

- [ ] ✅ User can send message in room
- [ ] ✅ User can send message in DM
- [ ] ✅ Message displays with sender avatar + username
- [ ] ✅ Message displays timestamp
- [ ] ✅ Message content displays with markdown formatting:
  - [ ] **Bold** text
  - [ ] *Italic* text
  - [ ] `Code` inline
  - [ ] Links open in new tab
  - [ ] Lists render correctly
  - [ ] Blockquotes style correctly
- [ ] ✅ User can edit their own message
- [ ] ✅ Edited message shows "(edited)" indicator
- [ ] ✅ User cannot edit others' messages
- [ ] ✅ User can delete their own message
- [ ] ✅ Deleted message shows "[deleted]" placeholder
- [ ] ✅ User cannot delete others' messages
- [ ] ✅ Message list auto-scrolls to newest message
- [ ] ✅ Message list paginates when scrolling up

### Real-time Features

- [ ] ✅ **Typing Indicators**:
  - [ ] "User is typing…" appears when another user types
  - [ ] Indicator disappears after user stops typing
  - [ ] Multiple users typing shows "User A and User B are typing…"
  - [ ] Indicator disappears 2s after last keystroke

- [ ] ✅ **Online Status**:
  - [ ] User status changes to "online" on connect
  - [ ] User status changes to "offline" on disconnect
  - [ ] Online status visible in room members list
  - [ ] Online status visible in DM conversation list
  - [ ] Green dot visible next to online users
  - [ ] Status updates immediately for all connected users

- [ ] ✅ **Read Receipts** (DMs only):
  - [ ] Recipient sees message as unread initially
  - [ ] Message marks as read when conversation opened
  - [ ] Read status displays "Seen at 2:45 PM" or similar
  - [ ] Sender sees "Seen" badge on their message

### User Interface

- [ ] ✅ Header shows current chat name
- [ ] ✅ Header shows connection status badge
- [ ] ✅ Connection status shows "Connected" when online
- [ ] ✅ Connection status shows "Reconnecting…" when offline
- [ ] ✅ Sidebar displays room list
- [ ] ✅ Sidebar displays DM list
- [ ] ✅ Sidebar search works for rooms and users
- [ ] ✅ Active chat highlights in sidebar
- [ ] ✅ User list displays for rooms (right sidebar)
- [ ] ✅ User list shows online status
- [ ] ✅ User avatar generates from initials if no image
- [ ] ✅ Notification toasts appear and disappear
- [ ] ✅ Modal dialogs work (create room)
- [ ] ✅ Modal can be closed with Escape key
- [ ] ✅ All colors and fonts render correctly
- [ ] ✅ Layout responsive on mobile/tablet

---

## Performance Testing

### Load & Responsiveness

- [ ] ✅ App loads in < 3 seconds on 4G
- [ ] ✅ Sending message takes < 1 second to appear
- [ ] ✅ Typing indicator appears within 50ms
- [ ] ✅ Presence updates within 100ms
- [ ] ✅ Message list scrolls smoothly with 1000+ messages
- [ ] ✅ No excessive CPU usage during idle
- [ ] ✅ Memory doesn't grow continuously
- [ ] ✅ Database queries complete in < 100ms

### Scalability Verification

- [ ] ✅ App handles 100+ messages in conversation
- [ ] ✅ App handles 50+ users in room
- [ ] ✅ Pagination works for old messages
- [ ] ✅ No lag with multiple real-time updates

---

## Security Testing

### Authentication & Authorization

- [ ] ✅ Cannot access `/` (chat) without login
- [ ] ✅ Cannot access protected API without token
- [ ] ✅ Invalid token rejected
- [ ] ✅ Expired token triggers re-login
- [ ] ✅ Passwords never logged or displayed
- [ ] ✅ User cannot edit/delete others' messages
- [ ] ✅ User cannot access others' DMs
- [ ] ✅ User cannot access rooms they didn't join

### Input Validation

- [ ] ✅ XSS attempt in message blocked (no `<script>` execution)
- [ ] ✅ SQL injection attempt blocked
- [ ] ✅ Very long messages handled gracefully (truncated or error)
- [ ] ✅ Special characters in messages display correctly
- [ ] ✅ @ mentions don't cause errors
- [ ] ✅ URLs in messages don't break layout

### HTTPS/SSL (Production)

- [ ] ✅ SSL certificate valid
- [ ] ✅ Mixed content warnings absent
- [ ] ✅ All traffic over HTTPS
- [ ] ✅ Socket.io uses WSS (secure WebSocket)

---

## Browser Compatibility

- [ ] ✅ Chrome/Chromium (latest)
- [ ] ✅ Firefox (latest)
- [ ] ✅ Safari (latest)
- [ ] ✅ Edge (latest)
- [ ] ✅ Mobile Safari (iOS)
- [ ] ✅ Chrome Android

---

## Deployment Checklist

### Pre-Production

- [ ] ✅ All tests pass: `npm test`
- [ ] ✅ No console errors or warnings
- [ ] ✅ No sensitive data in code/logs
- [ ] ✅ All environment variables set correctly
- [ ] ✅ Database backups configured
- [ ] ✅ Error monitoring set up (Sentry, etc.)
- [ ] ✅ Logging configured
- [ ] ✅ Monitoring/alerting configured

### Production Environment

- [ ] ✅ NODE_ENV=production
- [ ] ✅ JWT_SECRET is strong (32+ random chars)
- [ ] ✅ CLIENT_URL matches frontend domain
- [ ] ✅ Database at persistent mount point
- [ ] ✅ Nginx reverse proxy configured
- [ ] ✅ SSL certificate valid
- [ ] ✅ Firewall rules configured
- [ ] ✅ Auto-restart service configured (systemd)
- [ ] ✅ Log rotation configured

### Post-Deployment

- [ ] ✅ Test registration/login on prod
- [ ] ✅ Test room creation on prod
- [ ] ✅ Test messaging on prod
- [ ] ✅ Verify SSL certificate
- [ ] ✅ Check error logs
- [ ] ✅ Monitor server metrics (CPU, memory, disk)
- [ ] ✅ Test from different networks (mobile, VPN, etc.)
- [ ] ✅ Verify backups are running

---

## Edge Cases & Error Handling

### Network Issues

- [ ] ✅ App handles network timeout gracefully
- [ ] ✅ App auto-reconnects on network loss
- [ ] ✅ Messages queued offline are sent on reconnect
- [ ] ✅ Typing indicator cancels on disconnect
- [ ] ✅ Presence updates correctly on reconnect

### Race Conditions

- [ ] ✅ Rapid message sending works correctly (no duplicates)
- [ ] ✅ Simultaneous edit/delete handled correctly
- [ ] ✅ User join/leave during room deletion handled
- [ ] ✅ Message sent by user who disconnects handled

### Data Validation

- [ ] ✅ Empty message rejected
- [ ] ✅ Very long message handled (no crash)
- [ ] ✅ Non-existent room/user returns 404
- [ ] ✅ Non-existent message deletion returns error
- [ ] ✅ Concurrent read receipts don't duplicate

---

## Accessibility (a11y)

- [ ] ✅ Keyboard navigation works (Tab, Enter, Escape)
- [ ] ✅ Focus indicators visible
- [ ] ✅ Form labels associated with inputs
- [ ] ✅ Alt text on avatars
- [ ] ✅ Color not sole indicator of status
- [ ] ✅ Sufficient color contrast
- [ ] ✅ Mobile touch targets adequate (44x44px)

---

## Documentation Review

- [ ] ✅ README complete and accurate
- [ ] ✅ QUICK_START guide works end-to-end
- [ ] ✅ DATABASE.md explains schema
- [ ] ✅ ARCHITECTURE.md is comprehensive
- [ ] ✅ DEPLOYMENT.md has clear steps
- [ ] ✅ API endpoints documented
- [ ] ✅ Socket.io events documented
- [ ] ✅ Environment variables documented
- [ ] ✅ Common issues troubleshooting included

---

## Sign-Off

**Date**: ________________

**Tester Name**: ________________

**Test Environment**: ☐ Local ☐ Staging ☐ Production

**Overall Status**:
- ☐ All tests passed - Ready for deployment
- ☐ Minor issues found - Document and fix
- ☐ Critical issues found - Do not deploy

**Notes**:
```
[Paste any notes, issues, or blockers here]
```

---

## Quick Test Run (5 min)

```bash
# 1. Start backend
cd backend
npm run dev
# Wait for: "Server running on port 5000"

# 2. Start frontend (new terminal)
cd frontend
npm run dev
# Wait for: "Local: http://localhost:3000"

# 3. Open browser
# http://localhost:3000

# 4. Register 2 accounts
# test1@test.com / test1
# test2@test.com / test2

# 5. Quick tests
# - [ ] Create room
# - [ ] Send message
# - [ ] Start DM
# - [ ] See typing indicator
# - [ ] Edit message
# - [ ] Check online status

# 6. Verify no console errors
# Open browser DevTools (F12)
# No red errors in Console
```

---

**Happy Testing! 🎉**
