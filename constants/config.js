export const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080',"https://chat-app-6k7a.onrender.com","https://chat-app-frontend-puce-eight.vercel.app/"];
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHATTU_TOKEN = "chattu-token";

export { corsOptions, CHATTU_TOKEN };
