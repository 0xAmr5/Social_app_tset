import { EventEmitter } from "node:events";
import mailEnum from "../../enum/mail.enum";

export const eventEmitter = new EventEmitter();

eventEmitter.on(mailEnum.sendMail, (fn: Function) => {
  return fn();
});