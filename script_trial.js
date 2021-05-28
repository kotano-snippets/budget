const button = document.querySelector('.button');
const content = document.querySelector('.content');
const progressBar = document.querySelector('.meter__meter-progress');
const form = document.form;
const total = document.getElementsByClassName('.totalBudget');

class Observable {
    constructor(value) {
        this.value = value;
        this.subscriptions = [];
    }

    next(value) {
        this.value = value;
        this.subscriptions.forEach(fn => {
            fn(value);
        });
    }

    subscribe(fn) {
        this.subscriptions.push(fn);
    }
}

const categories = new Observable([]);

button.addEventListener('click', () => {

    const obj = {
        category: form.category.value,
        plan: Number(form.plan.value),
        spent: Number(form.spent.value),
        left: Number(form.plan.value - form.spent.value)
    };

    // if (obj.left <0) {
    //     console.log(`Внимание! Превышен лимит категории ${obj.category}`);
    // }

    // function limitAlert(categories) {
    //     let limit = ``;
    //     categories.forEach((item, id) => {
    //         if (obj.left <0) {
    //             limit +=`
    //             <div class "alert"> Внимание! Превышен лимит категории ${obj.category} </div>
    //             `;
    //     }
    //     });
    // }

    for (let field of form) {
        field.value = '';
    }

    categories.next([...categories.value, obj]);
});

function generateHtml(categories) {
    let html = ``;
    categories.forEach((item, id) => {
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


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('button-delete')) {
        const dataID = Number(e.target.getAttribute('data-id'));
        const filteredCategories = categories.value.filter((el, i) => {
            return i !== dataID;
        });
        categories.next(filteredCategories);
    }
});

document.addEventListener('change', function (e) {
    if (e.target.classList.contains('square__text-input')) {
        const data = e.target.getAttribute('data-id')
        const value = e.target.value
        const [field, id] = data.split('_');
        console.log(field, id);
        const elements = categories.value.map((el, i) => {
            if (i === Number(id)) {
                el[field] = value
                el.left = el.plan - el.spent
            }
            return el
        })
        categories.next(elements)
    }
})

categories.subscribe((items) => {
    const html = generateHtml(items);
    content.innerHTML = html;
    localStorage.setItem('cats', JSON.stringify(items));
});


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

const items = localStorage.getItem('cats');

if (items)
    categories.next(JSON.parse(items));
