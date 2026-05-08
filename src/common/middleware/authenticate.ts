import type { NextFunction, Request, Response } from "express";
import { SECRET_ADMIN_ACCESS_TOKEN, SECRET_USER_ACCESS_TOKEN, TOKEN_ADMIN_PREFIX, TOKEN_USER_PREFIX } from "../../config/config.services";
import { ErrorConflict, Errorforbidden, ErrorUnAuthorizedRequest } from "../utils/global-error-handler";
import { accessTokenVerify } from "../utils/security/jsonWebTokens";
import jsonwebtoken from "jsonwebtoken";
import userRepo from "../../DB/repo/user.repo";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../DB/models/user.model";
import cacheKeyEnum from "../enum/cacheKey.enum";
import redisServices from "../services/redis.services";



  export async function authenticate(req : Request ,res:Response,next : NextFunction){
    let {authorization} : any = req.headers 

    if (!authorization) Errorforbidden('invalid token')
    let [prefix, token] : [string,string] = authorization.split(" ");
    if ( !prefix ){
      Errorforbidden('invalid token')
    }

    const secret : string = (function (){
      if ( prefix == TOKEN_USER_PREFIX){
        return SECRET_USER_ACCESS_TOKEN
      }
      else if (prefix == TOKEN_ADMIN_PREFIX){
        return SECRET_ADMIN_ACCESS_TOKEN
      }
        return Errorforbidden('invalid token')
    })()
    
    const verify: jsonwebtoken.JwtPayload = accessTokenVerify(
      {token , secret },
    ) as jsonwebtoken.JwtPayload;
    const user : HydratedDocument<IUser> | null = await userRepo.findById({
      id : verify.data.userId ,
    })
    if (!user) ErrorConflict('user does not exists')
    if (user!.creadnatials && user!.creadnatials.getTime() < (verify.iat as number)*1000) 
    ErrorUnAuthorizedRequest('token revoked please login again')

    const CachedRevokeToken = await redisServices.getKey({
      key : redisServices.cacheKey({filter : token , subject : cacheKeyEnum.revokeToken})
    })

    if (CachedRevokeToken) ErrorUnAuthorizedRequest('token revoked please login again')
      
    req.user = user as HydratedDocument<IUser>;
    req.token = token as string ;
    req.tokenDecoded = verify
    next();
  }
