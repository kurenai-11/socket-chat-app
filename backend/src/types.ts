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
