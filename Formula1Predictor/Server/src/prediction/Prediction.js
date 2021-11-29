export class Prediction {
    constructor({name, driverOrder, webViewPath, latitude, longitude}) {
        this.name = name;
        this.driverOrder = driverOrder;
        this.webViewPath = webViewPath;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}