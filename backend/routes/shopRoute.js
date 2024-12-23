import express from "express";
import { fetchAllShops, findShop, shopDetails } from "../controller/shopController.js";

const shopRouter = express.Router();

shopRouter.get("/all", fetchAllShops);
shopRouter.get("/details", shopDetails);
shopRouter.get("/:shopId", findShop);

export default shopRouter;