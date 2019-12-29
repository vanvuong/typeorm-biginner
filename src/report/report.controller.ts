import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import userModel from '../users/user.model';

export default class ReportController implements Controller {
    public path = '/report';
    public router = express.Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.get(`${this.path}`, this.generateReport);
    }

    private generateReport = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const usersByCountries = await this.user.aggregate([
            {
                $match: {
                    'address.country': {
                        $exists: true,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        country: '$address.country',
                    },
                    users: {
                        $push: {
                            name: '$name',
                            _id: '$_id',
                        },
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user._id',
                    foreignField: '_id',
                    as: 'users',
                },
            },
            {
                $addFields: {
                    amountOfArticles: {
                        $size: '$articles',
                    },
                },
            },
            {
                $sort: {
                    amountOfArticles: 1,
                },
            },
        ]);
        response.send({ usersByCountries });
    };
}