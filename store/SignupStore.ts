// 회원가입 단계와 입력한 정보
import { create } from "zustand";
import createSelectors from "./createSelectors";
import type { SignupUser } from "@/types/User";

type SignupStepState = {
  currentStep: number;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  resetStep: () => void;
};

const useSignupStepStoreBase = create<SignupStepState>()((set) => ({
  currentStep: 1,
  handlePrevStep: () =>
    set((state) => ({ currentStep: state.currentStep - 1 })),
  handleNextStep: () =>
    set((state) => ({ currentStep: state.currentStep + 1 })),
  resetStep: () => set({ currentStep: 0 }),
}));

export const useSignupStepStore = createSelectors(useSignupStepStoreBase);

type EnteredInfoState = {
  user: SignupUser;
  setUser: (updates: Partial<SignupUser>) => void;
  resetUser: () => void;
};

const initialUser: SignupUser = {
  nickName: "",
  profileImg: undefined,
  birth: undefined,
  gender: undefined,
  categories: [],
};

const useSignupInfoStoreBase = create<EnteredInfoState>((set) => ({
  user: initialUser,
  setUser: (updates) =>
    set((state) => ({
      user: { ...state.user, ...updates },
    })),
  resetUser: () =>
    set({
      user: initialUser,
    }),
}));

export const useSignupInfoStore = createSelectors(useSignupInfoStoreBase);
