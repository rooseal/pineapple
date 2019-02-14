(function () {
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
  // END - General functions

  // Define site state
  const state = {
    menu: false
  };

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
    }
  }

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


  //
  // Run code when window loads
  //

  console.log('Houston, we have javascript');

  // Create state dispatcher
  const emitter = new EventEmitter();
  const dispatch = createDispatcher(reducer, state, emitter);
  
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
}());
