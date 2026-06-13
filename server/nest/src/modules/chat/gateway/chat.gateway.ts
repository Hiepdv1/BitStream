import { UseFilters } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import cookie from 'cookie';
import { Server, Socket } from 'socket.io';
import { WsExceptionFilter } from 'src/app/filters/ws-exception.filter';
import { WsUnauthorizedException } from 'src/common/exceptions/ws-exception';
import {
  MAX_PACKET_SIZE,
  MIN_PACKET_SIZE,
  PACKET_CONFIG,
} from 'src/common/constants/protocol.constant';
import { BinaryReader } from 'src/infrastructure/binary/reader/reader';
import { AccessTokenPayload } from 'src/modules/auth/types/auth';
import { JwtTokenService } from 'src/modules/security/jwt/services/jwt.service';
import { JwtTokenType } from 'src/modules/security/jwt/types/jwt.type';
import { ChatDispatcher } from '../dispatchers/chat.dispatcher';
import { ChatInternalService } from '../services/chat-internal.service';

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  public server: Server;

  constructor(
    private readonly jwtService: JwtTokenService,
    private readonly chatInternalService: ChatInternalService,
    private readonly chatDispatcher: ChatDispatcher,
  ) {}

  afterInit(server: Server) {
    this.server = server;
    server.use((socket, next) => {
      const rawCookies = socket.handshake.headers.cookie || '';
      const parsedCookies = cookie.parse(rawCookies);
      const token = parsedCookies['access_token'];

      if (!token) {
        return next(new WsUnauthorizedException('Unauthorized'));
      }

      try {
        const payload = this.jwtService.verify<AccessTokenPayload>(
          JwtTokenType.ACCESS,
          token,
        );
        socket.auth = payload;
        return next();
      } catch (error) {
        return next(new WsUnauthorizedException('Unauthorized'));
      }
    });
  }

  handleConnection(client: Socket, ...args: any[]) {}

  handleDisconnect(client: Socket) {
    const auth = client.auth;

    if (!auth) return;

    const currentRoom = client.currentRoom;

    if (!currentRoom) return;

    this.chatInternalService.removeViewer(currentRoom, auth.sub);
  }

  @SubscribeMessage('b')
  async handleBinaryPacket(client: Socket, data: any) {
    if (
      !Buffer.isBuffer(data) ||
      data.length < MIN_PACKET_SIZE ||
      data.length > MAX_PACKET_SIZE
    ) {
      client.disconnect(true);
      return;
    }

    let reader: BinaryReader;
    let version: number;
    let opcode: number;

    try {
      reader = new BinaryReader(data);
      version = reader.readUint8();
      opcode = reader.readUint8();
    } catch {
      client.disconnect(true);
      return;
    }

    if (version != PACKET_CONFIG.VERSION) {
      client.disconnect(true);
      return;
    }

    return await this.chatDispatcher.dispatch(
      this.server,
      client,
      opcode,
      reader,
    );
  }
}
