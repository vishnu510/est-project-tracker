# 🌟 EST Brand Services — Project Tracker Portal

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://vishnu510.github.io/est-project-tracker/)
[![Download Windows EXE](https://img.shields.io/badge/Download-Windows%20Setup%20(.exe)-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/vishnu510/est-project-tracker/releases)
[![GitHub Release](https://img.shields.io/github/v/release/vishnu510/est-project-tracker?style=for-the-badge&logo=github)](https://github.com/vishnu510/est-project-tracker/releases)

An enterprise-grade, high-performance Project Tracker and Financial Management portal built for **EST Brand Services**. Features real-time executive analytics, granular expense categorizations, vendor management, budget burn-rate tracking, role-based governance, and email dispatching.

---

## 📥 Download Windows Desktop App (.exe)

You can download the Windows desktop application directly from the **[GitHub Releases Page](https://github.com/vishnu510/est-project-tracker/releases)**:

| File | Type | Description |
| :--- | :--- | :--- |
| 🚀 **[EST Brand Services Setup 1.0.0.exe](https://github.com/vishnu510/est-project-tracker/releases/download/v1.0.0/EST.Brand.Services.Setup.1.0.0.exe)** | **Windows Installer** | Setup wizard with desktop & start menu shortcuts. |
| ⚡ **[EST Brand Services 1.0.0.exe](https://github.com/vishnu510/est-project-tracker/releases/download/v1.0.0/EST.Brand.Services.1.0.0.exe)** | **Portable Executable** | Single standalone `.exe` file that runs instantly without installation. |

> 💡 **Tip**: If you are using the web version, you can also click the **"Download .EXE"** button located at the top right of the application header!

---

## 🌐 Live Web Version
Access the live deployed application in your web browser:
🔗 **[https://vishnu510.github.io/est-project-tracker/](https://vishnu510.github.io/est-project-tracker/)**

---

## ✨ Key Features

- 🏢 **Multi-Project Management**: Manage enterprise brand campaigns, sprints, and client scopes.
- 💰 **Budget & Expense Tracking**: Dynamic breakdown across Operations, Marketing, Tech, & Logistics.
- 📊 **Executive Master Dashboard**: Real-time KPI summaries, budget health, and progress charts.
- 👥 **Role-Based Access (RBAC)**: Super Admin full oversight vs. Admin-restricted project workspaces.
- 🔐 **Admin Accounts & Credential Vault**: Super Admin credential generator and access management.
- 📧 **Automated Email Notifications**: Built-in EmailJS preview modals and client status dispatches.
- 📱 **Fully Responsive Design**: Optimized for Desktop (4K/1080p), Tablets, and Mobile screens.
- 🖥️ **Native Windows Desktop App**: Powered by Electron with custom title bar styling, offline assets, and low-latency performance.

---

## 🛠️ How to Build from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://www.npmjs.com/) (v10 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/vishnu510/est-project-tracker.git
cd est-project-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server (Web)
```bash
npm run dev
```

### 4. Build Windows `.exe` Executables
```bash
npm run build:win
```
The output installers will be generated inside the `release/` folder:
- `release/EST Brand Services Setup 1.0.0.exe` (NSIS Installer)
- `release/EST Brand Services 1.0.0.exe` (Portable)

---

## 🚢 Publishing a New Release on GitHub

To publish the `.exe` to GitHub Releases manually or automatically:

### Option A: Upload via GitHub Web Interface
1. Go to **[github.com/vishnu510/est-project-tracker/releases/new](https://github.com/vishnu510/est-project-tracker/releases/new)**.
2. Enter tag version: `v1.0.0` and Release title: `EST Brand Services v1.0.0`.
3. Drag & drop the `.exe` files from your local `release/` folder into the binaries attachment box.
4. Click **Publish release**.

### Option B: Automatic GitHub Actions Build
Tag and push to GitHub:
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions will automatically build the Windows binaries and publish the release for you!

---

## 📄 License
Copyright © 2026 **EST Brand Services**. All Rights Reserved.
