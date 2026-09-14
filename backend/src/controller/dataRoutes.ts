import { Router } from "express";
import { prisma } from "../lib/db.js";
import type { Request, Response, NextFunction } from "express";

const router = Router();
const rough = process.env.TOKEN
console.log("token", rough);
console.log("TOKEN from env:", process.env.TOKEN);

router.post("/data", async (req: Request, res: Response) => {
    const { email, userId, notes, economic_Activites, topData, BullishBias, BearishBias, button_pressed } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (!existingUser) {
            return res.status(409).json({ message: "user not exists plz login with your account" });
        }

        const updateData = await prisma.data.create({
            data: {
                userId,
                topEvents: topData,
                bullishBias: BullishBias,
                bearishBias: BearishBias,
                notes,
                button_pressed,
                economic_Activites
            }
        })

        return res.status(201).json({ message: "data send success" })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "server  error" });
    }
})

router.get("/getdata", async (req, res) => {
    try {
        const id = req.query.userId as string;

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(409).json({ message: "User not found" });
        }

        const data = await prisma.data.findFirst({
            where: { userId: id },                        // match by userId
            orderBy: { createdAt: "desc" }        // newest first
        });

        if (!data) {
            return res.status(404).json({ message: "No data yet" });
        }

        return res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
})

export default router;