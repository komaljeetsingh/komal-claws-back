import express from "express";
import UserController from "../controllers/user.js";
import { isAuthorised } from "../middlewares/auth.js"

import multer from "multer";
import fs from "fs"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = `uploads/products`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + "png");
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "images", maxCount: 10 },
]);

export const router = express.Router();

router.get("/:_id", isAuthorised, UserController.getUser);//Done
router.patch("/:_id", isAuthorised, upload, UserController.updateUser);//Done
router.patch("/img/:_id", isAuthorised, upload, UserController.updateUserImg);//Done
router.get("/all", UserController.getUsers);//Done
router.post("/", UserController.addUser);//Done

