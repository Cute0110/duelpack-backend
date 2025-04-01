const express = require("express");
const router = express.Router();
const config = require("../config/main");

// controllers
const userController = require("../controllers/userController");
const packController = require("../controllers/packController");
const forgeController = require("../controllers/forgeController");
const cartController = require("../controllers/cartController");
const paymentController = require("../controllers/paymentController");

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
router.post("/google_login", userController.google_login);
router.post("/register", userController.register);

router.get("/check_session", userController.checkSession);
router.get("/admin_check_session", adminAuthenticate, userController.checkSession);

//nowpayment callback
router.post("/depositPaymentCallback", paymentController.handleDepositCallback);
router.post("/createInvoice", authenticate, paymentController.createInvoice);

//admin pages
router.post("/get_all_users", adminAuthenticate, userController.getAllUsers);
router.post("/user_delete", adminAuthenticate, userController.userDelete);
router.post("/user_status_change", adminAuthenticate, userController.userStatusChange);
router.post("/reset_password", adminAuthenticate, userController.resetUserPassword);
router.post("/user_name_change", authenticate, userController.userNameChange);
router.post("/change_password", authenticate, userController.changeUserPassword);

//packs
router.post("/pack_list", packController.getAllPacks);
router.post("/pack_items_list", packController.getPackItems);
router.post("/pack_items_list_all", packController.getPackItemsAll);
router.post("/buy_items", authenticate, packController.buyItems);

//cart
router.post("/cart_list", authenticate, cartController.getAllItems);
router.post("/sell_cart_items", authenticate, cartController.sellItems);

//transactions
router.post("/get_deposit_histories", adminAuthenticate, paymentController.getAllDepositHistory);
router.post("/get_withdraw_histories", adminAuthenticate, paymentController.getAllWithdrawHistory);
router.post("/withdraw_confirm", adminAuthenticate, paymentController.onWithdrawConfirm);

//forge
router.post("/forge_list", forgeController.getAllForge);

module.exports = router;
