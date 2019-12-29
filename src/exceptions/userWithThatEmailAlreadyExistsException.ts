import HttpException from './httpException';

class UserWithThatEmailAlreadyExistsException extends HttpException {
    constructor(email: string) {
        super(400, `User with email ${email} already exists`);
    }
}

export default UserWithThatEmailAlreadyExistsException;
