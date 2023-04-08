import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException
} from '@nestjs/common';

import { SearchQueryCursor } from '../interfaces/search-query';

import { Base64 } from '@/common/util/base64';

@Injectable()
export class CursorDecodePipe implements PipeTransform {
  transform(
    cursor: string,
    _metadata: ArgumentMetadata
  ): SearchQueryCursor | null {
    if (!cursor) {
      return null;
    }
    const decoded = Base64.decodeString(cursor);

    const separatorIdx = decoded.indexOf('|');

    if (separatorIdx <= 0 || separatorIdx === decoded.length - 1) {
      throw new BadRequestException('Failed to parse parts of the cursor');
    }

    const unique = decoded.substring(0, separatorIdx);
    const sorted = decoded.substring(separatorIdx + 1);

    return { unique, sorted };
  }
}
