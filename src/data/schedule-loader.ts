import fs from 'fs';
import path from 'path';

// In a real Next.js app, we can't import fs in client components directly.
// We need a Server Action or pass data via props. 
// For this prototype, I'll put the string in a variable here or use a server component approach.
// To keep it simple for the "Client Component" page.tsx, I will copy the string here as a const.
// Or I can read it using a server action. Let's try to do it right with a server action or just a const for now.
// But I saved 'schedule_dump.txt' which is on the server side.
// I will create a server action to reading it.

// Actually, I can't easily "import" a text file in client code without webpack config or fetch.
// I will make a hardcoded export for now with the same content I saved to the txt file to ensure it works in the client.
// Or I can use a simple API route.

const RAW_DATA = `
### SHEET: ETB-1 ###
ASTEA|Unnamed: 1|ASTELEHENA|ASTEARTEA|ASTEAZKENA|OSTEGUNA|OSTIRALA|LARUNBATA|IGANDEA|Unnamed: 9|Unnamed: 10|Unnamed: 11|Unnamed: 12|Unnamed: 13|Unnamed: 14|Unnamed: 15|Unnamed: 16
1.0||29|30|31|01|02|03|04||||||||
||||||||||||||||
|||||||ZUZENEKOAK|||||||||
|||||AURRERA ASTROMUTIL AURRERA|||230082  atal 1|IPUIN TXIKI, SOINU HANDI         240058 atal 1|||||||||
|07:00:00|||220474  1-2 atal|||AURRERA ASTROMUTIL AURRERA||07:00:00|||||||
||||ROBIN HOOD||||||||||||
|||||||230082  2 ATAL|||||||||
||||240069 / 240070  2 atal|||LANDAKO UMEAK|||||||||
|07:30:00|||POTTOKIAK|||||07:30:00|||||||
|||||||240071  2 ATAL|||||||||
|||240092 - 2-3 ATAL||||POTTOKIAK|||||||||
|08:00:00||MAKUSI ZORIONAK  (246147)  88||||240092  2 ATAL||08:00:00|||||||
||||POTX ETA LOTX|246167  atal 1||YOKO|||||||||
||||AMESLARIEN BANDA|246388  atal 1|||||||||||
||||SUPERDINO|||216268  2 ATAL|||||||||
|08:30:00|||220222  2-3 atal|||TXAKUR PATRULLA||08:30:00|||||||
|09:00:00||||||||09:00:00|||||||
|||IPUIN TXIKI, SOINU HANDI|||240058  2-3 atal|186061  2 ATAL|||||||||
|09:30:00|||YOKO|||09:30  MAKUSI ZORIONAK|BIZI BERRIA - 1|09:30:00|||||||
|10:00:00|||TXAKUR-PATRUILA|||AMESLARIEN BANDA   atal 1||10:00:00|||||||
|21:00:00|||KONTZERTUA 2025|||||21:00:00|||||||
|||EITB KULTURA - ATALAK||256037/001   57'|EITB KULTURA - ATALAK|GO!AZEN 12.0|HITZETIK|MIHILUZE||||||||
`;

export const scheduleData = RAW_DATA;
