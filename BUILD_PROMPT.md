# Prompt for Building the "AI Product Showcase" Application

Act as a world-class senior frontend engineer with deep expertise in the Gemini API and modern UI/UX design. Your task is to build a complete web application called 'AI Product Showcase' using React, TypeScript, and Tailwind CSS.

## 1. Core Concept
The application allows users to generate professional-quality product photoshoots using AI. It should have two distinct modes:
*   **Lookbook Mode:** The user uploads a photo of a model and a photo of a product (e.g., a shirt). The AI generates images of the model wearing the product in various settings.
*   **B-roll Mode:** The user uploads only a product photo (e.g., a handbag). The AI generates various lifestyle and studio shots of that product.

## 2. UI/UX and Layout
*   **Overall Theme:** A sleek, modern dark theme. Use the 'Inter' font from Google Fonts.
*   **Main Layout:** A two-column responsive layout.
    *   **Left Column (Controls):** A fixed-width panel containing all user inputs and controls, organized into numbered sections with titles and subtitles.
    *   **Right Column (Gallery):** A flexible panel that displays the gallery of generated images.
*   **Header:** A simple header with the application title "AI Product Showcase" and a shopping bag icon.
*   **Footer:** A minimal footer with a copyright notice, crediting Google Gemini.

## 3. Component Breakdown & Functionality

*   **`App.tsx` (Main Component):**
    *   Manages all application state: generation mode, uploaded images, theme/lighting selections, loading states, errors, generated images, and video generation status.
    *   Renders the main layout and all other components.

*   **Controls (Left Panel):**
    *   **Mode Selector:** Buttons to switch between 'Lookbook' and 'B-roll' modes.
    *   **Image Uploaders:** Create a reusable `ImageUploader` component with:
        *   Drag-and-drop support.
        *   Click-to-upload functionality.
        *   An image preview once a file is selected.
        *   A button to remove the uploaded image.
        *   Lookbook mode will have two uploaders (Model, Product); B-roll will have one (Product).
    *   **Customization Dropdowns:** Two dropdown menus for 'Photoshoot Theme' and 'Lighting Style'. Populate them with diverse options (e.g., 'Studio Professional', 'Urban Street Style', 'Golden Hour', 'Dramatic Shadows').
    *   **Generate Button:** A primary call-to-action button, labeled "Create Lookbook" or "Create B-roll" depending on the mode. It should show a loading spinner and be disabled during image generation.

*   **Gallery (Right Panel):**
    *   Displays a 2x3 grid of `ImageCard` components.
    *   Shows a loading state for the entire gallery while images are being generated.
    *   Initial state should show placeholder images.

*   **`ImageCard.tsx` (Individual Image Display):**
    *   Displays a single generated image with an aspect ratio of 2:3.
    *   On hover, an overlay appears with action buttons.
    *   **Action Buttons & Features:**
        *   **Zoom:** Opens the image in a full-screen `Modal` component.
        *   **Download:** Downloads the image file.
        *   **Generate Prompt:**
            *   Calls the Gemini text model to generate a descriptive prompt for the image.
            *   Displays the prompt on the card and provides a 'Copy Prompt' button.
        *   **Generate Video:**
            *   Calls the Gemini VEO video model to animate the image into a short clip.

*   **Modals:**
    *   **`Modal.tsx`:** A reusable modal for displaying a zoomed-in view of an image. It should be dismissible by clicking the background or pressing the 'Escape' key.
    *   **`VideoModal.tsx`:** A dedicated modal for playing the generated video. It should feature an HTML5 video player with controls, autoplay, and loop enabled. It must handle blob URL cleanup on unmount.

## 4. Gemini API Integration (`services/geminiService.ts`)

*   Use the `@google/genai` library. The API key should be sourced from `process.env.API_KEY`.
*   **Image Generation (`generateImages`):**
    *   Use the `gemini-2.5-flash-image-preview` model.
    *   Construct a detailed prompt based on the user's mode, theme, and lighting selections.
    *   For Lookbook mode, the prompt should instruct the AI to place the product on the model.
    *   For B-roll mode, the prompt should focus on creative product photography.
    *   Generate 6 images in parallel.
*   **Prompt Generation (`generateImagePrompt`):**
    *   Use the `gemini-2.5-flash` model.
    *   Send the image and a prompt asking the AI to describe it for a text-to-image generator.
*   **Video Generation (`generateVideoFromImage`):**
    *   Use the `veo-2.0-generate-001` model.
    *   Send the selected image and a simple prompt like "Animate this image with subtle motion."
    *   Implement an asynchronous polling loop that checks the video generation status every 10 seconds.
    *   Once complete, fetch the video from the returned URI, convert it to a blob URL to protect the API key, and return the blob URL.

## 5. Loading & Error States

*   Implement a clear loading state for the main image generation process, showing a spinner and a message like "Warming up the AI stylist..."
*   For video generation, implement a full-screen overlay with a larger spinner. Display a series of cycling messages (e.g., "AI is directing your video...", "This can take a few minutes...") to keep the user engaged during the potentially long wait.
*   Display any API errors clearly to the user.

## 6. File Structure
Organize the code logically:
*   `index.tsx` (entry point)
*   `App.tsx`
*   `types.ts`
*   `constants.ts`
*   `components/`
    *   `icons/`
*   `services/`
*   `utils/`
