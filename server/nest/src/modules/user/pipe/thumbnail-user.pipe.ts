import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { FormFieldException } from 'src/common/exceptions';

@Injectable()
export class ThumbnailUserPipe implements PipeTransform {
  transform(files: any, _metadata: ArgumentMetadata) {
    const thumbnail = files?.thumbnail?.[0];

    if (!thumbnail) {
      throw new BadRequestException('thumbnail is required');
    }

    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(thumbnail.mimetype)
    ) {
      throw new FormFieldException('image', 'Image must be png, jpeg or webp');
    }
    if (thumbnail.size > 2 * 1024 * 1024)
      throw new FormFieldException('image', 'Image max 2MB');

    return {
      thumbnail,
    };
  }
}
