import mongoose, { Document, Schema } from 'mongoose';

export interface ISingleSlot {
    start: string;
    end: string;
    availability: boolean;
}

export interface ISlots {
    doctorId: mongoose.Types.ObjectId;
    dayId: mongoose.Types.ObjectId;
    slots: ISingleSlot[]
}

export interface ISlotsModel extends ISlots, Document { }

const SlotsSchema: Schema = new Schema({
    doctorId: { type: Schema.Types.ObjectId, required: true, ref: 'Doctor' },
    dayId: { type: Schema.Types.ObjectId, required: true, ref: 'Days' },
    slots: [
        {
            start: String,
            end: String,
            availability: Boolean
        }
    ]
});

export default mongoose.model<ISlotsModel>('Slots', SlotsSchema);
