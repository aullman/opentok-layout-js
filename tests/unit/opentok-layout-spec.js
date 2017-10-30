/*globals describe, beforeEach, expect, it, afterEach, initLayoutContainer */
describe('opentok layout', function () {
  it('defines initLayoutContainer', function () {
    expect(window.hasOwnProperty('initLayoutContainer')).toBe(true);
  });

  it('defines a layout method', function () {
    var layoutDiv = document.createElement('div');
    document.body.appendChild(layoutDiv);
    var layoutContainer = initLayoutContainer(layoutDiv);

    expect(layoutContainer.hasOwnProperty('layout')).toBe(true);
    expect(typeof layoutContainer.layout).toEqual('function');
  });

  it('does not break jQuery', function() {
    expect(window.$).toBe(window.jQuery);
  });

  describe('handling layout of 2 elements', function () {
    var layoutDiv, div1, div2;
    beforeEach(function () {
      layoutDiv = document.createElement('div');
      layoutDiv.setAttribute('id', 'layoutDiv');
      layoutDiv.style.position = 'absolute';
      layoutDiv.style.top = '0px';
      layoutDiv.style.left = '0px';
      layoutDiv.style.width = '400px';
      layoutDiv.style.height = '300px';
      layoutDiv.style.backgroundColor = 'grey';
      document.body.style.margin = '0px';
      document.body.style.padding = '0px';
      document.body.appendChild(layoutDiv);

      div1 = document.createElement('div');
      div2 = document.createElement('div');
      div1.style.backgroundColor = 'green';
      div2.style.backgroundColor = 'red';
      layoutDiv.appendChild(div1);
      layoutDiv.appendChild(div2);
    });

    afterEach(function () {
      document.body.removeChild(layoutDiv);
      layoutDiv = null;
      div1 = null;
      div2 = null;
    });

    it('handles default layout', function () {
      var layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      var div1Rect = div1.getBoundingClientRect();
      var div2Rect = div2.getBoundingClientRect();
      expect(div1Rect.width).toBe(200);
      expect(div2Rect.width).toBe(200);
      expect(div1Rect.height).toBe(300);
      expect(div2Rect.height).toBe(300);
      expect(div1Rect.left).toBe(0);
      expect(div1Rect.top).toBe(0);
      expect(div2Rect.left).toBe(200);
      expect(div2Rect.top).toBe(0);
    });

    it('maintains aspect ratio if you set fixedRatio:true', function () {
      var layoutContainer = initLayoutContainer(layoutDiv, {fixedRatio: true});
      layoutContainer.layout();
      var div1Rect = div1.getBoundingClientRect();
      expect(div1Rect.width/div1Rect.height).toBeCloseTo(4/3, 3);
    });

    it('lets you change the min and maxRatio to force a ratio', function () {
      var layoutContainer = initLayoutContainer(layoutDiv, {minRatio: 9/16, maxRatio: 9/16});
      layoutContainer.layout();
      var div1Rect = div1.getBoundingClientRect();
      expect(div1Rect.width/div1Rect.height).toBeCloseTo(16/9, 3);
    });

    describe('with a big element', function () {
      beforeEach(function () {
        div1.className = 'OT_big';
      });

      it('handles default layout', function () {
        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        var div1Rect = div1.getBoundingClientRect();
        var div2Rect = div2.getBoundingClientRect();
        expect(div1Rect.width).toBe(320);
        expect(div2Rect.width).toBe(80);
        expect(div1Rect.height).toBe(300);
        expect(div2Rect.height).toBe(120);
        expect(div1Rect.left).toBe(0);
        expect(div1Rect.top).toBe(0);
        expect(div2Rect.left).toBe(320);
        expect(div2Rect.top).toBe(90);
      });

      it('handles bigFixedRatio:true', function () {
        var layoutContainer = initLayoutContainer(layoutDiv, {bigFixedRatio: true});
        layoutContainer.layout();
        var div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.width/div1Rect.height).toBeCloseTo(4/3, 3);
      });

      it('lets you change the bigMinRatio and bigMaxRatio to force a ratio', function () {
        var layoutContainer =
                initLayoutContainer(layoutDiv, {bigMinRatio: 9/16, bigMaxRatio: 9/16});
        layoutContainer.layout();
        var div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.width/div1Rect.height).toBeCloseTo(16/9, 3);
      });

      it('handles bigPercentage', function () {
        var layoutContainer = initLayoutContainer(layoutDiv, {bigPercentage: 0.9});
        layoutContainer.layout();
        var div1Rect = div1.getBoundingClientRect();
        var div2Rect = div2.getBoundingClientRect();
        expect(div1Rect.width).toBe(360);
        expect(div2Rect.width).toBe(40);
        expect(div1Rect.height).toBe(300);
        expect(div2Rect.height).toBe(60);
      });

      it('handles bigFirst', function () {
        var layoutContainer = initLayoutContainer(layoutDiv, {bigFirst: false});
        layoutContainer.layout();
        var div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.left).toBe(80);
        expect(div1Rect.top).toBe(0);
      });

      it('takes margin into account', function () {
        div1.style.margin = '5px';
        div2.style.margin = '5px';

        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        var div1Rect = div1.getBoundingClientRect();
        var div2Rect = div2.getBoundingClientRect();
        expect(div1Rect.width).toBe(310);
        expect(div2Rect.width).toBe(70);
        expect(div1Rect.height).toBe(290);
        expect(div2Rect.height).toBe(110);
      });

      it('takes padding into account', function () {
        div1.style.padding = '5px';
        div2.style.padding = '5px';

        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        expect(div1.clientWidth).toBe(320);
        expect(div2.clientWidth).toBe(80);
        expect(div1.clientHeight).toBe(300);
        expect(div2.clientHeight).toBe(120);
      });
    });
  });

  describe('handling layout of 5 elements', function () {
    var layoutDiv, divs = [], divCount = 5;
    beforeEach(function () {
      layoutDiv = document.createElement('div');
      layoutDiv.setAttribute('id', 'layoutDiv');
      layoutDiv.style.position = 'absolute';
      layoutDiv.style.top = '0px';
      layoutDiv.style.left = '0px';
      layoutDiv.style.width = '400px';
      layoutDiv.style.height = '300px';
      layoutDiv.style.backgroundColor = 'grey';
      document.body.style.margin = '0px';
      document.body.style.padding = '0px';
      document.body.appendChild(layoutDiv);
      var colors = ['blue', 'green', 'orange', 'teal', 'yellow'];
      for (var i = 0; i < divCount; i++) {
        divs[i] = document.createElement('div');
        divs[i].style.backgroundColor = colors[i];
        layoutDiv.appendChild(divs[i]);
      }
    });

    afterEach(function () {
      document.body.removeChild(layoutDiv);
      layoutDiv = null;
      divs = [];
    });

    it('handles default layout', function () {
      var layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect them to all have the same width and height
      var rect;
      for (var i = 0; i < divs.length; i++) {
        rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBe(133);
        expect(rect.height).toBe(150);
      }
      rect = divs[0].getBoundingClientRect();
      expect(rect.left).toBe(0.5);
      expect(rect.top).toBe(0);
      rect = divs[1].getBoundingClientRect();
      expect(rect.left).toBe(133.5);
      expect(rect.top).toBe(0);
      rect = divs[2].getBoundingClientRect();
      expect(rect.left).toBe(266.5);
      expect(rect.top).toBe(0);
      rect = divs[3].getBoundingClientRect();
      expect(rect.left).toBe(67);
      expect(rect.top).toBe(150);
      rect = divs[4].getBoundingClientRect();
      expect(rect.left).toBe(200);
      expect(rect.top).toBe(150);
    });

    it('handles a big element', function () {
      divs[0].className = 'OT_big';
      var layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect div[0] to be big
      var bigRect = divs[0].getBoundingClientRect();
      expect(bigRect.width).toBe(320);
      expect(bigRect.height).toBe(300);
      expect(bigRect.left).toBe(0);
      expect(bigRect.top).toBe(0);
      // Expect them to all have the same width and height
      var rect;
      for (var i = 1; i < divs.length; i++) {
        rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBe(80);
        expect(rect.height).toBe(75);
      }
      rect = divs[1].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(0);
      rect = divs[2].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(75);
      rect = divs[3].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(150);
      rect = divs[4].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(225);
    });

    it('handles two big elements', function () {
      divs[0].className = 'OT_big';
      divs[1].className = 'OT_big';
      var layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect div[0] to be big
      var bigRect = divs[0].getBoundingClientRect();
      expect(bigRect.width).toBeCloseTo(266.66, 1);
      expect(bigRect.height).toBe(150);
      expect(bigRect.left).toBeCloseTo(26.66, 1);
      expect(bigRect.top).toBe(0);
      // Expect div[1] to be big
      var big2Rect = divs[1].getBoundingClientRect();
      expect(big2Rect.width).toBeCloseTo(266.66, 1);
      expect(big2Rect.height).toBe(150);
      expect(big2Rect.left).toBeCloseTo(26.66, 1);
      expect(big2Rect.top).toBe(150);
      // Expect them to all have the same width and height
      var rect;
      for (var i = 2; i < divs.length; i++) {
        rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBe(80);
        expect(rect.height).toBe(100);
      }
      rect = divs[2].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(0);
      rect = divs[3].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(100);
      rect = divs[4].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(200);
    });

    it('handles hidden elements', function () {
      divs[0].style.display = 'none';
      var layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      for (var i = 1; i < divs.length; i++) {
        var rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBe(200);
        expect(rect.height).toBe(150);
      }
    });

    describe('in really wide div', function () {
      beforeEach(function () {
        layoutDiv.style.width = '1000px';
      });

      it('handles default layout', function () {
        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect them to all have the same width and height
        var rect;
        for (var i = 0; i < divs.length; i++) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(200);
          expect(rect.height).toBe(300);
        }
        rect = divs[0].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(0);
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBe(0);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(400);
        expect(rect.top).toBe(0);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(600);
        expect(rect.top).toBe(0);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(800);
        expect(rect.top).toBe(0);
      });

      it('handles a big element', function () {
        divs[0].className = 'OT_big';
        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        var bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBe(400);
        expect(bigRect.height).toBe(300);
        expect(bigRect.left).toBe(0);
        expect(bigRect.top).toBe(0);
        // Expect them to all have the same width and height
        var rect;
        for (var i = 1; i < divs.length; i++) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBeCloseTo(266.66, 1);
          expect(rect.height).toBe(150);
        }
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(433.33, 1);
        expect(rect.top).toBe(0);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(700);
        expect(rect.top).toBe(0);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(433.33, 1);
        expect(rect.top).toBe(150);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(700);
        expect(rect.top).toBe(150);
      });

      it('handles two big elements', function () {
        divs[0].className = 'OT_big';
        divs[1].className = 'OT_big';
        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        var bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBe(200);
        expect(bigRect.height).toBe(300);
        expect(bigRect.left).toBe(0);
        expect(bigRect.top).toBe(0);
        // Expect div[1] to be big
        var big2Rect = divs[1].getBoundingClientRect();
        expect(big2Rect.width).toBe(200);
        expect(big2Rect.height).toBe(300);
        expect(big2Rect.left).toBe(200);
        expect(big2Rect.top).toBe(0);
        // Expect them to all have the same width and height
        var rect;
        for (var i = 2; i < divs.length; i++) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(200);
          expect(rect.height).toBe(300);
        }
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(400);
        expect(rect.top).toBe(0);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(600);
        expect(rect.top).toBe(0);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(800);
        expect(rect.top).toBe(0);
      });
    });

    describe('in really tall div', function () {
      beforeEach(function () {
        layoutDiv.style.height = '800px';
      });

      it('handles default layout', function () {
        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect them to all have the same width and height
        var rect;
        for (var i = 0; i < divs.length; i++) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(200);
          expect(rect.height).toBe(266);
        }
        rect = divs[0].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBeCloseTo(1, 0);
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBeCloseTo(1, 0);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(267);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBeCloseTo(267, 0);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(100);
        expect(rect.top).toBeCloseTo(533, 0);
      });

      it('handles a big element', function () {
        divs[0].className = 'OT_big';
        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        var bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBe(400);
        expect(bigRect.height).toBe(300);
        expect(bigRect.left).toBe(0);
        expect(bigRect.top).toBe(0);
        // Expect them to all have the same width and height
        var rect;
        for (var i = 1; i < divs.length; i++) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(200);
          expect(rect.height).toBe(250);
        }
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(300);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBe(300);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(550);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBe(550);
      });

      it('handles two big elements', function () {
        divs[0].className = 'OT_big';
        divs[1].className = 'OT_big';
        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        var bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBe(200);
        expect(bigRect.height).toBe(300);
        expect(bigRect.left).toBe(0);
        expect(bigRect.top).toBe(0);
        // Expect div[1] to be big
        var big2Rect = divs[1].getBoundingClientRect();
        expect(big2Rect.width).toBe(200);
        expect(big2Rect.height).toBe(300);
        expect(big2Rect.left).toBe(200);
        expect(big2Rect.top).toBe(0);
        // Expect them to all have the same width and height
        var rect;
        for (var i = 2; i < divs.length; i++) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(200);
          expect(rect.height).toBe(250);
        }
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(300);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBe(300);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(100);
        expect(rect.top).toBe(550);
      });
    });
  });
});
