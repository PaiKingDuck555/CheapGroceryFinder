# **RealCheapGroceryFinder** 🛒💰  
📌 **Compare grocery prices, find nearby stores, and save money effortlessly.**  

---

## **📝 Overview**
RealCheapGrocery is a web application that helps users **compare product prices** across multiple grocery stores using real-time data scraping and text analysis. It also provides **nearby store locations** using the Google Maps API.  

This app is particularly useful for **budget-conscious shoppers, students, and bulk buyers** looking to optimize grocery spending.  

### **🔹 Why Use This App?**
- **🛒 Compare grocery prices across multiple stores** instantly.  
- **📍 Find nearby grocery stores** using real-time location data.  
- **📷 Extract price data from images** using OCR (Optical Character Recognition).  
- **✅ Remove duplicate listings** for more accurate pricing comparisons.  
- **📊 Sort and filter products** by price, store, and availability.  

---

## **✨ Features**
- ✅ **Product Price Comparison:** Scrapes grocery store product prices and presents them in a structured, easy-to-read format.  
- ✅ **Store Locator:** Uses geolocation to display nearby grocery stores.  
- ✅ **Automated Web Scraping & OCR:** Extracts product pricing from screenshots using image recognition.  
- ✅ **Duplicate Filtering:** Removes duplicate stores and product listings to enhance accuracy.  
- ✅ **Intuitive UI:** Displays structured search results in an interactive format.  

---

## **🔧 How It Works**
1️⃣ **User Input:** Users enter a grocery item they want to compare prices for.  
2️⃣ **Backend API Call:** The frontend sends a request to `/scrape`, passing the product name(s).  
3️⃣ **Web Scraping & Image Analysis:**  
   - The server captures store listings with prices using **Cheerio (web scraping)**.  
   - It then processes screenshots of product listings using **Tesseract.js (OCR - Optical Character Recognition)** to extract text-based pricing.  
4️⃣ **Data Processing & Filtering:** The extracted data is processed, structured, and cleaned (removing duplicates and sorting).  
5️⃣ **Store Locator API Call:** If users want to find nearby grocery stores, a request is made to `/grocery-location` using the **Google Places API**.  
6️⃣ **Frontend Display:** The results are dynamically rendered using JavaScript and displayed in an interactive format.  

---

## 🛠 Tech Stack & APIs Used

### **🖥 Backend**
- **Node.js & Express.js** - Server-side framework to handle API requests and responses.
- **Puppeteer.js** - Web scraping library used to extract product data from grocery store websites.
- **Tesseract.js** - Optical Character Recognition (OCR) library to extract price data from images.
- **Google Places API** - Fetches nearby grocery store locations based on user input or geolocation.

### **🌐 Frontend**
- **HTML/CSS/JavaScript** - Core web technologies for UI and user interaction.
- **Fetch API** - Handles asynchronous requests from frontend to backend.
- **Google Maps API** - Renders store locations on an interactive map.

--- 

## 🙌 Why This App is Helpful

**RealCheapGrocery** helps users **save time and money** by instantly comparing grocery prices across multiple stores.  

### **🔹 Who Benefits from This App?**
- **🛒 Budget-Conscious Shoppers** - Find the lowest prices without visiting multiple stores.  
- **📚 Students & Families** - Reduce grocery expenses and optimize spending.  
- **📦 Bulk Buyers** - Identify stores with lower prices for bulk purchases.  
- **⏳ People Without Store Loyalty** - If you shop based on the best deals rather than store preference, this app makes comparisons effortless.  

### **🚀 How This App Solves Real Problems**
✅ **No More Manual Price Checking** - Instead of manually visiting multiple grocery store websites, users can compare prices instantly.  
✅ **Efficient Grocery Shopping** - Users can make cost-effective purchasing decisions by identifying which store has the cheapest items.  
✅ **Find Nearby Grocery Stores** - The app not only helps compare prices but also finds **the closest** store locations.  
✅ **Works with Real-Time Data** - Instead of relying on outdated pricing, the app fetches the latest available store listings.  

With **RealCheapGrocery**, users no longer need to spend hours comparing grocery prices—**it's all done in seconds!**  





