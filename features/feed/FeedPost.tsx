"use client";

// 게시글 하나를 처리하는 부분
import { useState } from "react";
import type { PostRes } from "@/types/Post";
import type { User } from "@/types/User";
import dateFormatter from "@/lib/dateFormatter";
import Post from "../post/Post";
import ProfileImg from "@/components/ProfileImg";
import Link from "next/link";
import CheerBtns from "../post/CheerBtns";
import ModalWithoutCloseBtn from "@/components/ModalWithoutCloseBtn";
import { useQuery } from "@tanstack/react-query";
import { HorizontalThreeDotsIcon } from "@/components/Icons";

export default function FeedPost({ post }: { post: PostRes }) {
  const { data: currentUser, isError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`/api/members/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("network error");
      }
      return (await res.json()).data as User;
    },
    // 중복 호출 방지
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isError) {
    return null;
  }
  return (
    <>
      <div className="w-full">
        <div className="flex gap-2.5 items-center py-2.5 px-5 sm:px-0">
          <Link
            href={`/${post.memberNickName}`}
            className="flex gap-2.5 items-center"
          >
            <ProfileImg size={32} url={post.memberProfileUrl} />
            <p className="font-medium">{post.memberNickName}</p>
          </Link>
          {post.createdAt && (
            <p className="font-light text-black/50">
              {dateFormatter(post.createdAt)}
            </p>
          )}
          <button
            className="ml-auto px-0.5"
            onClick={() => setIsModalOpen(true)}
          >
            <HorizontalThreeDotsIcon />
          </button>
        </div>
        <div>
          <Post post={post} />
        </div>
        <CheerBtns postId={post.id} cheerings={post.cheerings ?? []} />
      </div>
      {isModalOpen && (
        <ModalWithoutCloseBtn onClose={() => setIsModalOpen(false)}>
          {currentUser?.id !== post.memberId && (
            <li
              className="py-2 cursor-pointer text-[#DF171B] font-semibold"
              onClick={async () => {
                const res = await fetch(`/api/report`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    postId: post.id,
                    reporterName: currentUser?.nickName,
                  }),
                });
                if (res.ok) {
                  alert("신고가 접수되었습니다.");
                } else {
                  alert("신고에 실패했습니다. 다시 시도해 주세요.");
                }
                setIsModalOpen(false);
              }}
            >
              신고
            </li>
          )}
          {currentUser?.id === post.memberId && (
            <li
              className="py-2 cursor-pointer text-[#DF171B] font-semibold"
              onClick={async () => {
                const res = await fetch(`/api/posts?postId=${post.id}`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                });
                if (res.ok) {
                  window.location.href = `/${currentUser?.nickName}`;
                } else {
                  alert("게시물 삭제에 실패했습니다. 다시 시도해 주세요.");
                }
              }}
            >
              삭제
            </li>
          )}
          <li
            className="py-2 cursor-pointer w-xs"
            onClick={() => setIsModalOpen(false)}
          >
            취소
          </li>
        </ModalWithoutCloseBtn>
      )}
    </>
  );
}
