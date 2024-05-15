export const generateFUBHeader = (apiKey: string): { [key: string]: string } => {
    const Authorization = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
    return {
        Authorization,
        'X-System': 'FTTool',
        'X-System-Key': 'FTTool',
    };
};
