import { Router } from "express";
const router = Router();
import userController from "../controllers/user.controller.js";
import userValidation from "../validations/user.validation.js";
import validate from "../middlewares/validate.js";

router.get("/", validate(userValidation.getAllUser), userController.getAllUser);
router.get("/me", validate(userValidation.getMe), userController.getMe);
router.get("/:userId", validate(userValidation.getUser), userController.getUser);
router.put("/", validate(userValidation.updateUser), userController.updateUser);

router.post("/follow/:userId", validate(userValidation.addFollow), userController.addFollow);
router.delete(
  "/follow/:userId",
  validate(userValidation.removeFollow),
  userController.removeFollow
);

router.get("/followed/:userId", validate(userValidation.getFollowed), userController.getFollowed);
router.get("/follower/:userId", validate(userValidation.getFollower), userController.getFollower);

export default router;