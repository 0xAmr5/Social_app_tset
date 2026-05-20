import { ErrorInteralServerError } from "../utils/global-error-handler";
import { createClient, RedisArgument, RedisClientType } from "redis";
import { REDIS_CLIENT } from "../../config/config.service";
import cacheKeyEnum from "../enum/cacheKey.enum";

class redisService {
  otp_key({ email, subject }: { email: string; subject: string }) {
    return this.cacheKey({ filter: email, subject });
  }
  async setValue({ key, value, ttl }: { key: string; value: string; ttl: number }) {
    return await this.setKey({ key, value, ttl });
  }
  async getValue(key: string) {
    return await this.getKey({ key });
  }
  async isExist(revokedTokenKey: string) {
    return (await this.keyExists({ key: revokedTokenKey })) > 0;
  }
  async addFCM(userId: unknown, token: string) {
    return await this.addSet({ filter: String(userId), subject: cacheKeyEnum.fcm }, token);
  }
  async getFCMS(userId: unknown) {
    return await this.getSet({ filter: String(userId), subject: cacheKeyEnum.fcm });
  }
  async removeFCMUser(userId: unknown) {
    return await this.deleteKey({ key: this.cacheKey({ filter: String(userId), subject: cacheKeyEnum.fcm }) });
  }
  private readonly _client: RedisClientType;
  constructor() {
    this._client = createClient({
      url: REDIS_CLIENT,
    });
    this.eventHandler();
  }

  async connect() {
    await this._client.connect();
    console.log("connected to redis succeded");
  }

  eventHandler() {
    this._client.on("error", () => {
      ErrorInteralServerError("connection to redis failed");
    });
  }

  private async keyExists({ key }: { key: RedisArgument }): Promise<number> {
    return await this._client.exists(key);
  }

  cacheKey({ filter, subject }: { filter: string; subject: string }): string {
    return `${subject}::${filter}`;
  }

  async setKey({
    key,
    value,
    ttl = 60,
  }: {
    key: RedisArgument;
    value: any | RedisArgument;
    ttl: number;
  }) {
    try {
      value =
        typeof value === "string"
          ? value
          : JSON.stringify(value, null, 2);
      return await this._client.set(key, value, { EX: ttl });
    } catch (err) {
      ErrorInteralServerError(err);
    }
  }

  async getKey({ key }: { key: string }): Promise<void | string> {
    try {
      if ((!this.keyExists({ key }) as unknown as number) > 0) {
        ErrorInteralServerError("key expiered");
      }
      const value = await this._client.get(key);
      try {
        return JSON.parse(value as string);
      } catch (err) {
        return value as string;
      }
    } catch (err) {
      ErrorInteralServerError("failed to get the value from cache");
    }
  }

  async getAllKeys(pattern: RedisArgument): Promise<String[] | any> {
    try {
      const value = await this._client.keys(pattern);
      return value;
    } catch (err) {
      ErrorInteralServerError(err);
    }
  }

  async deleteKey(input: { key: RedisArgument } | RedisArgument) {
    try {
      const key = typeof input === "object" && "key" in input ? input.key : input;
      if ((!this.keyExists({ key }) as unknown as number) > 0) {
        return;
      }
      const value = await this._client.del(await this.getAllKeys(key));
      return value;
    } catch (err) {
      ErrorInteralServerError(err);
    }
  }

  async getKeyTtl(key: RedisArgument) {
    try {
      if ((!this.keyExists({ key }) as unknown as number) > 0) {
        ErrorInteralServerError("key expiered");
      }
      const value = await this._client.ttl(key);
      return value;
    } catch (err) {
      ErrorInteralServerError(err);
    }
  }

  async incrKey(key: RedisArgument) {
    try {
      await this._client.incr(key);
    } catch (err) {
      ErrorInteralServerError(err);
    }
  }

  // redis.RedisArgument, members: RedisVariadicArgument
  async addSet({filter,subject} :{filter : string , subject : string} , members : any ) : Promise<number>{
    return await this._client.sAdd(this.cacheKey({
      filter ,
      subject
    }),members)
  }
  async getSet({filter,subject} :{filter : string , subject : string}){
    return await this._client.sMembers(this.cacheKey({
      filter ,
      subject
    }))
  }
  async deleteSet({filter,subject} :{filter : string , subject : string} , members : any){
    return await this._client.sRem(this.cacheKey({
      filter ,
      subject
    }),members)

  }
  async existsSet({filter,subject} :{filter : string , subject : string}){
    return await this._client.sCard(this.cacheKey({
      filter ,
      subject
    }))

  }
}

export default new redisService();
