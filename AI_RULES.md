# AI Development Guidelines for Pool Reading App

This document provides rules and guidelines for the AI to follow when developing and modifying this application. The goal is to maintain code quality, consistency, and adherence to the established technology stack.

## Tech Stack Overview

The application is built with a modern, type-safe, and efficient stack. Here are the key technologies in use:

*   **Framework**: React with TypeScript for building a robust and scalable user interface.
*   **Build Tool**: Vite is used for its fast development server and optimized build process.
*   **Styling**: Tailwind CSS is the exclusive choice for utility-first styling. All visual aspects are controlled through Tailwind classes.
*   **UI Components**: The app uses **shadcn/ui**, which provides a set of reusable and accessible components built on top of Radix UI primitives. These components are located in `src/components/ui`.
*   **Icons**: **Lucide React** is the designated icon library for a consistent and clean visual language.
*   **Notifications**: User feedback, such as success or error messages, is handled by **Sonner** through toast notifications.
*   **Backend & Database**: **Supabase** serves as the backend. Data persistence is managed through Supabase Functions and its integrated Key-Value store.
*   **Server-side Routing**: **Hono** is used within Supabase Functions to create and manage API endpoints.
*   **State Management**: Local component state is managed with React's built-in hooks (`useState`, `useEffect`).

## Library Usage Rules

To ensure consistency, please adhere to the following rules when using libraries:

### 1. UI and Components

*   **Primary Source**: ALWAYS use components from the `src/components/ui` directory (shadcn/ui) for building UI elements like buttons, cards, inputs, selects, etc.
*   **No New UI Libraries**: Do not introduce other component libraries (e.g., Material-UI, Ant Design). If a required component doesn't exist, build it using shadcn/ui primitives.
*   **Custom Components**: Place all new, custom-built components that are not part of the core UI library into the `src/components/` directory.

### 2. Styling

*   **Tailwind CSS Only**: All styling MUST be done with Tailwind CSS utility classes.
*   **No Custom CSS**: Avoid writing custom CSS in `.css` files or using inline `style` attributes. The only exception is for dynamic properties that cannot be handled by Tailwind.
*   **Conditional Classes**: Use the `cn` utility function (available in `src/components/ui/utils.ts`) which combines `clsx` and `tailwind-merge` for safely applying conditional classes.

### 3. Icons

*   **Lucide React Exclusively**: All icons must be imported from the `lucide-react` package. Do not use SVGs directly or install other icon libraries.
*   **Example**: `import { Printer, Save, Calendar } from 'lucide-react';`

### 4. Notifications

*   **Use Sonner Toasts**: For all non-disruptive user notifications (e.g., "Data saved," "Sync failed"), use the `toast` function from `sonner`.
*   **Example**: `toast.success("Data saved to cloud successfully!");`

### 5. Data Fetching & Backend Interaction

*   **API Abstraction**: All communication with the Supabase backend MUST go through the functions defined in `src/utils/api.ts`.
*   **No Direct Supabase Calls**: Do not call Supabase client methods directly from within your components. This keeps the data logic centralized and easy to manage.

### 6. State Management

*   **React Hooks**: For all client-side state, rely on React's built-in hooks (`useState`, `useEffect`, `useContext`).
*   **No External Libraries**: Do not add complex state management libraries like Redux or Zustand.
*   **Offline First**: Continue using `localStorage` as a local cache and for offline support, with Supabase being the primary source of truth when the application is online.