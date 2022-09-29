import 'module-alias/register';
import Doctor from '@/models/Doctor';
import Days from '@/models/Days';
import Slots from '@/models/Slots';
import Reservation from '@/models/Reservation';
import Log from '@/library/Logging';


export { cascadeDeleteDoctor };


const cascadeDeleteDoctor = async (doctorId: string) => {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new Error('Doctor with given ID does not exist.');
    }
    else {
        await Days.findOneAndRemove({ doctorId: doctorId });
        await Slots.deleteMany({ doctorId: doctorId });
        await Reservation.deleteMany({ doctorId: doctorId });
        Log.info(`Successfully deleted days, slots and reservations linked to ${doctorId}.`)
    }
}
