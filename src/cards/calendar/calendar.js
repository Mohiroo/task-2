const { css } = require("jquery");
let $ = require( "jquery" );

let day = $(".calendar__date")
let button_next = $(".month__next")
let button_back = $(".month__back")
let button_clear = $(".calendar__button-clear")
let button_apply = $(".calendar__button-apply")

const today = new Date(); // Текущий день, месяц, год
let selectedMonth = new Date(); // Изменяемый: при переключении переключении месяцов
let daysOfMonth = []; // список дней месяца для вычисления "оставшися клеток для заполнения"

let datesOfCalendar = []; // datesOfCalendar[0] == classIndex[0]
let months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октрябрь", "Ноябрь", "Декабрь"]

let pickedDates = 0; // Клики по датам
let firstPickDate = null; // месяц, год 1 выбранной даты
let secondPickDate = null; // месяц, год 2 выбранной даты

createCalendar()

button_next.on("click", function() { 
  changeMonth("next");
  refreshCalendar();
})
button_back.on("click", function() { 
  changeMonth("back");
  refreshCalendar();
})
day.on("click", function() { 
  let calendarCell = $(this).index();

  pickDates(calendarCell);
})

button_clear.on("click", function() { 
  firstPickDate = null;
  secondPickDate = null;
  pickedDates = 0;
  
  refreshCalendar();
})
button_apply.on("click", function() {
  console.log((firstPickDate.getMonth() + 1).toString().length == 1);
  let firstDate__date = firstPickDate.getDate().toString().length == 1 ? "0" + firstPickDate.getDate() : firstPickDate.getDate()
  let firstDate__month = (firstPickDate.getMonth() + 1).toString().length == 1 ? "0" + (firstPickDate.getMonth() + 1) : firstPickDate.getMonth() + 1
  let firstDate__year = firstPickDate.getFullYear()

  if (secondPickDate != null) {
    let secondDate__date = secondPickDate.getDate().toString().length == 1 ? "0" + secondPickDate.getDate() : secondPickDate.getDate()
    let secondDate__month = (secondPickDate.getMonth() + 1).toString().length == 1 ? "0" + (secondPickDate.getMonth() + 1) : secondPickDate.getMonth() + 1
    let secondDate__year = secondPickDate.getFullYear()

    $(".date1").text(`${firstDate__date}.${firstDate__month}.${firstDate__year}`)
    $(".date2").text(`${secondDate__date}.${secondDate__month}.${secondDate__year}`)
  } else {
    $(".date1").text(`${firstDate__date}.${firstDate__month}.${firstDate__year}`)
    $(".date2").text(`${firstDate__date}.${firstDate__month}.${firstDate__year}`)
  }
})

function createCalendar() {
  createTitle();
  getDaysInMonth(selectedMonth.getMonth(), selectedMonth.getFullYear());

  let firstDayOfMonth = (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)).getDay(); // первый день в месяцу в формате недели
  let lastDayOfMonth = daysOfMonth[daysOfMonth.length-1]
  let dayIndex = 1; // Счетчик дней, на выходе равен 35
  let classIndex = 0; // Счетчик ячеек, на выходе равен 34

  for (let i = 1; i < firstDayOfMonth; i++) { // Дни предыдущего месяца
    dayIndex = i-firstDayOfMonth+1; // +1 поскольку dayIndex = 0 - первое число месяца

    let date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), dayIndex);
    day.eq(classIndex).text(date.getDate())
    day.eq(classIndex).addClass("prev-month")

    displayPickedDates(date, classIndex);

    classIndex = classIndex + 1;
    dayIndex = dayIndex + 1;
    datesOfCalendar.push(date);
  }
  for(let i = firstDayOfMonth; i < lastDayOfMonth+firstDayOfMonth; i++) { // Дни текущего месяца
    let date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), dayIndex);
    day.eq(classIndex).text(date.getDate())

    // Отметка текущего дня месяца
    if (today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && today.getDate() == date.getDate()) {
      day.eq(classIndex).addClass("calendar__date-today")
    }

    displayPickedDates(date, classIndex);

    dayIndex = dayIndex + 1;
    classIndex = classIndex + 1;
    datesOfCalendar.push(date);
  }
  for (let i = classIndex; i < day.length; i++) { // Дни последующего месяца
    let date = (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), dayIndex));
    day.eq(classIndex).text(date.getDate())
    day.eq(classIndex).addClass("next-month")

    displayPickedDates(date, classIndex);

    dayIndex = dayIndex + 1;
    classIndex = classIndex + 1;
    datesOfCalendar.push(date);
  }
}

function changeMonth(direction) {
  if (direction == "next") {
    selectedMonth.setMonth(selectedMonth.getMonth() + 1)
  } else {
    selectedMonth.setMonth(selectedMonth.getMonth() - 1)
  }
}

function createTitle() {
  let title = $(".month__selected")
  let selected_month = months[selectedMonth.getMonth()]

  title.text(`${selected_month} ${selectedMonth.getFullYear()}`)
}

function getDaysInMonth(month, year) {
  let date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    daysOfMonth.push(date.getDate());
    date.setDate(date.getDate() + 1);
  }
}

function refreshCalendar() { // Пересоздание календаря (пример - переход на следущющий месяц)
  day.removeClass("prev-month");
  day.removeClass("calendar__date-today");
  day.removeClass("next-month");

  datesOfCalendar = [];

  clearPickedDates();
  createCalendar();
}

let firstPickCell = null; // 1 выбранная дата
let secondPickCell = null; // 2 выбранная дата

function pickDates(calendarCell) { // Выбор дат
  if (pickedDates == 0) {   // Выбор 1 даты
    firstPickCell = calendarCell;
    firstPickDate = datesOfCalendar[calendarCell];
    
    day.eq(firstPickCell).addClass("calendar__date-first-pick");

    pickedDates = 1;
  } else if (pickedDates == 1) {    // Выбор 2 даты + диапазон
    secondPickDate = datesOfCalendar[calendarCell];
    day.removeClass("calendar__date-first-pick");

    if (firstPickDate < secondPickDate) { // Сначала выбрана 1 дата, потом - 2
      secondPickCell = calendarCell;

      for (let i = 0; i < datesOfCalendar.length; i++) {
        if (datesOfCalendar[i].getFullYear() == firstPickDate.getFullYear() && datesOfCalendar[i].getMonth() == firstPickDate.getMonth() && datesOfCalendar[i].getDate() == firstPickDate.getDate()) {
          day.eq(i).addClass("calendar__date-start")

          firstPickCell = i;
        } else if (datesOfCalendar[i].getFullYear() == secondPickDate.getFullYear() && datesOfCalendar[i].getMonth() == secondPickDate.getMonth() && datesOfCalendar[i].getDate() == secondPickDate.getDate()) {
          day.eq(i).addClass("calendar__date-end")

          secondPickCell = i;
        } else if (firstPickDate < datesOfCalendar[i] && secondPickDate > datesOfCalendar[i]) {
          day.eq(i).addClass("calendar__date-range");
        }
      }

    } else { // Сначала выбрана 2 дата, потом - 1
      secondPickDate = datesOfCalendar[calendarCell];
      
      let temp = firstPickDate;
      firstPickDate = secondPickDate;
      secondPickDate = temp;

      secondPickCell = firstPickCell;
      firstPickCell = calendarCell;
      
      for (let i = 0; i < datesOfCalendar.length; i++) {
        if (datesOfCalendar[i].getFullYear() == firstPickDate.getFullYear() && datesOfCalendar[i].getMonth() == firstPickDate.getMonth() && datesOfCalendar[i].getDate() == firstPickDate.getDate()) {
          day.eq(i).addClass("calendar__date-start")

          firstPickCell = i;
        } else if (datesOfCalendar[i].getFullYear() == secondPickDate.getFullYear() && datesOfCalendar[i].getMonth() == secondPickDate.getMonth() && datesOfCalendar[i].getDate() == secondPickDate.getDate()) {
          day.eq(i).addClass("calendar__date-end")

          secondPickCell = i;
        } else if (firstPickDate < datesOfCalendar[i] && secondPickDate > datesOfCalendar[i]) {
          day.eq(i).addClass("calendar__date-range");
        }
      }
    }
    pickedDates = 2;
  } else if (pickedDates == 2) {    // 3 пик, новый выбор дат
    firstPickDate = datesOfCalendar[calendarCell];
    secondPickDate = null;

    day.removeClass("calendar__date-start");
    day.removeClass("calendar__date-end");
    day.removeClass("calendar__date-range");

    firstPickCell = calendarCell;
    day.eq(firstPickCell).addClass("calendar__date-first-pick");

    pickedDates = 1;
  }
  
  if (firstPickCell == secondPickCell) {
    day.removeClass("calendar__date-start");
    day.removeClass("calendar__date-end");
  }
  console.log(firstPickDate);
  console.log(secondPickDate);
}

function displayPickedDates(date, calendarCell) {    // Соотношение даты
  if (firstPickDate != null && secondPickDate != null) { // 1 и 2 даты выбраны
    if (firstPickDate.getFullYear() == date.getFullYear() && firstPickDate.getMonth() == date.getMonth() && firstPickDate.getDate() == date.getDate()) { // Отметка 1 выбранной даты
      day.eq(calendarCell).addClass("calendar__date-start");
    } else if (secondPickDate.getFullYear() == date.getFullYear() && secondPickDate.getMonth() == date.getMonth() && secondPickDate.getDate() == date.getDate()) {
      day.eq(calendarCell).addClass("calendar__date-end");
    } else if (firstPickDate < date && secondPickDate > date) {
      day.eq(calendarCell).addClass("calendar__date-range");
    }

  } else if (firstPickDate != null && secondPickDate == null) { // 1 дата выбрана, 2 - нет
    if (firstPickDate.getFullYear() == date.getFullYear() && firstPickDate.getMonth() == date.getMonth() && firstPickDate.getDate() == date.getDate()) { // Отметка 1 выбранной даты
      day.eq(calendarCell).addClass("calendar__date-first-pick");
    }
  }
}

function clearPickedDates() { // Очистка выбранных дат
  day.removeClass("calendar__date-first-pick")
  day.removeClass("calendar__date-start");
  day.removeClass("calendar__date-end");
  day.removeClass("calendar__date-range");
}