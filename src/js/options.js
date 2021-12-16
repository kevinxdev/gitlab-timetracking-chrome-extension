let gitlabUrlInput = document.getElementById("gitlab-url");
let gitlabPATInput = document.getElementById("gitlab-pat");
let layoutWidthBox = document.getElementById("layout-width-box");
let layoutWidthInput = document.getElementById("layout-width-input");

let ro = new ResizeObserver((entries) => {
  let width = parseInt(layoutWidthBox.style.width, 10);
  if (width >= 400 && width <= 800) {
    chrome.storage.sync.set({ layoutWidth: width });
    layoutWidthInput.value = width;
  }
});

ro.observe(layoutWidthBox);

layoutWidthInput.addEventListener("change", function () {
  let width = this.value;
  if (width >= 400 && width <= 800) {
    chrome.storage.sync.set({ layoutWidth: width });
    layoutWidthBox.style.width = `${width}px`;
    layoutWidthInput.classList.remove("is-invalid");
    document
      .getElementById("validationServer05Feedback")
      .classList.add("invisible");
  } else {
    layoutWidthInput.classList.add("is-invalid");
    document
      .getElementById("validationServer05Feedback")
      .classList.remove("invisible");
  }
});

function constructSettings() {
  chrome.storage.sync.get(
    ["gitlabUrl", "gitlabPAT", "layoutWidth"],
    function (data) {
      if (!data.layoutWidth) {
        chrome.storage.sync.set({ layoutWidth: 400 });
        layoutWidthBox.style.width = "400px";
        layoutWidthInput.value = 400;
      } else {
        layoutWidthBox.style.width = `${data.layoutWidth}px`;
        layoutWidthInput.value = data.layoutWidth;
      }
      if (data.gitlabUrl) {
        gitlabUrlInput.value = data.gitlabUrl;
      }
      if (data.gitlabPAT) {
        gitlabPATInput.value = data.gitlabPAT;
      }
      gitlabUrlInput.addEventListener("change", function () {
        chrome.storage.sync.set({ gitlabUrl: this.value });
        let request = new Request(`${this.value}api/v4/projects`, {});
        fetch(request)
          .then((response) => {
            if (gitlabUrlInput.classList.contains("is-invalid")) {
              gitlabUrlInput.classList.remove("is-invalid");
              document
                .getElementById("validationServer03Feedback")
                .classList.add("invisible");
            }
          })
          .catch((error) => {
            gitlabUrlInput.classList.add("is-invalid");
            document
              .getElementById("validationServer03Feedback")
              .classList.remove("invisible");
          });
      });
      gitlabPATInput.addEventListener("change", function () {
        chrome.storage.sync.set({ gitlabPAT: this.value });
        chrome.storage.sync.get("gitlabUrl", ({ gitlabUrl }) => {
          let request = new Request(`${gitlabUrl}api/v4/user`, {
            headers: {
              "PRIVATE-TOKEN": this.value,
            },
          });
          fetch(request)
            .then((response) => {
              if (gitlabPATInput.classList.contains("is-invalid")) {
                gitlabPATInput.classList.remove("is-invalid");
                document
                  .getElementById("validationServer04Feedback")
                  .classList.add("invisible");
              }
              response.json().then((data) => {
                if (data.message == "401 Unauthorized") {
                  gitlabPATInput.classList.add("is-invalid");
                  document
                    .getElementById("validationServer04Feedback")
                    .classList.remove("invisible");
                } else {
                  chrome.storage.sync.set({ gitlabUserID: data.id });
                }
              });
            })
            .catch((error) => {
              gitlabPATInput.classList.add("is-invalid");
              document
                .getElementById("validationServer04Feedback")
                .classList.remove("invisible");
            });
        });
      });
    }
  );
}
constructSettings();
