// import "../lib/env.js";
import { Router } from "express";
import { prisma } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Router();
const rough = process.env.TOKEN;
console.log("token", rough);
console.log("TOKEN from env:", process.env.TOKEN);
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({ message: "user already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newuser = await prisma.user.create({
            data: {
                name: username,
                email,
                password: hashedPassword
            }
        });
        const tokken = jwt.sign({
            userId: newuser.id, username: newuser.name, email: newuser.email
        }, process.env.TOKEN, { expiresIn: "7d" });
        return res.status(201).json({
            message: "signup success", userData: {
                id: newuser.id,
                username: newuser.name,
                email: newuser.email,
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "server  error" });
    }
});
/* ------------------ LOGIN ------------------ */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user.id, username: user.name, email: user.email }, process.env.TOKEN, { expiresIn: "7d" });
        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "none",
        //     partitioned: true,
        //     maxAge: 5 * 60 * 60 * 1000,
        // });
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.name,
                email: user.email,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
export default router;
//# sourceMappingURL=auth.js.map