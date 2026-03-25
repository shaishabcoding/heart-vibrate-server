import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Extend Socket to carry decoded user after handshake auth
interface AuthSocket extends Socket {
  user: { id: string };
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) throw new UnauthorizedException('No token provided');

      const payload = await this.jwtService.verifyAsync(token);
      client.user = { id: payload.sub };

      this.logger.log(`Client connected — socketId: ${client.id}, userId: ${client.user.id}`);
    } catch {
      this.logger.warn(`Unauthorized connection attempt — socketId: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    this.logger.log(`Client disconnected — socketId: ${client.id}, userId: ${client.user?.id}`);
  }

  // ── Room management ───────────────────────────────────────────────────────

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { chatId: string },
  ) {
    client.join(payload.chatId);
    this.logger.log(`User joined room — userId: ${client.user.id}, chatId: ${payload.chatId}`);
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { chatId: string },
  ) {
    client.leave(payload.chatId);
    this.logger.log(`User left room — userId: ${client.user.id}, chatId: ${payload.chatId}`);
  }

  // ── Typing indicators (no DB write) ───────────────────────────────────────

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: AuthSocket, @MessageBody() payload: { chatId: string }) {
    // broadcast to everyone in room except the sender
    client.to(payload.chatId).emit('typing', {
      chatId: payload.chatId,
      userId: client.user.id,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { chatId: string },
  ) {
    client.to(payload.chatId).emit('stopTyping', {
      chatId: payload.chatId,
      userId: client.user.id,
    });
  }

  // ── Public emitter — called by MessageService after REST mutations ─────────

  emitToChat(chatId: string, event: string, payload: unknown) {
    this.server.to(chatId).emit(event, payload);
    this.logger.log(`Emitted '${event}' — chatId: ${chatId}`);
  }
}
