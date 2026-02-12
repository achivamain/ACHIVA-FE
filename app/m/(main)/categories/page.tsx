import Logout from "@/components/Logout";
import { MobileHomeCategorySelector } from "@/features/home/HomeCategorySelector";
import { categories, Category } from "@/types/Categories";
import { getMe } from "@/lib/getUser";
import { getAuthSession } from "@/lib/getAuthSession";

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

  return (
    <div className="min-h-dvh w-full flex flex-col">
      <MobileHomeCategorySelector user={userData} />
    </div>
  );
}
