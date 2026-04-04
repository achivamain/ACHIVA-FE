export function looksLikeStaticAssetPathSegment(segment: string) {
  const decodedSegment = decodeURIComponent(segment).trim();

  // 파일 관련 요청도 [nickName] 경로로 해석하는 것을 방지하기 위한 임시 함수
  return /\.[A-Za-z0-9]{1,10}$/.test(decodedSegment);
}
