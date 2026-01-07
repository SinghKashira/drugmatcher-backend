import { FileInterceptor } from '@nestjs/platform-express';
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { extname } from 'path';
import { FilematcherService } from './filematcher.service';
import { HybridOcrService } from 'src/hybrid-ocr/hybrid-ocr.service';

@Controller('filematcher')
export class FilematcherController {
  constructor(
    private readonly filematcherService: FilematcherService,
    private hybridOcr: HybridOcrService
  ) {}

    // @Post()
    // async filematcher(@Body('input') input: string) {
    //     return input;
    //   //const response = await this.chatService.sendMessage(message, sessionId, uuid);
    //   //return response; // ✅ don’t wrap it again
    // }

    // @Post('upload')
    // @UseInterceptors(FileInterceptor('image'))
    // async upload(@UploadedFile() file: Express.Multer.File) {
    //    // return this.extractMedicineDetails(file);
    //    console.log(file);

    //     return {
    //     filename: file.originalname,
    //     type: file.mimetype,
    //     size: file.size
    //     };
    // }



  //   @Post()
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, callback) => {
  //         const uniqueName =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         const ext = extname(file.originalname);
  //         callback(null, `${uniqueName}${ext}`);
  //       },
  //     }),
  //     limits: {
  //       fileSize: 5 * 1024 * 1024, // 5 MB
  //     },
  //     fileFilter: (req, file, callback) => {
  //       if (!file.mimetype.match(/(jpg|jpeg|png|pdf)$/)) {
  //         return callback(
  //           new BadRequestException('Only JPG, PNG, PDF allowed'),
  //           false,
  //         );
  //       }
  //       callback(null, true);
  //     },
  //   }),
  // )
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   if (!file) {
  //     throw new BadRequestException('File is required');
  //   }

  //   return {
  //     message: 'File uploaded successfully',
  //     filename: file.filename,
  //     originalName: file.originalname,
  //     size: file.size,
  //     path: file.path,
  //   };
  // }


  // @Post()
  // async chat(@Body('file') message: string) {
  //   return "hiii"
  // }

  // @Post('ocr')
  // @UseInterceptors(FileInterceptor('file'))
  // async extractText(@UploadedFile() file: Express.Multer.File) {
  //   // console.log(
  //   //   'GOOGLE_APPLICATION_CREDENTIALS:',
  //   //   process.env.GOOGLE_APPLICATION_CREDENTIALS,
  //   // );

  //   //return file;
  //   return this.filematcherService.processImage(file.buffer);
  // }


  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Only image files allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  @Post('ocr')
  async extract(@UploadedFile() file: Express.Multer.File) {
   // return this.filematcherService.processImage(file.buffer);
   return this.filematcherService.processBlister(file.buffer);

  }

}
