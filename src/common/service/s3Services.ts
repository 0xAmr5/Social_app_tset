import { Bucket$, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, GetObjectCommandInput, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY, APPLICATION_NAME, AWS_REGION, AWS_S3_BUCKET_NAME, AWS_SECRET_ACCESS_KEY } from "../../config/config.service.js";
import multerStorageEnum from "../enum/multerStorageType.js";
import fs from 'node:fs'
import { ErrorInteralServerError } from "../utils/global-error-handler.js";
import { Upload } from "@aws-sdk/lib-storage";
import {v4 as uuidv4 } from 'uuid'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
class s3services {
    private _client ;
    constructor(){
        this._client = new S3Client({
            region : AWS_REGION,
            credentials : {
                accessKeyId: AWS_ACCESS_KEY,
                secretAccessKey : AWS_SECRET_ACCESS_KEY
            }
        })
    }

    async uploadFile ({
        file,
        storageType = multerStorageEnum.memory,
        ACL,
        path
    }:{
        file : Express.Multer.File,
        storageType? :  string ,
        ACL? : ObjectCannedACL,
        path? : string | undefined
        }){
        const command = new PutObjectCommand({
            Bucket : AWS_S3_BUCKET_NAME,
            Key : `${APPLICATION_NAME}/${path}/${Date.now()}/${Math.random()}/${file.originalname}`,
            ACL ,
            Body : (storageType == multerStorageEnum.memory ) ?  file.buffer : fs.createReadStream(file.path),
        })
    
        await this._client.send(command);
        if (!command.input.Key){
            ErrorInteralServerError('failed to upload file')
        }
        return command.input.Key
    }

    async uploadLargeFile ({
        file,
        storageType = multerStorageEnum.memory,
        ACL,
        path,
    }:{
        file : Express.Multer.File,
        storageType? :  string ,
        ACL? : ObjectCannedACL,
        path? : string | undefined,
        }){
    
        const command = new Upload({
            client : this._client,
            params : {
            Bucket : AWS_S3_BUCKET_NAME,
            Key : `${APPLICATION_NAME}/${path}/${Date.now()}/${Math.random()}/${file.originalname}`,
            ACL ,
            Body : (storageType == multerStorageEnum.memory ) ?  file.buffer : fs.createReadStream(file.path),
            ContentType : file.mimetype
        }})
    
        command.on('httpUploadProgress',function(progress){
            console.log('file progress is ',progress)
        })
    
        return command.done
    }

    async uploadFiles({
        files,
        storageType = multerStorageEnum.memory,
        ACL,
        path,
        fileSize = 5*1024*1024
    }:{
        files : Express.Multer.File[],
        storageType? :  string ,
        ACL? : ObjectCannedACL,
        path? : string | undefined,
        fileSize? : number
        }): Promise<string[] | any>{
            if (fileSize < 5*1024*1024){
                const urls =  await Promise.all(
                    files.map((file : Express.Multer.File)=>{this.uploadFile({file,storageType,path})}
                ))
                return urls ;
            }
            else {
                    const urls =  await Promise.all(
                    files.map((file : Express.Multer.File)=>{this.uploadLargeFile({file,storageType,path})}
                ))
                return urls ;
            }
    }

    async createSignedUrl({
        fileName,
        path,
        ContentType,
        expiresIn = 3*60
    }:{
        fileName : string,
        path : string
        ContentType : string,
        expiresIn? : number
    }){
        const Key = `social_media_app/${path}/${Math.random()*10000}/${fileName}`;
        const command = new PutObjectCommand({
            Bucket : AWS_S3_BUCKET_NAME,
            ContentType,
            Key
        })

        const url = await getSignedUrl(this._client,command,{expiresIn});

        return { Key , url }
    }

    async getFiles(folderName : string ){
        const command = new ListObjectsV2Command({ Bucket : AWS_S3_BUCKET_NAME , Prefix : `social_media_app/${folderName}`})
        return await this._client.send(command);
    }
    async getFile(Key : string ){
        const command = new GetObjectCommand({ Bucket : AWS_S3_BUCKET_NAME , Key})
        return await this._client.send(command);
    }

    async getSignedUrl({
    Key,
    expiresIn = 3*60,
    download 
    
}:{
    Key : string
    expiresIn? : number,
    download? : boolean
}){
    const command = new PutObjectCommand({
        Bucket : AWS_S3_BUCKET_NAME,
        Key,
        ContentDisposition : (download) ? `attachment ; filename-="${Key.split('/').pop()}"` : undefined
    })

    return await getSignedUrl(this._client,command,{expiresIn});

}

    async deleteFile({Key} : {Key: string}){
        const command = new DeleteObjectCommand({
            Bucket : AWS_S3_BUCKET_NAME,
            Key
        })

        return await this._client.send(command)
    }
    
    async deleteFiles({Keys } : { Keys : string[] }){
        const keyMapped = Keys.map((k)=>{
            return { Key : k }
        })
        const command = new DeleteObjectsCommand({
            Bucket : AWS_S3_BUCKET_NAME,
            Delete :{
                Objects: keyMapped,
                Quiet : false
            }
        })

        return await this._client.send(command)
    }

    async deleteFolder({folderKey}: {folderKey : string}){
        const files  = await this.getFiles(folderKey);

        const folder  = files.Contents?.map((file)=>{
            return file.Key
        }) as string[]

        this.deleteFiles({Keys : folder})
    }
}

export default new s3services()
