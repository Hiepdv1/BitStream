import { PipeTransform, Injectable } from '@nestjs/common';
import { FormFieldException } from 'src/common/exceptions';

@Injectable()
export class GiftUpdateFileValidatorPipe implements PipeTransform {
  transform(files: any) {
    if (!files || Object.keys(files).length === 0) {
      return files;
    }

    const image = files?.image?.[0];

    if (image) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(image.mimetype)) {
        throw new FormFieldException(
          'image',
          'Image must be png, jpeg or webp',
        );
      }
    }

    const effect = files?.effect?.[0];

    if (effect) {
      if (effect.mimetype !== 'application/json') {
        throw new FormFieldException('effect', 'Effect must be a JSON file');
      }
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
