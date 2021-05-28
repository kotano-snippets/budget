const button = document.querySelector('.button');
const content = document.querySelector('.content');
const progressBar = document.querySelector('.meter__meter-progress');
const form = document.form;
const total = document.getElementsByClassName('.totalBudget');



// Создаем класс Observable, который принимает значение value
// с методами next
class Observable {
    constructor(value) {
        this.value = value;
        this.subscriptions = [];
    }

    // next сохраняет новое значение value и
    // и выполняет вычисления для каждой функции в subscriptions
    next(value) {
        this.value = value;
        this.subscriptions.forEach(fn => {
            fn(value);
        });
    }

    // метод для добавления нового обработчика для элементов
    subscribe(fn) {
        this.subscriptions.push(fn);
    }
}

/// создаем экземпляр класса Observable
const categories = new Observable([]);


/// повесим обработчик на кнопку +
button.addEventListener('click', () => {

    const obj = {
        category: form.category.value,
        plan: Number(form.plan.value),
        spent: Number(form.spent.value),
        left: Number(form.plan.value - form.spent.value)
    };

    // очищаем все поля ввода в форме
    for (let field of form) {
        field.value = '';
    }
    // обновляем данные в категориях
    categories.next([...categories.value, obj]);
});

// Создаем интерфейс для категорий
function generateHtml(categories) {
    let html = ``;
    categories.forEach((item, id) => {
        // Создаем теги для отображения информации о категориях
        // сохраняем идентификаторы в аттрибуте data-id
        // если в категории мы потратили больше, чем запланировали, то выводим предупреждение
        html = `
                <div class="row">
                    <div class="col-3">
                        <div class="square"><input data-id="category_${id}" class="square__text square__text-input square__text--y" value="${item.category}"></div>
                    </div>
                    <div class="col-3">
                        <div class="square"><input data-id="plan_${id}" class="square__text square__text-input square__text--y" value="${item.plan}"></div>
                    </div>
                    <div class="col-3">
                        <div class="square"><input data-id="spent_${id}" class="square__text square__text-input square__text--y" value="${item.spent}"></div>
                    </div>
                    <div class="col-2">
                        <div class="square"><p class="square__text square__text--y">${item.left}</p></div>
                    </div>
                    <div class="col-1">
                        <button class="button-delete" style="margin: auto" data-id="${id}"><img class="button-delete" data-id="${id}" src="delete.png"> </button>
                    </div>
                </div>
                ${(item.plan < item.spent) ? '<div className="row" style="color: red">Лимит бюджета на ' + item.category + ' превышен </div>' : ''}
            `;
    });
    return html;
}


// добавляем обработчик кликов на кнопки удаления категорий
document.addEventListener('click', (e) => {
    /// Если "кликнутый" элемент содержит класс `button-delete`
    /// то удаляем его из объека categories
    if (e.target.classList.contains('button-delete')) {
        const dataID = Number(e.target.getAttribute('data-id'));
        const filteredCategories = categories.value.filter((el, i) => {
            return i !== dataID;
        });
        categories.next(filteredCategories);
    }
});


// при изменении значения существующих категорий...
document.addEventListener('change', function (e) {
    /// если измененный элемент содержит класс `square__text-input`
    if (e.target.classList.contains('square__text-input')) {
        const data = e.target.getAttribute('data-id')
        const value = e.target.value
        /// деструктурируем данные из data-аттрибута
        const [field, id] = data.split('_');
        console.log(field, id);
        /// сохраним измененные данные в массиве
        const elements = categories.value.map((el, i) => {
            if (i === Number(id)) {
                el[field] = value
                el.left = el.plan - el.spent
            }
            return el
        })
        /// обновим
        categories.next(elements)
    }
})

// добавим обработчик для отрисовки изменений
categories.subscribe((items) => {
    const html = generateHtml(items);
    content.innerHTML = html;
    // сохраним в локальном хранилище
    localStorage.setItem('cats', JSON.stringify(items));
});


// обновим значение progressBar
categories.subscribe((items) => {
    const sumTotal = items.reduce((acc, budget) => {
        return acc + budget.plan;
    }, 0);

    const sumSpent = items.reduce((acc, budget) => {
        return acc + budget.spent;
    }, 0);


    const progress = (sumSpent / sumTotal);
    progressBar.style.width = (progress * 100) + '%';
});

// получим значения из локального хранилища
const items = localStorage.getItem('cats');

// если данные ранее были сохранены, то загрузим их в память
if (items)
    categories.next(JSON.parse(items));
