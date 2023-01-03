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
