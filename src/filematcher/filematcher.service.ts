import { Injectable } from '@nestjs/common';
import * as vision from '@google-cloud/vision';


import * as sharp from 'sharp';
import { createWorker, PSM } from 'tesseract.js';
import { extractDrugDetails, extractDrugDataFromLines, extractLines } from './filematcher.extractor';



import OpenAI from 'openai';

@Injectable()
export class FilematcherService {

    private client = new vision.ImageAnnotatorClient();

  async detectText(imageBuffer: Buffer) {
    const [result] = await this.client.textDetection(imageBuffer);

    const detections = result.textAnnotations;

    return {
      fullText: detections?.[0]?.description || '',
      confidence: detections?.[0]?.confidence || null,
      raw: detections
    };
  }







  // async processImage(buffer: Buffer) {
  //   // 1. Preprocess image
  //   const processedImage = await this.preprocess(buffer);

  //   // 2. OCR
  //   const text = await this.extractText(processedImage);

  //  // return text;

  //   // 3. Convert text → structured JSON
  //   const extractedData = extractDrugDetails(text);

  //   return {
  //     success: true,
  //     extracted_data: extractedData,
  //   };
  // }

  // private async preprocess(buffer: Buffer): Promise<Buffer> {
  //   return sharp(buffer)
  //     .resize({ width: 1500 })
  //     .grayscale()
  //     .normalize()
  //     .sharpen()
  //     .toBuffer();
  // }

  // private async extractText(buffer: Buffer): Promise<string> {
  //   const worker = await createWorker('eng');
    

  //   const {
  //     data: { text },
  //   } = await worker.recognize(buffer);

  //   await worker.terminate();
  //   return text;
  // }




  async processImage(buffer: Buffer) {
    const processed = await this.preprocess(buffer);
    const text = await this.extractText(processed);

    //return text;

    return {
      success: true,
      extracted_data: extractDrugDetails(text),
    };
  }

  private async preprocess(buffer: Buffer): Promise<Buffer> {
    console.log("blister preprocess");
    return sharp(buffer)
    .resize({ width: 2200 })
    .grayscale()
    .linear(1.5, -20)    // contrast boost
    .threshold(140)     // foil-friendly
    .toBuffer();
  }

  private async extractText(buffer: Buffer): Promise<string> {
    const worker = await createWorker();
  
    // await worker.loadLanguage('eng');
    // await worker.initialize('eng');
  
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT, // Sparse text (blister packs!)
      tessedit_char_whitelist:
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      user_defined_dpi: '300',
      preserve_interword_spaces: '1',
    });
  
    const {
      data: { text },
    } = await worker.recognize(buffer);
  
    await worker.terminate();

    console.log("blister extractText");
    return text;
  }
  




  async processBlister(buffer: Buffer) {
    const processed = await this.preprocess(buffer);
  
    const tesseractText = await this.extractText(processed);
  
    const gptResult = await this.gptVisionExtract(
      buffer,
      tesseractText
    );

    const lines = extractLines(gptResult.output_text);
     console.log("gptResult.output_text >> ",gptResult.output_text);

//  const lines = [{
// "brand_name": "OSSOPAN XT",
//         "generic_name": "Calcium Carbonate",
//         "ingredients": [
//             "Calcium Carbonate",
//             "Vitamin D3",
//             "Methylcobalamin",
//             "L-Methylfolate Calcium",
//             "Pyridoxal-5-Phosphate"
//         ],
//         "salts": [
//             "Calcium Carbonate",
//             "Pyridoxal-5-Phosphate"
//         ],
//         "strength": "Calcium Carbonate 1250 mg + Vitamin D3 2000 IU + Methylcobalamin 1500 mg + L-Methylfolate 200 mcg + Pyridoxal-5-Phosphate 20 mg",
//         "dosage_form": "tablet",
//         "usage": "For oral use",
//         "purpose": "Nutritional supplement",
//         "expiry_date": null,
//         "batch_no": null,
//         "manufacturer": "M/s D. Manohar Laboratories",
//         "confidence_score": 0.9,
//         "source": "image",
//         "region": "US"
//   }];
  
    return {
      success: true,
      source: 'HYBRID',
      extracted_data: JSON.parse(gptResult.output_text)//extractDrugDataFromLines(lines),
     // extracted_data: lines
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

   // return base64Image;

    const imageDataUrl =`data:image/jpeg;base64,${base64Image}`;

    //return imageDataUrl;
  
    // const response = await openai.responses.create({
    //   model: 'gpt-4o-mini',
    //   input: [
    //     {
    //       role: 'user',
    //       content: [
    //         {
    //           type: 'input_text',
    //           text: `
    // You are a pharmaceutical text extraction engine.
    
    // TASK:
    // Extract structured information from a medicine blister wrapper using OCR text and image.
    
    // CRITICAL RULES (MUST FOLLOW):
    // - DO NOT guess, infer, or assume any missing information
    // - If a value is NOT explicitly visible, return null
    // - Do NOT fabricate brand or generic names
    // - Prefer OCR text; use the image ONLY to correct OCR mistakes
    // - Do NOT provide medical advice
    // - Usage and purpose must be descriptive, NOT prescriptive
    // - Use US FDA-aligned terminology where possible
    // - Return ONLY valid JSON (no markdown, no explanation)
    
    // SOURCE PRIORITY:
    // 1. OCR text
    // 2. Image (only to fix OCR errors)
    
    // OUTPUT FORMAT (EXACT):
    // {
    //   "brand_name": "string | null",
    //   "generic_name": "string | null",
    //   "ingredients": ["string"],
    //   "salts": ["string"],
    //   "strength": "string | null",
    //   "dosage_form": "string | null",
    //   "usage": "string | null",
    //   "purpose": "string | null",
    //   "expiry_date": "string | null",
    //   "batch_no": "string | null",
    //   "manufacturer": "string | null",
    //   "confidence_score": "number between 0 and 1",
    //   "source": "image | document",
    //   "region": "US"
    // }
    
    // FIELD RULES:
    // - brand_name → The marketed brand name printed on the pack
    // - generic_name → Primary active ingredient only (e.g., Calcium Carbonate)
    // - ingredients → List of active ingredients only
    // - salts → Chemical salt forms (e.g., Calcium Carbonate, Pyridoxal-5-Phosphate)
    // - strength → Combined strength string if printed (e.g., "Calcium Carbonate 1250 mg + Vitamin D3 2000 IU")
    // - dosage_form → tablet, capsule, syrup, injection (only if explicitly printed)
    // - usage → Printed usage text only (e.g., "For oral use")
    // - purpose → Printed indication text only (e.g., "Nutritional supplement")
    // - expiry_date → Printed expiry (e.g., "12/2026")
    // - batch_no → Printed batch number only
    // - manufacturer → Printed manufacturer name only
    // - confidence_score → 0.0–1.0 based on text clarity and completeness
    // - source → "image" if image used to correct OCR, else "document"
    // - region → Always "US"
    
    // OCR TEXT:
    // """
    // ${ocrText}
    // """
    //           `,
    //         },
    //         {
    //           type: 'input_image',
    //           image_url: imageDataUrl,
    //           detail: 'auto',
    //         },
    //       ],
    //     },
    //   ],
    // });


    console.log("blister gptVision before");


    /*****WITH US REGION RULE********/
  
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `
    You are a medical text extraction engine operating under US FDA labeling rules.
    
    TASK:
    Extract structured drug information from a medicine blister wrapper.
    
    REGION:
    US
    
    STRICT RULES (CRITICAL):
    - Do NOT guess or infer any value
    - Do NOT assume brand or generic names
    - Do NOT invent usage, purpose, or strength
    - If a value is NOT explicitly present, return null
    - Ingredients and salts must be textually present
    - Usage and purpose must be descriptive, not prescriptive
    - Drug names should match US-accepted naming where possible
    - Do NOT combine multiple fields into one
    - If OCR text conflicts with the image, prefer OCR
    - Use the image ONLY to correct obvious OCR character errors
    - Return ONLY valid JSON (no markdown, no explanations)
    
    FIELD DEFINITIONS (US-specific):
    - isMedical: return yes if image is related to medical otherwise no
    - brand_name: Trade name printed on packaging (e.g., Tylenol)
    - generic_name: Official US generic name (e.g., Acetaminophen)
    - ingredients: List of ingredient names as printed
    - salts: Chemical salt forms explicitly mentioned (e.g., Sodium, Hydrochloride)
    - strength: Strength with unit exactly as printed (e.g., 500 mg)
    - dosage_form: Tablet, capsule, syrup, etc. (must be printed)
    - usage: Text describing how the medicine is used (if printed)
    - purpose: Intended purpose stated on label (e.g., pain relief)
    - expiry_date: Date printed as EXP or Expiry
    - batch_no: Lot or batch number if printed
    - manufacturer: Company name printed as manufacturer
    - confidence_score:
      - 1.0 = all key fields clearly visible
      - 0.7–0.9 = minor OCR ambiguity
      - 0.4–0.6 = partial data
      - 0.0–0.3 = very limited or unclear data
    - source: "image" or "document"
    - region: Must be "US"
    
    OCR TEXT:
    """
    ${ocrText}
    """
    
    EXPECTED OUTPUT FORMAT:
    {
      "isMedical": "string | null",
      "brand_name": "string | null",
      "generic_name": "string | null",
      "ingredients": ["string"],
      "salts": ["string"],
      "strength": "string | null",
      "dosage_form": "string | null",
      "usage": "string | null",
      "purpose": "string | null",
      "expiry_date": "string | null",
      "batch_no": "string | null",
      "manufacturer": "string | null",
      "confidence_score": 0.0,
      "source": "image",
      "region": "US"
    }
              `,
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
              detail: 'auto',
            },
          ],
        },
      ],
    });
    

    console.log("blister gptVision");
    return response;
   // return JSON.parse(response.output_text);
  }
  
}
