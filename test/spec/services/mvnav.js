'use strict';

describe('Service: mvNav', function () {

  // load the service's module
  beforeEach(module('moveditorApp'));

  // instantiate service
  var mvNav;
  beforeEach(inject(function (_mvNav_) {
    mvNav = _mvNav_;
  }));

  it('should do something', function () {
    expect(!!mvNav).toBe(true);
  });

});
