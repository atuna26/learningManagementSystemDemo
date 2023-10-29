


function questionKindChange(option) {
  optionList = document.getElementsByClassName(option.id)[0];
  if (option.value === "Radio" || option.value === "Checkbox") {
    optionList.classList.remove("visually-hidden");
  } else {
    optionList.classList.add("visually-hidden");
  }
}

const randomPassword = () => {
  let password = document.getElementById("userPassword");
  let pass = "";
  let str =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    ".*-!#$&*@" +
    "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 1; i <= 10; i++) {
    let char = Math.floor(Math.random() * str.length + 1);

    pass += str.charAt(char);
  }
  password.value = pass;
};

const lessonChange = () =>{
  let lessonValue = document.getElementById("lessonSelect");
  let lessonCont1 = document.getElementById("lessonCont1");
  let lessonCont2 = document.getElementById("lessonCont2");
  let lessonCancel = document.getElementById("lessonCancel");
  if(lessonValue.value=="No"){
    lessonCancel.classList.remove("visually-hidden")
    lessonCont1.classList.add("visually-hidden")
    lessonCont2.classList.add("visually-hidden")
  }else if (lessonValue.value=="Yes") {
    lessonCancel.classList.add("visually-hidden")
    lessonCont1.classList.remove("visually-hidden")
    lessonCont2.classList.remove("visually-hidden")
  }
}

const nextButton = () =>{
  let lessonCont1 = document.getElementById("lessonCont1");
  let lessonCont2 = document.getElementById("lessonCont2");
  let lessonPart2Cont1 = document.getElementById("lessonPart2Cont1");
  let lessonPart2Cont2 = document.getElementById("lessonPart2Cont2");
  let lessonPart2Cont3 = document.getElementById("lessonPart2Cont3");
  let lessonPart2Cont4 = document.getElementById("lessonPart2Cont4");

  let lessonCancel = document.getElementById("lessonCancel");
  let lessonValue = document.getElementById("lessonSelect");
  let buttons = document.getElementById("nextButtons");
  if(lessonValue.value=="No"){
    document.getElementById("feedbackForm").submit()
  }else if(lessonValue.value=="Yes"){
    lessonCancel.classList.add("visually-hidden")
    lessonCont1.classList.add("visually-hidden")
    lessonCont2.classList.add("visually-hidden")
    lessonPart2Cont1.classList.remove("visually-hidden")
    lessonPart2Cont2.classList.remove("visually-hidden")
    lessonPart2Cont3.classList.remove("visually-hidden")
    lessonPart2Cont4.classList.remove("visually-hidden")
    buttons.setAttribute("onClick","nextButton2()")
  }else{
    alert("Unanswered Question")
  }
}

const nextButton2 = () =>{
  let lessonPart2Cont1 = document.getElementById("lessonPart2Cont1");
  let lessonPart2Cont2 = document.getElementById("lessonPart2Cont2");
  let lessonPart2Cont3 = document.getElementById("lessonPart2Cont3");
  let lessonPart2Cont4 = document.getElementById("lessonPart2Cont4");
  let lessonPart3Cont1 = document.getElementById("lessonPart3Cont1");
  let lessonPart3Cont2 = document.getElementById("lessonPart3Cont2");
  let lessonPart3Cont3 = document.getElementById("lessonPart3Cont3");
  let buttons = document.getElementById("nextButtons");


  lessonPart2Cont1.classList.add("visually-hidden")
  lessonPart2Cont2.classList.add("visually-hidden")
  lessonPart2Cont3.classList.add("visually-hidden")
  lessonPart2Cont4.classList.add("visually-hidden")
  lessonPart3Cont1.classList.remove("visually-hidden")
  lessonPart3Cont2.classList.remove("visually-hidden")
  lessonPart3Cont3.classList.remove("visually-hidden")
  buttons.type="submit"

} 


const registerRoleChange = () => {
  let roleSelect = document.getElementById("roleSelect");
  let studentForm = document.getElementById("studentGroup");
  let teacherForm = document.getElementById("teacherGroup");

  if (roleSelect.value === "Student") {
    teacherForm.classList.add("visually-hidden");
    studentForm.classList.remove("visually-hidden");
  } else if (roleSelect.value === "Teacher") {
    studentForm.classList.add("visually-hidden");
    teacherForm.classList.remove("visually-hidden");
  } else {
    studentForm.classList.add("visually-hidden");
    teacherForm.classList.add("visually-hidden");
  }
};
