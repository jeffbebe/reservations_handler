import {
  FileSystemStoredFile,
  HasMimeType,
  IsFile,
  MaxFileSize,
} from 'nestjs-form-data';

export class UploadDto {
  @IsFile()
  @MaxFileSize(1e6 * 50) // max 50mb file size
  @HasMimeType([
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ])
  file: FileSystemStoredFile;
}
