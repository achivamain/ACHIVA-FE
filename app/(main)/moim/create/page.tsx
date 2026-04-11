"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/Icons";
import { toast } from "sonner";

export default function MoimCreatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMember, setMaxMember] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("모임 이름을 입력해주세요.");
    if (isPrivate && !password) return alert("비밀번호를 입력해주세요.");

    try {
      const res = await fetch("/api/moim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          maxMember,
          isPrivate,
          password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Detail error data:", errorData);
        alert(`모임 생성 실패: ${errorData.details || errorData.error || "알 수 없는 오류"}`);
        return;
      }

      toast.success("모임이 생성되었습니다!");
      router.push("/moim");
    } catch (err) {
      console.error(err);
      alert("모임 생성 중 오류가 발생했습니다.");
    }
  };

  // 최대 3개까지만 선택 가능하게 제한할 수도 있음, 일단은 제한 없이 여러개 가능
  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* 헤더 */}
      <header className="px-5 py-4 border-b border-gray-100 flex items-center sticky top-0 bg-white z-10">
        <button onClick={() => router.back()} className="mr-3">
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-theme">새 모임 만들기</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 pb-24">
        <form onSubmit={handleCreate} className="space-y-8">
          {/* 모임 이름 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">모임 이름 <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="예) 강남구 불꽃 청년 구역"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-theme transition-colors shadow-sm"
            />
          </div>

          {/* 한 줄 소개 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">한 줄 소개</label>
            <input
              type="text"
              placeholder="모임을 짧게 소개해주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={50}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-theme transition-colors shadow-sm"
            />
          </div>

          {/* 인원 설정 */}
          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">최대 인원</label>
             <select 
                value={maxMember} 
                onChange={(e) => setMaxMember(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-theme transition-colors shadow-sm"
             >
                <option value={5}>5명</option>
                <option value={10}>10명</option>
                <option value={30}>30명</option>
                <option value={50}>50명</option>
                <option value={100}>100명</option>
             </select>
          </div>

          {/* 공개 여부 */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-1">
               <label className="text-sm font-semibold text-gray-700">비공개 모임으로 설정</label>
               <input 
                  type="checkbox" 
                  checked={isPrivate} 
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 accent-theme cursor-pointer"
               />
            </div>
            <p className="text-xs text-gray-500">비공개 설정 시 비밀번호를 아는 사람만 가입할 수 있습니다.</p>
            
            {isPrivate && (
              <div className="mt-4">
                <input
                  type="password"
                  placeholder="비밀번호 4자리 (숫자)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={4}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-theme transition-colors shadow-sm"
                />
              </div>
            )}
          </div>
        </form>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 lg:left-auto lg:w-[calc(100vw-250px)] lg:max-w-[700px] xl:max-w-[900px]">
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-colors shadow-md ${
            !name.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-theme text-white hover:bg-[#322020]"
          }`}
        >
          모임 개설하기
        </button>
      </div>
    </div>
  );
}
