
# Product Requirements Document (PRD)

---

## Project Name: Smart Thumbnail Maker

---

## Overview

A single-page web application built with Next.js, TypeScript, and Node.js that allows users to upload an image along with an instruction. The app then leverages the Gemini API to analyze the inputs and returns a set of suggested image manipulations. Based on these suggestions, image processing occurs on the server using libraries like Sharp and Jimp, and the generated thumbnail is displayed on the page.

---

## Dependencies

### Frontend
- **Next.js** – Framework for SSR and routing  
- **React** – UI library (bundled with Next.js)  
- **TypeScript** – For static typing and better developer DX  
- **Shadcn UI (or similar)** – UI component library for consistent design

### Backend
- **Node.js** – Runtime environment for server-side processing  
- **Sharp** – High-performance image processing (resizing, format conversion)  
- **Jimp** – Full-featured image manipulation (compositing, text overlay)  
- **Axios** – For making HTTP requests (integrate with Gemini API)  
- **Gemini API SDK/Connector** – To interact with the Gemini API for AI-driven analysis

### Installation Commands

```bash
# Next.js project with TypeScript setup
npx create-next-app@latest smart-thumbnail-maker --typescript

# Navigate to project folder
cd smart-thumbnail-maker

# Install image processing libraries and API connector
npm install sharp jimp axios

# Install UI dependencies (example using Shadcn UI and Tailwind CSS)
npm install @shadcn/ui tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Architect & Component Collaboration

1. **Frontend (Next.js + React):**
   - **Upload/Input Component:**  
     - Presents a file upload button and text input field for user instructions.
     - Uses Shadcn UI components for a consistent and responsive design.
   - **API Call Component:**  
     - On submission, sends a POST request (via Axios) to a custom Next.js API endpoint.
   - **Result Preview Component:**  
     - Displays the generated thumbnail once the backend returns the manipulated image.

2. **Backend (Next.js API Routes / Node.js):**
   - **API Endpoint:**  
     - Receives the image and instruction.
     - Calls the Gemini API (using Axios and/or Gemini SDK) to analyze the input.
   - **Image Processing Module:**  
     - Based on Gemini API suggestions, uses Sharp for resizing/compression and Jimp for additional manipulations (text overlays, compositing).
   - **Response Module:**  
     - Returns the final thumbnail as a buffer or a URL (if saved on disk/cloud) to the frontend.

3. **Gemini API Integration:**
   - The backend sends both the image (or its URL) and the instruction text to the Gemini API.
   - Receives structured instructions (e.g., resize dimensions, font, color, background instructions).
   - These instructions drive the image processing functions provided by Sharp/Jimp.

---

## High-Level File Structure

```
/smart-thumbnail-maker
├── public/
│   └── favicon.ico
├── src/
│   ├── pages/
│   │   ├── index.tsx                // Main page: combines Upload/Input and Thumbnail Preview
│   │   └── api/
│   │       └── process-image.ts     // API route: handles Gemini API call and image manipulation
│   ├── components/
│   │   ├── UploadSection.tsx        // File input and instruction text field
│   │   └── ThumbnailPreview.tsx     // Renders the resulting thumbnail
│   ├── lib/
│   │   ├── gemini.ts                // Module for Gemini API integration
│   │   ├── imageProcessor.ts        // Wraps Sharp and Jimp logic based on Gemini API suggestions
│   │   └── axiosInstance.ts         // Custom Axios setup for API calls (optional)
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       └── api.d.ts                 // Type definitions for API requests/responses
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Collaboration Summary

- **User Interaction:**  
  The user interacts with the UploadSection component to select an image and enter an instruction.

- **Frontend to Backend:**  
  On form submission, Next.js sends the image and instructions to an API endpoint. Axios handles HTTP requests.

- **Gemini API & Image Processing:**  
  The API endpoint calls the Gemini API to receive recommendations. These recommendations guide the image manipulation operations implemented using Sharp and Jimp.

- **Display:**  
  The manipulated thumbnail is sent back to the frontend and displayed in the ThumbnailPreview component.

- **Scalability & Maintainability:**  
  Separation of concerns through modules (Gemini API integration, image processor) ensures that updates (such as swapping out the image processing library or Gemini API changes) can be implemented with minimal disruption.

---

## Conclusion

This architecture leverages the power of Next.js with TypeScript for a seamless full-stack experience, harnesses industry-leading image manipulation libraries (Sharp, Jimp) for quick and efficient processing, and integrates AI-driven analysis via the Gemini API. The modular design enables easy future enhancements and maintenance.
