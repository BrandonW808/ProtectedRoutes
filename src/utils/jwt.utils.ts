import jwt, { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

interface RefreshTokenPayload {
    id: string;
}

/**
 * Generate JWT access token
 */
export const generateToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const options: SignOptions = {
        expiresIn: process.env.JWT_EXPIRES_IN as any,
        issuer: 'user-management-api',
        audience: 'user-management-client'
    };

    return jwt.sign(
        payload,
        secret,
        options
    );
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(
        payload,
        secret,
        {
            expiresIn: '30d',
            issuer: 'user-management-api',
            audience: 'user-management-client'
        }
    );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string, isRefreshToken: boolean = false): TokenPayload | RefreshTokenPayload => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        const decoded = jwt.verify(token, secret, {
            issuer: 'user-management-api',
            audience: 'user-management-client'
        }) as TokenPayload | RefreshTokenPayload;

        return decoded;
    } catch (error) {
        throw error;
    }
};

/**
 * Decode JWT token without verification (use carefully)
 */
export const decodeToken = (token: string): any => {
    return jwt.decode(token);
};
