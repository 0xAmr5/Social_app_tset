import { NextFunction, Request, Response } from 'express';
import multer from 'multer'
import multerStorageEnum from '../enum/multerStorageType';
import { tmpdir } from 'node:os'

export function fileUpload({
    fileType,
    storageType = multerStorageEnum.memory
}: { fileType : readonly string[] , storageType? : string}){

        const storage : any = (storageType == multerStorageEnum.memory) ? multer.memoryStorage() : multer.diskStorage({
            destination : tmpdir(),
            filename : (req:Request,file : Express.Multer.File ,cb : Function)=>{
                const prefix = Math.random();
                cb(null,prefix)
            }
        }) ;

        const result = multer(
            { storage , fileFilter : function fileFilter(req : Request,file : Express.Multer.File ,cb : Function){
                if (fileType.includes(file.mimetype)) cb(null,true)
                cb(null,false);
        }})
        return result
    
}
