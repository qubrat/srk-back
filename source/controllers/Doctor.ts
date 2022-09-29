import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Doctor from '@/models/Doctor';
import { createDayArray, updateDoctorDayArray } from '@/library/DaysUtils';
import { cascadeDeleteDoctor } from '@/library/DoctorUtils';
import Log from '@/library/Logging';

const createDoctor = (req: Request, res: Response, next: NextFunction) => {
	const { firstname, lastname, specialization } = req.body;
	const doctorId = new mongoose.Types.ObjectId();
	const daysId = new mongoose.Types.ObjectId();
	const doctor = new Doctor({
		_id: doctorId,
		firstname,
		lastname,
		specialization,
		days: daysId
	});
	createDayArray(doctorId, daysId, firstname, lastname);
	return doctor
		.save()
		.then((doctor) => res.status(201).json({ doctor }))
		.catch((error) => res.status(500).json({ error }));
};

const readDoctor = (req: Request, res: Response, next: NextFunction) => {
	const doctorId = req.params.doctorId;
	return Doctor.findById(doctorId)
		.populate({
			path: 'days',
			select: '-doctorId -__v',
			populate: {
				path: 'days.slots',
				model: 'Slots'
			}
		})
		.then((doctor) => (doctor ? res.status(200).json({ doctor }) : res.status(404).json({ message: 'Not found' })))
		.catch((error) => res.status(500).json({ error }));
};

const readAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
	return Doctor.find()
		.populate({
			path: 'days',
			select: '-doctorId -__v',
			populate: {
				path: 'days.slots',
				model: 'Slots'
			}
		})
		.then((doctors) => res.status(200).json({ doctors }))
		.catch((error) => res.status(500).json({ error }));
};

const updateDoctor = (req: Request, res: Response, next: NextFunction) => {
	const doctorId = req.params.doctorId;

	return Doctor.findById(doctorId)
		.then((doctor) => {
			if (doctor) {
				doctor.set(req.body);

				return doctor
					.save()
					.then((doctor) => res.status(201).json({ doctor }))
					.catch((error) => res.status(500).json({ error }));
			} else {
				res.status(404).json({ message: 'Not found' });
			}
		})
		.catch((error) => res.status(500).json({ error }));
};

const deleteDoctor = async (req: Request, res: Response, next: NextFunction) => {
	const doctorId = req.params.doctorId;
	try {
		await cascadeDeleteDoctor(doctorId)
			.catch((error) => {
				throw error;
			});
		const doctor = await Doctor.findByIdAndDelete(doctorId);
		return doctor ? res.status(201).json({ message: `Deleted: ${doctorId}` }) : res.status(404).json({ message: 'Not found' });
	} catch (error) {
		Log.error(error);
		return res.status(500).json({ error });
	}
};

export default { createDoctor, readDoctor, readAllDoctors, updateDoctor, deleteDoctor };
