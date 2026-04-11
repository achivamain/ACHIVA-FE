const NICKNAME_TAG_SEPARATOR = "#";

// 실명 기반 커뮤니티로 만들기 위해 해시태그 사용
// 백엔드에서는 해시태그 붙은 닉네임 자체를 그대로 닉네임처럼 취급해서 사용
export function normalizeNickName(nickName: string) {
  try {
    return decodeURIComponent(nickName);
  } catch {
    return nickName;
  }
}

export function getDisplayNickName(nickName: string) {
  const normalizedNickName = normalizeNickName(nickName).trim();
  const tagSeparatorIndex = normalizedNickName.indexOf(
    NICKNAME_TAG_SEPARATOR,
  );

  if (tagSeparatorIndex === -1) {
    return normalizedNickName;
  }

  return normalizedNickName.slice(0, tagSeparatorIndex);
}

export function encodeNickNameValue(nickName: string) {
  return encodeURIComponent(normalizeNickName(nickName));
}

export function isSameNickName(a: string, b: string) {
  return normalizeNickName(a) === normalizeNickName(b);
}

export function buildUserPath(nickName: string, suffix = "") {
  return `/${encodeNickNameValue(nickName)}${suffix}`;
}

export function buildMobileUserPath(nickName: string, suffix = "") {
  return `/m/${encodeNickNameValue(nickName)}${suffix}`;
}
