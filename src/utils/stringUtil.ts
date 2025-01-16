export class StringUtil {
    static convertToPascalCase(str: string): string {
        return str
            .replace(/\w+/g, function (w) {
                return w[0].toUpperCase() + w.slice(1).toLowerCase();
            })
            .replace(/\s+/g, "");
    }
}