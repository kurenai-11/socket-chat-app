export type UserMessage = {
  type: "userMessage";
  id: string;
  content: string;
  author: string;
  date: string;
};

export type ServerMessage = {
  type: "serverMessage";
  id: string;
  content: string;
  date: string;
};

export type Message = UserMessage | ServerMessage;

// socket types
export interface ServerToClientEvents {
  "user connected": (message: Message) => void;
  "user disconnected": (message: Message) => void;
  "message sent": (message: Message) => void;
}

export interface ClientToServerEvents {
  "send message": (message: Partial<UserMessage>) => void;
}

// utility types
// object nullable
export type ONullable<T extends object> = { [K in keyof T]: T[K] | null };
// primitive nullable
export type Nullable<T> = T | null;

// application types
export interface User {
  banned: boolean;
  bannedUntil: Nullable<string>;
  id: number;
  username: string;
  createdAt: string;
  displayName: Nullable<string>;
  role: "User" | "Moderator" | "Admin";
}
