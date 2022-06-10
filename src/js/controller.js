import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    //update to selected item
    resultsView.update(model.loadResultsPerPage());
    bookmarksView.update(model.state.bookmark);
    //loading recipe
    await model.loadRecipe(id);
    //rendering recipe
    recipeView.render(model.state.recipe);
    //controlServings();
  } catch (err) {
    //alert(err);

    recipeView.renderError();
  }
};

const controlLoadSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //console.log(resultsView);
    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);
    //console.log(model.state.search.results);
    //resultsView.render(model.state.search.results);
    resultsView.render(model.loadResultsPerPage());
    //resultsperPage
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPageClick = function (goToPage) {
  console.log(goToPage);
  resultsView.render(model.loadResultsPerPage(goToPage));
  paginationView.render(model.state.search);
};
const controlServings = function (newServings) {
  //update servings
  model.updateServings(newServings);
  //render new servingss
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmark);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmark);
};

const controlAddRecipe = async function (recipeData) {
  //console.log(recipeData);
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(recipeData);
    console.log(model.state.recipe);
    recipeView.render(model.state.recipe);
    bookmarksView.render(model.state.bookmark);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //recipeView.renderMessage();
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRenderer(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlLoadSearchResults);
  paginationView.handlerClick(controlPageClick);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
