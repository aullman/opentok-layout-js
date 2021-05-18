/* globals describe, beforeEach, expect, it, afterEach, initLayoutContainer */
describe('opentok layout', () => {
  it('defines initLayoutContainer', () => {
    expect(typeof window.initLayoutContainer).toEqual('function');
  });

  it('defines layout and getLayout methods', () => {
    const layoutDiv = document.createElement('div');
    document.body.appendChild(layoutDiv);
    const layoutContainer = initLayoutContainer(layoutDiv);

    expect(typeof layoutContainer.layout).toEqual('function');
    expect(typeof layoutContainer.getLayout).toEqual('function');
  });

  it('does not break jQuery', () => {
    expect(window.$).toBe(window.jQuery);
  });

  describe('handling layout of 2 elements', () => {
    let layoutDiv;
    let div1;
    let div2;
    let expectedLayout;
    let children;
    beforeEach(() => {
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
      children = [div1, div2];
      expectedLayout = [{
        width: 200,
        height: 300,
        left: 0,
        top: 0,
      },
      {
        width: 200,
        height: 300,
        left: 200,
        top: 0,
      }];
    });

    afterEach(() => {
      document.body.removeChild(layoutDiv);
      layoutDiv = null;
      div1 = null;
      div2 = null;
    });

    it('handles default getLayout', () => {
      const layoutContainer = initLayoutContainer({
        containerWidth: 400,
        containerHeight: 300,
      });
      expect(layoutContainer.getLayout(children.map(() => ({ width: 300, height: 200 }))))
        .toEqual(expectedLayout);
    });

    it('triggers the onLayout method', () => {
      const layoutContainer = initLayoutContainer(layoutDiv, {
        onLayout: (elem, position) => {
          ['width', 'height', 'top', 'left'].forEach((key) => {
            expect(
              position[key] === expectedLayout[0][key] || position[key] === expectedLayout[1][key]
            ).toBe(true);
          });
        },
      });
      layoutContainer.layout();
    });

    it('handles default layout', () => {
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      expectedLayout.forEach((box, idx) => {
        const boundingRect = children[idx].getBoundingClientRect();
        ['width', 'height', 'left', 'top'].forEach((val) => {
          expect(boundingRect[val]).toBeCloseTo(expectedLayout[idx][val], 1);
        });
      });
    });

    it('adds the "ot-layout" class to elements', () => {
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      expect(div1.classList.contains('ot-layout')).toBe(true);
      expect(div2.classList.contains('ot-layout')).toBe(true);
    });

    it('maintains multiple aspect ratios if you set fixedRatio:true', () => {
      div1.videoWidth = 640;
      div1.videoHeight = 480;
      div2.videoWidth = 480;
      div2.videoHeight = 640;
      const layoutContainer = initLayoutContainer(layoutDiv, { fixedRatio: true });
      layoutContainer.layout();
      const div1Rect = div1.getBoundingClientRect();
      expect(div1Rect.width / div1Rect.height).toBeCloseTo(640 / 480, 1);
      const div2Rect = div2.getBoundingClientRect();
      expect(div2Rect.width / div2Rect.height).toBeCloseTo(480 / 640, 1);
    });

    it('grows to takes up the whole height if there are narrow elements', () => {
      // The second element is portrait and so it doesn't take up as much
      // space as the first one. So we should account for that and make the height larger
      div1.videoWidth = 640;
      div1.videoHeight = 480;
      div2.videoWidth = 480;
      div2.videoHeight = 640;
      layoutDiv.style.width = '660px';
      const layoutContainer = initLayoutContainer(layoutDiv, { fixedRatio: true });
      layoutContainer.layout();
      const div1Rect = div1.getBoundingClientRect();
      const div2Rect = div2.getBoundingClientRect();
      expect(div1Rect.height).toBeCloseTo(300, 1);
      expect(div2Rect.height).toBeCloseTo(300, 1);
      expect(div2Rect.width).not.toBeGreaterThan(640);
    });

    it('adjusts to not go over the width if you have a wider element', () => {
      // The second element is 720p and so we need to adjust to not go over the width
      div1.videoWidth = 640;
      div1.videoHeight = 480;
      div2.videoWidth = 1280;
      div2.videoHeight = 720;
      layoutDiv.style.width = '600px';
      const layoutContainer = initLayoutContainer(layoutDiv, { fixedRatio: true });
      layoutContainer.layout();
      const div2Rect = div2.getBoundingClientRect();
      expect(div2Rect.left + div2Rect.width).toBeLessThan(600);
    });

    it('lets you change the min and maxRatio to force a ratio', () => {
      const layoutContainer = initLayoutContainer(layoutDiv,
        { minRatio: 9 / 16, maxRatio: 9 / 16 });
      layoutContainer.layout();
      const div1Rect = div1.getBoundingClientRect();
      expect(div1Rect.width / div1Rect.height).toBeCloseTo(16 / 9, 3);
    });

    describe('alignItems', () => {
      ['start', 'center', 'end'].forEach((alignItems) => {
        it(`Handles ${alignItems}`, () => {
          const layoutContainer = initLayoutContainer(layoutDiv, {
            alignItems,
            minRatio: 10 / 16,
            maxRatio: 10 / 16,
          });
          layoutContainer.layout();
          const boundingRect = div1.getBoundingClientRect();
          switch (alignItems) {
            case 'start':
              expect(boundingRect.left).toEqual(0);
              break;
            case 'end':
              expect(boundingRect.left).toBeCloseTo(160, 1);
              break;
            case 'center':
            default:
              expect(boundingRect.left).toBeCloseTo(80, 1);
              break;
          }
        });
      });
    });

    describe('maxWidth and maxHeight', () => {
      it('does not go over the maxWidth and maxHeight and stays centered', () => {
        const layoutContainer = initLayoutContainer(layoutDiv, {
          maxWidth: 160,
          maxHeight: 100,
        });
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.width).toBeCloseTo(160, 1);
        expect(div1Rect.height).toBeCloseTo(100, 1);
        expect(div1Rect.left).toBeCloseTo(40, 1);
        expect(div1Rect.top).toBeCloseTo(100, 1);
        const div2Rect = div2.getBoundingClientRect();
        expect(div2Rect.width).toBeCloseTo(160, 1);
        expect(div2Rect.height).toBeCloseTo(100, 1);
        expect(div2Rect.left).toBeCloseTo(200, 1);
        expect(div2Rect.top).toBeCloseTo(100, 1);
      });
    });

    describe('ignoreClass', () => {
      it('does not position items that are ignored', () => {
        div1.className = 'OT_ignore';
        div1.style.position = 'absolute';
        div1.style.top = '0px';
        div1.style.left = '0px';
        div1.style.width = '100px';
        div1.style.height = '100px';
        div1.style.zIndex = 1;
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.width).toBeCloseTo(100, 1);
        expect(div1Rect.height).toBeCloseTo(100, 1);
        expect(div1Rect.top).toBeCloseTo(0, 1);
        expect(div1Rect.left).toBeCloseTo(0, 1);
        const div2Rect = div2.getBoundingClientRect();
        expect(div2Rect.width).toBeCloseTo(400, 1);
        expect(div2Rect.height).toBeCloseTo(300, 1);
        expect(div2Rect.top).toBeCloseTo(0, 1);
        expect(div2Rect.left).toBeCloseTo(0, 1);
      });
    });

    describe('with a big element', () => {
      beforeEach(() => {
        div1.className = 'OT_big';
        expectedLayout = [{
          width: 320,
          height: 300,
          left: 0,
          top: 0,
        },
        {
          width: 80,
          height: 120,
          left: 320,
          top: 90,
        },
        ];
      });

      it('handles default getLayout', () => {
        const layoutContainer = initLayoutContainer({
          containerWidth: 400,
          containerHeight: 300,
        });
        expect(layoutContainer.getLayout(children.map(child => ({
          width: 640,
          height: 480,
          big: child.className === 'OT_big',
        })))).toEqual(expectedLayout);
      });

      it('handles default layout', () => {
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        expectedLayout.forEach((box, idx) => {
          const boundingRect = children[idx].getBoundingClientRect();
          ['width', 'height', 'left', 'top'].forEach((val) => {
            expect(boundingRect[val]).toBeCloseTo(expectedLayout[idx][val], 1);
          });
        });
      });

      it('handles bigFixedRatio:true', () => {
        const layoutContainer = initLayoutContainer(layoutDiv, { bigFixedRatio: true });
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.width / div1Rect.height).toBeCloseTo(4 / 3, 3);
      });

      it('lets you change the bigMinRatio and bigMaxRatio to force a ratio', () => {
        const layoutContainer = initLayoutContainer(layoutDiv,
          { bigMinRatio: 9 / 16, bigMaxRatio: 9 / 16 });
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.width / div1Rect.height).toBeCloseTo(16 / 9, 3);
      });

      it('handles bigPercentage', () => {
        const layoutContainer = initLayoutContainer(layoutDiv, { bigPercentage: 0.9 });
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        const div2Rect = div2.getBoundingClientRect();
        expect(div1Rect.width).toBeCloseTo(360, 1);
        expect(div2Rect.width).toBeCloseTo(40, 1);
        expect(div1Rect.height).toBeCloseTo(300, 1);
        expect(div2Rect.height).toBeCloseTo(60, 1);
      });

      it('handles bigFirst false', () => {
        const layoutContainer = initLayoutContainer(layoutDiv, { bigFirst: false });
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.left).toBeCloseTo(80, 1);
        expect(div1Rect.top).toBeCloseTo(0, 1);
      });

      it('takes margin into account', () => {
        div1.style.margin = '5px';
        div2.style.margin = '5px';

        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        const div2Rect = div2.getBoundingClientRect();
        expect(div1Rect.width).toBeCloseTo(310, 1);
        expect(div2Rect.width).toBeCloseTo(70, 1);
        expect(div1Rect.height).toBeCloseTo(290, 1);
        expect(div2Rect.height).toBeCloseTo(110, 1);
      });

      it('takes padding into account', () => {
        div1.style.padding = '5px';
        div2.style.padding = '5px';

        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        expect(div1.clientWidth).toBeCloseTo(320, 1);
        expect(div2.clientWidth).toBeCloseTo(80, -1);
        expect(div1.clientHeight).toBeCloseTo(300, 1);
        expect(div2.clientHeight).toBeCloseTo(120, 1);
      });

      describe('smallAlignItems', () => {
        ['start', 'center', 'end'].forEach((smallAlignItems) => {
          it(`Handles ${smallAlignItems}`, () => {
            const layoutContainer = initLayoutContainer(layoutDiv, { smallAlignItems });
            layoutContainer.layout();
            const boundingRect = children[1].getBoundingClientRect();
            switch (smallAlignItems) {
              case 'start':
                expect(boundingRect.top).toBeCloseTo(0, 1);
                break;
              case 'end':
                expect(boundingRect.top).toBeCloseTo(180, 1);
                break;
              case 'center':
              default:
                expect(boundingRect.top).toBeCloseTo(90, 1);
                break;
            }
          });
        });
      });

      describe('bigAlignItems', () => {
        ['start', 'center', 'end'].forEach((bigAlignItems) => {
          it(`Handles ${bigAlignItems}`, () => {
            const layoutContainer = initLayoutContainer(layoutDiv, {
              bigAlignItems,
              bigFixedRatio: true,
            });
            layoutContainer.layout();
            const boundingRect = children[0].getBoundingClientRect();
            switch (bigAlignItems) {
              case 'start':
                expect(boundingRect.top).toBeCloseTo(0, 1);
                break;
              case 'end':
                expect(boundingRect.top).toBeCloseTo(60, 1);
                break;
              case 'center':
              default:
                expect(boundingRect.top).toBeCloseTo(30, 1);
                break;
            }
          });
        });
      });

      describe('small and big maxWidth and maxHeight', () => {
        it('does not go over the bigMaxWidth and bigMaxHeight and stays centered', () => {
          const layoutContainer = initLayoutContainer(layoutDiv, {
            bigMaxWidth: 200,
            bigMaxHeight: 220,
          });
          layoutContainer.layout();
          const div1Rect = div1.getBoundingClientRect();
          expect(div1Rect.width).toBeCloseTo(200, 1);
          expect(div1Rect.height).toBeCloseTo(220, 1);
          expect(div1Rect.left).toBeCloseTo(60, 1);
          expect(div1Rect.top).toBeCloseTo(40, 1);
          const div2Rect = div2.getBoundingClientRect();
          expect(div2Rect.width).toBeCloseTo(80, 1);
          expect(div2Rect.height).toBeCloseTo(120, 1);
          expect(div2Rect.left).toBeCloseTo(320, 1);
          expect(div2Rect.top).toBeCloseTo(90, 1);
        });

        it('does not go over the smallMaxWidth and smallMaxHeight and stays centered', () => {
          const layoutContainer = initLayoutContainer(layoutDiv, {
            smallMaxWidth: 50,
            smallMaxHeight: 50,
          });
          layoutContainer.layout();
          const div1Rect = div1.getBoundingClientRect();
          expect(div1Rect.width).toBeCloseTo(320, 1);
          expect(div1Rect.height).toBeCloseTo(300, 1);
          expect(div1Rect.left).toBeCloseTo(0, 1);
          expect(div1Rect.top).toBeCloseTo(0, 1);
          const div2Rect = div2.getBoundingClientRect();
          expect(div2Rect.width).toBeCloseTo(50, 1);
          expect(div2Rect.height).toBeCloseTo(50, 1);
          expect(div2Rect.left).toBeCloseTo(335, 1);
          expect(div2Rect.top).toBeCloseTo(125, 1);
        });
      });
    });
  });

  describe('handling layout of 5 elements', () => {
    let layoutDiv;
    let divs = [];
    const divCount = 5;
    beforeEach(() => {
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
      const colors = ['blue', 'green', 'orange', 'teal', 'yellow'];
      for (let i = 0; i < divCount; i += 1) {
        divs[i] = document.createElement('div');
        divs[i].style.backgroundColor = colors[i];
        layoutDiv.appendChild(divs[i]);
      }
    });

    afterEach(() => {
      document.body.removeChild(layoutDiv);
      layoutDiv = null;
      divs = [];
    });

    it('handles default layout', () => {
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect them to all have the same width and height
      let rect;
      for (let i = 0; i < divs.length; i += 1) {
        rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBeCloseTo(133, 1);
        expect(rect.height).toBeCloseTo(150, 1);
      }
      rect = divs[0].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(0.5, 1);
      expect(rect.top).toBeCloseTo(0, 1);
      rect = divs[1].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(133.5, 1);
      expect(rect.top).toBeCloseTo(0, 1);
      rect = divs[2].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(266.5, 1);
      expect(rect.top).toBeCloseTo(0, 1);
      rect = divs[3].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(67, 1);
      expect(rect.top).toBeCloseTo(150, 1);
      rect = divs[4].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(200, 1);
      expect(rect.top).toBeCloseTo(150, 1);
    });

    it('grows to takes up the whole height if there are narrow elements', () => {
      divs[1].videoWidth = 480;
      divs[1].videoHeight = 640;
      divs[2].videoWidth = 1280;
      divs[2].videoHeight = 720;
      layoutDiv.style.width = '400px';
      layoutDiv.style.height = '600px';
      const layoutContainer = initLayoutContainer(layoutDiv, { fixedRatio: true });
      layoutContainer.layout();
      const rect = divs[4].getBoundingClientRect();
      expect(rect.top + rect.height).toBeCloseTo(600, 1);
    });

    it('does not grows to take up the whole height if you pass scaleLastRow=false', () => {
      divs[1].videoWidth = 480;
      divs[1].videoHeight = 640;
      divs[2].videoWidth = 1280;
      divs[2].videoHeight = 720;
      layoutDiv.style.width = '400px';
      layoutDiv.style.height = '600px';
      const layoutContainer = initLayoutContainer(layoutDiv, {
        fixedRatio: true,
        scaleLastRow: false,
      });
      layoutContainer.layout();
      const rect = divs[4].getBoundingClientRect();
      expect(rect.top + rect.height).toBeCloseTo(514, 1);
    });

    it('does not mess up the aspect ratio of the last row when it grows', () => {
      layoutDiv.style.width = '600px';
      layoutDiv.style.height = '500px';
      const layoutContainer = initLayoutContainer(layoutDiv, {
        minRatio: 1,
        maxRatio: 1,
      });
      layoutContainer.layout();
      const rect = divs[4].getBoundingClientRect();
      expect(rect.width / rect.height).toBe(1);
    });

    it('handles a big element', () => {
      divs[0].className = 'OT_big';
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect div[0] to be big
      const bigRect = divs[0].getBoundingClientRect();
      expect(bigRect.width).toBeCloseTo(320, 1);
      expect(bigRect.height).toBeCloseTo(300, 1);
      expect(bigRect.left).toBeCloseTo(0, 1);
      expect(bigRect.top).toBeCloseTo(0, 1);
      // Expect them to all have the same width and height
      let rect;
      for (let i = 1; i < divs.length; i += 1) {
        rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBeCloseTo(80, 1);
        expect(rect.height).toBeCloseTo(75, 1);
      }
      rect = divs[1].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(320, 1);
      expect(rect.top).toBeCloseTo(0, 1);
      rect = divs[2].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(320, 1);
      expect(rect.top).toBeCloseTo(75, 1);
      rect = divs[3].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(320, 1);
      expect(rect.top).toBeCloseTo(150, 1);
      rect = divs[4].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(320, 1);
      expect(rect.top).toBeCloseTo(225, 1);
    });

    it('handles two big elements', () => {
      divs[0].className = 'OT_big';
      divs[1].className = 'OT_big';
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect div[0] to be big
      const bigRect = divs[0].getBoundingClientRect();
      expect(bigRect.width).toBeCloseTo(266.66, 1);
      expect(bigRect.height).toBeCloseTo(150, 1);
      expect(bigRect.left).toBeCloseTo(26.66, 1);
      expect(bigRect.top).toBeCloseTo(0, 1);
      // Expect div[1] to be big
      const big2Rect = divs[1].getBoundingClientRect();
      expect(big2Rect.width).toBeCloseTo(266.66, 1);
      expect(big2Rect.height).toBeCloseTo(150, 1);
      expect(big2Rect.left).toBeCloseTo(26.66, 1);
      expect(big2Rect.top).toBeCloseTo(150, 1);
      // Expect them to all have the same width and height
      let rect;
      for (let i = 2; i < divs.length; i += 1) {
        rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBeCloseTo(80, 1);
        expect(rect.height).toBeCloseTo(100, 1);
      }
      rect = divs[2].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(320, 1);
      expect(rect.top).toBeCloseTo(0, 1);
      rect = divs[3].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(320, 1);
      expect(rect.top).toBeCloseTo(100, 1);
      rect = divs[4].getBoundingClientRect();
      expect(rect.left).toBeCloseTo(320, 1);
      expect(rect.top).toBeCloseTo(200, 1);
    });

    it('handles hidden elements', () => {
      divs[0].style.display = 'none';
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      for (let i = 1; i < divs.length; i += 1) {
        const rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBeCloseTo(200, 1);
        expect(rect.height).toBeCloseTo(150, 1);
      }
    });

    describe('in really wide div', () => {
      beforeEach(() => {
        layoutDiv.style.width = '1000px';
      });

      it('handles default layout', () => {
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect them to all have the same width and height
        let rect;
        for (let i = 0; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBeCloseTo(200, 1);
          expect(rect.height).toBeCloseTo(300, 1);
        }
        rect = divs[0].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(0, 1);
        expect(rect.top).toBeCloseTo(0, 1);
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(200, 1);
        expect(rect.top).toBeCloseTo(0, 1);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(400, 1);
        expect(rect.top).toBeCloseTo(0, 1);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(600, 1);
        expect(rect.top).toBeCloseTo(0, 1);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(800, 1);
        expect(rect.top).toBeCloseTo(0, 1);
      });

      it('handles a big element', () => {
        divs[0].className = 'OT_big';
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        const bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBeCloseTo(533.33, 1);
        expect(bigRect.height).toBeCloseTo(300, 1);
        expect(bigRect.left).toBeCloseTo(133.33, 1);
        expect(bigRect.top).toBeCloseTo(0, 1);
        // Expect them to all have the same width and height
        let rect;
        for (let i = 1; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBeCloseTo(100, 1);
          expect(rect.height).toBeCloseTo(150, 1);
        }
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(800, 1);
        expect(rect.top).toBeCloseTo(0, 1);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(900, 1);
        expect(rect.top).toBeCloseTo(0, 1);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(800, 1);
        expect(rect.top).toBeCloseTo(150, 1);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(900, 1);
        expect(rect.top).toBeCloseTo(150, 1);
      });

      it('handles bigFirst "column" and "row"', () => {
        divs[0].className = 'OT_big';
        let layoutContainer = initLayoutContainer(layoutDiv, { bigFirst: 'column' });
        layoutContainer.layout();
        // Big element is displayed on the left because we are in a column layout
        let bigDivRect = divs[0].getBoundingClientRect();
        expect(bigDivRect.left).toBeCloseTo(133.33);
        expect(bigDivRect.top).toBe(0);

        layoutContainer = initLayoutContainer(layoutDiv, { bigFirst: 'row' });
        layoutContainer.layout();
        // Big element is displayed on the right because we are in a column layout
        bigDivRect = divs[0].getBoundingClientRect();
        expect(bigDivRect.left).toBeCloseTo(333.33);
        expect(bigDivRect.top).toBe(0);
      });

      it('handles two big elements', () => {
        divs[0].className = 'OT_big';
        divs[1].className = 'OT_big';
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        const bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBeCloseTo(400, 1);
        expect(bigRect.height).toBeCloseTo(300, 1);
        expect(bigRect.left).toBeCloseTo(0, 1);
        expect(bigRect.top).toBeCloseTo(0, 1);
        // Expect div[1] to be big
        const big2Rect = divs[1].getBoundingClientRect();
        expect(big2Rect.width).toBeCloseTo(400, 1);
        expect(big2Rect.height).toBeCloseTo(300, 1);
        expect(big2Rect.left).toBeCloseTo(400, 1);
        expect(big2Rect.top).toBeCloseTo(0, 1);
        // Expect them to all have the same width and height
        let rect;
        for (let i = 2; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBeCloseTo(177.76, 1);
          expect(rect.height).toBeCloseTo(100, 1);
        }
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(811.1, 1);
        expect(rect.top).toBeCloseTo(0, 1);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(811.1, 1);
        expect(rect.top).toBeCloseTo(100, 1);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(811.1, 1);
        expect(rect.top).toBeCloseTo(200, 1);
      });
    });

    describe('in really tall div', () => {
      beforeEach(() => {
        layoutDiv.style.height = '800px';
      });

      it('handles default layout', () => {
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect them to all have the same width and height
        let rect;
        for (let i = 0; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          if (i > divs.length - 2) {
            // The last row grows a little bit to take up the extra space
            expect(rect.height).toBeCloseTo(268, 1);
            expect(rect.width).toBeCloseTo(201, 1);
          } else {
            expect(rect.height).toBeCloseTo(266, 1);
            expect(rect.width).toBeCloseTo(200, 1);
          }
        }
        rect = divs[0].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(0, 1);
        expect(rect.top).toBeCloseTo(0, 1);
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(200, 1);
        expect(rect.top).toBeCloseTo(0, 1);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(0, 1);
        expect(rect.top).toBeCloseTo(266, 1);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(200, 1);
        expect(rect.top).toBeCloseTo(266, 1);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(99.5, 1);
        expect(rect.top).toBeCloseTo(532, 0);
      });

      it('handles a big element', () => {
        divs[0].className = 'OT_big';
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        const bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBeCloseTo(400, 1);
        expect(bigRect.height).toBeCloseTo(600, 1);
        expect(bigRect.left).toBeCloseTo(0, 1);
        expect(bigRect.top).toBeCloseTo(20, 1);
        // Expect them to all have the same width and height
        let rect;
        for (let i = 1; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBeCloseTo(100, 1);
          expect(rect.height).toBeCloseTo(150, 1);
        }
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(0, 1);
        expect(rect.top).toBeCloseTo(645, 1);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(100, 1);
        expect(rect.top).toBeCloseTo(645, 1);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(200, 1);
        expect(rect.top).toBeCloseTo(645, 1);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(300, 1);
        expect(rect.top).toBeCloseTo(645, 1);
      });

      it('handles bigFirst "column" and "row"', () => {
        divs[0].className = 'OT_big';
        let layoutContainer = initLayoutContainer(layoutDiv, { bigFirst: 'column' });
        layoutContainer.layout();
        // Big element is displayed at the bottom because we are in a row layout
        let bigDivRect = divs[0].getBoundingClientRect();
        expect(bigDivRect.left).toBeCloseTo(0, 1);
        expect(bigDivRect.top).toBeCloseTo(160, 1);

        layoutContainer = initLayoutContainer(layoutDiv, { bigFirst: 'row' });
        layoutContainer.layout();
        // Big element is displayed at the top because we are in a row layout
        bigDivRect = divs[0].getBoundingClientRect();
        expect(bigDivRect.left).toBeCloseTo(0, 1);
        expect(bigDivRect.top).toBeCloseTo(20, 1);
      });

      it('handles two big elements', () => {
        divs[0].className = 'OT_big';
        divs[1].className = 'OT_big';
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        const bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBeCloseTo(400, 1);
        expect(bigRect.height).toBeCloseTo(320, 1);
        expect(bigRect.left).toBeCloseTo(0, 1);
        expect(bigRect.top).toBeCloseTo(0, 1);
        // Expect div[1] to be big
        const big2Rect = divs[1].getBoundingClientRect();
        expect(big2Rect.width).toBeCloseTo(400, 1);
        expect(big2Rect.height).toBeCloseTo(320, 1);
        expect(big2Rect.left).toBeCloseTo(0, 1);
        expect(big2Rect.top).toBeCloseTo(320, 1);
        // Expect them to all have the same width and height
        let rect;
        for (let i = 2; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBeCloseTo(133, 1);
          expect(rect.height).toBeCloseTo(160, 1);
        }
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(0.5, 1);
        expect(rect.top).toBeCloseTo(640, 1);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(133.5, 1);
        expect(rect.top).toBeCloseTo(640, 1);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(266.5, 1);
        expect(rect.top).toBeCloseTo(640, 1);
      });
    });
  });
});
