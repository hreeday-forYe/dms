import express from "express";
import DistributorController from "../controllers/distributorController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const distributorRouter = express.Router();

distributorRouter.get("/", DistributorController.fetchAllDistributors);


distributorRouter.get(
  "/distributor-profile",
  isAuthenticated,
  authorizeRoles("distributor"),
  DistributorController.getDistributorProfile
);

distributorRouter.get(
  "/dashboard-data",
  isAuthenticated,
  authorizeRoles("distributor"),
  DistributorController.getDashboardData
);



distributorRouter.get("/:id", DistributorController.fetchSingleDistributor);

distributorRouter.post(
  "/add-distributor",
  isAuthenticated,
  authorizeRoles("admin"),
  DistributorController.addDistributor
);

distributorRouter.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  DistributorController.updateDistributor
);

export default distributorRouter;
