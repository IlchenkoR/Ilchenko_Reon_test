import mongoose, { Document, Schema, Model } from 'mongoose';

export type IAccount = Document & {
    ref: string;
    code: string;
    stat: number;
};

const accountSchema: Schema = new Schema({
    ref: { type: String, required: true },
    code: { type: String, required: true },
    stat: { type: Number, required: true }
});

const AccountModel: Model<IAccount> = mongoose.model<IAccount>('Account', accountSchema);

export default AccountModel;