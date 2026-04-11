import Notifications from "@/features/user/Notifications";

export default function Page() {
  return (
    <div className="flex-1 w-full flex justify-center">
        <div className="max-w-[480px] mx-auto min-h-screen pb-[calc(80px+env(safe-area-inset-bottom))]">
          <h2 className="text-theme font-semibold text-2xl my-7">나눔함</h2>
          <div className="bg-white rounded-t-[30px] p-5 shadow-sm min-h-[500px]">
            <Notifications />
          </div>
      </div>
    </div>
  );
}
