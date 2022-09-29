import Reservation from '@/models/Reservation';

export async function generateReservationCode() {
	let resp: any = [];
	let randCode;
	do {
		randCode = 'REZ' + Math.floor(Math.random() * 99999);
		resp = await Reservation.find({ reservationCode: randCode }).exec();
	}
	while (resp.length != 0)
	return randCode;
}
