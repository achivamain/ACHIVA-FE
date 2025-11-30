import { categories } from "@/types/Categories";
import {
  useCreatePostStepStore,
  useDraftPostStore,
} from "@/store/CreatePostStore";
import { CategoryButton } from "@/components/Buttons";
import { NextStepButton } from "./Buttons";

export default function CategorySelector() {
  const draft = useDraftPostStore.use.post();
  const setPost = useDraftPostStore.use.setPost();
  const handleNextStep = useCreatePostStepStore.use.handleNextStep();

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="flex gap-3 flex-wrap">
          {categories.map((category) => (
            <CategoryButton
              key={category}
              isSelected={draft.category === category}
              onClick={() => {
                setPost({ category: category });
              }}
            >
              {category}
            </CategoryButton>
          ))}
        </div>
      </div>
      <NextStepButton onClick={handleNextStep} disabled={!draft.category}>
        다음
      </NextStepButton>
    </div>
  );
}
