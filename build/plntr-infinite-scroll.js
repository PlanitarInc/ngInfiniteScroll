/* plntr-infinite-scroll - v1.2.2 - 2016-11-16 */
var mod;

mod = angular.module('plntr-infinite-scroll', []);

mod.value('THROTTLE_MILLISECONDS', null);

mod.directive('plntrInfiniteScroll', [
  '$rootScope', '$window', '$interval', 'THROTTLE_MILLISECONDS', function($rootScope, $window, $interval, THROTTLE_MILLISECONDS) {
    return {
      scope: {
        plntrInfiniteScroll: '&',
        plntrInfiniteScrollContainer: '=',
        plntrInfiniteScrollDistance: '=',
        plntrInfiniteScrollDisabled: '=',
        plntrInfiniteScrollUseDocumentBottom: '=',
        plntrInfiniteScrollListenForEvent: '@',
        plntrInfiniteScrollDirection: '='
      },
      link: function(scope, elem, attrs) {
        var changeContainer, checkInterval, checkWhenEnabled, container, handleInfiniteScrollContainer, handleInfiniteScrollDisabled, handleInfiniteScrollDistance, handleInfiniteScrollUseDocumentBottom, handler, height, immediateCheck, offsetLeft, offsetTop, pageXOffset, pageYOffset, scrollDistance, scrollEnabled, throttle, unregisterEventListener, useDocumentBottom, width, windowElement;
        windowElement = angular.element($window);
        scrollDistance = null;
        scrollEnabled = null;
        checkWhenEnabled = null;
        container = null;
        immediateCheck = true;
        useDocumentBottom = false;
        unregisterEventListener = null;
        checkInterval = false;
        height = function(elem) {
          elem = elem[0] || elem;
          if (isNaN(elem.offsetHeight)) {
            return elem.document.documentElement.clientHeight;
          } else {
            return elem.offsetHeight;
          }
        };
        width = function(elem) {
          elem = elem[0] || elem;
          if (isNaN(elem.offsetWidth)) {
            return elem.document.documentElement.clientWidth;
          } else {
            return elem.offsetWidth;
          }
        };
        offsetTop = function(elem) {
          if (!elem[0].getBoundingClientRect) {
            return;
          }
          return elem[0].getBoundingClientRect().top + pageYOffset(elem);
        };
        offsetLeft = function(elem) {
          if (!elem[0].getBoundingClientRect) {
            return;
          }
          return elem[0].getBoundingClientRect().left + pageXOffset(elem);
        };
        pageYOffset = function(elem) {
          elem = elem[0] || elem;
          if (isNaN(window.pageYOffset)) {
            return elem.document.documentElement.scrollTop;
          } else {
            return elem.ownerDocument.defaultView.pageYOffset;
          }
        };
        pageXOffset = function(elem) {
          elem = elem[0] || elem;
          if (isNaN(window.pageXOffset)) {
            return elem.document.documentElement.scrollLeft;
          } else {
            return elem.ownerDocument.defaultView.pageXOffset;
          }
        };
        handler = function() {
          var containerEnd, containerLeftOffset, containerTopOffset, elementEnd, remaining, shouldScroll;
          if (scope.plntrInfiniteScrollDirection === 'vertical') {
            if (container === windowElement) {
              containerEnd = height(container) + pageYOffset(container[0].document.documentElement);
              elementEnd = offsetTop(elem) + height(elem);
            } else {
              containerEnd = height(container);
              containerTopOffset = 0;
              if (offsetTop(container) !== void 0) {
                containerTopOffset = offsetTop(container);
              }
              elementEnd = offsetTop(elem) - containerTopOffset + height(elem);
            }
          } else if (scope.plntrInfiniteScrollDirection === 'horizontal') {
            if (container === windowElement) {
              containerEnd = width(container) + pageXOffset(container[0].document.documentElement);
              elementEnd = offsetLeft(elem) + width(elem);
            } else {
              containerEnd = width(container);
              containerLeftOffset = 0;
              if (offsetLeft(container) !== void 0) {
                containerLeftOffset = offsetLeft(container);
              }
              elementEnd = offsetLeft(elem) - containerLeftOffset + width(elem);
            }
          }
          if (useDocumentBottom) {
            elementEnd = height((elem[0].ownerDocument || elem[0].document).documentElement);
          }
          remaining = elementEnd - containerEnd;
          shouldScroll = remaining <= height(container) * scrollDistance + 1;
          if (shouldScroll) {
            checkWhenEnabled = true;
            if (scrollEnabled) {
              if (scope.$$phase || $rootScope.$$phase) {
                return scope.plntrInfiniteScroll();
              } else {
                return scope.$apply(scope.plntrInfiniteScroll);
              }
            }
          } else {
            if (checkInterval) {
              $interval.cancel(checkInterval);
            }
            return checkWhenEnabled = false;
          }
        };
        throttle = function(func, wait) {
          var later, previous, timeout;
          timeout = null;
          previous = 0;
          later = function() {
            previous = new Date().getTime();
            $interval.cancel(timeout);
            timeout = null;
            return func.call();
          };
          return function() {
            var now, remaining;
            now = new Date().getTime();
            remaining = wait - (now - previous);
            if (remaining <= 0) {
              $interval.cancel(timeout);
              timeout = null;
              previous = now;
              return func.call();
            } else {
              if (!timeout) {
                return timeout = $interval(later, remaining, 1);
              }
            }
          };
        };
        if (THROTTLE_MILLISECONDS != null) {
          handler = throttle(handler, THROTTLE_MILLISECONDS);
        }
        scope.$on('$destroy', function() {
          container.unbind('scroll', handler);
          if (unregisterEventListener != null) {
            unregisterEventListener();
            unregisterEventListener = null;
          }
          if (checkInterval) {
            return $interval.cancel(checkInterval);
          }
        });
        handleInfiniteScrollDistance = function(v) {
          return scrollDistance = parseFloat(v) || 0;
        };
        scope.$watch('plntrInfiniteScrollDistance', handleInfiniteScrollDistance);
        handleInfiniteScrollDistance(scope.plntrInfiniteScrollDistance);
        handleInfiniteScrollDisabled = function(v) {
          scrollEnabled = !v;
          if (scrollEnabled && checkWhenEnabled) {
            checkWhenEnabled = false;
            return handler();
          }
        };
        scope.$watch('plntrInfiniteScrollDisabled', handleInfiniteScrollDisabled);
        handleInfiniteScrollDisabled(scope.plntrInfiniteScrollDisabled);
        handleInfiniteScrollUseDocumentBottom = function(v) {
          return useDocumentBottom = v;
        };
        scope.$watch('plntrInfiniteScrollUseDocumentBottom', handleInfiniteScrollUseDocumentBottom);
        handleInfiniteScrollUseDocumentBottom(scope.plntrinfiniteScrollUseDocumentBottom);
        changeContainer = function(newContainer) {
          if (container != null) {
            container.unbind('scroll', handler);
          }
          container = newContainer;
          if (newContainer != null) {
            return container.bind('scroll', handler);
          }
        };
        changeContainer(windowElement);
        if (scope.plntrInfiniteScrollListenForEvent) {
          unregisterEventListener = $rootScope.$on(scope.plntrInfiniteScrollListenForEvent, handler);
        }
        handleInfiniteScrollContainer = function(newContainer) {
          if ((newContainer == null) || newContainer.length === 0) {
            return;
          }
          if (newContainer.nodeType && newContainer.nodeType === 1) {
            newContainer = angular.element(newContainer);
          } else if (typeof newContainer.append === 'function') {
            newContainer = angular.element(newContainer[newContainer.length - 1]);
          } else if (typeof newContainer === 'string') {
            newContainer = angular.element(document.querySelector(newContainer));
          }
          if (newContainer != null) {
            return changeContainer(newContainer);
          } else {
            throw new Error("invalid infinite-scroll-container attribute.");
          }
        };
        scope.$watch('plntrInfiniteScrollContainer', handleInfiniteScrollContainer);
        handleInfiniteScrollContainer(scope.plntrInfiniteScrollContainer || []);
        if (attrs.infiniteScrollParent != null) {
          changeContainer(angular.element(elem.parent()));
        }
        if (attrs.infiniteScrollImmediateCheck != null) {
          immediateCheck = scope.$eval(attrs.infiniteScrollImmediateCheck);
        }
        return checkInterval = $interval((function() {
          if (immediateCheck) {
            handler();
          }
          return $interval.cancel(checkInterval);
        }));
      }
    };
  }
]);
