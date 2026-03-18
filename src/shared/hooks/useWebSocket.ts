import { useWebSocket as useWs } from '../../app/providers/WebSocketProvider';

export const useWebSocket = () => {
  return useWs();
};
