import { create } from "zustand";
import type { Mission, Mindset, Vision, ModalData } from "@/types/Goal";

interface GoalState {
  vision: Vision;
  missions: Mission[];
  mindsets: Mindset[];
  isModalOpen: boolean;
  isArchiveModalOpen: boolean;
}

interface GoalActions {
  // 초기 데이터 설정
  setInitialData: (data: {
    vision: Vision;
    missions: Mission[];
    mindsets: Mindset[];
  }) => void;
  // 하트클릭
  handleHeartClick: (
    id: number,
    type: "vision" | "mission" | "mindset"
  ) => void;
  // Modal 수정사항 저장
  handleSaveChanges: (updatedData: ModalData) => void;
  // Modal 열림, 닫힘
  toggleModal: (isOpen: boolean) => void;
  // 보관함 모달 열림, 닫힘
  toggleArchiveModal: (isOpen: boolean) => void;
  // 보관함으로 이동
  handleArchive: (id: number, type: "mission" | "mindset") => void;
  // 보관함에서 복구
  handleRestore: (id: number, type: "mission" | "mindset") => void;
  // 영구 삭제
  handlePermanentDelete: (id: number, type: "mission" | "mindset") => void;
}

// 초기값 하드코딩 (나중에 백엔드에서 가져올 데이터)
const initialState: GoalState = {
  vision: {
    id: 1,
    text: "살아가다보면 뭐가 있겠지",
    count: 25,
    isArchived: false,
  },
  missions: [
    { id: 1, text: "수학을 잘 해보자", count: 10, isArchived: false },
    { id: 2, text: "벌크업 해보자!", count: 5, isArchived: false },
    { id: 3, text: "영어 공부", count: 22, isArchived: false },
    { id: 4, text: "보관된 미션", count: 15, isArchived: true },
  ],
  mindsets: [
    { id: 101, text: "일찍 좀 일어나라", count: 150, isArchived: false },
    { id: 102, text: "수업 때 졸지 않기", count: 99, isArchived: false },
    { id: 103, text: "귀찮다고 미루지 않기", count: 180, isArchived: false },
    { id: 104, text: "보관된 마음가짐", count: 88, isArchived: true },
  ],
  isModalOpen: false,
  isArchiveModalOpen: false,
};

const useGoalStore = create<GoalState & GoalActions>((set, get) => ({
  ...initialState,

  setInitialData: (data) => set(data),

  handleHeartClick: (id, type) => {
    set((state) => {
      if (type === "vision") {
        return {
          vision:
            state.vision.id === id
              ? { ...state.vision, count: state.vision.count + 1 }
              : state.vision,
        };
      } else if (type === "mission") {
        return {
          missions: state.missions.map((mission) =>
            mission.id === id
              ? { ...mission, count: mission.count + 1 }
              : mission
          ),
        };
      } else {
        return {
          mindsets: state.mindsets.map((mindset) =>
            mindset.id === id
              ? { ...mindset, count: mindset.count + 1 }
              : mindset
          ),
        };
      }
    });
  },

  handleSaveChanges: (updatedData) => {
    const {
      vision: originalVision,
      missions: originalMissions,
      mindsets: originalMindsets,
    } = get();

    const archivedMissions = originalMissions.filter((m) => m.isArchived);
    const archivedMindsets = originalMindsets.filter((m) => m.isArchived);

    set({
      vision: {
        ...originalVision,
        text: updatedData.vision.text,
      },
      missions: [
        ...updatedData.missions.map((m) => {
          const originalMission = originalMissions.find(
            (original) => original.id === m.id
          );
          return {
            ...m,
            count: originalMission?.count ?? 0,
            isArchived: false,
          };
        }),
        ...archivedMissions,
      ],
      mindsets: [
        ...updatedData.mindsets.map((m) => {
          const originalMindset = originalMindsets.find(
            (original) => original.id === m.id
          );
          return {
            ...m,
            count: originalMindset?.count ?? 0,
            isArchived: false,
          };
        }),
        ...archivedMindsets,
      ],
    });
  },

  handleArchive: (id, type) => {
    set((state) => {
      if (type === "mission") {
        return {
          missions: state.missions.map((mission) =>
            mission.id === id ? { ...mission, isArchived: true } : mission
          ),
        };
      } else {
        return {
          mindsets: state.mindsets.map((mindset) =>
            mindset.id === id ? { ...mindset, isArchived: true } : mindset
          ),
        };
      }
    });
  },

  toggleModal: (isOpen) => set({ isModalOpen: isOpen }),

  toggleArchiveModal: (isOpen) => set({ isArchiveModalOpen: isOpen }),

  handleRestore: (id, type) => {
    set((state) => {
      if (type === "mission") {
        return {
          missions: state.missions.map((mission) =>
            mission.id === id ? { ...mission, isArchived: false } : mission
          ),
        };
      } else {
        return {
          mindsets: state.mindsets.map((mindset) =>
            mindset.id === id ? { ...mindset, isArchived: false } : mindset
          ),
        };
      }
    });
  },

  handlePermanentDelete: (id, type) => {
    set((state) => {
      if (type === "mission") {
        return {
          missions: state.missions.filter((mission) => mission.id !== id),
        };
      } else {
        return {
          mindsets: state.mindsets.filter((mindset) => mindset.id !== id),
        };
      }
    });
  },
}));

export default useGoalStore;
