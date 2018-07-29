/**
 * Quiz
 * Dependencies:
 * - jQuery
 * - Redux.js
 * - Handlebars.js
 *
 * @namespace Quiz
 *
 */

window.theme = window.theme || {};

theme.Quiz = (function() {
  // Quiz constructor
  function Quiz(quizData) {
    /**
     * Private variables and methods
     */

    /**
     * Redux logger
     * @param {Object} store
     * @returns {Function}
     * @private
     */
    function _logger(store) {
      return function(next) {
        return function(action) {
          console.log("dispatching", action);
          var result = next(action);
          console.log("next state", store.getState());
          return result;
        };
      };
    }

    /**
     * Root reducer
     * Actions: SELECTED, NEXT, PREV
     * @param {Object} state
     * @param {Object} action
     * @returns {Object}
     * @private
     */
    function _rootReducer(state, action) {
      // Initial state
      var state = state || {
        past: [],
        current: {
          selected: [],
          current_question_index: 1,
          show_result: false
        },
        future: []
      };

      // Copy the original state, so we don't modify the original state
      var newState = _copy(state);

      switch (action.type) {
        /** Select option */
        case _actions.SELECT:
          // Update `newState.current.selected` value based on `action.data`
          newState.current.selected = _updateCurrentSelected(
            newState.current.selected,
            action.data.questionIndex,
            action.data.optionIndex
          );
          // Push `newState.current` to `newState.past`
          newState.past.push(_copy(newState.current));
          // Get the next question index and update `newState.current.current_question_index`
          newState.current.current_question_index = _getNextQuestionIndex(
            action.data.questionIndex + 1,
            newState.current.selected
          );
          // Check if the new question exists. if it doesn't, show the result
          newState.current.show_result =
            newState.current.current_question_index >= _data.questions.length
              ? true
              : false;
          // Remove the first item of `newState.future`, if it exists
          if (newState.future.length) {
            newState.future.shift();
          }
          return newState;

        /** View the next step */
        case _actions.NEXT:
          // Push `newState.current` to `newState.past`
          newState.past.push(_copy(newState.current));
          // Set `newState.current` to be the first item of `newState.future`
          newState.current = newState.future[0];
          // Remove the first item from `newState.future`
          newState.future.shift();
          return newState;

        /** View the previous step */
        case _actions.PREV:
          // Add 'newState.current' to the begging of `newState.future`
          newState.future.unshift(_copy(newState.current));
          // Set the `newState.current` to be the last item of `newState.past`
          newState.current = newState.past[newState.past.length - 1];
          // Remove the last item from `newState.past`
          newState.past.pop();
          return newState;

        /** Default action */
        default:
          return newState;
      }
    }

    /**
     * Get the next question index
     * This is a helper function used in `_rootReducer`
     * @param {Number} nextIndex
     * @param {Array} selected
     * @returns {Number}
     * @private
     */
    function _getNextQuestionIndex(nextIndex, selected) {
      // If there is no more question, we set the hidesOn to be an empty array
      var hidesOn = _data.questions[nextIndex]
        ? _data.questions[nextIndex].hides_on
        : [];
      // If any of the selected options exists in hidesOn, check the next question
      if (_intersection(hidesOn, selected).length) {
        return _getNextQuestionIndex(nextIndex + 1, selected);
      } else {
        return nextIndex;
      }
    }

    /**
     * Replace an existing current selected option with the new one
     * or append the new one at the end
     * This is a helper function used in `_rootReducer`
     * @param {Array} selected
     * @param {String} newOption
     * @private
     */
    function _updateCurrentSelected(selected, questionIndex, optionIndex) {
      var newItem = questionIndex + ":" + optionIndex;

      // If this item's source question already exists in selected, replace it with the new one
      var newSelected = selected.map(function(item) {
        var selectedQuestionIndex = parseInt(item.split(":")[0]);
        return selectedQuestionIndex == questionIndex ? newItem : item;
      });

      // If this item's source question doesn't exist in selected, append it to the end
      if (newSelected.indexOf(newItem) == -1) {
        newSelected.push(newItem);
      }

      return newSelected;
    }

    /**
     * Create Redux store
     * @returns {Object}
     * @privatre
     */
    function _createStore() {
      // Create and return store
      return Redux.createStore(
        _rootReducer,
        _initialReduxState,
        Redux.applyMiddleware(_logger)
      );
    }

    /**
     * Get the quiz result based on current selected
     * This is a helper function used in `_setViewState`
     * @param {Object} reduxState
     * @private
     */
    _getResult = function(reduxState) {
      var result = _data.results.filter(function(result) {
        var stringifiedCombo = result.combo.map(function(combo) {
          return JSON.stringify(combo);
        });
        var stringifiedSelected = JSON.stringify(reduxState.current.selected);

        return stringifiedCombo.indexOf(stringifiedSelected) != -1;
      })[0];

      return result ? result : _data.default_result;
    };

    /**
     * Set the view state based on the redux state
     * @param {Object} reduxState
     * @returns {Object}
     * @private
     */
    function _setViewState(reduxState) {
      // If there is no availabel question and we want to show the result
      if (reduxState.current.show_result) {
        return {
          showResult: true,
          result: _getResult(reduxState)
        };
      }

      // If the next question is available
      var currentQuestionIndex = reduxState.current.current_question_index;
      var questionData = _data.questions[currentQuestionIndex];
      var options = questionData.options.map(function(option, index) {
        return {
          // Option value
          value: option,
          // This is used to determin if the current option is selected
          selected:
            currentQuestionIndex + ":" + index ==
            reduxState.current.selected[reduxState.current.selected.length - 1]
        };
      });

      return {
        showResult: false,
        question: {
          title: questionData.title,
          options: options,
          index: currentQuestionIndex
        },
        disablePrev: !reduxState.past.length,
        disableNext: !reduxState.future.length
      };
    }

    /**
     * Deep copy data
     * This is a helper function
     * @param {*} data
     * @returns {*}
     * @private
     */
    function _copy(data) {
      return JSON.parse(JSON.stringify(data));
    }

    /**
     * Get the intersection of two arrays
     * This is a helper function
     * @param {Array} arr1
     * @param {Array} arr2
     * @returns {*}
     * @private
     */
    function _intersection(arr1, arr2) {
      return arr1.filter(function(item) {
        return arr2.indexOf(item) != -1;
      });
    }

    /**
     * Store all question data and results map
     * @private
     */
    var _data = quizData;

    /**
     * Initial Redux state
     * @private
     */
    var _initialReduxState = {
      past: [],
      current: { selected: [], current_question_index: 0, show_result: false },
      future: []
    };

    /**
     * Action constants
     * @private
     */
    var _actions = { SELECT: "SELECT", PREV: "PREV", NEXT: "NEXT" };

    /**
     * View state used to render the view
     * @private
     */
    var _viewState = _setViewState(_initialReduxState);

    /**
     * Public variables and methods
     */

    /**
     * Redux store
     * @public
     */
    this.store = _createStore();

    /**
     * Dispatch actions
     * @param {Object} action
     * @public
     */
    this.dispatch = function(action) {
      if (_actions[action.type]) {
        this.store.dispatch(action);
      } else {
        throw "Unrecognized action type: " + action.type;
      }
    };

    /**
     * Update view state
     * @param {Object} reduxState
     * @public
     */
    this.updateViewState = function(reduxState) {
      _viewState = _setViewState(reduxState);
    };

    /**
     * Get a deep copy of the view state
     * @returns {Object}
     * @public
     */
    this.getViewState = function() {
      return _copy(_viewState);
    };
  }

  /**
   * Init quiz
   * @param {Object} options - Pass in custom options
   */
  function init(options) {
    // Default options
    var defaultOptions = {
      quizWrapperSelector: "#QuizWrapper",
      templateSelector: "#QuizTemplate",
      quizDataSelector: "#QuizData"
    };

    // Extend the default options
    if (options) {
      $.extend(defaultOptions, options);
    }

    // Cache some variables
    var $container = $(defaultOptions.quizWrapperSelector),
      source = $(defaultOptions.templateSelector).html(),
      template = Handlebars.compile(source),
      config = JSON.parse($(defaultOptions.quizDataSelector).html()),
      quiz = new Quiz(config);

    /**
     * Render the UI
     */
    function renderView() {
      var data = quiz.getViewState();

      // Append the HTML
      $container.empty().append(template(data));
    }

    /**
     * Bind action listeners
     */
    function bindListeners() {
      // Select option
      $(document.body).on("click", ".quiz__option span", function(evt) {
        var optionIndex = $(evt.target).data("index"),
          questionIndex = $(evt.target)
            .closest(".quiz")
            .data("index");

        // Dispatch the SELECT action
        quiz.store.dispatch({
          type: "SELECT",
          data: {
            optionIndex: optionIndex,
            questionIndex: questionIndex
          }
        });
      });

      // Got to the previous question
      $(document.body).on("click", ".quiz__prev", function(evt) {
        if ($(evt.target).hasClass("disabled")) {
          return;
        }

        // Dispatch the PREV action
        quiz.store.dispatch({
          type: "PREV"
        });
      });

      // Got to the next question
      $(document.body).on("click", ".quiz__next", function(evt) {
        if ($(evt.target).hasClass("disabled")) {
          return;
        }

        // Dispatch the NEXT action
        quiz.store.dispatch({
          type: "NEXT"
        });
      });
    }

    /**
     * Get product from the AjaxAPI
     *
     * @param {String} productHandle
     * @param {Function} callback
     * @returns {Promise}
     */
    function getProduct(productHandle, callback) {
      var params = {
        methods: "get",
        url: "/products/" + productHandle + ".js",
        dataType: "json",
        success: function(product) {
          console.log(product);
          if (typeof callback == "function") {
            callback(product);
          }
        }
      };

      return $.when($.ajax(params));
    }

    // Listen for actions
    bindListeners();

    // Update the UI every time the store is changed
    quiz.store.subscribe(function() {
      // Update state
      quiz.updateViewState(quiz.store.getState());

      // Renderview
      renderView();
    });

    // Render the first view on load
    renderView();
  }

  return {
    init: init
  };
})();

$(function() {
  theme.Quiz.init();
});
