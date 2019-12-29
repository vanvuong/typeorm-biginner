import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import AuthenticationTokenMissingException from '../exceptions/authenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/wrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken.interface';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import userModel from '../users/user.model';

export default async function(
    request: RequestWithUser,
    response: Response,
    next: NextFunction
) {
    const cookies = request.cookies;
    if (cookies && cookies.Authorization) {
        try {
            const secret = process.env.JWT_SECRET;
            const verificationResponse = jwt.verify(
                cookies.Authorization,
                secret
            ) as DataStoredInToken;
            const id = verificationResponse._id;
            const user = await userModel.findById(id);
            if (user) {
                request.user = user;
                next();
            } else {
                next(new WrongAuthenticationTokenException());
            }
        } catch (error) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        next(new AuthenticationTokenMissingException());
    }
}
