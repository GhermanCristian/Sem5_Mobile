import dataStore from 'nedb-promise';

export class PredictionStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(prediction) {
    return this.store.insert(prediction);
  };
  
  async update(props, prediction) {
    return this.store.update(props, prediction);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new PredictionStore({ filename: './db/predictions.json', autoload: true });