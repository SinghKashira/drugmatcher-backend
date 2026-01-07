function findAfter(text: string, keyword: RegExp): string | null {
  const lines = text.split('\n');
  const index = lines.findIndex((l) => keyword.test(l.toLowerCase()));

  if (index !== -1 && lines[index + 1]) {
    return lines[index + 1].trim();
  }
  return null;
}

function findMatch(text: string, regex: RegExp): string | null {
  const match = text.match(regex);
  return match ? match[0].trim() : null;
}

// export function extractDrugDetails(text: string) {
//     const clean = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  
//     const extract = (regex: RegExp) => {
//       const match = clean.match(regex);
//       return match ? match[1].trim() : null;
//     };
  
//     return {
//       drug_name:
//         extract(/(?:Brand|Name|Product)\s*[:\-]?\s*([A-Za-z0-9\s]+)/i),
  
//       ingredients:
//         extract(/(?:Composition|Ingredients|Contains)\s*[:\-]?\s*([A-Za-z0-9,.\s]+)/i),
  
//       dosage_text:
//         extract(/(?:Dosage|Dose|Each tablet contains)\s*[:\-]?\s*([A-Za-z0-9\s.%/]+)/i),
  
//       manufacturer:
//         extract(/(?:Manufactured by|Mfg\.?\s*By)\s*[:\-]?\s*([A-Za-z0-9\s.,]+)/i),
  
//       batch_no:
//         extract(/(?:Batch|Lot|B\.?No)\s*[:\-]?\s*([A-Za-z0-9]+)/i),
  
//       expiry:
//         extract(/(?:Exp|Expiry|Use before)\s*[:\-]?\s*([0-9\/\-]+)/i),
  
//       warnings:
//         extract(/(?:Warning|Caution)\s*[:\-]?\s*([A-Za-z0-9\s.,]+)/i),
  
//       raw_text: text,
//     };
//   }


export function extractDrugDetails(text: string) {
    const clean = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
   // return clean;
  
    const find = (r: RegExp) => {
      const m = clean.match(r);
      return m ? m[1].trim() : null;
    };
  
    return {
      drug_name:
        find(/([A-Z][A-Z\s]{5,})\s*(TABLETS|CAPSULES)?/),
  
      ingredients:
        find(/(\d+\s?mg)/i),
  
      batch_no:
        find(/B\.?\s?No\.?\s*([A-Z0-9]+)/i),
  
      expiry:
        find(/(EXP|Expiry)\s*([0-9\/\-]{5,})/i)?.replace(/EXP/i, '').trim() || null,
  
      manufacturer:
        find(/(Mfg|Manufactured)\s*(by)?\s*([A-Za-z\s]+)/i),
  
      raw_text: text,
    };
  }


//   export function extractDrugDataFromLines(lines: any) {
//     const ingredientNames: string[] = [];
//     const strengths: string[] = [];
  
//     for (const line of lines) {
//       // Ingredient names (letters + hyphens)
//       if (/^[A-Za-z][A-Za-z\s\-]+$/.test(line) && !/tablet|store|keep/i.test(line)) {
//         ingredientNames.push(line);
//       }
  
//       // Strengths (mg, IU, mcg)
//       if (/\b\d+\s?(mg|mcg|iu)\b/i.test(line)) {
//         strengths.push(line);
//       }
//     }
  
//     // Drug name usually appears as a branded word (capitalized, short)
//     const drugName =
//       lines.find(l => /^[A-Z][A-Za-z0-9\s]{3,}$/.test(l) && !ingredientNames.includes(l)) || null;
  
//     return {
//       drug_name: drugName,
//       ingredients: ingredientNames.map((name, i) => ({
//         name,
//         strength: strengths[i] || null,
//       })),
//       batch_no: null,        // not present
//       expiry: null,          // not present
//       manufacturer: null,    // not present
//       raw_text: lines.join(' | '),
//     };
//   }



export function extractDrugDataFromLines(lines: any) {
    if (!Array.isArray(lines)) {
      throw new Error(`Expected array of lines, received: ${typeof lines}`);
    }
  
    const ingredientNames: string[] = [];
    const strengths: string[] = [];
  
    for (const line of lines) {
      if (typeof line !== 'string') continue;
  
      // Ingredient name
      if (
        /^[A-Za-z][A-Za-z\s\-]+$/.test(line) &&
        !/tablet|store|keep|contains/i.test(line)
      ) {
        ingredientNames.push(line);
      }
  
      // Strength
      if (/\b\d+\s?(mg|mcg|iu)\b/i.test(line)) {
        strengths.push(line);
      }
    }
  
    const drugName =
      lines.find(
        l =>
          typeof l === 'string' &&
          /^[A-Z][A-Za-z0-9\s]{3,}$/.test(l) &&
          !ingredientNames.includes(l),
      ) || null;


      const batch_no =
      lines
        .map(l => l.match(/B\.?\s?No\.?\s*([A-Z0-9]+)/i)?.[1])
        .find(Boolean) || null;

    const expiry = lines.find(
        l =>
            typeof l === 'string' &&
            /(EXP|Expiry)\s*[0-9\/\-]{5,}/i.test(l)
        );
          
      

    const manufacturer = lines.find(
    l =>
        typeof l === 'string' &&
        /(Mfg|Manufactured)\s*(by)?\s*[A-Za-z\s]+/i.test(l)
    );
              


  
    return {
      drug_name: drugName,
      ingredients: ingredientNames.map((name, i) => ({
        name,
        strength: strengths[i] || null,
      })),
      batch_no: batch_no,
      expiry: expiry,
      manufacturer: manufacturer,
      raw_text: lines.join(' | '),
    };
  }
  




  export function extractLines(outputText: string): string[] {
    if (!outputText || typeof outputText !== 'string') {
      return [];
    }
  
    const cleaned = outputText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
  
    const parsed = JSON.parse(cleaned);
  
    if (Array.isArray(parsed)) {
      return parsed;
    }
  
    if (Array.isArray(parsed.text)) {
      return parsed.text;
    }
  
    return [];
  }
  
  
  
  
