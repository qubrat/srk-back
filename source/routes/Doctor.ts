import express from 'express';
import controller from '@/controllers/Doctor';
import {isAuthorized} from "@/middleware/Authorize";

const router = express.Router();


router.post('/create',isAuthorized("doctor"), controller.createDoctor);
router.get('/get/:doctorId', controller.readDoctor);
router.get('/get/', controller.readAllDoctors);
router.patch('/update/:doctorId',isAuthorized("doctor"), controller.updateDoctor);
router.delete('/delete/:doctorId',isAuthorized("doctor"), controller.deleteDoctor);

export = router;
