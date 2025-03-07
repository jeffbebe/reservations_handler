import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8080)
export class DocumentChangeGateway {
  @WebSocketServer() private server: Server;

  public notifyAboutDocumentChange(documentId: string, newDoc: unknown) {
    this.server.emit(documentId, newDoc);
  }

  @SubscribeMessage('subscribeToDocument')
  handleSubscription(
    @MessageBody() data: { documentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.emit(data.documentId);
  }
}
