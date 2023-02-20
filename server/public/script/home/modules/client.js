export class clientManager {

  constructor(scope, http, timeout) {
    this.scope = scope;
    this.http = http;
    this.timeout = timeout;
  }

  getElements(identifier) {
    return document.querySelectorAll(identifier);
  }

  getElement(identifier) {
    return document.querySelector(identifier);
  }

  event(DOM, event, callback) {
    DOM.addEventListener(event, callback);
  }

  addActive(DOM) {
    DOM.classList.add("active");
  }

  toggleActive(DOM) {
    DOM.classList.toggle("active");
  }

  removeActive(DOM) {
    DOM.classList.remove("active");
  }

  generateFilePath(files, index) {
    return files.path + "/" + files.files[index].name;
  }

  setTimeout(callback, time) {
    this.timeout(callback, time);
  }

  get(url, callback) {
    this.http.get(url).then((result) => {
      if (callback) {
        callback(result.data);
      }
    }, (error) => {
      console.error(error);
    })
  }

  post(url, data, callback) {
    this.http.post(url, data).then((result) => {
      if (callback) {
        callback(result.data);
      }
    }, (error) => {
      console.error(error);
    })
  }

}