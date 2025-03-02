
export interface Message {
  text: string;
  isUser: boolean;
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
}
