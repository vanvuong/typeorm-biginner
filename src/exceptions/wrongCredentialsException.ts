import HttpException from './httpException';

class WrongCredentialsException extends HttpException {
    constructor() {
        super(401, 'Wrong credentials provided');
    }
}

export default WrongCredentialsException;
