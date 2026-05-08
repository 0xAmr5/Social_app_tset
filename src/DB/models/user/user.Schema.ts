import zod from 'zod';

export const updatePasswordSchema = {
body : zod.object({
    email : zod.email(),
    oldPassword : zod.string(),
    newPassword : zod.string(),
    newCPassword : zod.string(),
}).superRefine((value , ctx)=>{
    if (value.newPassword != value.newCPassword ){
    ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: "passwords do not match",
        path: ["cpassword"],
    });

    }
})
}
