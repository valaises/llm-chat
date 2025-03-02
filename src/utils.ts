import {Chat} from "./types.ts";


export const generateRandomHash = (): string => {
  return Math.random().toString(36).substr(2, 9); // Generates a random string
};

export const getCurrentChat = (chats: Chat[], chatID: string): Chat | undefined => {
  return chats.find((chat) => chat.id === chatID);
};
