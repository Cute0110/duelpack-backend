const express = require("express");
const router = express.Router();
const config = require("../config/main");

// controllers
const userController = require("../controllers/userController");
const packController = require("../controllers/packController");
const itemController = require("../controllers/itemController");
const forgeController = require("../controllers/forgeController");
const cartController = require("../controllers/cartController");
const affiliateController = require("../controllers/affiliateController");
const paymentController = require("../controllers/paymentController");
const paypalPaymentController = require("../controllers/paypalPaymentController");

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
router.post("/user_transaction", adminAuthenticate, userController.userTransaction);
router.post("/user_delete", adminAuthenticate, userController.userDelete);
router.post("/user_status_change", adminAuthenticate, userController.userStatusChange);
router.post("/reset_password", adminAuthenticate, userController.resetUserPassword);
router.post("/change_password", authenticate, userController.changeUserPassword);

//users
router.post("/profile_save", authenticate, userController.onSaveProfile);
router.post("/referralCode_save", authenticate, userController.onSaveReferralCode);
router.post("/user_deposit_history", authenticate, userController.getUserDepositHistory);
router.post("/user_withdraw_history", authenticate, userController.getUserWithdrawHistory);

//affiliate
router.post("/get_user_affiliate", authenticate, affiliateController.getUserAffiliate);

//packs
router.post("/pack_list", packController.getAllPacks);
router.post("/pack_items_list", packController.getPackItems);
router.post("/pack_items_list_all", packController.getPackItemsAll);
router.post("/buy_items", authenticate, packController.buyItems);

//items
router.post("/item_list", itemController.getAllItems);

//cart
router.post("/cart_list", authenticate, cartController.getAllItems);
router.post("/sell_cart_items", authenticate, cartController.sellItems);

//transactions
router.post("/get_deposit_histories", adminAuthenticate, paymentController.getAllDepositHistory);
router.post("/get_withdraw_histories", adminAuthenticate, paymentController.getAllWithdrawHistory);
router.post("/withdraw_confirm", adminAuthenticate, paymentController.onWithdrawConfirm);

//forge
router.post("/forge_list", forgeController.getAllForge);
router.post("/forge_bet", authenticate, forgeController.onBetForge);

// Create PayPal Payment
router.post("/create_order", authenticate, paypalPaymentController.createOrder);
router.post("/capture_order", authenticate, paypalPaymentController.captureOrder);

module.exports = router;
