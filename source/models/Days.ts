import mongoose, { Document, Schema } from 'mongoose';

export interface ISingleDay {
    date: Date;
    workday: boolean;
    slots: mongoose.Types.ObjectId | null;
    _id: mongoose.Types.ObjectId
}

export interface IDays {
    doctorId: mongoose.Types.ObjectId;
    doctorName: string;
    days: ISingleDay[];
}

export interface IDaysModel extends IDays, Document { }

const DaysSchema: Schema = new Schema({
    doctorId: { type: Schema.Types.ObjectId, required: true, ref: 'Doctor' },
    doctorName: { type: String, required: true },
    days: [
        {
            date: Date,
            workday: Boolean,
            slots: { type: Schema.Types.ObjectId, ref: 'Slots' },
        }
    ]
});

export default mongoose.model<IDaysModel>('Days', DaysSchema);
