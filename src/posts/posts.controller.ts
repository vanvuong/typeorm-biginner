import * as express from 'express';
import { getRepository } from 'typeorm';
import Post from './post.entity';
// import Post from './posts.interface';
import postModel from './posts.model';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { NextFunction } from 'connect';
// import HttpException from '../exceptions/httpException';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';
import CreatePostDto from './post.dto';
import userModel from '../users/user.model';

class PostsController {
    public path = '/posts';
    public router = express.Router();
    private post = postModel;
    private user = userModel;
    private postRepository = getRepository(Post);

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.get(this.path, this.getAllPosts);
        this.router.get(`${this.path}/:id`, this.getPostById);
        this.router
            // .all(`${this.path}/*`, authMiddleware)
            .all(`${this.path}/*`)
            .patch(
                `${this.path}/:id`,
                validationMiddleware(CreatePostDto, true),
                this.modifyPost
            )
            .delete(`${this.path}/:id`, this.deletePost)
            .post(
                this.path,
                // authMiddleware,
                validationMiddleware(CreatePostDto),
                this.createPost
            );
    }

    getAllPosts = async (
        request: express.Request,
        response: express.Response
    ) => {
        // const posts = await this.post.find().populate('author', '-password');
        // response.send(posts);
        const posts = await this.postRepository.find();
        response.send(posts);
    };

    getPostById = async (
        request: express.Request,
        response: express.Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        // try {
        //     const post: Post = await this.post.findById(id);
        //     if (post) {
        //         response.send(post);
        //     } else {
        //         next(new PostNotFoundException(id));
        //     }
        // } catch (error) {
        //     next(new HttpException(error.status, error.message));
        // }
        const post = await this.postRepository.findOne(id);
        if (post) {
            response.send(post);
        } else {
            next(new PostNotFoundException(id));
        }
    };

    createPost = async (
        request: RequestWithUser,
        response: express.Response
    ) => {
        // const postData: CreatePostDto = request.body;
        // const createdPost = new this.post({
        //     ...postData,
        //     authors: [request.user._id],
        // });
        // const user = await this.user.findById(request.user._id);
        // user.posts = [...user.posts, createdPost._id];
        // await user.save();
        // const savedPost = await createdPost.save();
        // await savedPost.populate('authors', '-password').execPopulate();
        // response.send(savedPost);
        const postData: CreatePostDto = request.body;
        const newPost = this.postRepository.create(postData);
        await this.postRepository.save(newPost);
        response.send(newPost);
    };

    modifyPost = async (
        request: express.Request,
        response: express.Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        const postData: Post = request.body;
        // this.post.findByIdAndUpdate(id, postData, { new: true }).then(post => {
        //     if (post) {
        //         response.send(post);
        //     } else {
        //         next(new PostNotFoundException(id));
        //     }
        // });
        await this.postRepository.update(id, postData);
        const updatedPost = await this.postRepository.findOne(id);
        if (updatedPost) {
            response.send(updatedPost);
        } else {
            next(new PostNotFoundException(id));
        }
    };

    deletePost = async (
        request: express.Request,
        response: express.Response,
        next: NextFunction
    ) => {
        const id = request.params.id;
        // try {
        //     this.post.findByIdAndDelete(id).then(successResponse => {
        //         if (successResponse) {
        //             response.send(200);
        //         } else {
        //             next(new PostNotFoundException(id));
        //         }
        //     });
        // } catch (error) {
        //     next(new HttpException(error.status, error.message));
        // }
        const deleteResponse = await this.postRepository.delete(id);
        if (deleteResponse.raw[1]) {
            response.sendStatus(200);
        } else {
            next(new PostNotFoundException(id));
        }
    };
}

export default PostsController;
