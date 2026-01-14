import { FormEvent, useEffect, useState } from "react";
import { getYear, getMonth, getDate, differenceInYears } from "date-fns";
import { NextStepButton } from "./Buttons";
import { useSignupInfoStore, useSignupStepStore } from "@/store/SignupStore";

export default function BirthdayForm() {
  const setUser = useSignupInfoStore.use.setUser();
  const handleNextStep = useSignupStepStore.use.handleNextStep();
  const today = new Date();
  const [year, setYear] = useState(getYear(today));
  const [month, setMonth] = useState(getMonth(today) + 1);
  const [day, setDay] = useState(getDate(today));
  const [error, setError] = useState("");
  const [isEdited, setIsEdited] = useState(false);

  const years = Array.from(
    { length: getYear(today) - 1899 },
    (_, i) => 1900 + i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const [days, setDays] = useState<number[]>([]);

  useEffect(() => {
    const lastDay = new Date(year, month, 0).getDate();
    setDays(Array.from({ length: lastDay }, (_, i) => i + 1));
    if (day > lastDay) {
      setDay(lastDay);
    }

    const birthday = new Date(year, month - 1, day);
    const age = differenceInYears(new Date(), birthday);
    if (age < 13 && isEdited) {
      setError("만 14세 이상만 회원 가입이 가능합니다.");
    } else {
      setError("");
    }
  }, [day, year, month, isEdited]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUser({ birth: new Date(year, month - 1, day) });
    handleNextStep();
  }

  return (
    <div className="flex flex-col gap-15 mb-15">
      <div className="w-full text-left">
        <p className="font-semibold text-lg">생일을 입력해주세요</p>
        <p className="font-light text-sm text-theme-gray break-keep">
          연령 확인은 계정 보호 및 서비스 이용을 위한 절차이며, 입력하신
          생년월일은 다른 사용자에게 공개되지 않습니다.
        </p>
      </div>
      <form
        className="flex flex-col items-center gap-15"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-center gap-2">
          <select
            className="px-2 py-1 border border-theme rounded-sm"
            value={year}
            onChange={(e) => {
              setIsEdited(true);
              setYear(Number(e.target.value));
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select
            className="px-2 py-1 border border-theme rounded-sm"
            value={month}
            onChange={(e) => {
              setIsEdited(true);
              setMonth(Number(e.target.value));
            }}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
          <select
            className="px-2 py-1 border border-theme rounded-sm"
            value={day}
            onChange={(e) => {
              setIsEdited(true);
              setDay(Number(e.target.value));
            }}
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm font-light text-theme-red">{error}</p>}
        <NextStepButton disabled={!!error || !isEdited}>다음</NextStepButton>
      </form>
    </div>
  );
}
