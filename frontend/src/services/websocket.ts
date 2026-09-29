import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message } from '../types';

let stompClient: Client | null = null;

export const connectWebSocket = (onMessageReceived: (message: Message) => void, conversationId?: number) => {
  const wsUrl = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws';

  try {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // console.log('STOMP: ' + str);
      },
      onConnect: () => {
        // console.log('Connected to WebSocket');
        if (conversationId) {
          stompClient?.subscribe(`/topic/conversations/${conversationId}`, (msg) => {
            if (msg.body) {
              const parsed: Message = JSON.parse(msg.body);
              onMessageReceived(parsed);
            }
          });
        }
      },
      onStompError: (frame) => {
        console.warn('Broker reported error: ' + frame.headers['message']);
      },
    });

    stompClient.activate();
  } catch (err) {
    console.warn('WebSocket connection fallback:', err);
  }

  return () => {
    if (stompClient) {
      stompClient.deactivate();
    }
  };
};
