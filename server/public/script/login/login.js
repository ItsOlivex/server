document.forms["myForm"].addEventListener("submit", async (event) => {
  event.preventDefault();
  const resp = await fetch(event.target.action, {
    method: "POST",
    body: new URLSearchParams(new FormData(event.target)),
  });
  const body = await resp.json();
  if (body.status == "success") {
    document.querySelector("#name").value = document.querySelector(".name1").value;
    document.querySelector("#password").value = document.querySelector(".password1").value;
    document.querySelector("#form").submit();
  } else if (body.status == "failure") {
    if (!body.message) {
      document.querySelector(".passContainer").classList.add("error");
    } else {
      document.querySelector(".em").classList.add("error");
    }
  }
});



let line = document.querySelector(".cross");
let pass = document.querySelector(".password1");

document.querySelector(".hide").addEventListener("click", () => {
  line.classList.toggle("active");
  if (line.className == "cross active") {
    pass.type = "password";
  } else {
    pass.type = "text";
  }
});


let placeholders = document.querySelectorAll(".inputTitle");
let inputs = document.querySelectorAll(".in");

let activePlace = (placeholder) => {
  if (placeholder.classList.contains("i1")) {
    inputs[0].focus();
  } else if (placeholder.classList.contains("i2")) {
    inputs[1].focus();
  }
}

placeholders.forEach((placeholder) => {
  placeholder.addEventListener("click", () => {
    activePlace(placeholder);
  });
});

