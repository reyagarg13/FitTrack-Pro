// meals.js
import { mealsData } from '../../data/mealsData.js';
import { loadMeals, saveMeals } from '../utilities/storage.js';
import { uid } from '../utilities/helpers.js';

let meals = {};

function initMeals(){
  const stored = loadMeals();
  meals = stored || JSON.parse(JSON.stringify(mealsData));
  saveMeals(meals);
}

function renderMeals(){
  ['Breakfast','Lunch','Dinner'].forEach(mealType=>{
    const ul = document.querySelector(`[data-meal-list="${mealType}"]`);
    ul.innerHTML = '';
    meals[mealType].forEach(m=>{
      const li = document.createElement('li');
      li.innerHTML = `<span>${m.name}</span><span>${m.calories} kcal <button data-id="${m.id}" data-meal="${mealType}" class="ml-2">Remove</button></span>`;
      ul.appendChild(li);
    });
  });
  recalcTotal();
}

function recalcTotal(){
  let total = 0;
  Object.values(meals).forEach(arr=> arr.forEach(m=> total += Number(m.calories)));
  document.getElementById('total-calories').textContent = `${total} kcal`;
}

function attachEvents(){
  document.querySelectorAll('.meal-form').forEach(form=>{
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const mealType = form.dataset.mealForm;
      const name = form.name.value.trim();
      const calories = Number(form.calories.value);
      if(!name || !calories || calories<=0) return;
      const item = { id: uid('m'), name, calories };
      meals[mealType].push(item);
      saveMeals(meals);
      renderMeals();
      form.reset();
    });
  });

  document.querySelectorAll('.meal-list').forEach(ul=>{
    ul.addEventListener('click',(e)=>{
      if(e.target.tagName === 'BUTTON'){
        const id = e.target.dataset.id;
        const mealType = e.target.dataset.meal;
        meals[mealType] = meals[mealType].filter(m=> m.id !== id);
        saveMeals(meals);
        renderMeals();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initMeals();
  renderMeals();
  attachEvents();
});
