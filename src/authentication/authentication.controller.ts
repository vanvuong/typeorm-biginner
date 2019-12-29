import * as bcrypt from 'bcrypt';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import UserWithThatEmailAlreadyExistsException from '../exceptions/userWithThatEmailAlreadyExistsException';
import WrongCredentialsException from '../exceptions/wrongCredentialsException';
import Controller from '../interfaces/controller.interface';
import TokenData from '../interfaces/tokenData.interface';
import DataStoredInToken from '../interfaces/dataStoredInToken.interface';
import User from '../users/user.interface';
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from '../users/user.dto';
import userModel from '../users/user.model';
import LogInDto from './logIn.dto';
import AuthenticationService from './authentication.service';

export default class AuthenticationController implements Controller {
    public path = '/auth';
    public router = express.Router();
    public authenticationService = new AuthenticationService();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/register`,
            validationMiddleware(CreateUserDto),
            this.registration
        );
        this.router.post(
            `${this.path}/login`,
            validationMiddleware(LogInDto),
            this.loggingIn
        );
    }

    private registration = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const userData: CreateUserDto = request.body;
        try {
            const {
                cookie,
                user,
            } = await this.authenticationService.register(userData);
            response.setHeader('Set-Cookie', [cookie]);
            response.send(user);
        } catch (error) {
            next(error);
        }
    };

    private loggingIn = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const logInData: LogInDto = request.body;
        const user = await this.user.findOne({ email: logInData.email });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(
                logInData.password,
                user.password
            );
            if (isPasswordMatching) {
                user.password = undefined;
                const tokenData = this.createToken(user);
                response.setHeader('Set-Cookie', [
                    this.createCookie(tokenData),
                ]);
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    };

    private createToken(user: User): TokenData {
        const expiresIn = 60 * 60;
        const secret = process.env.JWT_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
        };

        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }
}
