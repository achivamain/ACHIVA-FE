import { z } from "zod";

export const UserSchema = z.object({
  email: z.email({ message: "유효하지 않은 이메일입니다." }),
  password: z
    .string()
    .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
    .max(20, { message: "비밀번호는 최대 20자 이하여야 합니다." })
    .refine(
      (val) =>
        /[a-zA-Z]/.test(val) && // 영문 포함
        /\d/.test(val) && // 숫자 포함
        /[!@#$%^&*(),.?":{}|<>]/.test(val), // 특수문자 포함
      {
        message: "비밀번호는 영어, 숫자, 특수문자를 모두 포함해야 합니다.",
      }
    ),
  nickName: z
    .string()
    .min(2, { message: "닉네임은 최소 2자 이상이어야 합니다." })
    .max(15, { message: "닉네임은 최대 15자 이하여야 합니다." })
    .regex(/^[A-Za-z0-9가-힣_]+$/, {
      message: "닉네임에는 한글, 영문자·숫자·밑줄(_)만 사용할 수 있습니다.",
    }),
});
