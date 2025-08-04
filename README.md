# Verma Furniture Admin Panel

A modern React Native admin panel built with Expo for managing a verma furniture e-commerce platform.

## Features

- **Dashboard**: Overview of categories, products, and banners
- **Category Management**: Create, edit, and delete product categories
- **Product Management**: Full CRUD operations for products with image upload
- **Banner Management**: Manage promotional banners with image cropping
- **Authentication**: Secure admin login system
- **Image Management**: Upload, crop, and manage images
- **Responsive Design**: Works on mobile, tablet, and web
- **Real-time Search**: Search and filter functionality
- **Modern UI**: Built with React Native Paper

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
- **React Native Paper**: Material Design components
- **Axios**: HTTP client for API calls
- **AsyncStorage**: Local data persistence
- **Expo Image Picker**: Image selection and camera access
- **Expo Image Manipulator**: Image cropping and editing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd verma-furniture-admin
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure API endpoint in `src/services/api.js`:
\`\`\`javascript
const API_BASE_URL = 'http://your-api-url.com/api';
\`\`\`

### Running the App

#### Mobile Development
\`\`\`bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
\`\`\`

#### Web Development
\`\`\`bash
# Run on web browser
npm run web
\`\`\`

The web version will be available at `http://localhost:19006`

## Project Structure

\`\`\`
src/
├── components/          # Reusable components
├── context/            # React context providers
├── navigation/         # Navigation configuration
├── screens/           # Screen components
├── services/          # API services and utilities
└── theme/             # Theme configuration
\`\`\`

## API Integration

The app expects the following API endpoints:

- `POST /api/auth/login` - Admin authentication
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/banners` - Get all banners
- `POST /api/banners` - Create banner
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner
- `POST /api/upload` - Upload images

## Configuration

### Environment Variables

Create an `app.config.js` file for environment-specific configuration:

\`\`\`javascript
export default {
  expo: {
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api"
    }
  }
};
\`\`\`

### Theme Customization

Modify `src/theme/theme.js` to customize colors, fonts, and spacing.

## Building for Production

### Web Build
\`\`\`bash
expo build:web
\`\`\`

### Mobile Build
\`\`\`bash
# For iOS
expo build:ios

# For Android
expo build:android
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
# VF-App
# VF-App
