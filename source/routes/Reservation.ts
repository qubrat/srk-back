import express from 'express';
import controller from '@/controllers/Reservation';

const router = express.Router();

router.post('/create', controller.createReservation);
router.get('/get/:reservationId', controller.readReservation);
router.get('/get/', controller.readAllReservations);
router.post('/login/', controller.loginWithReservation);
router.patch('/update/:reservationId', controller.updateReservation);
router.delete('/delete/:reservationId', controller.deleteReservation);

export = router;
