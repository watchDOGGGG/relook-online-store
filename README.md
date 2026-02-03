# Frontend Project

## 🚀 Project Overview

* Fully client-side frontend project
* Built for local development and independent deployment
* Uses modern, fast, and production-ready tooling

---

## 🛠️ Tech Stack

This project is built with:

* **Vite** – fast development server and build tool
* **React** – UI library
* **TypeScript** – type-safe JavaScript
* **Tailwind CSS** – utility-first styling
* **shadcn/ui** – accessible, reusable UI components
* **Supabase** – external backend services (authentication, database, storage)

---

## 📦 Prerequisites

Before running this project, make sure you have the following installed:

* **Node.js** (v18 or newer recommended)
* **npm** (comes with Node.js)

> Recommended: install Node.js using **nvm** for easy version management
> [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)

---

## 🧑‍💻 Local Development Setup

Follow these steps to run the project locally:

### 1️⃣ Clone the repository

```sh
git clone <YOUR_GIT_REPOSITORY_URL>
```

### 2️⃣ Navigate into the project directory

```sh
cd <PROJECT_FOLDER_NAME>
```

### 3️⃣ Install dependencies

```sh
npm install
```

### 4️⃣ Start the development server

```sh
npm run dev
```

The app will start with hot-reloading enabled. Open the URL shown in your terminal (usually [http://localhost:5173](http://localhost:5173)).

---

## 🔐 Supabase Configuration

This project uses **Supabase** as an external backend service for features such as authentication, database access, and storage. The backend is **not hosted in this repository** and is accessed from the frontend via Supabase APIs.

### Environment Variables

Create a `.env` file in the root of the project:

```sh
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_public_anon_key
```

> ⚠️ Do not commit the `.env` file to version control.

---

## 🏗️ Build for Production

To generate an optimized production build:

```sh
npm run build
```

The output will be generated in the `dist/` folder.

To preview the production build locally:

```sh
npm run preview
```

---

## ✏️ Editing the Code

You can edit the project using **any IDE or code editor**, such as:

* VS Code
* WebStorm
* Cursor
* Neovim

Simply open the project folder and start editing the source files.

---

## 🌐 Deployment

This is a static frontend application and can be deployed on platforms such as:

* Vercel
* Netlify
* Cloudflare Pages
* GitHub Pages
* Any static hosting service

Basic deployment steps:

1. Run `npm run build`
2. Upload the contents of the `dist/` folder to your hosting provider

---

## 📁 Project Type

* Frontend application
* Uses **Supabase** as an external backend service
* No custom backend server in this repository
* All backend logic is handled via Supabase APIs
* Client-side API integration

---

## 📄 License

This project is your personal codebase. Add a license here if you plan to make it open source.

---

## ✅ Notes

* No references to Lovable or external editors
* Fully independent development workflow
* Ready for customization and scaling

---

Happy coding 🚀
