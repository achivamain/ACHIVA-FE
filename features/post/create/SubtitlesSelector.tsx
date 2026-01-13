import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  useCreatePostStepStore,
  useDraftPostStore,
} from "@/store/CreatePostStore";
import { CategoryButton } from "@/components/Buttons";
import { basicTopics } from "@/types/Categories";
import {
  SubtitleCheckIcon,
  SubtitleDragIcon,
  SubtitlePlusIcon,
} from "@/components/Icons";
import { NextStepButton } from "./Buttons";

type SubtitleItem = {
  id: string;
  subtitle: string; // 타입 추론 때문에 에러나서 string으로 명시해줌
  selected: boolean;
};

export default function SubtitlesSelector() {
  const draft = useDraftPostStore.use.post();
  const setPost = useDraftPostStore.use.setPost();
  const handleNextStep = useCreatePostStepStore.use.handleNextStep();
  const category = draft.category!;
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>(
    basicTopics[category].map((subtitle) => ({
      id: crypto.randomUUID(),
      subtitle,
      selected: false,
    }))
  );

  const [isEditing, setIsEditing] = useState(false);
  const [enteredSubtitle, setEnteredSubtitle] = useState("");

  function handleDragEnd(result: any) {
    if (!result.destination) return;
    const newSubtitles = Array.from(subtitles);
    const [moved] = newSubtitles.splice(result.source.index, 1);
    newSubtitles.splice(result.destination.index, 0, moved);

    setSubtitles(newSubtitles);
  }

  return (
    <div className="h-full flex-1 flex flex-col justify-between gap-5">
      <div>
        <div className="flex flex-wrap gap-5 mb-10">
          <div className="flex items-center gap-3">
            <CategoryButton isSelected={true}>{category}</CategoryButton>
            <p className="font-light text-sm text-[#808080]">
              {draft.categoryCount}번째 이야기
            </p>
          </div>
        </div>
        <div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="subtitles">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-col gap-4"
                >
                  {subtitles.map((subtitle, index) => {
                    const selected = subtitle.selected;
                    return (
                      <Draggable
                        key={subtitle.id}
                        draggableId={subtitle.id}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center gap-5"
                          >
                            <SubtitleDragIcon selected={selected} />
                            <p
                              className={`text-lg font-medium mr-auto ${
                                selected ? "text-black" : "text-[#b3b3b3]"
                              }`}
                            >
                              {subtitle.subtitle}
                            </p>
                            <button
                              className="h-full"
                              onClick={() => {
                                setSubtitles((prev) =>
                                  prev.map((item) =>
                                    item.id === subtitle.id
                                      ? { ...item, selected: !item.selected }
                                      : item
                                  )
                                );
                              }}
                            >
                              <SubtitleCheckIcon selected={selected} />
                            </button>
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          <div
            className="flex gap-5 mt-5 items-center cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            <SubtitlePlusIcon />
            {isEditing ? (
              <input
                maxLength={14}
                className="h-7 flex items-center px-2"
                autoFocus
                value={enteredSubtitle}
                onChange={(e) => setEnteredSubtitle(e.target.value)}
                onBlur={() => {
                  setEnteredSubtitle("");
                  if (enteredSubtitle.trim()) {
                    setSubtitles((prev) => [
                      ...prev,
                      {
                        id: crypto.randomUUID(),
                        subtitle: enteredSubtitle,
                        selected: true,
                      },
                    ]);
                  }
                  setIsEditing(false);
                }}
              />
            ) : (
              <p className="text-lg font-medium">직접 입력</p>
            )}
          </div>
        </div>
      </div>
      <NextStepButton
        disabled={subtitles.every((item) => !item.selected)}
        onClick={() => {
          const pages = subtitles
            .filter((item) => item.selected)
            .map((item) => ({
              id: crypto.randomUUID(),
              subtitle: item.subtitle,
              content: "",
            }));
          setPost({ pages });
          handleNextStep();
        }}
      >
        다음
      </NextStepButton>
    </div>
  );
}
