import { HydratedDocument, QueryFilter } from "mongoose";
import UserModel, { IUser } from "../models/user.model";

class UserRepoCompat {
  async userEmailExists({
    email,
    confirmed,
  }: {
    email: string;
    confirmed?: boolean;
  }): Promise<HydratedDocument<IUser> | null> {
    const filter: QueryFilter<IUser> = { email };
    if (typeof confirmed === "boolean") {
      filter.isConfirmed = confirmed;
    }
    return UserModel.findOne(filter).select("+password").exec();
  }

  async findById(input: string | { id: string }) {
    const id = typeof input === "string" ? input : input.id;
    return UserModel.findById(id).exec();
  }

  async create(data: Partial<IUser>) {
    return UserModel.create(data);
  }

  async findOne({ filter, projection, options }: { filter: QueryFilter<IUser>; projection?: any; options?: any }) {
    return UserModel.findOne(filter, projection).sort(options).exec();
  }

  async findAll({ filter }: { filter: QueryFilter<IUser> }) {
    return UserModel.find(filter).exec();
  }

  async findOneAndUpdate({
    filter,
    update,
  }: {
    filter: QueryFilter<IUser>;
    update: Partial<IUser>;
  }) {
    return UserModel.findOneAndUpdate(filter, update, { new: true }).exec();
  }
}

export default new UserRepoCompat();
