# Smart Job Prep Assistant

A comprehensive job preparation tool that helps users optimize their resume bullet points using AI-powered suggestions based on job descriptions.

## 🚀 Features

- **AI-Powered Resume Rewriting**: Get tailored resume bullet point suggestions based on job descriptions
- **STAR Method Integration**: Generate compelling stories using the Situation-Task-Action-Result framework
- **Keyword Analysis**: Identify and highlight important keywords from job descriptions
- **Interactive UI**: User-friendly interface for easy navigation and interaction
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Authentication**: Secure user authentication and data persistence

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion (animations)
- React Icons
- Axios (HTTP client)

### Backend
- Node.js with Express
- MongoDB (database)
- JWT (authentication)
- Google Gemini API (AI processing)
- Zod (validation)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)
- Google Gemini API key

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-job-prep-assistant.git
   cd smart-job-prep-assistant/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     GEMINI_API_KEY=your_gemini_api_key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

## 🚀 Usage

1. **Authentication**
   - Register a new account or log in with existing credentials
   - Access your dashboard after successful authentication

2. **Resume Rewriter**
   - Paste your resume bullet point
   - Add the job description
   - Click "Generate Rewrites" to get AI-powered suggestions
   - Save your favorite rewrites for future reference

3. **STAR Stories**
   - Select a rewrite to generate a STAR story
   - Edit the generated story as needed
   - Save your STAR stories for interviews

## 📂 Project Structure

```
smart-job-prep-assistant/
├── backend/               # Backend server code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── .env.example      # Environment variables example
│   └── server.js         # Server entry point
│
└── frontend/             # Frontend React application
    ├── public/           # Static files
    └── src/
        ├── assets/       # Images, fonts, etc.
        ├── components/    # Reusable UI components
        ├── context/      # React context providers
        ├── pages/        # Page components
        ├── styles/       # Global styles
        └── App.js        # Main application component
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Resume Rewrites
- `POST /api/rewrite-resume` - Generate resume rewrites
- `GET /api/rewrites` - Get user's saved rewrites
- `GET /api/rewrites/:id` - Get a specific rewrite
- `PUT /api/rewrites/:id` - Update a rewrite
- `DELETE /api/rewrites/:id` - Delete a rewrite

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini API for AI-powered text generation
- Tailwind CSS for utility-first CSS framework
- Framer Motion for smooth animations
- All contributors who helped in the development