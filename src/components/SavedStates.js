// SavedStates.js

const STATES_STORAGE_KEY = "saved_states";

// Get the saved states from localStorage
export function getSavedStates() {
  const savedStatesJson = localStorage.getItem(STATES_STORAGE_KEY);
  return savedStatesJson ? JSON.parse(savedStatesJson) : [];
}

// Save a new state to localStorage
export function saveState(name, html, css, js) {
  const savedStates = getSavedStates();
  const newState = { name, html, css, js };
  savedStates.push(newState);
  localStorage.setItem(STATES_STORAGE_KEY, JSON.stringify(savedStates));
}

// Find a state object by its name
export function getStateByName(name) {
    const savedStates = getSavedStates();
    return savedStates.find((state) => state.name === name);
}
  
// Update an existing state by its name
export function updateStateByName(name, html, css, js) {
    const savedStates = getSavedStates();
    const index = savedStates.findIndex((state) => state.name === name);
    if (index !== -1) {
      // Modify the existing state object
      savedStates[index].html = html;
      savedStates[index].css = css;
      savedStates[index].js = js;
      // Save the modified states back to local storage
      localStorage.setItem(STATES_STORAGE_KEY, JSON.stringify(savedStates));
      return true; // Indicate success
    }
    return false; // Indicate failure (state not found)
}

// Update an existing state by its name
export function updateStatesName(oldName, newName) {
    const savedStates = getSavedStates();
    const index = savedStates.findIndex((state) => state.name === oldName);
    if (index !== -1) {
      // Modify the existing state object
      savedStates[index].name = newName;
      // Save the modified states back to local storage
      localStorage.setItem(STATES_STORAGE_KEY, JSON.stringify(savedStates));
      return true; // Indicate success
    }
    return false; // Indicate failure (state not found)
}

// Delete a saved state from localStorage
export function deleteState(index) {
  const savedStates = getSavedStates();
  savedStates.splice(index, 1);
  localStorage.setItem(STATES_STORAGE_KEY, JSON.stringify(savedStates));
}
