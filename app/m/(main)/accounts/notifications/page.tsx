import Notifications from "@/features/user/Notifications";

export default function Page() {
  return (
    <div className="flex-1 w-full flex justify-center">
      <div className="w-full flex flex-col mb-22">
        <div className="px-5">
          <h2 className="text-theme font-semibold text-2xl my-7">응원함</h2>
          <Notifications />
        </div>
      </div>
    </div>
  );
}
