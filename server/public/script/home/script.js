let selectors = document.querySelectorAll(".item");
let navs = document.querySelectorAll(".nav");
let subCont = document.querySelectorAll(".subcontent");
let console = document.querySelector(".consoles");
let changeSelection = (element, i) => {
  selectors.forEach((item, j) => {
    item.classList.remove("active");
    navs[j].classList.remove("active");
    subCont[j].classList.remove("active");
  });
  element.classList.add("active");
  navs[i].classList.add("active");
  subCont[i].classList.add("active");
  if (i == 1) {
    console.classList.add("active");
  } else {
    console.classList.remove("active");
  }
}
selectors.forEach((element, i) => {
  element.addEventListener("click", () => {
    changeSelection(element, i);
  })
});


let profileToggle = document.querySelector(".profileToggle");
let profileMenu = document.querySelector(".profileMenu");
profileToggle.addEventListener("click", () => {
  profileMenu.classList.toggle("active");
});



let search = document.querySelectorAll(".inputSearch");
let inputBox = document.querySelectorAll(".search .container");


