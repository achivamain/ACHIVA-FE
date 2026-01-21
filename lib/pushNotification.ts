// Expo 통신용 postMessage

export type PushNotificationType = "cheer" | "friend_request" | "friend_accept";

export const PUSH_NOTIFICATION_TYPES = {
  cheer: {
    type: "cheer" as const,
  },
  friend_request: {
    type: "friend_request" as const,
  },
  friend_accept: {
    type: "friend_accept" as const,
  },
} as const;

// 응원 알림 데이터
export interface CheerNotificationData {
  postId: string;
  cheeringType: string;
  senderId: string;
  senderNickName?: string;
  receiverId: string;
  receiverNickName?: string;
}

// 친구 요청 알림 데이터
export interface FriendRequestNotificationData {
  receiverId: string;
  receiverNickName?: string;
  senderId: string;
  senderNickName?: string;
}

// 친구 수락 알림 데이터
export interface FriendAcceptNotificationData {
  friendshipId: number;
  requesterId: string;
  requesterNickName?: string;
  accepterId: string;
  accepterNickName?: string;
}

export interface PushNotificationPayload {
  type: "PUSH_NOTIFICATION";
  data: {
    notificationType: PushNotificationType;
    linkToken: string; // JWT token
    payload: CheerNotificationData | FriendRequestNotificationData | FriendAcceptNotificationData;
    timestamp: string;
  };
}

/**
 * 앱으로 데이터 발송하는 함수
 * 
 * @param notificationType - cheer, friend_request, friend_accept
 * @param linkToken - JWT 토큰
 * @param payload - 상세 데이터
 * @returns 전송 성공 여부
 */
export function sendPushNotificationToApp(
  notificationType: PushNotificationType,
  linkToken: string,
  payload: CheerNotificationData | FriendRequestNotificationData | FriendAcceptNotificationData
): boolean {
  // ReactNativeWebView가 없으면 웹 환경이므로 전송하지 않음
  if (typeof window === "undefined" || !window.ReactNativeWebView) {
    return false;
  }

  const message: PushNotificationPayload = {
    type: "PUSH_NOTIFICATION",
    data: {
      notificationType,
      linkToken,
      payload,
      timestamp: new Date().toISOString(),
    },
  };

  try {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
    return true;
  } catch {
    return false;
  }
}

export function sendCheerNotification(
  linkToken: string,
  data: CheerNotificationData
): boolean {
  return sendPushNotificationToApp("cheer", linkToken, data);
}

export function sendFriendRequestNotification(
  linkToken: string,
  data: FriendRequestNotificationData
): boolean {
  return sendPushNotificationToApp("friend_request", linkToken, data);
}

export function sendFriendAcceptNotification(
  linkToken: string,
  data: FriendAcceptNotificationData
): boolean {
  return sendPushNotificationToApp("friend_accept", linkToken, data);
}



