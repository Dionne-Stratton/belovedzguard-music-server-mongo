const router = require("express").Router();
const uploadsController = require("../controllers/uploadsController");

router.post("/presign", uploadsController.createPresignedUpload);

module.exports = router;

