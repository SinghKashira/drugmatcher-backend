import { Injectable } from '@nestjs/common';
import * as vision from '@google-cloud/vision';
import OpenAI from 'openai';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';


@Injectable()
export class HybridOcrService {

    async processBlister(buffer: Buffer) {
        const processed = await this.preprocess(buffer);
      
        const tesseractText = await this.extractText(processed);
      
        const gptResult = await this.gptVisionExtract(
          buffer,
          tesseractText
        );
      
        return {
          success: true,
          source: 'HYBRID',
          extracted_data: gptResult,
        };
      }
      
  


      async gptVisionExtract(
        imageBuffer: Buffer,
        ocrText: string
      ) {


    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
        const base64Image = imageBuffer.toString('base64');

        const imageDataUrl =`data:image/jpeg;base64,${base64Image}`;
      
        const response = await openai.responses.create({
          model: 'gpt-4.1-mini',
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: `
      You are extracting text from a medicine blister wrapper.
      
      RULES (CRITICAL):
      - Do NOT guess or infer missing data
      - Do NOT assume drug names
      - If text is not clearly visible, return null
      - Prefer OCR text if present
      - Use the image ONLY to correct OCR errors
      - Return JSON only
      
      OCR TEXT:
      """
      ${ocrText}
      """
                  `,
                },
              ],
            },
          ],
        });
      
        return JSON.parse(response.output_text);
      }
  



      private async preprocess(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize({ width: 1500 })
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();
  }

  private async extractText(buffer: Buffer): Promise<string> {
    const worker = await createWorker('eng');
    

    const {
      data: { text },
    } = await worker.recognize(buffer);

    await worker.terminate();
    return text;
  }
}
