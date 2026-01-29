# CURSOR QUICK START GUIDE

**Follow these steps to start working in Cursor**

---

## STEP 1: VERIFY YOUR LOCAL FILES

Open Terminal and check:

```bash
cd ~/Desktop/itb-bid-system
ls -la
```

**You should see:**
- server.js
- package.json
- migrate.js
- public/ folder
- .gitignore
- .env.example
- All the documentation files

**If files are missing:** Run `git pull origin main` to get latest from GitHub

---

## STEP 2: ADD CURSOR CONTEXT FILES

Copy these files to your project folder:

1. **CURSOR_CONTEXT.md** ← Most important - read every session
2. **SESSION_TEMPLATE.md** ← Copy for each session to track progress
3. **Updated PROJECT_MASTER.md** ← Complete project documentation

**How to add them:**

Option A - Download from this chat and copy to folder
Option B - Create them manually in your project folder

Make sure they're in the root directory: `~/Desktop/itb-bid-system/`

---

## STEP 3: OPEN PROJECT IN CURSOR

1. Open Cursor IDE
2. File → Open Folder
3. Select: `~/Desktop/itb-bid-system`
4. Cursor loads your entire project

---

## STEP 4: START YOUR FIRST CURSOR SESSION

### Click the Cursor AI chat button (or Cmd+L / Ctrl+L)

### Say this:

```
Hi Claude! Please read CURSOR_CONTEXT.md to understand this project.

This is a construction ITB/Bid management system that's fully deployed and working.

I want to add SendGrid email integration so ITBs can be actually sent via email 
instead of just logging to console.

Can you help me:
1. Set up SendGrid
2. Modify the POST /api/itbs endpoint to send real emails
3. Create email templates

Let's start with step 1 - what do I need to do?
```

---

## STEP 5: WORKING EFFECTIVELY IN CURSOR

### ✅ Good Practices:

1. **Always start with context:**
   - "Read CURSOR_CONTEXT.md first"
   - Point to specific files: "Look at server.js line 392"
   - Give me error messages directly

2. **One feature at a time:**
   - Don't try to build everything in one session
   - Focus: "Add email sending" not "improve the app"

3. **Test as you go:**
   - Test locally when possible
   - Push to GitHub and test on Railway
   - Verify nothing broke

4. **Document changes:**
   - Copy SESSION_TEMPLATE.md for each session
   - Track what you changed
   - Note what's next

### ❌ Avoid:

- Vague requests: "make it better"
- Multiple unrelated changes at once
- Assuming I remember previous sessions
- Not testing before moving on

---

## STEP 6: AFTER EACH SESSION

### Before closing Cursor:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "Added SendGrid email integration"
   git push origin main
   ```

2. **Verify Railway deployed:**
   - Check Railway dashboard
   - Test production URL

3. **Fill out session log:**
   - Copy SESSION_TEMPLATE.md
   - Save as SESSION_3.md (or whatever number)
   - Document what you did

4. **Update CURSOR_CONTEXT.md if needed:**
   - Add new endpoints
   - Note configuration changes
   - Update "What to Build Next"

---

## COMMON CURSOR WORKFLOWS

### Adding a New Feature:
```
Read CURSOR_CONTEXT.md.

I want to add [feature]. Can you:
1. Show me which files need to be modified
2. Write the code changes
3. Help me test it
```

### Fixing a Bug:
```
Read CURSOR_CONTEXT.md.

I'm getting this error: [paste error]

It happens when I [describe what you were doing].

Can you help me debug it?
```

### Understanding Code:
```
Read CURSOR_CONTEXT.md.

Can you explain how [specific feature] works?

Look at server.js line 350-400.
```

---

## HELPFUL CURSOR SHORTCUTS

- **Cmd/Ctrl + L** - Open AI chat
- **Cmd/Ctrl + K** - Inline AI edit
- **Cmd/Ctrl + /** - Comment/uncomment
- **Cmd/Ctrl + P** - Quick file search
- **Cmd/Ctrl + Shift + F** - Search in all files

---

## TROUBLESHOOTING

### "Cursor can't find CURSOR_CONTEXT.md"
→ Make sure the file is in your project root folder

### "I'm getting authentication errors"
→ Check .env file has correct DATABASE_URL and JWT_SECRET

### "Changes aren't deploying to Railway"
→ Make sure you pushed to GitHub: `git push origin main`

### "Claude seems confused"
→ Start over: "Read CURSOR_CONTEXT.md and let's start fresh with [goal]"

---

## YOUR NEXT SESSION GOAL

**Session 3: Add SendGrid Email Integration**

**Before you start:**
1. ✅ Verify all files are in your local folder
2. ✅ Have CURSOR_CONTEXT.md in the project
3. ✅ Sign up for SendGrid (free account)
4. ✅ Get your SendGrid API key ready

**Start the session with:**
"Read CURSOR_CONTEXT.md. I want to add SendGrid email integration. I have my API key ready: [key]. Let's modify the ITB sending endpoint to actually send emails."

---

## REMEMBER

- 📖 **Always read CURSOR_CONTEXT.md first** - It has everything I need to know
- 🎯 **One feature per session** - Don't try to do too much
- ✅ **Test after changes** - Catch bugs early
- 📝 **Document as you go** - Your future self will thank you
- 💾 **Commit often** - Small commits are easier to debug

---

**You're ready! Open Cursor and start building!** 🚀
