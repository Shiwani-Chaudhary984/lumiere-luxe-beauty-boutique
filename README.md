# LUMIÈRE BEAUTY — Luxury Cosmetics Store
### University Web Development Project (HTML5, CSS3 & Vanilla JavaScript)

**Live Demo / GitHub Pages Ready** | **Prices in Nepalese Rupees (NPR)** | **100% Vanilla Code (Zero Frameworks)**

---

## 1. Project Overview & Compliance

**LUMIÈRE BEAUTY** is a complete, responsive luxury cosmetics e-commerce web application inspired by high-altitude Himalayan botanical alchemy and contemporary cosmetic science. 

This project strictly adheres to the university module requirements:
- **Languages Used**: Pure **HTML5**, **CSS3**, and **Vanilla JavaScript** (ES6+).
- **Framework-Free**: No React, no TypeScript runtime, no Tailwind runtime, no Bootstrap, and no backend or external database required.
- **Separation of Concerns**: Markup (`index.html`), presentation (`css/style.css`), datasets (`js/products.js`), and behavior (`js/app.js`) are maintained in separate, organized files.
- **Universal Compatibility**: Works out-of-the-box when opened directly via `file:///.../index.html`, on a local static server, or hosted on **GitHub Pages** without any compilation step.

---

## 2. Directory Structure

```text
/
├── index.html            # Master semantic HTML5 document with all views, modals & navigation
├── css/
│   └── style.css         # Complete vanilla CSS3 stylesheet (variables, grid, flexbox, responsive)
├── js/
│   ├── products.js       # 28 authentic Himalayan formulations (NPR pricing, shades, ingredients)
│   └── app.js            # Vanilla JS application controller (routing, cart, wishlist, checkout, FAQ)
├── public/
│   └── assets/           # Local project image assets & design references
├── metadata.json         # Project metadata and configuration
└── README.md             # Project documentation & Moodle submission guide
```

---

## 3. Implemented Pages & Features

1. **Home Page (`#home`)**:
   - Announcement banner with coupon code **GLOW15** (15% discount).
   - Luxury brand header with search input, NPR currency indicator, dynamic wishlist & cart badge counters, and mobile navigation drawer.
   - Editorial Hero banner with ambient glows, narrative typography, call-to-actions, and 4 trust badges (*100% Cruelty-Free, Derm Tested, Clean Botanicals, Nepal Express*).
   - Atelier Collections circular categories grid with formulation counts.
   - Celebrated Best Sellers carousel/grid with quick add and wishlist toggle.
   - Special Offer spotlight for *"The Rose Gold Radiance Box"* with live countdown timer.
   - New Arrivals & Trending tabbed showcase (All, Alpine Serums, Lip Oils, Silky Cushions).
   - Fictional customer testimonials from verified patrons across Nepal (Kathmandu, Lalitpur, Jhapa).
   - 4-column perks strip (*Free Nepal Shipping, 14-Day Easy Exchange, Luxury Gift Packaging, Dedicated Beauty Advisor*).
   - Instagram community flatlays (#LumiereGlowClub) and VIP newsletter subscription form.

2. **Shop Catalog Page (`#shop`)**:
   - **28 Handcrafted Formulations**: Complete with images, NPR pricing, volume, star ratings, and descriptions.
   - **Filter Sidebar**: Category selection, interactive price range slider (NPR 1,000 to NPR 6,000), search bar, and quick chips (*Best Sellers, On Sale, Under NPR 2,500*).
   - **Sorting**: Featured, Price: Low to High, Price: High to Low, Highest Rated, Alphabetical (A-Z).
   - Real-time count of matching formulations with a *"Reset All Filters"* action.

3. **Product Details View (`#product-details/{id}`)**:
   - Breadcrumb navigation (`Home > Shop > Category > Product`).
   - Image gallery with interactive thumbnail switcher.
   - Visual shade/undertone picker with color swatches.
   - Quantity stepper (+ / -).
   - *"Add to Shopping Bag"* and *"Buy Now"* (direct to checkout) buttons.
   - 4-tier interactive accordion: *The Ritual & Description, Himalayan Botanicals & Actives, How to Apply, Nepal Shipping & 14-Day Exchanges*.
   - Dynamic related product pairings row.

4. **Shopping Cart Drawer & Dedicated Page (`#cart`)**:
   - Slide-out drawer and full cart page.
   - Itemized list with thumbnail, title, selected shade, unit price, quantity increment/decrement, and remove button.
   - **Free Shipping Progress Bar**: Automatically calculates remaining amount to reach the NPR 4,000 threshold.
   - **Coupon Engine**: Accepts `GLOW15` (15% off) and `FIRSTGLOW` (NPR 500 off) with instant validation.
   - Full breakdown: Subtotal, Discount, Courier Delivery (Free over NPR 4,000 or NPR 200 standard), and Grand Total in NPR.

5. **Wishlist Page (`#wishlist`)**:
   - Persistent wishlist stored in browser `localStorage`.
   - Grid of saved formulations with *"Move to Bag"* and *"Move All to Bag"* capabilities.

6. **Checkout Page (`#checkout`)**:
   - 2-column layout with customer details (Name, Email, 10-digit Nepal mobile phone).
   - Nepal delivery address fields (Province 1–7, City/District, Street address, delivery notes).
   - **Simulated Payment Options**: eSewa Mobile Wallet, Khalti Digital Wallet, ConnectIPS, Cash on Delivery (COD), and Cards.
   - Comprehensive form validation and loading feedback on submission.

7. **Order Confirmation View (`#order-confirmation`)**:
   - Order Identifier (e.g. `LUM-2026-XXXX`).
   - Estimated delivery window (24–48 hours across Nepal).
   - Itemized invoice summary.
   - Browser print utility (*"Print / Save Receipt"*) and auto-save to Patron Order History.

8. **About Us Page (`#about-us`)**:
   - The Himalayan Heritage story and Durbar Marg salon background.
   - Three core pillars: *Wild Botanical Actives, 100% Cruelty-Free & Vegan, Ethical Fair Harvest*.

9. **Contact Page (`#contact`)**:
   - Durbar Marg boutique address, telephone, email, and opening hours.
   - Validated contact form with consultation inquiry subject dropdown and success state.

10. **FAQ Page (`#faq`)**:
    - Interactive accordion with 8 comprehensive beauty, delivery, skin suitability, and return questions.

11. **Demo Account & Order History (`#account`)**:
    - Patron profile header with Glow Loyalty Points and member tier.
    - Persistent order history table loaded from `localStorage` with order status badges (*Processing, Delivered*).
    - Utility to reset demo order history.

12. **In-App Project Guide Modal**:
    - Accessible directly via the floating mortarboard icon or header navigation link, explaining the university module specifications and GitHub Pages compatibility.

---

## 4. How to Run Locally

### Option 1: Direct File Opening (No server required)
1. Locate the project folder on your computer.
2. Double-click `index.html` to open it in your default web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari).
3. The website will load and function with all navigation, cart, wishlist, and styling intact.

### Option 2: Using VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Right-click `index.html` and select **"Open with Live Server"**.
3. The website will run at `http://127.0.0.1:5500/index.html`.

---

## 5. GitHub Pages Deployment Instructions

1. Create a new repository on your GitHub account (e.g. `lumiere-beauty-store`).
2. Push or upload the project files so that `index.html` is at the repository root.
3. In your GitHub repository:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Branch**, select `main` (or `master`) and `/ (root)`.
   - Click **Save**.
4. GitHub Pages will deploy your site at `https://<username>.github.io/<repository-name>/`.
5. Because all asset paths use relative paths (`./css/style.css`, `./js/products.js`, `./js/app.js`), the site functions properly inside the repository subdirectory.

---

## 6. Moodle Submission Instructions

1. Ensure the project folder contains:
   - `index.html`
   - `css/style.css`
   - `js/products.js`
   - `js/app.js`
   - `public/assets/`
   - `README.md`
2. Compress (ZIP) the entire folder:
   - Windows: Right-click folder > **Send to** > **Compressed (zipped) folder**.
   - macOS: Right-click folder > **Compress "lumiere-beauty"**.
3. Upload the resulting `.zip` file to your university **Moodle** submission inbox before the deadline.
4. Assessors can unzip the folder and launch `index.html` in any browser to verify all grading criteria.

---

*LUMIÈRE BEAUTY NEPAL — Crafted with botanical purity and high-altitude Himalayan actives.*
