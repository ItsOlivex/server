import { clientManager } from "../modules/client.js";

const app = angular.module('myApp', []);
app.controller('myCtrl', ($scope, $http, $timeout) => {
  let cl = new clientManager($scope, $http, $timeout);
  let body = cl.getElement("body");


  //profile configuration
  cl.get("/profile", (user) => {
    $scope.user = user;
    let toggleDarkMode = cl.getElement("#darkMode");
    let darkMode = {};
    if (user.darkMode === 1) {
      body.classList.add("dark");
      toggleDarkMode.checked = true;
    }
    user.permission > 1 ? cl.getElement(".accountManager").remove() : null;
    user.permission > 1 ? cl.getElement(".accountNav").remove() : null;
    cl.event(toggleDarkMode, "change", () => {
      darkMode = toggleDarkMode.checked ? { enable: 1 } : { enable: 0 };
      cl.post("/toggleDark", darkMode, (isDark) => {
        isDark.enable ? body.classList.add("dark") : body.classList.remove("dark");
      });
    });
  });
  //end profile configuration


  //accounts configuration 
  cl.get("/accounts", (accounts) => {
    $scope.accounts = accounts;
    let accountsList;
    let acInfo = cl.getElements(".acInfo");
    $scope.selectAccount = (index) => {
      if (acInfo[2].className != "addAccountForm acInfo active") {
        accountsList = cl.getElements(".account .infos");
        acInfo.forEach((item, i) => {
          cl.removeActive(item);
        });
        accountsList.forEach((account) => {
          cl.removeActive(account);
        });
        cl.addActive(acInfo[1]);
        cl.addActive(accountsList[index]);
      }
    }
    $scope.removeSelection = () => {
      if (acInfo[2].className != "addAccountForm acInfo active") {
        cl.removeActive(acInfo[1]);
        cl.addActive(acInfo[0]);
        accountsList ? accountsList.forEach((item) => {
          cl.removeActive(item);
        }) : null;
      }
    }
    $scope.createAccount = () => {
      acInfo.forEach((element) => {
        cl.removeActive(element);
      });
      accountsList ? accountsList.forEach((account) => {
        cl.removeActive(account);
      }) : null;
      cl.addActive(acInfo[2]);
    }
  });
  //end accounts configuration


  //file manager
  cl.post("/getFolders", { folders: [] }, (folder) => {
    $scope.folders = folder;

    //folder option menu
    let foldersOption;
    $scope.folderOption = (index, element) => {
      foldersOption = cl.getElements(".option.filesOption");
      let folderOption = foldersOption[index].nextElementSibling;
      cl.toggleActive(folderOption);
    }
    //delete folder
    $scope.deleteFolder = (index) => {
      cl.post("/deleteFolder", { folderName: $scope.folders[index] }, (folders) => {
        $scope.folders = folders;
      });
    }
    //createFolder
    $scope.createFolder = () => {
      cl.addActive(cl.getElement(".filesItem.addFolder"));
      cl.getElement(".folderName").focus();
    }

    cl.getElement("#folderName").addEventListener("submit", (e) => {
      e.preventDefault();
      cl.post("/createFolder", { folderName: document.querySelector(".folderName").value }, (folders) => {
        $scope.folders = folders;
        cl.getElement(".folderName").value = "";
        cl.getElement(".folderName").blur();
      });
    });

    let folderList;
    $scope.filesGeneral = { page: [], files: [[]] };

    $scope.selectFolder = (index) => {
      cl.removeActive(cl.getElement(".folderNotSelected"));
      cl.addActive(cl.getElement(".fileContainer"));
      cl.post("/getFiles", { path: null, folder: [$scope.folders[index]] }, (files) => {
        folderList = cl.getElements(".filesItem .infos");
        folderList.forEach((element) => {
          cl.removeActive(element);
        });
        cl.addActive(folderList[index]);
        while ($scope.filesGeneral.page.length){
          $scope.filesGeneral.page.pop();
        } while ($scope.filesGeneral.files[0].length){
          $scope.filesGeneral.files[0].pop();
        }
        cl.getElement(".fileManagerContainer").style.transform = "none";
        $scope.filesGeneral.page.push({ number: 0 });
        $scope.filesGeneral.files[0].push(files);
      });
    }

    $scope.selectFolders = (pIndex, index) => {
      if ($scope.filesGeneral.files[0][pIndex].files[index].url === "folder-outline") {
        if ((pIndex + 1) === $scope.filesGeneral.page.length) {
          cl.post("/getFiles", { path: cl.generateFilePath($scope.filesGeneral.files[0][pIndex], index), folder: null }, (files) => {
            $scope.filesGeneral.page.push({ number: 0 });
            $scope.filesGeneral.files[0].push(files);
            if ($scope.filesGeneral.page.length > 3) {
              let value = (-100 / 3) * ($scope.filesGeneral.page.length - 3);
              cl.getElement(".fileManagerContainer").style.transform = "translateX(" + value + "%)";
            }
          });
        }
      }
    }

    let folderIndex;
    $scope.show = true;

    $scope.rightClick = (e, index) => {
      e.preventDefault();
      console.log(e.currentTarget.className);
      if (e.currentTarget.className === "fileManagerFolder ng-scope") {
        cl.getElement("#menuFolder").focus();
        cl.getElement(".folderOption").style.top = (e.clientY - 70) + "px";
        cl.getElement(".folderOption").style.left = e.clientX + "px"
      } else {

      }
      folderIndex = index;
    }

    cl.event(cl.getElement("#menuFolder"), "focus", () => {
      cl.addActive(cl.getElement(".folderOption"));
    });

    cl.event(cl.getElement("#menuFolder"), "blur", () => {
      cl.setTimeout(() => {
        cl.removeActive(cl.getElement(".folderOption"));
      }, 100);
    });




    //create file and folder
    $scope.addCreateFile = () => {
      cl.removeActive(cl.getElements(".fileItem.createFile")[folderIndex]);
      cl.getElements("#newFileName")[folderIndex].focus();
    } 


    $scope.removeAddFile = () => {
      cl.addActive(cl.getElements(".fileItem.createFile")[folderIndex]);
      cl.getElements(".fileItem.createFile")[folderIndex].classList.remove("animate");
      cl.getElements("#newFileName")[folderIndex].value = "";
    }

    $scope.createFile = (e) => {
      e.preventDefault();
      cl.post("/createFile", { fileName: cl.getElements("#newFileName")[folderIndex].value, path: $scope.filesGeneral.files[0][folderIndex].path }, (files) => {
        console.log(files.error);
        if (files.error) {
          cl.getElements(".fileItem.createFile")[folderIndex].classList.add("animate");
        } else {
          cl.getElements("#newFileName")[folderIndex].blur();
          cl.getElements("#newFileName")[folderIndex].value = "";
          $scope.filesGeneral.files[0][folderIndex] = files;
        }
      });
    }



    $scope.addCreateFolder = () => {
      cl.removeActive(cl.getElements(".fileItem.createFolder")[folderIndex]);
      cl.getElements("#newFolder")[folderIndex].focus();
    } 


    $scope.removeAddFolder = () => {
      cl.addActive(cl.getElements(".fileItem.createFolder")[folderIndex]);
      cl.getElements(".fileItem.createFolder")[folderIndex].classList.remove("animate");
      cl.getElements("#newFolder")[folderIndex].value = "";
    }

    $scope.createNewFolder = (e) => {
      e.preventDefault();
      cl.post("/createNewFolder", { folderName: cl.getElements("#newFolder")[folderIndex].value, path: $scope.filesGeneral.files[0][folderIndex].path }, (files) => {
        if (files.error) {
          cl.getElements(".fileItem.createFolder")[folderIndex].classList.add("animate");
        } else {
          cl.getElements("#newFolder")[folderIndex].blur();
          cl.getElements("#newFolder")[folderIndex].value = "";
          $scope.filesGeneral.files[0][folderIndex] = files;
        }
      });
    }


  });
  //end file manager
});

app.directive('ngRightClick', function($parse) {
  return function(scope, element, attrs) {
      var fn = $parse(attrs.ngRightClick);
      element.bind('contextmenu', function(event) {
          scope.$apply(function() {
              event.preventDefault();
              fn(scope, {$event:event});
          });
      });
  };
});