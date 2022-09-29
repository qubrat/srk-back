import 'module-alias/register';
import Reservation from '@/models/Reservation';
import Slots from '@/models/Slots';
import mongoose from 'mongoose';
import { dayIdByDate } from '@/library/DaysUtils'


export { updateSlotForNewReservation, makeSlotAvailable };


const updateSlotForNewReservation = async (doctorId: string, dayId: string, dayDate: Date, time: string) => {
	const doctor = new mongoose.Types.ObjectId(doctorId);
	const day = new mongoose.Types.ObjectId(dayId);
	const occupied = await Reservation.findOne({ doctorId: doctorId, day: dayDate, time: time })
		.then((reservation: any) => {
			return reservation;
		});
	if (occupied) {
		throw Error('Reservation with given details already exists.');
	}
	const slotsObj = await Slots.findOne({ doctorId: doctor, dayId: day })
	if (slotsObj) {
		const found = slotsObj.slots.find((slot: { start: string }) => {
			return slot.start === time;
		});
		if (found) {
			if (found.availability) {
				found.availability = false;
				await slotsObj.save();
			} else {
				throw Error('Slot occupied.');
			}
		} else {
			throw Error('Object with specified time cannot be found in days array of slots object.');
		}
	} else {
		throw Error('Slots object with specified doctorID or dayID does not exist.');
	}
};

const makeSlotAvailable = async (reservationId: string) => {
	const reservation = await Reservation.findById(reservationId);
	if (reservation) {
		const doctorId = new mongoose.Types.ObjectId(reservation.doctorId);
		const dayId = await dayIdByDate(doctorId, reservation.day)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				throw error;
			});
		const day = new mongoose.Types.ObjectId(dayId);
		const slotsObj = await Slots.findOne({ doctorId: doctorId, dayId: day })
		if (slotsObj) {
			const found = slotsObj.slots.find((slot: { start: string }) => {
				return slot.start === reservation.time;
			});
			if (found) {
				if (!found.availability) {
					found.availability = true;
					slotsObj.save();
				} else {
					throw Error('Slot already free.');
				}
			} else {
				throw Error('Object with specified time cannot be found in days array of slots object.');
			}
		} else {
			throw Error('Slots object with specified doctorID or dayID does not exist.');
		}
	}
}
