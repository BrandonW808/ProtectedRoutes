import { IUser } from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
            userId?: string;
        }
    }
}

export { };
