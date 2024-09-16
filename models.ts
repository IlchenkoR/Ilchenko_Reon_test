import mongoose, { Document, Schema, Model } from 'mongoose';

export type IAccount = Document & {
    _id: string;
    ref: string;
    access_token: string;
    refresh_token: string;
    stat: number;
};

const accountSchema: Schema = new Schema({
    _id: { type: String, required: true },
    ref: { type: String, required: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    stat: { type: Number, required: true }
});

const AccountModel: Model<IAccount> = mongoose.model<IAccount>('Account', accountSchema);

export default AccountModel;    