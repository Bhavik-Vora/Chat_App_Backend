// constants/config.js

export const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:8080',
  'https://chat-app-6k7a.onrender.com',
  'https://chat-app-frontend-puce-eight.vercel.app',
  'https://chat-app-6k7a.onrender.com/api/v1/user/login',
  'https://chat-app-6k7a.onrender.com/api/v1/user/',
  'https://chat-app-6k7a.onrender.com/api/v1/chat/',
  'https://chat-app-6k7a.onrender.com/api/v1/admin/',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

export { corsOptions };
