// import { NextFunction, Request, Response } from "express";
// import { PREFIX, ACCESS_SECRET_KEY } from "../../config/config.service";
// import tokenService from "../service/token.service";
// import UserRepository from "../../DB/repository/user.repository";   
// import { AppError } from "../utils/global-error-handler"; 
// import redisService from "../service/redis.service";
// import { HydratedDocument } from "mongoose";
// import { IUser } from "../../DB/models/user.model";
// import { JwtPayload } from "jsonwebtoken";

// const userRepo = new UserRepository();

// // تعريف Interface محلي أو الاعتماد على الـ Module Declaration اللي فوق
// interface IRequest extends Request {
//     user?: HydratedDocument<IUser>;
//     decoded?: JwtPayload;
// }

// export const authentication = async (req: IRequest, res: Response, next: NextFunction) => {
//     const { authorization } = req.headers;

//     if (!authorization) {
//         throw new Error("token not found");
//     }

//     const [prefix, token] = authorization.split(" ");
//     if (prefix !== PREFIX) {
//         throw new Error("inValid token prefix");
//     }

//     if (!token) {
//         throw new AppError("token not exist", 401);
//     }

//     const decoded = tokenService.VerifyToken({ token, secret_key: ACCESS_SECRET_KEY }) as JwtPayload;

//     if (!decoded?.id) {
//         throw new Error("inValid token payload");
//     }

//     const user = await userRepo.findOne({ filter: { _id: decoded.id } });
//     if (!user) {
//         throw new Error("user not exist", { cause: 404 });
//     }

//     // جزء التأكد من الـ Blacklist في Redis (للـ Logout)
//     const revokeToken = await redisService.get_key(user._id as any); 
//     // ملاحظة: اتأكد من اسم الميثود في راديس سيرفيس عندك (get_key أو getValue)
    
//     if (revokeToken) {
//         throw new Error("inValid token revoked");
//     }
// res.locals.user = user;
//     req.user = user;
//     req.decoded = decoded;
//     next();
// };