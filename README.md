# ElevateHealth - AI-Powered Health Analytics Platform

ElevateHealth is a comprehensive health analytics platform that combines food analysis, barcode scanning, and biological age assessment to help users make informed health decisions.

## 🚀 Features

### 🍎 Food Analytics
- **AI-Powered Food Analysis**: Uses OpenAI Vision API to analyze food images and extract detailed nutritional information
- **Camera Integration**: Real-time camera capture for instant food analysis
- **Barcode Scanning**: Scan product barcodes to get nutritional information
- **Sugar Content Tracking**: Detailed sugar analysis and tracking
- **Restaurant Integration**: Automatic menu data fetching from supported restaurants

### 🧬 BioAge Analysis
- **Biological Age Assessment**: Real-time analysis using advanced algorithms
- **WebSocket Integration**: Live data streaming for real-time updates
- **Health Metrics**: Comprehensive health scoring and recommendations

### 📊 Dashboard & Tracking
- **Sugar Intake Calendar**: Visual calendar for tracking daily sugar consumption
- **Progress Tracking**: Monitor health improvements over time
- **Challenge System**: Gamified health challenges and progress tracking

## 🔧 Environment Setup

### Required Environment Variables

1. **Create Environment Files:**
   ```bash
   cp .env_example .env
   cp .env.local_example .env.local
   ```

2. **Configure OpenAI API Key:**
   - Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add to `.env.local`:
     ```bash
     OPENAI_API_KEY=sk-your-api-key-here
     ```

3. **Configure Supabase (Optional):**
   - Add to `.env`:
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **AI Integration**: OpenAI Vision API, GPT-4
- **Barcode Scanning**: ZXing library
- **Backend**: Next.js API routes, Python WebSocket server
- **Database**: Supabase (for user data and analytics)

## 📁 Project Structure

```
ElevateHealth/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── analyze-food/         # Food analysis endpoint
│   │   ├── analyze-barcode/      # Barcode analysis endpoint
│   │   └── product-lookup/       # Product lookup endpoint
│   ├── bioage/                   # BioAge analysis page
│   ├── bioage-analysis/          # BioAge results page
│   ├── dashboard/                # Main dashboard
│   ├── food-analytics/           # Food analysis interface
│   └── onboarding/               # User onboarding
├── bioage/                       # BioAge WebSocket server
│   ├── backend/                  # Python backend
│   ├── frontend/                 # BioAge frontend
│   └── websocket-server.py       # WebSocket server
├── components/                   # Reusable UI components
├── lib/                          # Utility libraries
│   ├── restaurant-data.ts        # Restaurant menu data
│   └── restaurant-scraper.ts     # Restaurant data scraper
├── doc/                          # Documentation
└── public/                       # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ElevateHealth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env_example .env.local
   ```
   
   Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start the BioAge WebSocket server** (in a separate terminal)
   ```bash
   cd bioage
   python3 websocket-server.py
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### OpenAI Setup
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file
3. Restart the development server

### BioAge WebSocket Server
The BioAge analysis requires a WebSocket server running on port 8081. The server connects to an external service for biological age calculations.

## 📱 Usage

### Food Analysis
1. Navigate to the Food Analytics page
2. Use the camera to capture food or upload an image
3. The AI will analyze the food and provide nutritional information
4. View detailed sugar content and health recommendations

### Barcode Scanning
1. Use the barcode scanner to scan product codes
2. Get instant nutritional information
3. Track sugar content and other nutrients

### BioAge Analysis
1. Navigate to the BioAge page
2. The system will connect to the WebSocket server
3. View real-time biological age analysis
4. Monitor health metrics and recommendations

## 🧪 API Endpoints

### Food Analysis
- `POST /api/analyze-food` - Analyze food images using OpenAI Vision API

### Barcode Analysis  
- `POST /api/analyze-barcode` - Analyze product barcodes

### Product Lookup
- `POST /api/product-lookup` - Look up product information

## 🔒 Environment Variables

```bash
# OpenAI API
OPENAI_API_KEY=sk-your-api-key-here

# Supabase (if using database features)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Ensure BioAge WebSocket server is running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `doc/` folder
- Review the API documentation
- Open an issue on GitHub

## 🚨 Troubleshooting

### Common Issues

**OpenAI API Issues:**
- **401 Unauthorized**: Check your API key is correct and starts with `sk-`
- **429 Rate Limited**: You've exceeded your API usage limits
- **Invalid image format**: Ensure images are in supported formats (PNG, JPEG, WebP)

**BioAge WebSocket Issues:**
- **Connection failed**: Ensure the WebSocket server is running on port 8081
- **No data received**: Check the external service connection

**Environment Variables:**
- **Variables not loading**: Restart the development server after adding new variables
- **File not found**: Ensure `.env.local` file exists and is properly named

### Getting Help
- Check the browser console for detailed error messages
- Verify all environment variables are set correctly
- Ensure both Next.js and WebSocket servers are running

## 🔄 Recent Updates

- ✅ Enhanced food analysis with OpenAI Vision API
- ✅ Added barcode scanning functionality
- ✅ Integrated BioAge WebSocket server
- ✅ Improved UI/UX with modern design
- ✅ Added comprehensive error handling
- ✅ Organized documentation in `doc/` folder
- ✅ Removed temporary and backup directories
