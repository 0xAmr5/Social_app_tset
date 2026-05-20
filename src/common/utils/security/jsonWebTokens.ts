import jsonwebtoken from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { SECRET_ADMIN_ACCESS_TOKEN, SECRET_ADMIN_REFRESH_TOKEN, SECRET_USER_ACCESS_TOKEN, SECRET_USER_REFRESH_TOKEN } from "../../../config/config.service.js";
import { Types } from "mongoose";
import roleEnum from "../../enum/role.enum.js";

export function generateAccessToken( data : { role : string , userId : Types.ObjectId }) : string {
  return jsonwebtoken.sign(
    {
      data,
      id: uuidv4(),
    },
    ( data.role == roleEnum.user) ? SECRET_USER_ACCESS_TOKEN : SECRET_ADMIN_ACCESS_TOKEN,
    {
      expiresIn: "10min",
    },
  );
}

export function generateRefreshToken({ data }: { data: any }) : string {
  return jsonwebtoken.sign(
    {
      data,
      id: uuidv4(),
    },
    ( data.role == roleEnum.user) ? SECRET_USER_REFRESH_TOKEN : SECRET_ADMIN_REFRESH_TOKEN,
    {
      expiresIn: "10h",
    },
  );
}
export const accessTokenVerify = ({token , secret }:{token : string , secret : string})=>{
  return jsonwebtoken.verify(token,secret)
}
