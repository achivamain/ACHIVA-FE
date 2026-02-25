import Logout from "@/components/Logout";
import { HomeCategorySelector } from "@/features/home/HomeCategorySelector";
import { categories, Category } from "@/types/Categories";
import { getAuthSession } from "@/lib/getAuthSession";
import { getMe } from "@/lib/getUser";

export default async function Page() {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const [user] = await Promise.all([getMe(token)]);

  //필요한 정보만 보내도록 했습니다
  type UserData = Pick<
    typeof user,
    | "nickName"
    | "profileImageUrl"
    | "birth"
    | "gender"
    | "region"
    | "description"
  > & {
    categories: Category[];
  };

  const userData: UserData = {
    ...user,
    categories: categories.filter((i) => user.categories?.includes(i)),
  };

  return <HomeCategorySelector user={userData} />;
}
