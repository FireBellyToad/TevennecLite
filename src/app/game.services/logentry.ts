export class LogEntry {

    static readonly COLOR_RED = 'red';
    static readonly COLOR_BLUE = 'blue';
    static readonly COLOR_GREEN = 'green';

    text: string;
    textColor: string;

    constructor( text: string, textColor: string ) {
        this.text = text;
        this.textColor = textColor;
    }

}
