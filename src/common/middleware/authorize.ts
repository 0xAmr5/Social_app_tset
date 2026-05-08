import type { NextFunction, Request, Response } from "express";
import { appError } from "../utils/global-error-handler";


export  function authorize(arrOfRoles : string[]){
    return (req:Request,res:Response,next:NextFunction)=>{
        const {user} = req;
        if (!arrOfRoles.includes(user?.role as string)){
            throw new appError('you are not authorized',403)
        }
        next();
    }
}