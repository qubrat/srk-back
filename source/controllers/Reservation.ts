import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Reservation from '@/models/Reservation';
import { generateReservationCode } from '@/library/GenerateReservationCode';
import { dayIdByDate } from '@/library/DaysUtils'
import { updateSlotForNewReservation, makeSlotAvailable } from '@/library/ReservationUtils';
import Log from '@/library/Logging';

const createReservation = async (req: Request, res: Response, next: NextFunction) => {
	const { email, doctorId, day, time } = req.body;
	try {
		const dayId = await dayIdByDate(doctorId, day)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				throw error;
			});
		await updateSlotForNewReservation(doctorId, dayId, day, time)
			.catch((error) => {
				throw error;
			});

		const reservationCode = await generateReservationCode()
			.then((result) => {
				return result;
			})
			.catch((error) => {
				throw error;
			});
		const reservation = new Reservation({
			_id: new mongoose.Types.ObjectId(),
			reservationCode,
			email,
			doctorId,
			day,
			time
		});
		return await reservation
			.save()
			.then((reservation) => res.status(201).json({ reservation }))
			.catch((error) => {
				throw error;
			});
	} catch (error) {
		Log.error(error);
		res.status(500).json({ error });
	}
};

const readReservation = async (req: Request, res: Response, next: NextFunction) => {
	const reservationId = req.params.reservationId;
	return await Reservation.findById(reservationId)
		.populate('doctorId', '-days -__v')
		.then((reservation) => (reservation ? res.status(200).json({ reservation }) : res.status(404).json({ message: 'Not found' })))
		.catch((error) => res.status(500).json({ error }));
};

const readAllReservations = async (req: Request, res: Response, next: NextFunction) => {
	return Reservation.find()
		.populate('doctorId', '-days -__v')
		.then((reservations) => res.status(200).json({ reservations }))
		.catch((error) => res.status(500).json({ error }));
};

const updateReservation = async (req: Request, res: Response, next: NextFunction) => {
	const reservationId = req.params.reservationId;
	return await Reservation.findById(reservationId)
		.then((reservation) => {
			if (reservation) {
				reservation.set(req.body);
				return reservation
					.save()
					.then((reservation) => res.status(201).json({ reservation }))
					.catch((error) => res.status(500).json({ error }));
			} else {
				res.status(404).json({ message: 'Not found' });
			}
		})
		.catch((error) => res.status(500).json({ error }));
};

const deleteReservation = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const reservationId = req.params.reservationId;
		await makeSlotAvailable(reservationId)
			.catch((error) => {
				throw error;
			});
		const reservation = await Reservation.findByIdAndDelete(reservationId);
		return reservation ? res.status(201).json({ message: `Deleted: ${reservationId})` }) : res.status(404).json({ message: 'Not found' });
	} catch (error) {
		Log.error(error);
		res.status(500).json({ error });
	}
};

const loginWithReservation = async (req: Request, res: Response, next: NextFunction) => {
	const { email, reservationCode } = req.body;
	Reservation.find({ email: email, reservationCode: reservationCode }, (err: any, reservations: any) => {
		if (err) return res.status(500).json({ err });
		if (reservations.length != 0) {
			Reservation.find({ email: email }, (err: any, reservations: any) => {
				if (err) return res.status(500).json({ err });
				return res.status(200).json({ reservations });
			});
		} else res.status(404).json({ message: 'Not found / Bad credentials' });
	});
};
//TODO Poprawić powyższe spaghetti.
export default { createReservation, readReservation, readAllReservations, updateReservation, deleteReservation, loginWithReservation };
