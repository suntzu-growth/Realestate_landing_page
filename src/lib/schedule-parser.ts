export interface Program {
    channel: string;
    day: string;
    time: string;
    title: string;
}

// Simple mapping for days based on the columns in the text
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export class ScheduleParser {
    private rawData: string;
    private programs: Program[] = [];

    constructor(rawData: string) {
        this.rawData = rawData;
        this.parse();
    }

    private parse() {
        const lines = this.rawData.split("\n");
        let currentChannel = "ETB-1"; // Default

        // This is a naive parser tuned to the specific text dump format provided
        // It looks for patterns like |HH:mm:ss| and assumes columns correspond to days

        for (const line of lines) {
            if (line.includes("SHEET:")) {
                const match = line.match(/SHEET: (.*?) ###/);
                if (match) currentChannel = match[1].trim();
                continue;
            }

            // Check if line has a time in the first column (e.g., |07:00:00|||)
            // The format seems to be: Time | Col1 | Mon | Tue | Wed | Thu | Fri | Sat | Sun ...
            // Split by pipe |
            const parts = line.split("|").map(p => p.trim());

            if (parts.length > 3) {
                // Try to find a time. Usually index 1 (because index 0 is empty string if line starts with |)
                let time = parts[1];
                // Sometimes time is in index 0 if no leading pipe? Text dump usually has leading pipe for this format
                if (!time && parts[0]) time = parts[0];

                // Valid time format check (simple)
                if (time && time.match(/\d{2}:\d{2}/)) {
                    // We have a time row. Now look at the day columns.
                    // Assuming columns 3 to 9 correspond to Mon-Sun (Indices 2-8 in 0-indexed parts array depending on leading empty)
                    // Let's look at the sample: |07:00:00|||220474...
                    // Index 0: ""
                    // Index 1: "07:00:00"
                    // Index 2: "" (Unnamed: 1)
                    // Index 3: Mon
                    // Index 4: Tue
                    // ...

                    for (let i = 0; i < 7; i++) {
                        const colIndex = 3 + i;
                        if (parts[colIndex]) {
                            this.programs.push({
                                channel: currentChannel,
                                day: DAYS[i],
                                time: time,
                                title: parts[colIndex]
                            });
                        }
                    }
                }
            }
        }
    }

    public search(query: string): Program[] {
        const lowerQuery = query.toLowerCase();
        return this.programs.filter(p =>
            p.title.toLowerCase().includes(lowerQuery) ||
            p.channel.toLowerCase().includes(lowerQuery)
        );
    }
}
