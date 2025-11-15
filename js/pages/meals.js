// meals.js
import { mealsData } from '../../data/mealsData.js';
import { loadMeals, saveMeals } from '../utilities/storage.js';
import { uid } from '../utilities/helpers.js';

let meals = {};

function initMeals(){
  const stored = loadMeals();
  if(stored){
    meals = stored;
  } else {
    meals = JSON.parse(JSON.stringify(mealsData));
    // Don't save empty meals initially
  }
}

/**
 * Renders meals for all meal types with highlight animation for new items
 */
function renderMeals(highlightId = null){
  ['Breakfast','Lunch','Dinner'].forEach(mealType=>{
    const ul = document.querySelector(`[data-meal-list="${mealType}"]`);
    ul.innerHTML = '';
    
    if(!meals[mealType] || meals[mealType].length === 0){
      ul.innerHTML = '<li class="empty-state" style="justify-content:center;color:#94a3b8;font-style:italic;border:none;animation:fadeIn 400ms ease-out">📭 No meals added yet</li>';
      return;
    }
    
    meals[mealType].forEach((m, idx)=>{
      const li = document.createElement('li');
      li.className = 'meal-item';
      li.style.animation = `slideInLeft 400ms ease-out ${idx * 50}ms backwards`;
      
      // Highlight newly added meal
      if(m.id === highlightId){
        li.classList.add('meal-highlight');
        setTimeout(() => li.classList.remove('meal-highlight'), 2000);
      }
      
      li.innerHTML = `
        <span class="meal-name">${m.name}</span>
        <span class="meal-calories-wrapper">
          <strong class="meal-calories">${m.calories}</strong> kcal 
          <button data-id="${m.id}" data-meal="${mealType}" class="meal-delete-btn ml-2 transition-transform duration-200 hover:scale-125" title="Remove meal">🗑️</button>
        </span>
      `;
      ul.appendChild(li);
    });
  });
  recalcTotal();
}

/**
 * Recalculates total calories with animated pulse effect
 */
function recalcTotal(){
  let total = 0;
  Object.values(meals).forEach(arr=> arr.forEach(m=> total += Number(m.calories)));
  const el = document.getElementById('total-calories');
  
  // Animate value from current to new total
  const currentValue = parseInt(el.textContent) || 0;
  animateTotalCalories(el, currentValue, total);
  
  // Trigger pulse animation
  el.style.animation = 'none';
  setTimeout(()=> el.style.animation = 'pulse-calories 600ms ease-out', 10);
}

/**
 * Animates total calorie value smoothly
 * @param {HTMLElement} element - DOM element to update
 * @param {number} start - Starting value
 * @param {number} end - Target value
 */
function animateTotalCalories(element, start, end){
  const duration = 600;
  const startTime = performance.now();
  
  function update(currentTime){
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuad = 1 - Math.pow(1 - progress, 2);
    const current = Math.round(start + (end - start) * easeOutQuad);
    element.textContent = `${current} kcal`;
    
    if(progress < 1){
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

/**
 * Shows inline validation error with auto-dismiss
 * @param {HTMLElement} input - Input element with error
 * @param {string} message - Error message to display
 */
function showValidationError(input, message){
  // Remove existing error if present
  const existingError = input.parentElement.querySelector('.validation-error');
  if(existingError) existingError.remove();
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'validation-error text-red-500 text-xs mt-1 font-semibold';
  errorDiv.style.animation = 'shake 400ms ease-out';
  errorDiv.textContent = '⚠️ ' + message;
  
  input.parentElement.appendChild(errorDiv);
  input.classList.add('border-red-400', 'bg-red-50');
  input.focus();
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if(errorDiv.parentElement) {
      errorDiv.style.animation = 'fadeOut 300ms ease-out';
      setTimeout(() => errorDiv.remove(), 300);
    }
    input.classList.remove('border-red-400', 'bg-red-50');
  }, 3000);
}

/**
 * Attaches event listeners for forms and delete buttons
 */
function attachEvents(){
  // Form submissions with inline validation
  document.querySelectorAll('.meal-form').forEach(form=>{
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const mealType = form.dataset.mealForm;
      const nameInput = form.name;
      const caloriesInput = form.calories;
      const name = nameInput.value.trim();
      const calories = Number(caloriesInput.value);
      
      // Clear previous errors
      form.querySelectorAll('.validation-error').forEach(err => err.remove());
      nameInput.classList.remove('border-red-400', 'bg-red-50');
      caloriesInput.classList.remove('border-red-400', 'bg-red-50');
      
      // Validation with inline messages
      if(!name || name.length < 2){
        showValidationError(nameInput, 'Meal name must be at least 2 characters');
        return;
      }
      if(!calories || calories <= 0 || calories > 5000){
        showValidationError(caloriesInput, 'Calories must be between 1 and 5000');
        return;
      }
      
      const item = { id: uid('m'), name, calories };
      meals[mealType].push(item);
      saveMeals(meals);
      renderMeals(item.id); // Pass ID to highlight new item
      form.reset();
      
      // Show success toast
      const event = new CustomEvent('show-toast', {
        detail: { message: `✅ ${name} added to ${mealType}!`, type: 'success' }
      });
      window.dispatchEvent(event);
      
      // Focus back to name input for quick entry
      nameInput.focus();
    });
    
    // Real-time validation feedback
    form.name.addEventListener('input', (e) => {
      const error = e.target.parentElement.querySelector('.validation-error');
      if(error && e.target.value.trim().length >= 2){
        error.remove();
        e.target.classList.remove('border-red-400', 'bg-red-50');
      }
    });
    
    form.calories.addEventListener('input', (e) => {
      const error = e.target.parentElement.querySelector('.validation-error');
      const val = Number(e.target.value);
      if(error && val > 0 && val <= 5000){
        error.remove();
        e.target.classList.remove('border-red-400', 'bg-red-50');
      }
    });
  });

  // Delete buttons with confirmation
  document.querySelectorAll('.meal-list').forEach(ul=>{
    ul.addEventListener('click',(e)=>{
      if(e.target.tagName === 'BUTTON' && e.target.dataset.id){
        const id = e.target.dataset.id;
        const mealType = e.target.dataset.meal;
        const meal = meals[mealType].find(m => m.id === id);
        
        // Show confirmation modal or native confirm
        const confirmDelete = confirm(`Delete "${meal.name}" (${meal.calories} kcal)?\n\nThis action cannot be undone.`);
        
        if(confirmDelete){
          meals[mealType] = meals[mealType].filter(m=> m.id !== id);
          saveMeals(meals);
          
          // Animate removal
          const li = e.target.closest('.meal-item');
          if(li){
            li.style.animation = 'slideOutRight 300ms ease-out';
            setTimeout(() => renderMeals(), 300);
          } else {
            renderMeals();
          }
          
          // Show deletion toast
          const event = new CustomEvent('show-toast', {
            detail: { message: `🗑️ ${meal.name} removed`, type: 'info' }
          });
          window.dispatchEvent(event);
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initMeals();
  renderMeals();
  attachEvents();
});
