import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatApiService } from '../services/chat-api.service';
import { Ok, paginatedResponse } from 'src/common/response/response.helper';
import { SkipAuth } from 'src/common/decorators';
import { GetVodChatHistoryDto } from '../dto/chat-api.dto';

@Controller('/chat')
export class ChatController {
  constructor(private readonly chatApiService: ChatApiService) {}

  @Get('/live/history/:streamID')
  @SkipAuth()

  async getLiveChatHistory(@Param('streamID') streamID: string) {
    const data = await this.chatApiService.getLiveHistory(streamID);

    return Ok(data, 'Get live chat history successfully');
  }

  @Get('/vod/history')
  @SkipAuth()

  async getVodChatHistory(@Query() payload: GetVodChatHistoryDto) {
    const { messages, meta } = await this.chatApiService.getVodHistory(
      payload.s,
      payload.from,
      payload.to,
      payload.limit,
    );

    return paginatedResponse(
      messages,
      meta,
      'Get vod chat history successfully',
    );
  }
}
