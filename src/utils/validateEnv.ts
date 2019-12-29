import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
    cleanEnv(process.env, {
        // MONGO_PASSWORD: str(),
        // MONGO_PATH: str(),
        // MONGO_USER: str(),
        POSTGRES_PASSWORD: str(),
        POSTGRES_USER: str(),
        POSTGRES_HOST: str(),
        POSTGRES_PORT: str(),
        POSTGRES_DB: str(),
        PORT: port(),
    });
}

export default validateEnv;
