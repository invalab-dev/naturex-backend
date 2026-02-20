import { Body, Controller, Param, Post, Query, Req } from '@nestjs/common';
import { TransmissionsService } from './transmissions.service.js';
import { FileMetadata } from './transmissions.type.js';

@Controller('transmissions/')
export class TransmissionsController {
  constructor(private readonly uploadsService: TransmissionsService) {}

  @Post('prepare')
  prepare(@Req() req, @Body() dto: FileMetadata & { projectId: string }) {
    const userId = req.user.id;

    return this.uploadsService.prepare(
      userId,
      dto.projectId,
      'naturex-bucket',
      crypto.randomUUID(),
      dto,
    );
  }

  @Post(':uploadId/complete')
  complete(
    @Req() req,
    @Param('uploadId') uploadId: string,
    @Body() parts: Array<{ partNumber: number; etag: string }>,
  ) {
    const userId = req.user.id;
    return this.uploadsService.complete(uploadId, userId, parts);
  }

  @Post(':uploadId/abort')
  abort(@Req() req, @Param('uploadId') uploadId: string) {
    const userId = req.user.id;
    return this.uploadsService.abort(uploadId, userId);
  }

  @Post(':uploadId/:partNumber')
  signPart(
    @Req() req,
    @Param('uploadId') uploadId: string,
    @Param('partNumber') partNumber: number,
  ) {
    const userId = req.user.id;
    return this.uploadsService.signPart(uploadId, userId, partNumber);
  }
}
