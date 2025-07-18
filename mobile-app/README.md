# OpenAPI Mobile

A modern business intelligence Flutter mobile application that mirrors the functionality and design of the OpenAPI modern-client web application.

## Features

### 🚀 **Core Functionality**
- **Company Search**: Advanced search capabilities with multiple filters (name, VAT number, city, sector)
- **Company Details**: Comprehensive company information including financials, contact details, and business data
- **Dashboard**: Analytics overview with statistics, charts, and recent activity
- **User Authentication**: Secure login and registration system
- **Profile Management**: User settings, usage statistics, and account management

### 🎨 **Design & UX**
- **Modern UI**: Clean, professional interface using Material Design 3
- **Consistent Branding**: Matches the modern-client color scheme and typography
- **Responsive Layout**: Optimized for mobile devices with intuitive navigation
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Professional Cards**: Business-focused card layouts for data display

### 🏗️ **Architecture**
- **Clean Architecture**: Organized by features with clear separation of concerns
- **State Management**: Riverpod for efficient state management
- **Navigation**: Go Router for declarative navigation
- **Theming**: Comprehensive theme system with custom colors and typography
- **Modular Structure**: Feature-based organization for scalability

## Getting Started

### Prerequisites
- Flutter SDK (3.8.1 or higher)
- Dart 3.8.1 or higher
- VS Code or Android Studio
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Install dependencies**
   ```bash
   flutter pub get
   ```

2. **Run the app**
   ```bash
   flutter run
   ```

3. **For macOS desktop**
   ```bash
   flutter run -d macos
   ```

## Key Features Implemented

### 🔐 **Authentication Pages**
- Modern login and registration forms
- Form validation and loading states
- Professional layout matching web app

### 📊 **Dashboard**
- Welcome section with gradient background
- Quick action cards for major features
- Statistics overview with interactive charts
- Recent activity feed

### 🔍 **Company Search**
- Quick search functionality
- Advanced search with multiple filters
- Company result cards
- Mock data for demonstration

### 🏢 **Company Details**
- Comprehensive company information display
- Organized sections (Basic Info, Contact, Financial)
- Professional status indicators

### 👤 **Profile Management**
- User statistics and settings
- Account management options
- Clean, organized layout

## Architecture & Design

The app follows a clean, feature-based architecture that closely mirrors your modern-client design:

- **Primary Color**: Blue (#0EA5E9) matching your web app
- **Typography**: Inter font via Google Fonts
- **Navigation**: Bottom navigation with 3 main sections
- **Cards**: Rounded design with subtle shadows
- **Responsive**: Optimized for mobile screens

## Next Steps

To complete the integration:

1. **Connect to your API server** - Update the base URL in `lib/core/constants/app_constants.dart`
2. **Implement real authentication** - Connect to your auth endpoints
3. **Add real data** - Replace mock data with API calls
4. **Test on devices** - Run on iOS/Android simulators or physical devices

The foundation is solid and ready for your business intelligence data!
