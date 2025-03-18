const express = require("express");
const router = express.Router();
const config = require("../config/main");

// controllers
const userController = require("../controllers/userController");
const packController = require("../controllers/packController");
const forgeController = require("../controllers/forgeController");

const { authenticate, adminAuthenticate } = require("../middleware/authMiddleware");

// const checkIp = async (req, res, next) => {
//     if (req.headers["host"].startsWith("localhost")) {
//         return next();
//     }

//     try {
//         const ipAddress = req.headers["x-forwarded-for"].split(",")[0];
//         if (!config.ACCESS_IPS.includes(ipAddress)) {
//             console.log("[Black IP]", ipAddress);
//             return res.status(403).send();
//         }

//         next();
//     } catch (e) {
//         console.log("[Check IP Error]", e.message);
//         return res.status(403).send();
//     }
// }

// routes

router.post("/login", userController.login);
router.post("/register", userController.register);

router.get("/check_session", userController.checkSession);
router.get("/admin_check_session", adminAuthenticate, userController.checkSession);

//users
router.post("/get_all_users", adminAuthenticate, userController.getAllUsers);
router.post("/user_delete", adminAuthenticate, userController.userDelete);
router.post("/user_status_change", adminAuthenticate, userController.userStatusChange);
router.post("/reset_password", adminAuthenticate, userController.resetUserPassword);
router.post("/user_name_change", authenticate, userController.userNameChange);
router.post("/change_password", authenticate, userController.changeUserPassword);

//packs
router.post("/pack_list", packController.getAllPacks);
router.post("/pack_items_list", packController.getPackItems);

//forge
router.post("/forge_list", forgeController.getAllForge);

module.exports = router;
