import "./lib/env.js"
import cors from "cors"
import express from "express";
import registerRoutes from "./controller/auth.js";
import dataRoutes from "./controller/dataRoutes.js"
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;
console.log("TOKEN from env:", process.env.TOKEN);
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))
app.use(cookieParser());
app.use(express.json());

app.use("/api", registerRoutes); 
app.use("/api", dataRoutes); 

app.listen(PORT, () => {
    console.log(`App is listening on Port ${PORT}`);
});