import "dotenv/config"; // Imports and configures dotenv immediately
import express from "express";
import cors from "cors";
import connectDB from "./utils/connectToDb.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user-routes.js";
import companyRoute from "./routes/company-routes.js";
import jobRoute from "./routes/job-routes.js";
import contactRoute from "./routes/Contact-Us-route.js";
import applicationRoute from "./routes/application-route.js";
import aiRoute from "./routes/ai-routes.js";

// Initializing app
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  "https://talentnestpro.netlify.app",
  "https://talentnest-pro.vercel.app",
  "http://localhost",
];

// CORS OPTION
const corsOptions = {
  origin: allowedOrigins,
  methods: "POST,GET,PUT,PATCH,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

// Port
const PORT = process.env.PORT || 3000;

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/contact", contactRoute);
app.use("/api/v1/ai", aiRoute);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`);
  });

  import("./utils/redis.js");
  // Start cron job AFTER the server starts
  import("./utils/cronJob.js");
});
