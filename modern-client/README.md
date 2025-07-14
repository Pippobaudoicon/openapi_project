# OpenAPI Modern Client

A modern, beautiful Vue.js client for the OpenAPI business intelligence platform. Built with cutting-edge technologies and designed with a startup-like aesthetic.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Authentication**: Complete login/register flow with password reset
- **Company Search**: Advanced search with filters and real-time results
- **Dashboard**: Comprehensive analytics and quick actions
- **File Management**: Upload, download, and manage business reports
- **Profile Management**: User settings and preferences
- **Real-time Updates**: Live data updates and notifications
- **Mobile Responsive**: Works perfectly on all devices

## 🛠 Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management for Vue.js
- **Vue Router** - Official router for Vue.js
- **Axios** - HTTP client for API requests
- **VueUse Motion** - Animation library
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Date-fns** - Modern JavaScript date utility library

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#0ea5e9 to #0284c7)
- **Gray**: Neutral palette for text and backgrounds
- **Success**: Green (#22c55e)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Primary Font**: Inter (body text)
- **Display Font**: Cal Sans (headings)

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Primary and secondary variants with hover effects
- **Forms**: Clean inputs with focus states
- **Animations**: Smooth transitions and micro-interactions

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: 320px to 767px

## 🔗 API Integration

The client integrates with the OpenAPI server running on `http://localhost:3000`:

- **Authentication**: Login, register, password reset
- **Company Search**: Advanced search with filters
- **Company Details**: Detailed company information
- **File Operations**: Upload, download, delete files
- **User Management**: Profile updates and preferences

## 🎯 Key Pages

1. **Authentication** (`/auth/*`)
   - Login
   - Register
   - Forgot Password
   - Reset Password

2. **Dashboard** (`/dashboard`)
   - Analytics overview
   - Quick actions
   - Recent activity
   - Credit information

3. **Search** (`/search`)
   - Advanced company search
   - Filter options
   - Results display

4. **Company Detail** (`/company/:piva`)
   - Detailed company information
   - Report generation
   - Financial data

5. **Files** (`/files`)
   - File management
   - Upload/download
   - Storage analytics

6. **Profile** (`/profile`)
   - User settings
   - Password change
   - Preferences

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=OpenAPI Client
```

### Proxy Configuration
The Vite development server is configured to proxy API requests to the backend server running on port 3000.

## 🎨 Customization

### Colors
Update the color palette in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom primary colors
      }
    }
  }
}
```

### Fonts
Add custom fonts in `src/style.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font:wght@400;600;700&display=swap');
```

## 🚀 Deployment

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist` directory
3. Deploy to your preferred hosting service (Vercel, Netlify, etc.)

## 📄 License

This project is part of the OpenAPI business intelligence platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.

---

Built with ❤️ using modern web technologies
