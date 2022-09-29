import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor {
	firstname: string;
	lastname: string;
	specialization: string;
}

export interface IDoctorModel extends IDoctor, Document {
	days: mongoose.Types.ObjectId
}

const DoctorSchema: Schema = new Schema({
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	specialization: { type: String, required: true },
	days: { type: Schema.Types.ObjectId, required: true, ref: 'Days' }
});

export default mongoose.model<IDoctorModel>('Doctor', DoctorSchema);
