import postModel, { IPost } from "../models/post.model";

class PostRepoCompat {
  create(data: Partial<IPost>) {
    return postModel.create(data);
  }

  paginate({ page = 1, limit = 10, search = {} }: { page?: number; limit?: number; search?: any }) {
    return postModel
      .find(search)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }
}

export default new PostRepoCompat();
