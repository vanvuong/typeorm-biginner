import 'dotenv/config';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import App from './app';
import config from './ormconfig';
import PostsController from './posts/posts.controller';
import AuthenticationController from './authentication/authentication.controller';
import UserController from './users/user.controller';
import ReportController from './report/report.controller';
import validateEnv from './utils/validateEnv';

validateEnv();

(async () => {
    try {
        await createConnection(config);
      } catch (error) {
        console.log('Error while connecting to the database', error);
        return error;
      }
      const app = new App(
        [
          new PostsController(),
          new AuthenticationController(),
          new UserController(),
        ],
      );
      app.listen();
})();
