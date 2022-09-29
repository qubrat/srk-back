import 'module-alias/register';
import { workdaySettings, holidays } from '@/config/settings';
import mongoose from 'mongoose';
import Days, { ISingleDay } from '@/models/Days';
import Slots, { ISingleSlot } from '@/models/Slots';
import Log from '@/library/Logging';


export { createDayArray, updateDoctorDayArray, dayIdByDate }


//====================================================================
// Helper classes
//====================================================================
class Slot implements ISingleSlot {
	start: string;
	end: string;
	availability: boolean;

	constructor(start: string, end: string) {
		this.start = start;
		this.end = end;
		this.availability = true;
	}
}

class Day implements ISingleDay {
	date: Date;
	workday: boolean;
	slots: mongoose.Types.ObjectId | null;
	_id: mongoose.Types.ObjectId

	validateHoliday() {
		const dateDay = String(this.date.getDate()).padStart(2, '0');
		const dateMonth = String(this.date.getMonth() + 1).padStart(2, '0');
		const dateYear = String(this.date.getFullYear());
		const monthAndDay = dateMonth + '-' + dateDay;
		const currentDate = new Date(dateYear + '-' + monthAndDay);
		if (currentDate.getDay() === 0 || currentDate.getDay() === 6 || holidays.includes(monthAndDay)) {
			return false;
		} else {
			return true;
		}
	}
	constructor(date: Date, slots: mongoose.Types.ObjectId, dayId: mongoose.Types.ObjectId) {
		this.date = new Date(+date);
		this.workday = this.validateHoliday();
		this._id = dayId;
		if (this.validateHoliday()) {
			this.slots = slots;
		} else {
			this.slots = null;
		}
	}
}

//====================================================================
// Helper functions
//====================================================================
function convertTime(time: number) {
	const minutes = time % 60;
	const hours = Math.floor(time / 60);

	// Return time in format hh:mm
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

//====================================================================
// Creating slots with parameters configured in @/config/settings
//====================================================================
function createSlotArray() {
	const slotCount = (workdaySettings.days.end - workdaySettings.days.start) / workdaySettings.slot.duration || 14;
	const slotLength = workdaySettings.slot.duration || 30;
	const firstSlotStart = workdaySettings.days.start || 480;
	const slotArray: Slot[] = [];
	for (let i = 0; i < slotCount; i++) {
		const start = firstSlotStart + i * slotLength;
		const end = start + slotLength - 1;
		const singleSlot = new Slot(convertTime(start), convertTime(end));
		slotArray.push(singleSlot);
	}
	return slotArray;
}

//====================================================================
// Creating array of days with length configured in @/config/settings
//====================================================================
const createDayArray = (doctorId: mongoose.Types.ObjectId, daysId: mongoose.Types.ObjectId, firstname: string, lastname: string) => {
	const slotsArray = createSlotArray();

	const dayCount = workdaySettings.days.dayCount || 30;
	const daysArray: Day[] = [];
	const todayNonUTC = new Date();
	const date = new Date(Date.UTC(todayNonUTC.getUTCFullYear(), todayNonUTC.getUTCMonth(), todayNonUTC.getUTCDate(), 0, 0, 0, 0));

	while (daysArray.length <= dayCount) {
		const dayId = new mongoose.Types.ObjectId();
		const slotsId = new mongoose.Types.ObjectId();
		const newDay = new Day(date, slotsId, dayId);
		daysArray.push(newDay);
		date.setDate(date.getDate() + 1);
		new Slots({
			_id: slotsId,
			doctorId: doctorId,
			dayId: dayId,
			slots: slotsArray
		}).save()
	}
	new Days({
		_id: daysId,
		doctorId: doctorId,
		doctorName: `${firstname} ${lastname}`,
		days: daysArray
	}).save()
}

//====================================================================
// Shifting array of days in database
//====================================================================
const updateDoctorDayArray = () => {
	const todayNonUTC = new Date();
	const today = new Date(Date.UTC(todayNonUTC.getUTCFullYear(), todayNonUTC.getUTCMonth(), todayNonUTC.getUTCDate(), 0, 0, 0, 0));
	let aux = 0;
	const slotsArray = createSlotArray();

	Days.find().exec((err, daysArray) => {
		daysArray.forEach(async (daysObj) => {
			try {
				while (daysObj.days[0].date < today) {
					const deletedDay = daysObj.days.shift();
					const deletedSlotsId = deletedDay?.slots;
					if (deletedSlotsId !== null) {
						await deleteSlotsForDay(deletedSlotsId?.toString()!)
							.catch((error) => {
								throw error;
							});
					} else {
						continue;
					}
					const dayCount = workdaySettings.days.dayCount || 30;
					const date = new Date();
					const dayId = new mongoose.Types.ObjectId();
					const slotsId = new mongoose.Types.ObjectId();

					await new Slots({
						_id: slotsId,
						doctorId: daysObj.doctorId,
						dayId: dayId,
						slots: slotsArray
					}).save()
					const newDay = new Day(new Date(date.setDate(date.getDate() + dayCount)), slotsId, dayId);
					daysObj.days.push(newDay);
					aux++;
					await daysObj.save();
				}
				if (aux === 1) {
					Log.debug(`Updated day array of doctor ${daysObj.doctorName} 1 time.`);
					aux = 0;
				} else if (aux) {
					Log.debug(`Updated day array of doctor ${daysObj.doctorName} ${aux} times.`);
					aux = 0;
				}
			} catch (error) {
				Log.error(error);
			}
		});
	});
}

//====================================================================
// Get dayId by given doctorId and date
//====================================================================
const dayIdByDate = async (doctorId: mongoose.Types.ObjectId, dayDate: Date) => {
	const dayNonUTC = new Date(dayDate);
	const givenDay = new Date(Date.UTC(dayNonUTC.getUTCFullYear(), dayNonUTC.getUTCMonth(), dayNonUTC.getUTCDate(), 0, 0, 0, 0));
	return await Days.findOne({ doctorId: doctorId }).then((daysObj: any) => {
		if (daysObj) {
			const found = daysObj.days.find((day: { date: { getTime: () => number } }) => day.date.getTime() === givenDay.getTime());
			if (found) {
				return found._id.toString();
			} else {
				throw new Error('Object with specified date cannot be found in days array of days object.');
			}
		} else {
			throw new Error('Doctor with specified ID does not exist.');
		}
	});
};

//====================================================================
// Delete slots linked to given day by slotsId
//====================================================================
const deleteSlotsForDay = async (slotsId: string) => {
	if (!slotsId) {
		throw Error(`Slots object with ID ${slotsId} does not exist.`);
	}
	else {
		await Slots.findByIdAndDelete(slotsId);
	}
}
