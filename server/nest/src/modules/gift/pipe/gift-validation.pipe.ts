import { PipeTransform, Injectable } from '@nestjs/common';
import { FormFieldException } from 'src/common/exceptions';

@Injectable()
export class GiftFileValidatorPipe implements PipeTransform {
  transform(files: any) {
    const image = files?.image?.[0];

    if (!image) throw new FormFieldException('image', 'Image file is required');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(image.mimetype)) {
      throw new FormFieldException('image', 'Image must be png, jpeg or webp');
    }
    if (image.size > 2 * 1024 * 1024)
      throw new FormFieldException('image', 'Image max 2MB');

    const effect = files?.effect?.[0];
    if (effect) {
      if (effect.mimetype !== 'application/json') {
        throw new FormFieldException('effect', 'Effect must be a JSON file');
      }
      if (effect.size > 3 * 1024 * 1024)
        throw new FormFieldException('effect', 'Effect max 3MB');
    }

    const sound = files?.sound?.[0];
    if (sound) {
      if (!['audio/mpeg', 'audio/wav'].includes(sound.mimetype)) {
        throw new FormFieldException('sound', 'Sound must be mp3 or wav');
      }
    }

    return {
      image,
      effect,
      sound,
    };
  }
}
