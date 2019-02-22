(function () {
  // Define user actions
  var actions = {
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
    },
    init (initialState) {
      return {
        type: 'INIT',
        payload: {
          initialState
        }
      }
    },
    showFooter () {
      return {
        type: 'SHOW_FOOTER'
      }
    },
    hideFooter () {
      return {
        type: 'HIDE_FOOTER'
      }
    },
    setScrolling (isScrolling) {
      return {
        type: 'SET_SCROLLING',
        payload: {
          isScrolling
        }
      }
    }
  }

  // Define site state
  var state = {
    menu: false,
    footer: false,
    isScrolling: false,
    pages: [],
    currentPage: 0,
  };

  // START - General functions
  function createDispatcher (reducer, emitter) {
    return function dispatch (action) {
            // Make sure we have a valid action object
      action = action || { type: 'PASS_THROUGH' };
      if (action.type === undefined) {
        action.type = 'PASS_THROUGH';
      }

      // Update the store
      state = reducer(state, action);

      // Emit event
      emitter.emitEvent(action.type, [state]); 
    }
  }

  function createIndexMarkup (activeIndex, index, dispatch) {
    var visibleIndex = index + 1;
    var indexDiv = document.createElement('div');

    indexDiv.className = index === activeIndex ? 'index__number active' : 'index__number';
    indexDiv.textContent = visibleIndex > 9 ? '0' + visibleIndex : '' + visibleIndex;
    indexDiv.addEventListener('click', function handleClickIndex (event) {
      dispatch(actions.goToPage(index));
    });

    return indexDiv;
  }

  function buildPageIndices (activeIndex, pages, dispatch) {
    var indexContainer = document.getElementById('pageIndices');

    var fragment = pages.reduce((fragment, currentPage, index) => {
      fragment.appendChild(createIndexMarkup(activeIndex, index, dispatch));
      return fragment;
    }, document.createDocumentFragment());

    indexContainer.innerHTML = '';
    indexContainer.appendChild(fragment);
  }

  function throttleAction (speed) {
    var state = {
      action: undefined,
      handle: undefined
    }

    speed = speed || 200; // Set default throttle speed

    return function throttler (fn) {
      state.action = fn;

      if (state.handle === undefined) {

        state.handle = setTimeout(function () {
          clearInterval(state.handle);
          state.handle = undefined;
        }, speed);

        state.action();
        state.action = undefined;
      }
    }
  }
  // END - General functions

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
      case 'SHOW_FOOTER':
        return {
          ...state,
          footer: true
        }
      case 'HIDE_FOOTER':
        return {
          ...state,
          footer: false
        }
      case 'INIT':
        return {
          ...state,
          ...action.payload.initialState
        }
      case 'SET_SCROLLING':
        return {
          ...state,
          isScrolling: action.payload.isScrolling
        }
      default:
        return state;
    }
  }

  // Define functions to update the view
  function handleMenu(visibility) {
    // Execute code to show menu
    var menuDrawer = document.getElementById('menuDrawer');

    if (visibility) {
      menuDrawer.style.marginRight = '-' + menuDrawer.offsetWidth + 'px';
      menuDrawer.style.display = 'block';
      menuDrawer.style.marginRight = 0;
    } else {
      menuDrawer.style.marginRight = '-' + menuDrawer.offsetWidth + 'px';
    }
  }

  function handleUpdateControls (index, pages) {
    if (index <= 0) {
      document.getElementById('previousPage').style.display = 'none';
    } else {
      document.getElementById('previousPage').style.display = 'block';
    }

    if (index >= pages.length - 1) {
      document.getElementById('nextPage').style.display = 'none';
    } else {
      document.getElementById('nextPage').style.display = 'block';
    }
  }

  function handleUpdatePage (index, pages, dispatch) {
    var speed = 20;
    var direction;

    
    // Set isScrolling state to indicate scroll action is happening
    dispatch(actions.setScrolling(true));

    // Update scroll position
    var target = pages[index].offsetTop;

    (function animatedScroll (source) {
      requestAnimationFrame(function () {
        if (source < target) {
          direction = 'down';
        } else {
          direction = 'up';
        }
  
        var newPosition = direction === 'down' ? source + speed : source - speed;
        // console.log('Scroll from ' + source + ' ' + direction + ' to ' + newPosition  + ' at ' + speed + ' speed');
  
        if ((direction === 'down' && newPosition >= target) || (direction === 'up' && newPosition <= target)) {
          window.scrollTo(0, target);
          
          dispatch(actions.setScrolling(false));
        } else {
          window.scrollTo(0, newPosition);
          animatedScroll(newPosition);
        }
      })
    })(window.scrollY);

    // Update active page index
    document.querySelectorAll('.index__number').forEach(function (currentElement, currentIndex) {
      if (currentIndex === index) {
        currentElement.className = 'index__number active';
      } else {
        currentElement.className = 'index__number';
      }
    });

    handleUpdateControls(index, pages);
  }

  function handleFooter (showFooter) {
    // document.querySelector('footer').style.bottom = showFooter ? '0' : '100%';
    var speed = 50;
    var direction;

    var element = document.querySelector('footer');
    var controls = document.getElementById('pageControls');
    var indices = document.getElementById('pageIndices');

    var target = showFooter ? element.offsetHeight : 0;
    var start = Number(element.style.marginTop.replace(/\D/g, ''));

    // Make sure the lower hud elements are hidden when the footer pops up so they don't interfere
    if (showFooter) {
      controls.style.display = 'none';
      indices.style.display = 'none';
    } else {
      controls.style.display = 'block';
      indices.style.display = 'block';
    }

    // Update scroll position
    (function animatedScroll (source) {
      requestAnimationFrame(function () {
        if (source < target) {
          direction = 'down';
        } else {
          direction = 'up';
        }
  
        var newPosition = direction === 'down' ? source + speed : source - speed;
  
        if ((direction === 'down' && newPosition >= target) || (direction === 'up' && newPosition <= target)) {
          element.style.marginTop = '-' + target + 'px';
          // console.log('We are there');
        } else {
          element.style.marginTop = '-' + newPosition + 'px';
          animatedScroll(newPosition);
        }
      })
    })(start);
  }

  // This code get's executed when the site loads.
  function initApp ({ dispatch }) {
    var pages = Array.from(document.querySelectorAll('.page'));

    console.log({ windowScroll: window.scrollY });

    // Init the state
    dispatch(actions.init({
      pages,
      currentPage: pages.findIndex(currentPage => {
        console.log({ offset: currentPage.offsetTop })
        return currentPage.offsetTop === Math.round(window.scrollY)
      })
    }));
  }

  //
  // Run code when window loads
  //

  console.log('Houston, we have javascript');
  // Create state dispatcher
  var emitter = new EventEmitter();
  var dispatch = createDispatcher(reducer, emitter);

  // Bind user interactions to actions
  document.getElementById('menuToggle').addEventListener('click', function () { dispatch(actions.openMenu()) });
  document.getElementById('menuClose').addEventListener('click', function () { dispatch(actions.closeMenu()) });
  document.getElementById('previousPage').addEventListener('click', function () {
    if (state.footer) {
      dispatch(actions.hideFooter());
    } else {
      dispatch(actions.goToPage(Math.max(state.currentPage - 1, 0)));
    }
  });
  document.getElementById('nextPage').addEventListener('click', function () {
    console.log({ state })
    if (state.currentPage + 1 >= state.pages.length) {
      dispatch(actions.showFooter());
    } else {
      dispatch(actions.goToPage(state.currentPage + 1));
    }
  });
  
  // Add custom scroll behviour
  var throttleScroll = throttleAction(1000);
  window.addEventListener('wheel', function (event) {
    event.preventDefault();

    if (!state.menu) {
      throttleScroll(function () {
        // console.log('Scrolled ', event.wheelDeltaY > 0 ? 'up' : 'down')
        if (event.wheelDeltaY > 0) {
          if (state.footer) {
            dispatch(actions.hideFooter());
          } else {
            dispatch(actions.goToPage(Math.max(state.currentPage - 1, 0)));
          }
        } else {
          // console.log('Scroll down from ' + state.currentPage + ' in ' + state.pages.length)
          if (state.currentPage + 1 >= state.pages.length) {
            dispatch(actions.showFooter());
          } else {
            dispatch(actions.goToPage(state.currentPage + 1));
          }
        }
      });
    }
  });

  // Bind actions to behaviour
  emitter.addListener('OPEN_MENU', function (state) {
    handleMenu(state.menu);
  });
  emitter.addListener('CLOSE_MENU', function (state) {
    handleMenu(state.menu);
  });
  emitter.addListener('SHOW_FOOTER', function (state) {
    handleFooter(state.footer);
  });
  emitter.addListener('HIDE_FOOTER', function (state) {
    handleFooter(state.footer);
  });
  emitter.addListener('CHANGE_PAGE', function (state) {
    handleUpdatePage(state.currentPage, state.pages, dispatch);
  });
  emitter.addListener('INIT', function (state) {
    console.log({ state });
    handleUpdateControls(state.currentPage, state.pages);
    buildPageIndices(state.currentPage, state.pages, dispatch);
  });

  initApp({ dispatch, emitter });
}());
