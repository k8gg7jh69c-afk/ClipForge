import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clipforgeRouter from "./clipforge";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clipforgeRouter);

export default router;
