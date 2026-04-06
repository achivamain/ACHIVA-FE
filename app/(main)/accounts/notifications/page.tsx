import Notifications from "@/features/user/Notifications";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <div className="flex-1 w-full flex justify-center">
      <div className="flex flex-col w-md">
        <h2 className="font-semibold text-2xl text-theme my-5 w-full text-left">
          나눔함
        </h2>
        <Notifications />
        <Footer />
      </div>
    </div>
  );
}
