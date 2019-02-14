(function () {
  // Define user actions
  const actions = {
    openMenu () {
      return {
        type: 'OPEN_MENU'
      }
    },
    closeMenu () {
      return {
        type: 'CLOSE_MENU'
      }
    },
    goToPage (index) {
      return {
        type: 'CHANGE_PAGE',
        payload: {
          index: index || 0
        }
      }
    }
  }

  // START - General functions
  function createDispatcher (reducer, store, emitter) {
    return function dispatch (action) {
            // Make sure we have a valid action object
      action = action || { type: 'PASS_THROUGH' };
      if (action.type === undefined) {
        action.type = 'PASS_THROUGH';
      }

      // Update the store
      store = reducer(store, action);

      // Emit event
      emitter.emitEvent(action.type, [store]); 
    }
  }

  function createIndexMarkup (index, dispatch) {
    const visibleIndex = index + 1;
    const indexDiv = document.createElement('div');

    indexDiv.className = index === 0 ? 'index__number active' : 'index__number';
    indexDiv.textContent = visibleIndex > 9 ? '0' + visibleIndex : '' + visibleIndex;
    indexDiv.addEventListener('click', function handleClickIndex (event) {
      dispatch(actions.goToPage(index));
    });

    return indexDiv;
  }

  function buildPageIndices (pages, dispatch) {
    const indexContainer = document.getElementById('pageIndices');

    const fragment = pages.reduce((fragment, currentPage, index) => {
      fragment.appendChild(createIndexMarkup(index, dispatch));
      return fragment;
    }, document.createDocumentFragment());

    indexContainer.innerHTML = '';
    indexContainer.appendChild(fragment);
  }
  // END - General functions

  // Define site state
  const state = {
    menu: false,
    pages: Array.from(document.querySelectorAll('.page') || []),
    currentPage: 0,
  };

  // Define state reducer function
  function reducer (state, action) {
    switch (action.type) {
      case 'OPEN_MENU':
        return {
          ...state,
          menu: true
        }
      case 'CLOSE_MENU':
        return {
          ...state,
          menu: false
        }
      case 'CHANGE_PAGE':
        return {
          ...state,
          currentPage: action.payload.index
        }
      default:
        return state;
    }
  }

  // Define functions to update the view
  function handleMenu(visibility) {
    // Execute code to show menu
    console.log('Setting menu visibility to ', visibility);
    document.getElementById('menuDrawer').style.display = visibility ? 'block' : 'none';
  }

  function handleUpdatePage (index) {
    console.log('Let\'s go to page ' + index);
  }


  //
  // Run code when window loads
  //

  console.log('Houston, we have javascript');

  // Create state dispatcher
  const emitter = new EventEmitter();
  const dispatch = createDispatcher(reducer, state, emitter);
  
  buildPageIndices(state.pages, dispatch);

  // Bind user interactions to actions
  document.getElementById('menuToggle').addEventListener('click', function () { dispatch(actions.openMenu()) });
  document.getElementById('menuClose').addEventListener('click', function () { dispatch(actions.closeMenu()) });

  // Bind actions to behaviour
  emitter.addListener('OPEN_MENU', function (state) {
    handleMenu(state.menu);
  });
  emitter.addListener('CLOSE_MENU', function (state) {
    handleMenu(state.menu);
  });
  emitter.addListener('CHANGE_PAGE', function (state) {
    handleUpdatePage(state.currentPage);
  })
}());
