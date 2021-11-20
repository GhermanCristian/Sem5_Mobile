export interface Prediction {
    _id: string;
    name?: string;
    driverOrder: string[];
    webViewPath: string;
    latitude: number;
    longitude: number;
}
