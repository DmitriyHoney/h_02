import { CommandRepo, QueryRepo } from './base.repositry';
import { CommentModel, Comment } from '../types/types';

class CommentsCommandRepo extends CommandRepo<CommentModel, Comment> {}
export const commentsCommandRepo =  new CommentsCommandRepo('comments');

class CommentsQueryRepo extends QueryRepo<CommentModel> {}
export const commentsQueryRepo = new CommentsQueryRepo('comments');