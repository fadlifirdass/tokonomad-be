# 🔧 Fix Database Connection Timeout

## ❌ Problem

You're getting this error:
```
Connection terminated due to connection timeout
```

This means your IP address is **NOT whitelisted** in YugabyteDB Cloud.

---

## ✅ Solution: Whitelist Your IP Address

### **Step 1: Go to YugabyteDB Cloud Dashboard**

Visit: https://cloud.yugabyte.com/

### **Step 2: Select Your Cluster**

Click on your cluster: **"dreamy-quelea"**

### **Step 3: Add IP to Allow List**

1. In the left sidebar, click **"Network Access"** or **"IP Allow List"**
2. Click **"Add IP Address"** or **"+ Add"**
3. Choose one of these options:

#### **Option A: Add Your Current IP (Recommended for Production)**
- Click "Add Current IP Address"
- Or manually enter your public IP (find it at: https://whatismyip.com/)
- Click "Save"

#### **Option B: Allow All IPs (For Testing ONLY - NOT for production)**
- Enter: `0.0.0.0/0`
- Description: "Development Testing"
- Click "Save"

### **Step 4: Wait 1-2 Minutes**

The IP allowlist takes a minute to propagate.

### **Step 5: Test Connection**

Run this in the `tokonomad-be` folder:

```bash
npx ts-node scripts/test-db-connection.ts
```

You should see:
```
✅ Connection successful!
✅ Query successful!
✅ Transactions table exists
🎉 Database connection is working perfectly!
```

---

## 🔍 Alternative: Check Current IP Allowlist

In YugabyteDB dashboard:
1. Go to your cluster "dreamy-quelea"
2. Click "Network Access" or "Connection Info"
3. Check the "IP Allow List" section
4. Make sure your IP is listed

---

## 🌐 Find Your Public IP

Visit one of these:
- https://whatismyip.com/
- https://ifconfig.me/
- https://ipinfo.io/ip

Then add that IP to YugabyteDB allowlist.

---

## ⚡ Quick Test After Fix

Once you've added your IP, restart the backend:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

Then try creating a transaction from the frontend!

---

## 🎯 What to Expect After Fix

When the connection works, you'll see in the backend logs:

```
✅ PostgreSQL client connected
✅ Database connection successful
✅ Database tables initialized successfully
🚀 TOKONOMAD API SERVER IS RUNNING 🚀
```

And transactions will save successfully! 🎉

---

## 🆘 Still Not Working?

### Check 1: Verify Credentials

Make sure `.env` has the correct values:
```env
DB_HOST=ap-southeast-1.3d0d4b77-e91b-47d8-be15-7818c45a9913.aws.yugabyte.cloud
DB_PORT=5433
DB_NAME=yugabyte
DB_USER=admin
DB_PASSWORD=U71LSf7Zo0YcKzPxzKsqe97vVZEFtD
DB_SSL=true
```

### Check 2: Test DNS Resolution

```bash
ping ap-southeast-1.3d0d4b77-e91b-47d8-be15-7818c45a9913.aws.yugabyte.cloud
```

Should resolve to an IP address.

### Check 3: Test Port Connectivity

```bash
telnet ap-southeast-1.3d0d4b77-e91b-47d8-be15-7818c45a9913.aws.yugabyte.cloud 5433
```

Should connect (or try using `nc` or `Test-NetConnection` on Windows).

### Check 4: Firewall

Make sure your firewall isn't blocking outgoing connections to port 5433.

---

## 📝 Summary

**The fix is simple:**

1. ✅ Go to YugabyteDB dashboard
2. ✅ Click "Network Access" → "IP Allow List"
3. ✅ Add your current IP (or `0.0.0.0/0` for testing)
4. ✅ Wait 1-2 minutes
5. ✅ Restart backend: `npm run dev`
6. ✅ Test creating a transaction!

**Once your IP is whitelisted, everything will work perfectly!** 🚀
