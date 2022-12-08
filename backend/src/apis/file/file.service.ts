import { Injectable } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { Storage } from '@google-cloud/storage';
import { getToday } from 'src/common/libraries/utils';
import { v4 as uuidv4 } from 'uuid';

interface IFile {
  files: FileUpload[];
}

const { GCP_STORAGE_FILENAME, GCP_STORAGE_PROJECTID, GCP_STORAGE_BUCKET } = process.env;

@Injectable()
export class FileService {
  async upload({ files }: IFile) {
    // 스토리지에 이미지 업로드
    const storage = new Storage({
      keyFilename: GCP_STORAGE_FILENAME,
      projectId: GCP_STORAGE_PROJECTID,
    }).bucket(GCP_STORAGE_BUCKET);

    // 일단 먼저 다 받기
    const waitedFiles = await Promise.all(files);

    // 구글 스토리지에 동시에 모두 올리기
    const results = await Promise.all(
      waitedFiles.map(
        file =>
          new Promise((resolve, reject) => {
            const fname = `${getToday()}/${uuidv4()}/origin/${file.filename}`;
            file
              .createReadStream()
              .pipe(storage.file(fname).createWriteStream())
              .on('finish', () => resolve(`${GCP_STORAGE_BUCKET}/${fname}`))
              .on('error', error => reject(error));
          }),
      ),
    );

    return results;
  }
}
