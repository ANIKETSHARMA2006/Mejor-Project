# ULTRON - AI Writing Assistant 🚀

![ULTRON](https://img.shields.io/badge/AI-ULTRON-7c3aed?style=for-the-badge&logo=googlebard&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Stream Chat](https://img.shields.io/badge/Stream-Chat-blue?style=for-the-badge&logo=stream&logoColor=white)

ULTRON is an intelligent, full-stack AI Writing Assistant designed to help users from the first draft to the final edit. Powered by Google's **Gemini AI** and built with a modern React frontend and a robust Node.js backend, ULTRON offers a seamless, real-time chat experience to make you write better and faster.

---

## ✨ Features

- **Real-Time AI Chat:** Instant, real-time communication with the ULTRON AI bot using Stream Chat.
- **Advanced Language Model:** Powered by Google's Gemini 1.5 Flash for high-quality, contextual responses.
- **Premium UI & Animations:** Beautifully crafted modern UI featuring Vite-style animated glowing borders, smooth hover effects, and interactive tap states.
- **Fully Responsive:** Flawlessly adapts to Mobile, Tablet, and Desktop screens with pixel-perfect layout and padding.
- **Custom Loading States:** Highly responsive, CSS-animated loader that dynamically adjusts to text width.
- **Secure Authentication:** Built-in session management and user authentication.
- **Voice Input (Mic):** Integrated browser Speech-to-Text for hands-free typing.
- **Markdown Support:** Renders rich text, code blocks, and formatted lists in AI responses.
- **Live Deployment:** Auto-deployed via Vercel (Frontend) and Render (Backend).

## 🛠️ Tech Stack

### Frontend
- **React.js** (via Vite)
- **Tailwind CSS v4** for modern, responsive styling
- **Stream Chat React SDK** for real-time messaging UI
- **React Markdown** for text formatting

### Backend
- **Node.js & Express.js**
- **Stream Chat Node SDK** for backend webhook and token generation
- **Google Generative AI SDK** (Gemini)
- **CORS & Cookie-Parser** for security and session handling

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/Parinay-Chauhan/Mejor-Project.git
cd Mejor-Project
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and set up your environment variables.
```bash
cd chatbackend
npm install
```
Create a `.env` file in the `chatbackend` folder and add your keys:
```env
PORT=10000
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies.
```bash
cd Frontend
npm install
```
Create a `.env` file in the `Frontend` folder and add your Stream API key:
```env
VITE_STREAM_API_KEY=your_stream_api_key
```
Start the frontend development server:
```bash
npm run dev
```

## 🌐 Live URLs

- **Frontend:** [https://mejor-project-sigma.vercel.app/](https://mejor-project-sigma.vercel.app/)
- **Backend API:** [https://mejor-backend.onrender.com](https://mejor-backend.onrender.com)

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/Parinay-Chauhan/Mejor-Project/issues).

## 📄 License
This project is proprietary and built for demonstration and internal use.

---
*Built with ❤️ by Parinay Chauhan*
