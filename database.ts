import mongoose from 'mongoose';
import logger from './logger';
import AccountModel from './models';

class Database {
    private static instance: Database;
    private connection: mongoose.Connection;

    private constructor() {
        mongoose.connect('mongodb://localhost:27017/Widget');

        this.connection = mongoose.connection;

        this.connection.on('connected', () => {
            logger.debug('Connected to MongoDB');
        });

        this.connection.on('error', (err: Error) => {
            logger.error(`MongoDB connection error: ${err}`);
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async updateAccount(clientId: string, ref: string, code: string, stat: number): Promise<void> {
        try {
            await AccountModel.updateOne(
                { _id: clientId },
                { $set: { ref, code, stat } },
                { upsert: true }
            );
        } catch (err) {
            logger.error(`Error updating account: ${err}`);
        }
    }

    public async clearAccount(clientId: string): Promise<void> {
        try {
            await AccountModel.updateOne(
                { _id: clientId },
                { $set: { code: "", stat: 0 } }
            );
        } catch (err) {
            logger.error(`Error clearing account: ${err}`);
        }
    }
}

export default Database;