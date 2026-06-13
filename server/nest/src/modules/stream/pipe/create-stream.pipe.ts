import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { FormFieldException } from 'src/common/exceptions';

@Injectable()
export class ThumbnailStreamPipe implements PipeTransform {
  transform(files: any, metadata: ArgumentMetadata) {
    const thumbnail = files?.thumbnail?.[0];

    if (thumbnail) {
      if (
        !['image/png', 'image/jpeg', 'image/webp'].includes(thumbnail.mimetype)
      ) {
        throw new FormFieldException(
          'image',
          'Image must be png, jpeg or webp',
        );
      }
      if (thumbnail.size > 3 * 1024 * 1024)
        throw new FormFieldException('image', 'Image max 3MB');
    }

    return {
      thumbnail: thumbnail || undefined,
    };
  }
}
